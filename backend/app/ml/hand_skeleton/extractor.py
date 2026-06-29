import os
import cv2
import numpy as np
import mediapipe as mp


class HandSkeletonExtractor:

  def __init__(
    self,
    max_num_hands: int = 2,
    min_detection_confidence: float = 0.5,
    min_tracking_confidence: float = 0.5,
    min_detection_ratio: float = 0.9,
  ):
    self.min_detection_ratio = min_detection_ratio

    self.hands = mp.solutions.hands.Hands(
        static_image_mode=False,
        max_num_hands=max_num_hands,
        min_detection_confidence=min_detection_confidence,
        min_tracking_confidence=min_tracking_confidence,
    )
  
  def extract_landmarks(self, frame):

    rgb = cv2.cvtColor(
      frame,
      cv2.COLOR_BGR2RGB
    )
    results = self.hands.process(rgb)

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
        label = (
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

        if label == "Right":
          landmarks[:63] = coords
        elif label == "Left":
          landmarks[63:] = coords

    return landmarks, hand_detected
  
  def normalize_landmarks(
    self,
    sequence
  ):
    normalized_sequence = []

    for frame in sequence:
      frame = frame.copy()

      left = frame[:63].reshape(21, 3)
      right = frame[63:].reshape(21, 3)

      left_exists = np.any(left)
      right_exists = np.any(right)

      if left_exists:
        anchor = left[0]

      elif right_exists:
        anchor = right[0]

      else:
        anchor = np.zeros(
            3,
            dtype=np.float32
        )

      if left_exists:
          left = left - anchor
      if right_exists:
          right = right - anchor

      all_points = []

      if left_exists:
          all_points.append(left)

      if right_exists:
          all_points.append(right)

      if all_points:
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
            left /= max_distance
          if right_exists:
            right /= max_distance

      normalized_sequence.append(
        np.concatenate([
          left.flatten(),
          right.flatten()
        ])
      )

    return np.array(
      normalized_sequence,
      dtype=np.float32
    )
  
  def process_video(
    self,
    input_path: str,
    output_path: str
  ):
    """
    Mengekstraksi landmark dari satu video dan
    menyimpannya menjadi file .npy.
    """

    cap = cv2.VideoCapture(input_path)

    if not cap.isOpened():
      raise ValueError("Video tidak dapat dibuka.")

    sequence = []

    total_frames = 0
    detected_frames = 0

    while True:
      ret, frame = cap.read()

      if not ret:
        break

      total_frames += 1

      landmarks, detected = self.extract_landmarks(
        frame
      )

      if detected:
        detected_frames += 1

      sequence.append(
        landmarks
      )

    cap.release()

    if total_frames == 0:
      raise ValueError("Video tidak memiliki frame.")

    detection_ratio = (
      detected_frames / total_frames
    )

    if detection_ratio < self.min_detection_ratio:
      raise ValueError(
        f"Deteksi tangan hanya "
        f"{detection_ratio:.2%}"
      )

    sequence = self.normalize_landmarks(
      sequence
    )

    self.save_landmarks(
      sequence,
      output_path
    )

    return {
      "input_path": input_path,
      "output_path": output_path,
      "frame_count": total_frames,
      "detected_frames": detected_frames,
      "detection_ratio": round(
        detection_ratio,
        4
      ),
      "success": True
    }
  
  def save_landmarks(
    self,
    sequence,
    output_path
  ):
    """
    Menyimpan hasil landmark menjadi file .npy.
    """

    os.makedirs(
      os.path.dirname(output_path),
      exist_ok=True
    )

    np.save(
      output_path,
      sequence
    )
  
  def close(self):
    self.hands.close()