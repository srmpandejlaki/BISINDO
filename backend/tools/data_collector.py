import cv2
import os
import csv
import time
from datetime import datetime

# =====================================
# CONFIG
# =====================================

DATASET_PATH = "dataset_raw"
VIDEO_DURATION = 2
TARGET_FPS = 30

os.makedirs(DATASET_PATH, exist_ok=True)

METADATA_FILE = os.path.join(DATASET_PATH, "metadata.csv")

# =====================================
# METADATA
# =====================================

if not os.path.exists(METADATA_FILE):
    with open(METADATA_FILE, "w", newline="") as f:
        writer = csv.writer(f)

        writer.writerow([
            "filename",
            "label",
            "duration",
            "fps",
            "created_at"
        ])

# =====================================
# FUNCTION
# =====================================

def get_next_filename(label):

    label_folder = os.path.join(DATASET_PATH, label)

    os.makedirs(label_folder, exist_ok=True)

    files = [
        f for f in os.listdir(label_folder)
        if f.endswith(".avi")
    ]

    next_number = len(files) + 1

    filename = f"{label}_{next_number:03d}.avi"

    return os.path.join(label_folder, filename)


def count_label_data(label):

    label_folder = os.path.join(DATASET_PATH, label)

    if not os.path.exists(label_folder):
        return 0

    return len([
        f for f in os.listdir(label_folder)
        if f.endswith(".avi")
    ])


def save_metadata(filename, label):

    with open(METADATA_FILE, "a", newline="") as f:

        writer = csv.writer(f)

        writer.writerow([
            filename,
            label,
            VIDEO_DURATION,
            TARGET_FPS,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ])


# =====================================
# INPUT LABEL
# =====================================

while True:

    label = input("Masukkan Label (A-Z): ").upper()

    if len(label) == 1 and label.isalpha():
        break

    print("Label harus satu huruf A-Z")

# =====================================
# CAMERA
# =====================================

cap = cv2.VideoCapture(0)

cap.set(cv2.CAP_PROP_FPS, TARGET_FPS)

if not cap.isOpened():
    print("Kamera tidak ditemukan")
    exit()

print("\n==============================")
print("Label :", label)
print("Jumlah data :", count_label_data(label))
print("==============================")
print("SPACE = Rekam")
print("L = Ganti Label")
print("ESC = Keluar")

# =====================================
# MAIN LOOP
# =====================================

while True:

    ret, frame = cap.read()

    if not ret:
        break

    display = frame.copy()

    cv2.putText(
        display,
        f"Label : {label}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 0),
        2
    )

    cv2.putText(
        display,
        f"Data : {count_label_data(label)}",
        (20, 80),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 0),
        2
    )

    cv2.putText(
        display,
        "SPACE=Record | L=Change Label | ESC=Exit",
        (20, 120),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (255, 255, 255),
        2
    )

    cv2.imshow("BISINDO Dataset Recorder", display)

    key = cv2.waitKey(1) & 0xFF

    # ESC
    if key == 27:
        break

    # CHANGE LABEL
    elif key == ord("l"):

        new_label = input("\nLabel Baru (A-Z): ").upper()

        if len(new_label) == 1 and new_label.isalpha():
            label = new_label

    # RECORD
    elif key == 32:

        # =========================
        # COUNTDOWN
        # =========================

        for i in range(3, 0, -1):

            start = time.time()

            while time.time() - start < 1:

                ret, frame = cap.read()

                temp = frame.copy()

                cv2.putText(
                    temp,
                    str(i),
                    (300, 250),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    5,
                    (0, 0, 255),
                    8
                )

                cv2.imshow(
                    "BISINDO Dataset Recorder",
                    temp
                )

                cv2.waitKey(1)

        # =========================
        # FILE
        # =========================

        filepath = get_next_filename(label)

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        writer = cv2.VideoWriter(
            filepath,
            cv2.VideoWriter_fourcc(*"XVID"),
            TARGET_FPS,
            (width, height)
        )

        print(f"\nRecording : {filepath}")

        start_time = time.time()

        while time.time() - start_time < VIDEO_DURATION:

            ret, frame = cap.read()

            if not ret:
                break

            writer.write(frame)

            temp = frame.copy()

            cv2.putText(
                temp,
                "RECORDING",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 0, 255),
                2
            )

            cv2.imshow(
                "BISINDO Dataset Recorder",
                temp
            )

            cv2.waitKey(1)

        writer.release()

        save_metadata(
            os.path.basename(filepath),
            label
        )

        print("Saved :", filepath)
        print("Total data :", count_label_data(label))

# =====================================
# CLOSE
# =====================================

cap.release()
cv2.destroyAllWindows()