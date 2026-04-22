# =========================================
# IMPORT
# =========================================
import cv2
import numpy as np
import os
import json
import mediapipe as mp
from tensorflow.keras.models import load_model
from collections import deque, Counter
import time

# =========================================
# CONFIG
# =========================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

MODEL_PATH = os.path.join(BASE_DIR, "app", "ml", "models", "bisindo_lstm.h5")
LABEL_PATH = os.path.join(BASE_DIR, "app", "ml", "models", "labels.json")

SEQUENCE_LENGTH = 30
PREDICTION_SMOOTHING = 10
CONFIDENCE_THRESHOLD = 0.7
COOLDOWN_TIME = 1.5  # detik

# =========================================
# LOAD MODEL & LABEL
# =========================================
model = load_model(MODEL_PATH)

with open(LABEL_PATH, "r") as f:
    label_map = json.load(f)

reverse_label_map = {v: k for k, v in label_map.items()}

# =========================================
# MEDIAPIPE
# =========================================
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

hands = mp_hands.Hands(max_num_hands=2)

# =========================================
# BUFFER
# =========================================
sequence = deque(maxlen=SEQUENCE_LENGTH)
predictions = deque(maxlen=PREDICTION_SMOOTHING)

last_prediction_time = 0
current_output = "..."

# =========================================
# NORMALIZATION (WAJIB SAMA DENGAN TRAINING)
# =========================================
def normalize_wrist(frame):
    frame = np.array(frame)

    left = frame[:63].reshape(21, 3)
    right = frame[63:].reshape(21, 3)

    if not np.all(left == 0):
        left = left - left[0]

    if not np.all(right == 0):
        right = right - right[0]

    return np.concatenate([left.flatten(), right.flatten()])

# =========================================
# WEBCAM
# =========================================
cap = cv2.VideoCapture(0)

print("🎥 Realtime detection started... tekan 'q' untuk keluar")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)

    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(image)
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

    left_hand = []
    right_hand = []

    # =========================================
    # DETEKSI TANGAN
    # =========================================
    if results.multi_hand_landmarks:
        for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):

            mp_drawing.draw_landmarks(
                image, hand_landmarks, mp_hands.HAND_CONNECTIONS
            )

            label_hand = results.multi_handedness[idx].classification[0].label

            keypoints = []
            for lm in hand_landmarks.landmark:
                keypoints.extend([lm.x, lm.y, lm.z])

            if label_hand == "Left":
                left_hand = keypoints
            else:
                right_hand = keypoints

    # padding jika tidak ada tangan
    if len(left_hand) == 0:
        left_hand = [0] * 63
    if len(right_hand) == 0:
        right_hand = [0] * 63

    keypoints = left_hand + right_hand
    sequence.append(keypoints)

    # =========================================
    # PREDIKSI
    # =========================================
    if len(sequence) == SEQUENCE_LENGTH:

        processed_sequence = [normalize_wrist(f) for f in sequence]
        input_data = np.array(processed_sequence)
        input_data = np.expand_dims(input_data, axis=0)

        prediction = model.predict(input_data, verbose=0)[0]
        predicted_class = np.argmax(prediction)
        confidence = prediction[predicted_class]

        predictions.append(predicted_class)

        # stabilisasi (majority vote)
        most_common = Counter(predictions).most_common(1)[0][0]

        current_time = time.time()

        # hanya update jika confident & tidak spam
        if (
            confidence > CONFIDENCE_THRESHOLD and
            current_time - last_prediction_time > COOLDOWN_TIME
        ):
            current_output = reverse_label_map[most_common]
            last_prediction_time = current_time

            # reset biar tidak carry over gesture lama
            sequence.clear()
            predictions.clear()

    # =========================================
    # DISPLAY
    # =========================================
    cv2.putText(
        image,
        f"Prediction: {current_output}",
        (10, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )

    cv2.imshow("BISINDO Realtime", image)

    if cv2.waitKey(10) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()