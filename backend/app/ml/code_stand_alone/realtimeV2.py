# =========================================
# IMPORT
# =========================================
import cv2
import numpy as np
import os
import json
import mediapipe as mp
import time

from tensorflow.keras.models import load_model
from collections import deque, Counter

# =========================================
# CONFIG
# =========================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "app",
    "ml",
    "models",
    "bisindo_lstm_no_es_v2.h5"
)

LABEL_PATH = os.path.join(
    BASE_DIR,
    "app",
    "ml",
    "models",
    "labels.json"
)

SEQUENCE_LENGTH = 60

PREDICTION_SMOOTHING = 5
CONFIDENCE_THRESHOLD = 0.5
COOLDOWN_TIME = 1.0

# =========================================
# LOAD MODEL
# =========================================

print("Loading model...")

model = load_model(MODEL_PATH)

with open(LABEL_PATH, "r") as f:
    label_map = json.load(f)

reverse_label_map = {
    v: k
    for k, v in label_map.items()
}

print("Model loaded.")

# =========================================
# MEDIAPIPE
# =========================================

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# =========================================
# BUFFER
# =========================================

sequence = deque(
    maxlen=SEQUENCE_LENGTH
)

predictions = deque(
    maxlen=PREDICTION_SMOOTHING
)

last_prediction_time = 0

current_output = "..."

# =========================================
# NORMALIZATION
# HARUS SAMA DENGAN TRAINING
# =========================================

def normalize_frame(frame):

    frame = np.array(
        frame,
        dtype=np.float32
    )

    left_hand = frame[:63].reshape(21, 3)
    right_hand = frame[63:].reshape(21, 3)

    left_exists = np.any(left_hand)
    right_exists = np.any(right_hand)

    # =====================================
    # GLOBAL ANCHOR
    # =====================================

    if left_exists:

        anchor = left_hand[0]

    elif right_exists:

        anchor = right_hand[0]

    else:

        anchor = np.zeros(
            3,
            dtype=np.float32
        )

    # =====================================
    # TRANSLATION NORMALIZATION
    # =====================================

    if left_exists:
        left_hand = left_hand - anchor

    if right_exists:
        right_hand = right_hand - anchor

    # =====================================
    # SCALE NORMALIZATION
    # =====================================

    all_points = []

    if left_exists:
        all_points.append(left_hand)

    if right_exists:
        all_points.append(right_hand)

    if len(all_points) > 0:

        all_points = np.vstack(
            all_points
        )

        max_distance = np.max(
            np.linalg.norm(
                all_points,
                axis=1
            )
        )

        if max_distance > 0:

            if left_exists:
                left_hand = (
                    left_hand /
                    max_distance
                )

            if right_exists:
                right_hand = (
                    right_hand /
                    max_distance
                )

    return np.concatenate([
        left_hand.flatten(),
        right_hand.flatten()
    ])

# =========================================
# WEBCAM
# =========================================

cap = cv2.VideoCapture(0)

print(
    "\nRealtime Detection Started"
)
print(
    "Press Q to Exit\n"
)

while cap.isOpened():

    ret, frame = cap.read()

    if not ret:
        break

    # =====================================
    # PENTING:
    # JANGAN MIRROR
    # =====================================

    # frame = cv2.flip(frame, 1)

    rgb = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2RGB
    )

    results = hands.process(rgb)

    image = frame.copy()

    left_hand = []
    right_hand = []

    detected_hands = 0

    # =====================================
    # DETECT HAND
    # =====================================

    if (
        results.multi_hand_landmarks
        and results.multi_handedness
    ):

        for hand_landmarks, handedness in zip(
            results.multi_hand_landmarks,
            results.multi_handedness
        ):

            mp_drawing.draw_landmarks(
                image,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS
            )

            label_hand = (
                handedness
                .classification[0]
                .label
            )

            coords = []

            for lm in hand_landmarks.landmark:

                coords.extend([
                    lm.x,
                    lm.y,
                    lm.z
                ])

            # =================================
            # MEDIA PIPE SELFIE ASSUMPTION
            # DATASET NON MIRROR
            # =================================

            if label_hand == "Left":

                # sebenarnya RIGHT
                right_hand = coords

            elif label_hand == "Right":

                # sebenarnya LEFT
                left_hand = coords

    # =====================================
    # PADDING
    # =====================================

    if len(left_hand) == 0:
        left_hand = [0] * 63
    else:
        detected_hands += 1

    if len(right_hand) == 0:
        right_hand = [0] * 63
    else:
        detected_hands += 1

    frame_features = (
        left_hand +
        right_hand
    )

    sequence.append(
        frame_features
    )

    # =====================================
    # PREDICTION
    # =====================================

    if (
        len(sequence)
        == SEQUENCE_LENGTH
    ):

        processed_sequence = [

            normalize_frame(frame)

            for frame in sequence

        ]

        input_data = np.array(
            processed_sequence,
            dtype=np.float32
        )

        input_data = np.expand_dims(
            input_data,
            axis=0
        )

        prediction = model.predict(
            input_data,
            verbose=0
        )[0]

        predicted_class = np.argmax(
            prediction
        )

        confidence = prediction[
            predicted_class
        ]

        predictions.append(
            predicted_class
        )

        most_common = Counter(
            predictions
        ).most_common(1)[0][0]

        current_time = time.time()

        if (
            confidence >=
            CONFIDENCE_THRESHOLD
            and
            current_time
            -
            last_prediction_time
            >
            COOLDOWN_TIME
        ):

            current_output = (
                reverse_label_map[
                    most_common
                ]
            )

            last_prediction_time = (
                current_time
            )

    # =====================================
    # DISPLAY
    # =====================================

    cv2.putText(
        image,
        f"Prediction : {current_output}",
        (10, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )

    cv2.putText(
        image,
        f"Hands : {detected_hands}",
        (10, 80),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 0),
        2
    )

    if (
        len(sequence)
        ==
        SEQUENCE_LENGTH
    ):

        cv2.putText(
            image,
            f"Confidence : {confidence:.2f}",
            (10, 120),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 255),
            2
        )

    cv2.imshow(
        "BISINDO Realtime",
        image
    )

    if (
        cv2.waitKey(1)
        &
        0xFF
        ==
        ord("q")
    ):
        break

cap.release()

cv2.destroyAllWindows()

hands.close()