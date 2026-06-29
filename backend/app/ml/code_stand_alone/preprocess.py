# =========================================
# IMPORT
# =========================================
import os
import numpy as np
from tqdm import tqdm

# =========================================
# CONFIG
# =========================================
INPUT_PATH = "dataset_v2"
OUTPUT_PATH = "dataset_processed_v2"

SEQUENCE_LENGTH = 60
FEATURE_SIZE = 126

# AUGMENTATION CONFIG
USE_AUGMENTATION = True
NOISE_LEVEL = 0.01
SCALE_RANGE = (0.9, 1.1)

# =========================================
# NORMALIZATION FUNCTIONS
# =========================================

def normalize_scale(hand):
    """
    Normalisasi skala tangan berdasarkan jarak wrist ke titik referensi
    """
    wrist = hand[0]
    ref_point = hand[9]  # middle finger MCP

    scale = np.linalg.norm(ref_point - wrist)

    if scale > 0:
        hand = hand / scale

    return hand


def normalize_wrist(frame):
    """
    Normalisasi posisi berdasarkan wrist (origin)
    + scale normalization
    """
    frame = np.array(frame)

    left = frame[:63].reshape(21, 3)
    right = frame[63:].reshape(21, 3)

    # LEFT HAND
    if not np.all(left == 0):
        wrist_left = left[0]
        left = left - wrist_left
        left = normalize_scale(left)

    # RIGHT HAND
    if not np.all(right == 0):
        wrist_right = right[0]
        right = right - wrist_right
        right = normalize_scale(right)

    return np.concatenate([left.flatten(), right.flatten()])


# =========================================
# AUGMENTATION FUNCTIONS
# =========================================

def add_noise(sequence, noise_level=0.01):
    noise = np.random.normal(0, noise_level, sequence.shape)
    return sequence + noise


def random_scale(sequence, scale_range=(0.9, 1.1)):
    scale = np.random.uniform(*scale_range)
    return sequence * scale


def frame_dropout(sequence, drop_prob=0.1):
    """
    Menghapus beberapa frame secara acak (temporal augmentation)
    """
    new_seq = []
    for frame in sequence:
        if np.random.rand() > drop_prob:
            new_seq.append(frame)

    return np.array(new_seq)


def pad_sequence(seq, target_len=30):
    """
    Menjaga panjang sequence tetap konsisten
    """
    if len(seq) >= target_len:
        return seq[:target_len]

    pad = np.zeros((target_len - len(seq), seq.shape[1]))
    return np.vstack([seq, pad])


# =========================================
# PROCESS ONE FILE
# =========================================

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


# =========================================
# APPLY AUGMENTATION
# =========================================

def augment_sequence(sequence):
    seq = sequence.copy()

    # Noise
    seq = add_noise(seq, NOISE_LEVEL)

    # Random scale
    seq = random_scale(seq, SCALE_RANGE)

    # (Opsional) frame dropout
    # seq = frame_dropout(seq, drop_prob=0.1)
    # seq = pad_sequence(seq, SEQUENCE_LENGTH)

    return seq


# =========================================
# MAIN PROCESS
# =========================================

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

            # ===== ORIGINAL PROCESSED =====
            processed = process_file(input_file)

            if processed is not None:
                output_file = os.path.join(output_label_path, file)
                np.save(output_file, processed)

                # ===== AUGMENTATION =====
                if USE_AUGMENTATION:
                    augmented = augment_sequence(processed)

                    aug_file = file.replace(".npy", "_aug.npy")
                    output_aug_file = os.path.join(output_label_path, aug_file)

                    np.save(output_aug_file, augmented)


if __name__ == "__main__":
    main()