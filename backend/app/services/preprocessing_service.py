import os

from sqlalchemy.orm import Session

from app.database.models.dataset import Dataset
from app.repositories import RawDataRepository, DatasetRepository
from app.ml.preprocessing.preprocess import VideoPreprocessor


class PreprocessingService:

    def __init__(self):
        self.dataset_repository = DatasetRepository()
        self.raw_data_repository = RawDataRepository()

    def get_preprocessing_status(
        self,
        db: Session,
        idDataset: int
    ):
        dataset = self.dataset_repository.get_by_id(
            db,
            idDataset,
            Dataset.idDataset
        )

        if not dataset:
            raise ValueError("Dataset tidak ditemukan")

        total = self.raw_data_repository.count_total_by_dataset(
            db,
            idDataset
        )

        preprocessed = self.raw_data_repository.count_preprocessed_by_dataset(
            db,
            idDataset
        )

        return {
            "idDataset": dataset.idDataset,
            "datasetName": dataset.datasetName,
            "totalVideo": total,
            "preprocessed": preprocessed,
            "remaining": total - preprocessed
        }

    def preprocess_dataset(
        self,
        db: Session,
        idDataset: int,
        target_frame: int = 60
    ):
        dataset = self.dataset_repository.get_by_id(
            db,
            idDataset,
            Dataset.idDataset
        )

        if not dataset:
            raise ValueError("Dataset tidak ditemukan.")

        raw_data_list = self.raw_data_repository.get_not_preprocessed_by_dataset(
            db,
            idDataset
        )

        if not raw_data_list:
            raise ValueError("Dataset tidak memiliki data.")

        output_folder = os.path.join(
            "storage",
            "preprocessed",
            dataset.datasetName
        )

        os.makedirs(output_folder, exist_ok=True)
        preprocessor = VideoPreprocessor(target_frame)

        processed = 0
        failed = 0
        results = []

        for raw_data in raw_data_list:
            try:
                filename = os.path.basename(raw_data.dataFilePath)

                output_path = os.path.join(
                    output_folder,
                    filename
                )

                result = preprocessor.preprocess(
                    raw_data.dataFilePath,
                    output_path
                )

                self.raw_data_repository.update_preprocessed_path(
                    db,
                    raw_data,
                    output_path
                )

                processed += 1

                results.append(result)

            except Exception as e:
                failed += 1

                results.append({
                    "input_path": raw_data.dataFilePath,
                    "error": str(e)
                })
        self.dataset_repository.update_preprocessing_result(
            db,
            dataset,
            output_path
        )

        db.commit()
        db.refresh(dataset)

        return {
            "dataset": dataset,
            "processed": processed,
            "failed": failed,
            "results": results
        }