from sqlalchemy.orm import Session
from pathlib import Path

import numpy as np

from app.repositories import DatasetRepository, LabelRepository, RawDataRepository
from app.database.models import Dataset, Label, RawData

from app.utils.zip_extractor import extract_zip

class DataCollectionService:

    def __init__(self):
        self.dataset_repository = DatasetRepository()
        self.raw_data_repository = RawDataRepository()
        self.label_repository = LabelRepository()

    # Dataset
    def get_all_datasets(self, db):
        return self.dataset_repository.get_all(db)
    
    def get_dataset_by_id(self, db: Session, idDataset: int):
        dataset = (self.dataset_repository.get_by_id(db, idDataset))

        if not dataset :
            raise ValueError("Dataset not found")
        
        return self.dataset_repository.get_by_id(db, idDataset)
    
    def create_dataset_from_zip(
        self,
        db: Session,
        zip_path: str
    ):
        try:
            # Extract ZIP
            dataset_folder = extract_zip(zip_path)

            dataset_path = Path(dataset_folder)

            dataset_name = dataset_path.name

            label_folders = [
                folder
                for folder in dataset_path.iterdir()
                if folder.is_dir()
            ]

            total_label = len(label_folders)

            total_data = sum(
                len(list(folder.glob("*.npy")))
                for folder in label_folders
            )

            dataset = Dataset(
                datasetName=dataset_name,
                folderPath=str(dataset_path),
                totalData=total_data,
                totalLabel=total_label
            )

            db.add(dataset)
            db.flush()

            for label_folder in label_folders:

                label_name = (label_folder.name.upper())

                label = (
                    self.label_repository
                    .get_by_name(
                        db,
                        label_name
                    )
                )

                if not label:
                    raise ValueError(
                        f"Label '{label_name}' not found"
                    )

                npy_files = (
                    label_folder.glob(
                        "*.npy"
                    )
                )

                for npy_file in npy_files:

                    sequence = np.load(
                        npy_file,
                        allow_pickle=True
                    )

                    sequence_length = (
                        sequence.shape[0]
                    )

                    raw_data = RawData(
                        idDataset=dataset.idDataset,
                        idLabel=label.idLabel,
                        sequenceLength=sequence_length,
                        dataFilePath=str(
                            npy_file
                        )
                    )

                    db.add(raw_data)

            db.commit()
            db.refresh(dataset)

            return dataset

        except Exception as error:

            db.rollback()
            raise error

    def delete_dataset(
        self,
        db: Session,
        dataset_id: int
    ):

        dataset = (
            self.dataset_repository
            .get_by_id(
                db,
                dataset_id
            )
        )

        if not dataset:
            raise ValueError("Dataset not found")

        return self.dataset_repository.delete(db, dataset)
    
    # Raw Data
    def get_raw_data_by_id_dataset(self, db: Session, idDataset: int):
        raw_data_by_id = (
            self.raw_data_repository.get_by_id_dataset(db, idDataset)
        )

        if  not raw_data_by_id:
            raise ValueError("Raw data not found")
        
        return self.raw_data_repository.get_by_id_dataset(db, idDataset)
    
    # def get_raw_data_by_id(self, db: Session, idRawData: int):
    #     return self.raw_data_repository.get_by_id(db, idRawData)
    
    # def update_raw_data_by_id(self, db: Session, idRawData: int):
    #     return self.raw_data_repository.update(db, idRawData)
    
    # def delete_raw_data_by_id(self, db: Session, idRawData: int):
    #     return self.raw_data_repository.delete_by_id(db, idRawData)
    