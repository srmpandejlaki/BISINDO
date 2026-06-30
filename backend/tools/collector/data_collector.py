import cv2
import os
import csv
import struct
import time
from datetime import datetime
import subprocess
import shutil

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

FFMPEG_PATH = os.path.join(
    BASE_DIR,
    "ffmpeg",
    "ffmpeg.exe"
)

# =====================================
# CONFIG
# =====================================

DATASET_PATH = "storage/raw_data/dataset_dummy"
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
def convert_to_browser_mp4(input_path):
    """
    Mengubah video hasil OpenCV (mp4v)
    menjadi MP4 H264 yang kompatibel
    dengan browser HTML5.
    """

    output_path = input_path.replace(".mp4", "_temp.mp4")

    command = [
        FFMPEG_PATH,
        "-y",
        "-i",
        input_path,
        "-c:v", "libx264",
        "-preset", "medium",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-an",
        output_path
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True
    )

    print(result.stdout)
    print(result.stderr)

    os.replace(output_path, input_path)

    print("  ✓ Video dikonversi ke H.264 + FastStart")

# =====================================
# HELPER FUNCTIONS
# =====================================

def get_next_filename(label):
    label_folder = os.path.join(DATASET_PATH, label)
    os.makedirs(label_folder, exist_ok=True)
    files = [f for f in os.listdir(label_folder) if f.endswith(".mp4")]
    next_number = len(files) + 1
    filename = f"{label}_{next_number:03d}.mp4"
    return os.path.join(label_folder, filename)


def count_label_data(label):
    label_folder = os.path.join(DATASET_PATH, label)
    if not os.path.exists(label_folder):
        return 0
    return len([f for f in os.listdir(label_folder) if f.endswith(".mp4")])


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

width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

print("\n==============================")
print("Label      :", label)
print("Jumlah data:", count_label_data(label))
print(f"Resolusi   : {width}x{height} @ {TARGET_FPS}fps")
print("==============================")
print("SPACE = Rekam")
print("L     = Ganti Label")
print("ESC   = Keluar")

# =====================================
# MAIN LOOP
# =====================================

while True:

    ret, frame = cap.read()

    if not ret:
        break

    frame = cv2.flip(frame, 1)  # Mirror

    display = frame.copy()

    cv2.putText(
        display,
        f"Label : {label}  |  Data : {count_label_data(label)}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0, 255, 0),
        2
    )

    cv2.putText(
        display,
        "SPACE=Record | L=Change Label | ESC=Exit",
        (20, 80),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (255, 255, 255),
        2
    )

    cv2.imshow("BISINDO Dataset Recorder", display)

    key = cv2.waitKey(1) & 0xFF

    # ESC — keluar
    if key == 27:
        break

    # L — ganti label
    elif key == ord("l"):
        new_label = input("\nLabel Baru (A-Z): ").upper()
        if len(new_label) == 1 and new_label.isalpha():
            label = new_label
            print(f"Label diganti ke: {label} (data saat ini: {count_label_data(label)})")

    # SPACE — mulai rekam
    elif key == 32:

        # =========================
        # COUNTDOWN 3..2..1
        # =========================

        for i in range(3, 0, -1):
            start = time.time()
            while time.time() - start < 1:
                ret, frame = cap.read()
                if not ret:
                    break
                frame = cv2.flip(frame, 1)
                temp = frame.copy()
                cv2.putText(
                    temp,
                    str(i),
                    (int(width / 2) - 40, int(height / 2) + 40),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    5,
                    (0, 0, 255),
                    8
                )
                cv2.imshow("BISINDO Dataset Recorder", temp)
                cv2.waitKey(1)

        # =========================
        # REKAM VIDEO
        # =========================

        filepath = get_next_filename(label)

        video_writer = cv2.VideoWriter(
            filepath,
            cv2.VideoWriter_fourcc(*"mp4v"),
            TARGET_FPS,
            (width, height)
        )

        print(f"\nRecording : {filepath}")

        start_time = time.time()

        while time.time() - start_time < VIDEO_DURATION:

            ret, frame = cap.read()

            if not ret:
                break

            frame = cv2.flip(frame, 1)

            video_writer.write(frame)

            temp = frame.copy()

            remaining = max(0.0, VIDEO_DURATION - (time.time() - start_time))

            cv2.putText(
                temp,
                f"● REC  {remaining:.1f}s",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 0, 255),
                2
            )

            cv2.imshow("BISINDO Dataset Recorder", temp)
            cv2.waitKey(1)

        video_writer.release()

        # =========================
        # FASTSTART: moov ke depan
        # =========================

        print("Mengonversi video ke format browser...")

        try:
            convert_to_browser_mp4(filepath)
        except Exception as e:
            print("Gagal konversi:", e)

        save_metadata(
            os.path.basename(filepath),
            label
        )

        print(f"Saved      : {filepath}")
        print(f"Total data : {count_label_data(label)}")

# =====================================
# CLOSE
# =====================================

cap.release()
cv2.destroyAllWindows()