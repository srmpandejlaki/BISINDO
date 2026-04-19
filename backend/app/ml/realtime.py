# =========================================
# IMPORT
# =========================================
import cv2
import numpy as np
import os
import json
import mediapipe as mp
from tensorflow.keras.models import load_model
from collections import deque

# =========================================
# PATH CONFIG
# =========================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

MODEL_PATH = os.path.join(BASE_DIR, "app", "ml", "models", "bisindo_lstm.h5")
LABEL_PATH = os.path.join(BASE_DIR, "app", "ml", "models", "labels.json")

SEQUENCE_LENGTH = 30

# =========================================
# LOAD MODEL & LABEL
# =========================================
model = load_model(MODEL_PATH)

with open(LABEL_PATH, "r") as f:
    label_map = json.load(f)

# reverse mapping (angka → huruf)
reverse_label_map = {v: k for k, v in label_map.items()}

# =========================================
# MEDIAPIPE SETUP
# =========================================
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

hands = mp_hands.Hands(max_num_hands=2)

# =========================================
# SEQUENCE BUFFER (PAKAI QUEUE)
# =========================================
sequence = deque(maxlen=SEQUENCE_LENGTH)

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

    # Convert warna untuk mediapipe
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

            # gambar skeleton tangan
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

    # kalau tidak terdeteksi → isi nol
    if len(left_hand) == 0:
        left_hand = [0] * 63
    if len(right_hand) == 0:
        right_hand = [0] * 63

    keypoints = left_hand + right_hand

    # =========================================
    # MASUKKAN KE SEQUENCE
    # =========================================
    sequence.append(keypoints)

    prediction_text = "..."

    # =========================================
    # PREDIKSI (JIKA SUDAH 30 FRAME)
    # =========================================
    if len(sequence) == SEQUENCE_LENGTH:
        input_data = np.array(sequence)

        # normalisasi (harus sama seperti training!)
        input_data = input_data / np.max(input_data)

        input_data = np.expand_dims(input_data, axis=0)  # (1, 30, 126)

        prediction = model.predict(input_data, verbose=0)[0]

        predicted_class = np.argmax(prediction)
        confidence = prediction[predicted_class]

        prediction_text = f"{reverse_label_map[predicted_class]} ({confidence:.2f})"

    # =========================================
    # DISPLAY
    # =========================================
    cv2.putText(image, f"Prediction: {prediction_text}",
                (10, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 255, 0),
                2)

    cv2.imshow("BISINDO Realtime", image)

    if cv2.waitKey(10) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()