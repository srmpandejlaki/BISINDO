import os
import numpy as np
from sqlalchemy.orm import Session

from app.database.models import Training, Dataset
from app.repositories import TrainingRepository


class BisindoTestService:
    def __init__(self):
        self.training_repository = TrainingRepository()
        self.model_cache = {}

    async def realtime_inference_websocket(self, websocket, idTraining: int, db: Session):
        from fastapi import WebSocketDisconnect
        import cv2
        import numpy as np
        from collections import deque
        import json
        import os
        from tensorflow.keras import backend as K
        from tensorflow.keras.models import load_model
        from app.ml.hand_skeleton.extractor import HandSkeletonExtractor

        # =========================================
        # 1. GET TRAINING MODEL
        # =========================================
        if idTraining == 0:
            training = db.query(Training).order_by(Training.idTraining.desc()).first()
        else:
            training = db.query(Training).filter(Training.idTraining == idTraining).first()

        if not training:
            await websocket.close(code=4004, reason="Training tidak ditemukan")
            return

        if not training.trainModelPath or not os.path.exists(training.trainModelPath):
            await websocket.close(code=4004, reason="Model tidak ditemukan")
            return

        # =========================================
        # 2. LOAD LABELS
        # =========================================
        dataset = db.query(Dataset).filter(Dataset.idDataset == training.idDataset).first()

        label_json_path = os.path.join(
            "app",
            "ml",
            "models",
            "labels.json"
        )

        if os.path.exists(label_json_path):
            with open(label_json_path, "r") as f:
                label_map = json.load(f)

            labels = [
                label
                for label, _
                in sorted(label_map.items(), key=lambda x: x[1])
            ]
        else:
            labels = [chr(i) for i in range(ord("A"), ord("Z") + 1)]

        # =========================================
        # 3. LOAD MODEL
        # =========================================
        model_path = training.trainModelPath

        if model_path not in self.model_cache:
            self.model_cache[model_path] = load_model(model_path)

        model = self.model_cache[model_path]

        sequence_length = model.input_shape[1] if model.input_shape[1] else 60
        sequence = deque(maxlen=sequence_length)
        hands_history = deque(maxlen=sequence_length)

        # =========================================
        # 4. HAND LANDMARK EXTRACTOR
        # =========================================
        # Use exact same MediaPipe configuration as training, but set min_detection_ratio=0
        # since we are streaming real-time frames individually.
        extractor = HandSkeletonExtractor(min_detection_ratio=0.0)

        await websocket.accept()

        try:
            while True:
                data = await websocket.receive_bytes()

                try:
                    msg = json.loads(data)
                    if msg.get("reset"):
                        sequence.clear()
                        hands_history.clear()
                        continue
                except Exception:
                    pass  # not JSON, continue with normal frame processing
                
                nparr = np.frombuffer(data, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                if frame is None:
                    continue

                # =========================================
                # EXTRACT LANDMARKS (SAME AS TRAINING)
                # =========================================
                landmarks, hand_detected = extractor.extract_landmarks(frame)
                
                # Count hands detected: Left is at [63:], Right is at [:63] in extractor.py
                detected_hands = 0
                if hand_detected:
                    left_exists = np.any(landmarks[63:])
                    right_exists = np.any(landmarks[:63])
                    if left_exists and right_exists:
                        detected_hands = 2
                    elif left_exists or right_exists:
                        detected_hands = 1

                sequence.append(landmarks)
                hands_history.append(detected_hands)

                # =========================================
                # PREDICTION
                # =========================================
                if len(sequence) == sequence_length:
                    # Convert deque of frames to a numpy array of shape (sequence_length, 126)
                    seq_arr = np.array(sequence, dtype=np.float32)

                    # Normalize using the EXACT same logic as training
                    processed_sequence = extractor.normalize_landmarks(seq_arr)

                    X_input = np.expand_dims(processed_sequence, axis=0)

                    prediction = model.predict(X_input, verbose=0)[0]

                    predicted_class = np.argmax(prediction)
                    confidence = float(prediction[predicted_class])
                    predicted_label = labels[predicted_class]

                    avg_hands_detected = round(np.mean(hands_history))

                    await websocket.send_json({
                        "success": True,
                        "predicted_label": predicted_label,
                        "confidence": confidence,
                        "hands_detected": avg_hands_detected
                    })

                else:
                    await websocket.send_json({
                        "success": True,
                        "accumulating": True,
                        "predicted_label": "...",
                        "confidence": 0.0,
                        "frames_count": len(sequence),
                        "required_frames": sequence_length,
                        "hands_detected": detected_hands
                    })

        except WebSocketDisconnect:
            pass

        except Exception as e:
            try:
                await websocket.send_json({
                    "success": False,
                    "error": str(e)
                })
            except:
                pass

        finally:
            extractor.close()
