import os
import cv2
import numpy as np


class VideoPreprocessor:
    def __init__(self, target_frame: int = 60):
        self.target_frame = target_frame

    def validate(self, input_path: str):
        """
        Validasi apakah video dapat diproses.
        """

        cap = cv2.VideoCapture(input_path)

        if not cap.isOpened():
            return {
                "valid": False,
                "message": "Video tidak dapat dibuka."
            }

        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        cap.release()

        if frame_count == 0:
            return {
                "valid": False,
                "message": "Video tidak memiliki frame."
            }

        return {
            "valid": True,
            "frame_count": frame_count,
            "fps": fps,
            "width": width,
            "height": height
        }

    def read_frames(self, input_path: str):
        """
        Membaca seluruh frame video.
        """

        cap = cv2.VideoCapture(input_path)

        frames = []

        while True:
            ret, frame = cap.read()

            if not ret:
                break

            frames.append(frame)

        fps = cap.get(cv2.CAP_PROP_FPS)

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        cap.release()

        return frames, fps, width, height

    def standardize_frames(self, frames):
        """
        Menyeragamkan jumlah frame menjadi target_frame.
        """

        original_count = len(frames)

        if original_count == self.target_frame:
            return frames

        indices = np.linspace(
            0,
            original_count - 1,
            self.target_frame
        ).astype(int)

        return [frames[i] for i in indices]

    def save_video(
        self,
        frames,
        output_path,
        fps,
        width,
        height
    ):
        """
        Menyimpan video hasil preprocessing.
        """

        os.makedirs(
            os.path.dirname(output_path),
            exist_ok=True
        )

        fourcc = cv2.VideoWriter_fourcc(*"mp4v")

        writer = cv2.VideoWriter(
            output_path,
            fourcc,
            fps,
            (width, height)
        )

        for frame in frames:
            writer.write(frame)

        writer.release()

        # ============================
        # Validasi hasil video
        # ============================
        cap = cv2.VideoCapture(output_path)

        read_count = 0

        while True:
            ret, frame = cap.read()

            if not ret:
                break

            read_count += 1

        metadata_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        cap.release()

        print(f"\n=== VALIDASI PREPROCESS ===")
        print(f"Output : {output_path}")
        print(f"Frame ditulis     : {len(frames)}")
        print(f"Metadata frame    : {metadata_count}")
        print(f"Frame terbaca     : {read_count}")
        print("============================")

    def preprocess(
        self,
        input_path: str,
        output_path: str
    ):
        """
        Menjalankan seluruh proses preprocessing.
        """

        validation = self.validate(input_path)

        if not validation["valid"]:
            raise ValueError(validation["message"])

        frames, fps, width, height = self.read_frames(
            input_path
        )

        standardized_frames = self.standardize_frames(
            frames
        )

        self.save_video(
            standardized_frames,
            output_path,
            fps,
            width,
            height
        )

        return {
            "input_path": input_path,
            "output_path": output_path,
            "original_frame_count": len(frames),
            "processed_frame_count": len(standardized_frames),
            "fps": fps,
            "width": width,
            "height": height
        }