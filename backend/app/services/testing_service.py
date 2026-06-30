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

from app.database.models import Training, Dataset, RatioDataSplit, Testing
from app.repositories import TrainingRepository

class TestingService:
    def __init__(self):
        self.training_repository = TrainingRepository()
        self.model_cache = {}

    def load_dataset_with_filenames(self, dataset_path: str):
        X = []
        y = []
        filenames = []
        
        if not os.path.exists(dataset_path):
            return np.array(X), np.array(y), filenames

        items = sorted(os.listdir(dataset_path))
        has_subdirs = any(os.path.isdir(os.path.join(dataset_path, item)) for item in items)

        if has_subdirs:
            for label in items:
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
        else:
            for filename in items:
                if not filename.endswith(".npy"):
                    continue
                file_path = os.path.join(dataset_path, filename)
                data = np.load(file_path)
                X.append(data)
                label = filename.split("_")[0].upper()
                y.append(label)
                filenames.append(filename)
                
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
        if not dataset or not dataset.landmarkFolderPath:
            raise ValueError("Dataset not found or landmark processing has not been completed")

        # 3. Fetch split ratio
        ratio_split = db.query(RatioDataSplit).filter(RatioDataSplit.idRatioDataSplit == training.idRatioDataSplit).first()
        test_size = 0.2
        if ratio_split and ratio_split.trainRatio:
            try:
                parts = ratio_split.trainRatio.split(":")
                if len(parts) == 3:
                    train_val = float(parts[0])
                    test_val = float(parts[1])
                    val_val = float(parts[2])
                    total = train_val + test_val + val_val
                    test_size = test_val / total
                elif len(parts) == 2:
                    train_val = float(parts[0])
                    test_val = float(parts[1])
                    test_size = test_val / (train_val + test_val)
            except Exception:
                pass

        # 4. Load dataset
        X, y, filenames = self.load_dataset_with_filenames(dataset.landmarkFolderPath)
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
        testing = Testing(
            idTraining=idTraining,
            accuracy=accuracy,
            precision=precision,
            recall=recall,
            f1score=f1score,
            confusionMatrix=confusionMatrix,
            weightedAverage=weightedAverage,
            macroAverage=macroAverage,
            mcc=mcc,
        )

        db.add(testing)
        db.commit()
        db.refresh(testing)

        return {
            "summary": {
                "idTesting": testing.idTesting,
                "idTraining": testing.idTraining,
                "accuracy": testing.accuracy,
                "precision": testing.precision,
                "recall": testing.recall,
                "f1score": testing.f1score,
                "mcc": testing.mcc,
                "macroAverage": testing.macroAverage,
                "weightedAverage": testing.weightedAverage,
                "confusionMatrix": testing.confusionMatrix
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
        if not dataset or not dataset.landmarkFolderPath:
            raise ValueError("Dataset not found or landmark processing has not been completed")

        # Dynamically build labels list based on actual .npy files or folders
        items = sorted(os.listdir(dataset.landmarkFolderPath))
        has_subdirs = any(os.path.isdir(os.path.join(dataset.landmarkFolderPath, item)) for item in items)
        if has_subdirs:
            labels = sorted([item for item in items if os.path.isdir(os.path.join(dataset.landmarkFolderPath, item))])
        else:
            labels_set = set()
            for filename in items:
                if filename.endswith(".npy"):
                    label = filename.split("_")[0].upper()
                    labels_set.add(label)
            labels = sorted(list(labels_set))

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
    
    def get_testing_result(self, db: Session, idTesting: int):
        return db.query(Testing).filter(Testing.idTesting == idTesting).first()

    def extract_landmarks_from_video(self, video_path: str, sequence_length: int):
        import cv2
        from app.ml.hand_skeleton.extractor import HandSkeletonExtractor
        
        extractor = HandSkeletonExtractor(min_detection_ratio=0.0)
        cap = cv2.VideoCapture(video_path)
        sequence = []
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            landmarks, _ = extractor.extract_landmarks(frame)
            sequence.append(landmarks)
            
        cap.release()
        extractor.close()
        
        if len(sequence) == 0:
            raise ValueError("Gagal mengekstrak frame dari video. Berkas video mungkin rusak atau kosong.")
            
        # Resample
        sequence = np.array(sequence, dtype=np.float32)
        indices = np.linspace(0, len(sequence) - 1, sequence_length).astype(int)
        sequence = sequence[indices]
        
        # Normalize using the exact same logic as training
        sequence = extractor.normalize_landmarks(sequence)
        
        return sequence

    def get_evaluation_by_training_id(self, db: Session, idTraining: int):
        # Check that the training record exists first
        training = db.query(Training).filter(Training.idTraining == idTraining).first()
        if not training:
            return None

        # Query the Testing table (actual test evaluation), get the most recent one
        eval_record = (
            db.query(Testing)
            .filter(Testing.idTraining == idTraining)
            .order_by(Testing.createdAt.desc())
            .first()
        )

        if not eval_record:
            return None

        return {
            "idTesting": eval_record.idTesting,
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
