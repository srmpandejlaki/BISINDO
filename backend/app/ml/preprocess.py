import os
import numpy as np
from tqdm import tqdm

# ========================
# CONFIG
# ========================
INPUT_PATH = "dataset"
OUTPUT_PATH = "dataset_processed"

SEQUENCE_LENGTH = 30
FEATURE_SIZE = 126

# ========================
# NORMALIZATION FUNCTION
# ========================
def normalize_wrist(frame):
    frame = np.array(frame)

    # split left & right
    left = frame[:63].reshape(21, 3)
    right = frame[63:].reshape(21, 3)

    # wrist index = 0
    if not np.all(left == 0):
        wrist_left = left[0]
        left = left - wrist_left

    if not np.all(right == 0):
        wrist_right = right[0]
        right = right - wrist_right

    return np.concatenate([left.flatten(), right.flatten()])


# ========================
# PROCESS ONE FILE
# ========================
def process_file(file_path):
    try:
        data = np.load(file_path)

        # VALIDASI SHAPE
        if data.shape != (SEQUENCE_LENGTH, FEATURE_SIZE):
            print(f"Skip (shape salah): {file_path}")
            return None

        processed_sequence = []

        for frame in data:
            new_frame = normalize_wrist(frame)
            processed_sequence.append(new_frame)

        return np.array(processed_sequence)

    except Exception as e:
        print(f"Error: {file_path} -> {e}")
        return None


# ========================
# MAIN PROCESS
# ========================
def main():
    for label in os.listdir(INPUT_PATH):
        input_label_path = os.path.join(INPUT_PATH, label)

        if not os.path.isdir(input_label_path):
            continue

        output_label_path = os.path.join(OUTPUT_PATH, label)
        os.makedirs(output_label_path, exist_ok=True)

        files = os.listdir(input_label_path)

        print(f"\nProcessing label: {label}")

        for file in tqdm(files):
            if not file.endswith(".npy"):
                continue

            input_file = os.path.join(input_label_path, file)
            output_file = os.path.join(output_label_path, file)

            processed = process_file(input_file)

            if processed is not None:
                np.save(output_file, processed)


if __name__ == "__main__":
    main()