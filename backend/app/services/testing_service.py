import os
import numpy as np
from sqlalchemy.orm import Session
from tensorflow.keras.models import load_model
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.utils import to_categorical
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    matthews_corrcoef,
    classification_report
)

from app.database.models import Training, Dataset, RatioDataSplit, Evaluation
from app.repositories import TrainingRepository, EvaluationRepository

class TestingService:
    def __init__(self):
        self.training_repository = TrainingRepository()
        self.evaluation_repository = EvaluationRepository()

    def load_dataset_with_filenames(self, dataset_path: str):
        X = []
        y = []
        filenames = []
        labels = sorted(os.listdir(dataset_path))
        
        for label in labels:
            label_path = os.path.join(dataset_path, label)
            if not os.path.isdir(label_path):
                continue
            for filename in os.listdir(label_path):
                if not filename.endswith(".npy"):
                    continue
                file_path = os.path.join(label_path, filename)
                data = np.load(file_path)
                X.append(data)
                y.append(label)
                filenames.append(f"{label}/{filename}")
                
        return np.array(X), np.array(y), filenames

    def test_model_on_dataset(self, db: Session, idTraining: int):
        # 1. Fetch Training record
        training = db.query(Training).filter(Training.idTraining == idTraining).first()
        if not training:
            raise ValueError("Model training record not found")
            
        if not training.trainModelPath or not os.path.exists(training.trainModelPath):
            raise ValueError(f"Model file not found at path: {training.trainModelPath}")

        # 2. Fetch associated Dataset
        dataset = db.query(Dataset).filter(Dataset.idDataset == training.idDataset).first()
        if not dataset or not dataset.preprocessingResultPath:
            raise ValueError("Dataset not found or has not been preprocessed")

        # 3. Fetch split ratio
        ratio_split = db.query(RatioDataSplit).filter(RatioDataSplit.idRatioDataSplit == training.idRatioDataSplit).first()
        test_size = 0.2
        if ratio_split and ratio_split.trainRatio:
            try:
                parts = ratio_split.trainRatio.split(":")
                if len(parts) == 2:
                    train_val = float(parts[0])
                    test_val = float(parts[1])
                    test_size = test_val / (train_val + test_val)
            except Exception:
                pass

        # 4. Load dataset
        X, y, filenames = self.load_dataset_with_filenames(dataset.preprocessingResultPath)
        if len(X) == 0:
            raise ValueError("Dataset is empty")

        # 5. Encode Labels
        encoder = LabelEncoder()
        y_encoded = encoder.fit_transform(y)
        y_categorical = to_categorical(y_encoded)
        labels = sorted(list(encoder.classes_))

        # 6. Reconstruct train_test_split (deterministic)
        X_train, X_test, y_train, y_test, filenames_train, filenames_test = train_test_split(
            X,
            y_categorical,
            filenames,
            test_size=test_size,
            random_state=42,
            stratify=y
        )

        # 7. Load model and predict
        from tensorflow.keras import backend as K
        K.clear_session()
        model = load_model(training.trainModelPath)
        
        y_pred_prob = model.predict(X_test, verbose=0)
        y_pred = np.argmax(y_pred_prob, axis=1)
        y_true = np.argmax(y_test, axis=1)

        # 8. Detailed predictions list
        predictions_details = []
        for i in range(len(filenames_test)):
            name = filenames_test[i]
            label_asli = labels[y_true[i]]
            prediksi = labels[y_pred[i]]
            confidence = float(y_pred_prob[i][y_pred[i]])
            keterangan = "Benar" if label_asli == prediksi else "Salah"
            
            predictions_details.append({
                "no": i + 1,
                "name": name,
                "label_asli": label_asli,
                "prediksi": prediksi,
                "confidence": f"{confidence * 100:.1f}%",
                "keterangan": keterangan
            })

        # 9. Compute evaluation metrics
        accuracy = float(accuracy_score(y_true, y_pred))
        precision = float(precision_score(y_true, y_pred, average="weighted", zero_division=0))
        recall = float(recall_score(y_true, y_pred, average="weighted", zero_division=0))
        f1score = float(f1_score(y_true, y_pred, average="weighted", zero_division=0))
        mcc = float(matthews_corrcoef(y_true, y_pred))
        
        report_dict = classification_report(y_true, y_pred, target_names=labels, output_dict=True, zero_division=0)
        macroAverage = float(report_dict["macro avg"]["f1-score"])
        weightedAverage = float(report_dict["weighted avg"]["f1-score"])
        
        cm = confusion_matrix(y_true, y_pred)
        confusionMatrix = cm.tolist()

        # 10. Save or update evaluation in DB
        eval_record = db.query(Evaluation).filter(Evaluation.idTraining == idTraining).first()
        if not eval_record:
            import datetime
            eval_record = Evaluation(
                idTraining=idTraining,
                createdAt=datetime.datetime.now()
            )
            db.add(eval_record)
            
        eval_record.accuracy = accuracy
        eval_record.precision = precision
        eval_record.recall = recall
        eval_record.f1score = f1score
        eval_record.confusionMatrix = confusionMatrix
        eval_record.weightedAverage = weightedAverage
        eval_record.macroAverage = macroAverage
        eval_record.mcc = mcc
        
        db.commit()
        db.refresh(eval_record)

        return {
            "summary": {
                "idEvaluation": eval_record.idEvaluation,
                "accuracy": accuracy,
                "precision": precision,
                "recall": recall,
                "f1score": f1score,
                "mcc": mcc,
                "macroAverage": macroAverage,
                "weightedAverage": weightedAverage,
                "confusionMatrix": confusionMatrix
            },
            "predictions": predictions_details
        }

    def test_model_on_upload(self, db: Session, idTraining: int, file_path: str, filename: str):
        # 1. Fetch Training record
        training = db.query(Training).filter(Training.idTraining == idTraining).first()
        if not training:
            raise ValueError("Model training record not found")
            
        if not training.trainModelPath or not os.path.exists(training.trainModelPath):
            raise ValueError(f"Model file not found at path: {training.trainModelPath}")

        # 2. Fetch dataset to get label map
        dataset = db.query(Dataset).filter(Dataset.idDataset == training.idDataset).first()
        if not dataset or not dataset.preprocessingResultPath:
            raise ValueError("Dataset not found or has not been preprocessed")

        labels = sorted(os.listdir(dataset.preprocessingResultPath))

        # 3. Load model to get expected sequence length
        from tensorflow.keras import backend as K
        K.clear_session()
        model = load_model(training.trainModelPath)
        
        # Expected shape is (None, SEQUENCE_LENGTH, 126)
        sequence_length = model.input_shape[1] if model.input_shape[1] is not None else 60

        # 4. Process upload based on file type
        if filename.endswith(".npy"):
            # Condition 1: Loaded keypoint array
            data = np.load(file_path)
            # If batch dim exists, e.g. (1, 60, 126), squeeze it first
            if len(data.shape) == 3 and data.shape[0] == 1:
                data = data[0]
                
            if len(data.shape) != 2 or data.shape[1] != 126:
                raise ValueError(f"Dimensi berkas .npy salah. Harus (N, 126), didapat {data.shape}")
                
            # Resample sequence if sequence length differs
            if data.shape[0] != sequence_length:
                indices = np.linspace(0, data.shape[0] - 1, sequence_length).astype(int)
                data = data[indices]
                
            X_single = np.expand_dims(data, axis=0)
        else:
            # Condition 2: Video file. Process through MediaPipe Holistic/Hands extraction
            X_single_sequence = self.extract_landmarks_from_video(file_path, sequence_length)
            X_single = np.expand_dims(X_single_sequence, axis=0)

        # 5. Predict
        prediction = model.predict(X_single, verbose=0)[0]
        predicted_class = np.argmax(prediction)
        confidence = float(prediction[predicted_class])
        predicted_label = labels[predicted_class]

        return {
            "predicted_label": predicted_label,
            "confidence": f"{confidence * 100:.1f}%"
        }

    def extract_landmarks_from_video(self, video_path: str, sequence_length: int):
        import cv2
        import mediapipe as mp
        
        mp_hands = mp.solutions.hands
        hands = mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        cap = cv2.VideoCapture(video_path)
        sequence = []
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(rgb)
            
            landmarks = np.zeros(126, dtype=np.float32)
            if results.multi_hand_landmarks and results.multi_handedness:
                for hand_landmarks, handedness in zip(results.multi_hand_landmarks, results.multi_handedness):
                    hand_label = handedness.classification[0].label
                    coords = []
                    for lm in hand_landmarks.landmark:
                        coords.extend([lm.x, lm.y, lm.z])
                    coords = np.array(coords, dtype=np.float32)
                    
                    if hand_label == "Left":
                        landmarks[63:] = coords
                    elif hand_label == "Right":
                        landmarks[:63] = coords
                        
            sequence.append(landmarks)
            
        cap.release()
        hands.close()
        
        if len(sequence) == 0:
            raise ValueError("Gagal mengekstrak frame dari video. Berkas video mungkin rusak atau kosong.")
            
        # Resample
        sequence = np.array(sequence, dtype=np.float32)
        indices = np.linspace(0, len(sequence) - 1, sequence_length).astype(int)
        sequence = sequence[indices]
        
        # Normalization
        normalized_sequence = []
        for frame in sequence:
            frame = frame.copy()
            left_hand = frame[:63].reshape(21, 3)
            right_hand = frame[63:].reshape(21, 3)
            
            left_exists = np.any(left_hand)
            right_exists = np.any(right_hand)
            
            if left_exists:
                anchor = left_hand[0]
            elif right_exists:
                anchor = right_hand[0]
            else:
                anchor = np.zeros(3, dtype=np.float32)
                
            if left_exists:
                left_hand = left_hand - anchor
            if right_exists:
                right_hand = right_hand - anchor
                
            all_points = []
            if left_exists:
                all_points.append(left_hand)
            if right_exists:
                all_points.append(right_hand)
                
            if len(all_points) > 0:
                all_points = np.vstack(all_points)
                max_distance = np.max(np.linalg.norm(all_points, axis=1))
                if max_distance > 0:
                     if left_exists:
                         left_hand = left_hand / max_distance
                     if right_exists:
                         right_hand = right_hand / max_distance
                         
            normalized_frame = np.concatenate([left_hand.flatten(), right_hand.flatten()])
            normalized_sequence.append(normalized_frame)
            
        return np.array(normalized_sequence, dtype=np.float32)

    def get_evaluation_by_training_id(self, db: Session, idTraining: int):
        eval_record = db.query(Evaluation).filter(Evaluation.idTraining == idTraining).first()
        if not eval_record:
            return None
            
        return {
            "idEvaluation": eval_record.idEvaluation,
            "idTraining": eval_record.idTraining,
            "accuracy": eval_record.accuracy,
            "precision": eval_record.precision,
            "recall": eval_record.recall,
            "f1score": eval_record.f1score,
            "confusionMatrix": eval_record.confusionMatrix,
            "weightedAverage": eval_record.weightedAverage,
            "macroAverage": eval_record.macroAverage,
            "mcc": eval_record.mcc,
            "createdAt": eval_record.createdAt.isoformat() if eval_record.createdAt else None
        }

    async def realtime_inference_websocket(self, websocket, idTraining: int, db: Session):
        from fastapi import WebSocketDisconnect
        import cv2
        import mediapipe as mp
        import numpy as np
        from collections import deque
        import json
        import os
        from tensorflow.keras import backend as K
        from tensorflow.keras.models import load_model

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

        if dataset and dataset.preprocessingResultPath and os.path.exists(dataset.preprocessingResultPath):
            labels = sorted(os.listdir(dataset.preprocessingResultPath))
        else:
            label_json_path = os.path.join("app", "ml", "models", "labels.json")
            if os.path.exists(label_json_path):
                with open(label_json_path, "r") as f:
                    label_map = json.load(f)
                labels = sorted(list(label_map.keys()))
            else:
                labels = [chr(i) for i in range(ord('A'), ord('Z') + 1)]

        # =========================================
        # 3. LOAD MODEL
        # =========================================
        K.clear_session()
        model = load_model(training.trainModelPath)

        sequence_length = model.input_shape[1] if model.input_shape[1] else 60
        sequence = deque(maxlen=sequence_length)

        # =========================================
        # 4. MEDIAPIPE
        # =========================================
        mp_hands = mp.solutions.hands
        hands = mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

        await websocket.accept()

        # =========================================
        # 🔥 NORMALIZATION (SAMA PERSIS TRAINING)
        # =========================================
        def normalize_hand(hand):
            wrist = hand[0]
            ref_point = hand[9]  # middle finger MCP
            scale = np.linalg.norm(ref_point - wrist)
            if scale > 0:
                hand = hand / scale
            return hand

        try:
            while True:
                data = await websocket.receive_bytes()
                nparr = np.frombuffer(data, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                if frame is None:
                    continue

                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = hands.process(rgb)

                # =========================================
                # FEATURE VECTOR
                # =========================================
                landmarks = np.zeros(126, dtype=np.float32)
                detected_hands = 0

                if results.multi_hand_landmarks and results.multi_handedness:
                    for hand_landmarks, handedness in zip(
                        results.multi_hand_landmarks,
                        results.multi_handedness
                    ):
                        label = handedness.classification[0].label

                        coords = []
                        for lm in hand_landmarks.landmark:
                            coords.extend([lm.x, lm.y, lm.z])

                        coords = np.array(coords, dtype=np.float32).reshape(21, 3)

                        # =========================================
                        # URUTAN HARUS SAMA TRAINING:
                        # Right = [:63], Left = [63:]
                        # =========================================
                        if label == "Right":
                            landmarks[:63] = coords.flatten()
                            detected_hands += 1

                        elif label == "Left":
                            landmarks[63:] = coords.flatten()
                            detected_hands += 1

                sequence.append(landmarks)

                # =========================================
                # PREDICTION
                # =========================================
                if len(sequence) == sequence_length:

                    processed_sequence = []

                    for frame in sequence:
                        frame = frame.copy()

                        left = frame[63:].reshape(21, 3)
                        right = frame[:63].reshape(21, 3)

                        left_present = not np.all(left == 0)
                        right_present = not np.all(right == 0)

                        # =========================================
                        # MATCH TRAINING LOGIC
                        # =========================================

                        if left_present and right_present:
                            # GLOBAL ORIGIN = RIGHT WRIST
                            wrist_ref = right[0]
                            scale = np.linalg.norm(right[9] - right[0])

                            left = left - wrist_ref
                            right = right - wrist_ref

                            if scale > 0:
                                left = left / scale
                                right = right / scale

                        elif left_present:
                            wrist = left[0]
                            left = left - wrist
                            left = normalize_hand(left)

                        elif right_present:
                            wrist = right[0]
                            right = right - wrist
                            right = normalize_hand(right)

                        processed_frame = np.concatenate([
                            left.flatten(),
                            right.flatten()
                        ])

                        processed_sequence.append(processed_frame)

                    X_input = np.expand_dims(
                        np.array(processed_sequence, dtype=np.float32),
                        axis=0
                    )

                    prediction = model.predict(X_input, verbose=0)[0]

                    predicted_class = np.argmax(prediction)
                    confidence = float(prediction[predicted_class])
                    predicted_label = labels[predicted_class]

                    await websocket.send_json({
                        "success": True,
                        "predicted_label": predicted_label,
                        "confidence": confidence,
                        "hands_detected": detected_hands
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
            hands.close()
