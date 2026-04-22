import cv2
import numpy as np
import os
import mediapipe as mp
import random
import time

# ========================
# CONFIG
# ========================
LABELS = ["G"]  # tambah sampai A-Z nanti
SEQUENCE_LENGTH = 30
TARGET_PER_LABEL = 10
SAVE_PATH = "dataset"

# ========================
# FUNCTION: AMBIL INDEX TERAKHIR
# ========================
def get_last_index(folder_path):
    files = os.listdir(folder_path)

    if len(files) == 0:
        return 0

    indices = []

    for f in files:
        if f.endswith(".npy"):
            try:
                indices.append(int(f.replace(".npy", "")))
            except:
                pass

    if len(indices) == 0:
        return 0

    return max(indices) + 1

# ========================
# GENERATE SHUFFLED LIST
# ========================
all_data = []

for label in LABELS:
    all_data += [label] * TARGET_PER_LABEL

random.shuffle(all_data)

# ========================
# MEDIAPIPE
# ========================
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

hands = mp_hands.Hands(max_num_hands=2)

# ========================
# CREATE FOLDER + INIT COUNTER
# ========================
sequence_count = {}

for label in LABELS:
    folder = f"{SAVE_PATH}/{label}"
    os.makedirs(folder, exist_ok=True)

    # 🔥 ambil index terakhir dari dataset lama
    sequence_count[label] = get_last_index(folder)

    print(f"{label} mulai dari index: {sequence_count[label]}")

# ========================
# WEBCAM
# ========================
cap = cv2.VideoCapture(0)

current_index = 0
sequence = []

status = "GET READY"
start_time = time.time()

while cap.isOpened() and current_index < len(all_data):
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)

    label = all_data[current_index]

    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(image)
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

    # ========================
    # STATUS CONTROL
    # ========================
    if status == "GET READY":
        if time.time() - start_time > 5:  # 5 detik untuk bersiap
            status = "RECORDING"
            sequence = []

    elif status == "RECORDING":
        left_hand = []
        right_hand = []

        if results.multi_hand_landmarks:
            for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
                mp_drawing.draw_landmarks(
                    image, hand_landmarks, mp_hands.HAND_CONNECTIONS
                )

                label_hand = results.multi_handedness[idx].classification[0].label

                hand_keypoints = []
                for lm in hand_landmarks.landmark:
                    hand_keypoints.extend([lm.x, lm.y, lm.z])

                if label_hand == "Left":
                    left_hand = hand_keypoints
                else:
                    right_hand = hand_keypoints

        # kalau tangan tidak terdeteksi
        if len(left_hand) == 0:
            left_hand = [0]*63
        if len(right_hand) == 0:
            right_hand = [0]*63

        keypoints = left_hand + right_hand
        sequence.append(keypoints)

        # ========================
        # SAVE DATA
        # ========================
        if len(sequence) == SEQUENCE_LENGTH:
            np.save(
                f"{SAVE_PATH}/{label}/{sequence_count[label]}.npy",
                np.array(sequence)
            )

            print(f"Saved {label} #{sequence_count[label]}")

            sequence_count[label] += 1
            current_index += 1

            status = "GET READY"
            start_time = time.time()

    # ========================
    # DISPLAY
    # ========================
    cv2.putText(image, f"Label: {label}", (10, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)

    cv2.putText(image, f"Status: {status}", (10, 80),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)

    cv2.imshow("BISINDO Collector", image)

    if cv2.waitKey(10) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()