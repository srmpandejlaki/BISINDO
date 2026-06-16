import os
import numpy as np
from pathlib import Path


class PreprocessDataset:
  def __init__(self, input_path, output_path, sequence_length, feature_size,
               use_augmentation, noise_level, scale_range,
               use_frame_dropout=False, frame_dropout_prob=0.1):
    self.input_path = input_path
    self.output_path = output_path
    self.sequence_length = sequence_length
    self.feature_size = feature_size
    self.use_augmentation = use_augmentation
    self.noise_level = noise_level
    self.scale_range = scale_range
    self.use_frame_dropout = use_frame_dropout
    self.frame_dropout_prob = frame_dropout_prob

    # Create output directory if it doesn't exist
    os.makedirs(self.output_path, exist_ok=True)

  # =========================================
  # NORMALIZATION
  # =========================================

  def normalize_scale(self, hand):
    """Normalisasi skala tangan berdasarkan jarak wrist ke middle finger MCP."""
    wrist = hand[0]
    ref_point = hand[9]  # middle finger MCP
    scale = np.linalg.norm(ref_point - wrist)
    if scale > 0:
      hand = hand / scale
    return hand

  def normalize_wrist(self, frame):
    """
    Normalisasi posisi berdasarkan wrist (origin).
    - Jika kedua tangan aktif: gunakan wrist kanan sebagai origin bersama
      dan scale factor bersama agar hubungan spasial antar tangan terjaga.
    - Jika hanya satu tangan aktif: normalisasi independen.
    """
    frame = np.array(frame)
    left = frame[:63].reshape(21, 3)
    right = frame[63:].reshape(21, 3)

    left_present = not np.all(left == 0)
    right_present = not np.all(right == 0)

    if left_present and right_present:
      # KEDUA TANGAN AKTIF: Gunakan wrist kanan sebagai origin bersama
      wrist_ref = right[0]
      ref_point = right[9]
      scale = np.linalg.norm(ref_point - wrist_ref)

      left = left - wrist_ref
      right = right - wrist_ref

      if scale > 0:
        left = left / scale
        right = right / scale

    elif left_present:
      wrist_left = left[0]
      left = left - wrist_left
      left = self.normalize_scale(left)

    elif right_present:
      wrist_right = right[0]
      right = right - wrist_right
      right = self.normalize_scale(right)

    return np.concatenate([left.flatten(), right.flatten()])

  # =========================================
  # HAND-AWARE AUGMENTATION
  # =========================================

  def add_noise(self, sequence):
    """Menambahkan noise hanya pada tangan yang aktif (tidak all zeros)."""
    seq = sequence.copy()
    for frame_idx in range(len(seq)):
      frame = seq[frame_idx]
      left = frame[:63]
      right = frame[63:]

      if not np.all(left == 0):
        noise_left = np.random.normal(0, self.noise_level, left.shape)
        frame[:63] = left + noise_left

      if not np.all(right == 0):
        noise_right = np.random.normal(0, self.noise_level, right.shape)
        frame[63:] = right + noise_right

    return seq

  def random_scale(self, sequence):
    """Melakukan scaling acak secara konsisten pada tangan yang aktif."""
    seq = sequence.copy()
    scale = np.random.uniform(*self.scale_range)

    for frame_idx in range(len(seq)):
      frame = seq[frame_idx]
      left = frame[:63]
      right = frame[63:]

      if not np.all(left == 0):
        frame[:63] = left * scale

      if not np.all(right == 0):
        frame[63:] = right * scale

    return seq

  def frame_dropout(self, sequence):
    """Menghapus beberapa frame secara acak (temporal augmentation)."""
    new_seq = []
    for frame in sequence:
      if np.random.rand() > self.frame_dropout_prob:
        new_seq.append(frame)
    return np.array(new_seq)

  def pad_sequence(self, seq):
    """Menjaga panjang sequence tetap konsisten setelah frame dropout."""
    target_len = self.sequence_length
    if len(seq) >= target_len:
      return seq[:target_len]
    pad = np.zeros((target_len - len(seq), seq.shape[1]))
    return np.vstack([seq, pad])

  # =========================================
  # CORE PROCESSING
  # =========================================

  def process_file(self, file_path):
    """Memproses satu file .npy: validasi shape + normalisasi wrist."""
    try:
      data = np.load(file_path)

      if data.shape != (self.sequence_length, self.feature_size):
        print(f"Skip (shape salah): {file_path} (shape: {data.shape})")
        return None

      processed_sequence = []
      for frame in data:
        new_frame = self.normalize_wrist(frame)
        processed_sequence.append(new_frame)

      return np.array(processed_sequence)

    except Exception as e:
      print(f"Error: {file_path} -> {e}")
      return None

  def augment_sequence(self, sequence):
    """Apply augmentation pipeline pada sequence yang sudah dinormalisasi."""
    seq = sequence.copy()

    if self.use_frame_dropout:
      seq = self.frame_dropout(seq)
      seq = self.pad_sequence(seq)

    seq = self.add_noise(seq)
    seq = self.random_scale(seq)

    return seq

  # =========================================
  # MAIN PIPELINE
  # =========================================

  def preprocess(self, raw_data_list):
    """
    Pipeline utama: iterasi seluruh RawData records, process + augment + save.
    raw_data_list: list of RawData ORM objects with .dataFilePath and .label.labelName
    Returns: dict with stats about processing results.
    """
    total_processed = 0
    total_augmented = 0
    total_skipped = 0

    for raw_data in raw_data_list:
      file_path = raw_data.dataFilePath
      label_name = raw_data.label.labelName

      # Create label output directory
      label_output_path = os.path.join(self.output_path, label_name)
      os.makedirs(label_output_path, exist_ok=True)

      # Process file
      processed = self.process_file(file_path)

      if processed is None:
        total_skipped += 1
        continue

      # Save processed file
      file_name = Path(file_path).name
      output_file = os.path.join(label_output_path, file_name)
      np.save(output_file, processed)
      total_processed += 1

      # Augmentation
      if self.use_augmentation:
        augmented = self.augment_sequence(processed)
        aug_file_name = file_name.replace(".npy", "_aug.npy")
        output_aug_file = os.path.join(label_output_path, aug_file_name)
        np.save(output_aug_file, augmented)
        total_augmented += 1

    return {
      "total_processed": total_processed,
      "total_augmented": total_augmented,
      "total_skipped": total_skipped,
      "output_path": self.output_path
    }