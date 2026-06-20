import os
import cv2
import numpy as np
import mediapipe as mp
from tqdm import tqdm

# =========================================
# CONFIG
# =========================================

INPUT_PATH = "storage/dataset_raw"
OUTPUT_PATH = "dataset_processedV2"

SEQUENCE_LENGTH = 60
MIN_DETECTION_RATIO = 0.90

os.makedirs(OUTPUT_PATH, exist_ok=True)

# =========================================
# MEDIAPIPE
# =========================================

mp_hands = mp.solutions.hands

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# =========================================
# EXTRACT LANDMARKS
# =========================================

def extract_landmarks(frame):

    rgb = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2RGB
    )

    results = hands.process(rgb)

    landmarks = np.zeros(
        126,
        dtype=np.float32
    )

    hand_detected = False

    if (
        results.multi_hand_landmarks
        and results.multi_handedness
    ):

        hand_detected = True

        for hand_landmarks, handedness in zip(
            results.multi_hand_landmarks,
            results.multi_handedness
        ):

            hand_label = (
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

            coords = np.array(
                coords,
                dtype=np.float32
            )

            # =====================
            # LEFT HAND
            # =====================

            if hand_label == "Left":

                landmarks[63:] = coords

            # =====================
            # RIGHT HAND
            # =====================

            elif hand_label == "Right":

                landmarks[:63] = coords

    return landmarks, hand_detected

# =========================================
# NORMALIZATION
# =========================================

def normalize_landmarks(sequence):

    normalized_sequence = []

    for frame in sequence:

        frame = frame.copy()

        left_hand = frame[:63].reshape(21, 3)
        right_hand = frame[63:].reshape(21, 3)

        left_exists = np.any(left_hand)
        right_exists = np.any(right_hand)

        # =================================
        # GLOBAL ANCHOR
        # =================================

        if left_exists:

            anchor = left_hand[0]

        elif right_exists:

            anchor = right_hand[0]

        else:

            anchor = np.zeros(
                3,
                dtype=np.float32
            )

        # =================================
        # TRANSLATION NORMALIZATION
        # =================================

        if left_exists:

            left_hand = (
                left_hand - anchor
            )

        if right_exists:

            right_hand = (
                right_hand - anchor
            )

        # =================================
        # OPTIONAL SCALE NORMALIZATION
        # =================================

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
                        left_hand
                        / max_distance
                    )

                if right_exists:
                    right_hand = (
                        right_hand
                        / max_distance
                    )

        normalized_frame = np.concatenate([
            left_hand.flatten(),
            right_hand.flatten()
        ])

        normalized_sequence.append(
            normalized_frame
        )

    return np.array(
        normalized_sequence,
        dtype=np.float32
    )

# =========================================
# RESAMPLE
# =========================================

def resample_sequence(
    sequence,
    target_length
):

    current_length = len(sequence)

    if current_length == target_length:

        return np.array(
            sequence,
            dtype=np.float32
        )

    indices = np.linspace(
        0,
        current_length - 1,
        target_length
    ).astype(int)

    return np.array(
        sequence,
        dtype=np.float32
    )[indices]

# =========================================
# PROCESS VIDEO
# =========================================

def process_video(video_path):

    cap = cv2.VideoCapture(
        video_path
    )

    sequence = []

    detected_frames = 0
    total_frames = 0

    while True:

        ret, frame = cap.read()

        if not ret:
            break

        total_frames += 1

        landmarks, detected = (
            extract_landmarks(frame)
        )

        if detected:
            detected_frames += 1

        sequence.append(
            landmarks
        )

    cap.release()

    if total_frames == 0:
        return None

    detection_ratio = (
        detected_frames
        / total_frames
    )

    if detection_ratio < MIN_DETECTION_RATIO:

        print(
            f"SKIP ({detection_ratio:.2%}) "
            f"{os.path.basename(video_path)}"
        )

        return None

    sequence = resample_sequence(
        sequence,
        SEQUENCE_LENGTH
    )

    sequence = normalize_landmarks(
        sequence
    )

    return sequence

# =========================================
# MAIN
# =========================================

labels = sorted(
    os.listdir(INPUT_PATH)
)

for label in labels:

    label_input = os.path.join(
        INPUT_PATH,
        label
    )

    if not os.path.isdir(
        label_input
    ):
        continue

    label_output = os.path.join(
        OUTPUT_PATH,
        label
    )

    os.makedirs(
        label_output,
        exist_ok=True
    )

    videos = [

        file

        for file in os.listdir(
            label_input
        )

        if file.endswith(".avi")
    ]

    print(
        f"\nProcessing Label: {label}"
    )

    for video_name in tqdm(videos):

        video_path = os.path.join(
            label_input,
            video_name
        )

        sequence = process_video(
            video_path
        )

        if sequence is None:
            continue

        output_name = (
            video_name
            .replace(".avi", ".npy")
        )

        output_path = os.path.join(
            label_output,
            output_name
        )

        np.save(
            output_path,
            sequence
        )

print("\nPreprocessing selesai.")

hands.close()