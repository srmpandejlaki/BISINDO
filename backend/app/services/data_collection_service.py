from sqlalchemy.orm import Session
from pathlib import Path

import cv2
import numpy as np
from fastapi.responses import FileResponse
import zipfile
import tempfile
import os

from app.repositories import DatasetRepository, LabelRepository, RawDataRepository
from app.database.models import Dataset, RawData

from app.utils.zip_extractor import extract_zip

class DataCollectionService:

    def __init__(self):
        self.dataset_repository = DatasetRepository()
        self.raw_data_repository = RawDataRepository()
        self.label_repository = LabelRepository()

    # GET all Dataset (multiple)
    def get_all_datasets(self, db: Session):

        results = self.dataset_repository.get_all_with_total_data(db)

        datasets = []

        for dataset, total_data in results:
            preprocessed = self.raw_data_repository.count_preprocessed_by_dataset(db, dataset.idDataset)
            datasets.append({
                "idDataset": dataset.idDataset,
                "datasetName": dataset.datasetName,
                "datasetFolderPath": dataset.datasetFolderPath,
                "preprocessedFolderPath": dataset.preprocessedFolderPath,
                "totalData": total_data,
                "preprocessedCount": preprocessed,
                "remainingCount": total_data - preprocessed
            })

        return datasets
    
    # GET Dataset by id (single)
    def get_dataset_by_id(self, db: Session, idDataset: int):
        dataset = self.dataset_repository.get_by_id(db, idDataset, Dataset.idDataset)

        if not dataset:
            raise ValueError("Dataset not found")

        return dataset
    
    # GET Raw Data by id Dataset
    def get_raw_data_by_id_dataset(
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
            raise ValueError("Dataset not found")

        raw_datas = self.raw_data_repository.get_by_id_dataset(
            db,
            idDataset
        )

        return [
            {
                "idRawData": raw_data.idRawData,
                "dataName": raw_data.dataName,
                "dataFilePath": raw_data.dataFilePath,
                "preprocessedFilePath": raw_data.preprocessedFilePath,
                "labelName": raw_data.label.labelName
            }
            for raw_data in raw_datas
        ]
    
    # GET Raw Data by id
    def get_raw_data_by_id(self, db: Session, idRawData: int):
        return self.raw_data_repository.get_by_id(db, idRawData, RawData.idRawData)
    
    def update_raw_data_by_id(self, db: Session, idRawData: int, dataName: str, labelName: str):
        raw_data = self.raw_data_repository.get_by_id(db, idRawData, RawData.idRawData)
        if not raw_data:
            raise ValueError("Raw data tidak ditemukan.")
            
        if dataName:
            raw_data.dataName = dataName
            
        if labelName:
            label = self.label_repository.get_by_name(db, labelName.upper())
            if not label:
                raise ValueError(f"Label '{labelName}' tidak terdaftar.")
            raw_data.idLabel = label.idLabel
            
        db.commit()
        db.refresh(raw_data)
        return raw_data
    
    def delete_raw_data_by_id(self, db: Session, idRawData: int):
        raw_data = self.raw_data_repository.get_by_id(db, idRawData, RawData.idRawData)
        if not raw_data:
            raise ValueError("Raw data tidak ditemukan.")
            
        # Hapus file fisik dari disk
        for path in [raw_data.dataFilePath, raw_data.preprocessedFilePath, raw_data.landmarkFilePath]:
            if path and os.path.exists(path):
                try:
                    os.remove(path)
                except Exception as e:
                    print(f"Gagal menghapus file {path}: {e}")
                    
        self.raw_data_repository.delete(db, raw_data)
        return True
    
    def update_dataset_name(
        self,
        db,
        idDataset: int,
        datasetName: str
    ):
        dataset = self.dataset_repository.update_dataset_name(
            db,
            idDataset,
            datasetName
        )

        if not dataset:
            raise ValueError("Dataset not found")

        return dataset
    
    # Delete Dataset
    def delete_dataset(
        self,
        db: Session,
        dataset_id: int
    ):
        dataset = self.dataset_repository.get_by_id(
            db,
            dataset_id,
            Dataset.idDataset
        )

        if not dataset:
            raise ValueError("Dataset not found")

        return self.dataset_repository.delete(db, dataset)
    
    # Helper Method
    def _save_raw_data(
        self,
        db: Session,
        dataset: Dataset,
        dataset_path: Path,
    ):
        VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv"}

        # Ambil semua folder label
        label_folders = [
            folder
            for folder in dataset_path.iterdir()
            if folder.is_dir()
        ]

        if not label_folders:
            raise ValueError("Dataset tidak memiliki folder label.")

        total_data = 0

        for label_folder in label_folders:

            label_name = label_folder.name.upper()

            label = self.label_repository.get_by_name(
                db,
                label_name
            )

            if not label:
                raise ValueError(
                    f"Label '{label_name}' tidak ditemukan."
                )

            video_files = [
                file
                for file in label_folder.iterdir()
                if file.is_file()
                and file.suffix.lower() in VIDEO_EXTENSIONS
            ]

            total_data += len(video_files)

            for video_file in video_files:

                # Cek apakah nama data sudah ada pada dataset yang sama
                existing = self.raw_data_repository.get_by_name_and_dataset(
                    db,
                    dataset.idDataset,
                    video_file.stem
                )

                if existing:
                    raise ValueError(
                        f"Data '{video_file.stem}' sudah ada pada dataset."
                    )

                raw_data = RawData(
                    idDataset=dataset.idDataset,
                    idLabel=label.idLabel,
                    dataName=video_file.stem,
                    dataFilePath=str(video_file),
                    preprocessedFilePath=None,
                    landmarkFilePath=None
                )

                db.add(raw_data)

        if total_data == 0:
            raise ValueError(
                "Dataset tidak memiliki file video yang didukung."
            )
    
    # POST Dataset Baru
    def create_dataset_from_zip(
        self,
        db: Session,
        zip_path: str,
        datasetName: str
    ):
        try:

            dataset_folder = extract_zip(zip_path)

            dataset_path = Path(dataset_folder)

            existing = self.dataset_repository.get_by_name(
                db,
                datasetName
            )

            if existing:
                raise ValueError(
                    "Nama dataset sudah digunakan."
                )

            dataset = Dataset(
                datasetName=datasetName,
                datasetFolderPath=str(dataset_path),
            )

            db.add(dataset)
            db.flush()

            self._save_raw_data(
                db,
                dataset,
                dataset_path
            )

            db.commit()
            db.refresh(dataset)

            return dataset

        except Exception:
            db.rollback()
            raise
    
    # POST Raw Data to Dataset
    def add_data_to_dataset(
        self,
        db: Session,
        id_dataset: int,
        zip_path: str
    ):
        try:

            dataset = self.dataset_repository.get_by_id(
                db,
                id_dataset,
                Dataset.idDataset
            )

            if not dataset:
                raise ValueError(
                    "Dataset tidak ditemukan."
                )

            dataset_folder = extract_zip(zip_path)

            dataset_path = Path(dataset_folder)

            self._save_raw_data(
                db,
                dataset,
                dataset_path
            )

            db.commit()
            db.refresh(dataset)

            return dataset

        except Exception:
            db.rollback()
            raise
    
    # Download Dataset by ID
    def download_dataset(
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
            raise ValueError(
                "Dataset tidak ditemukan."
            )

        raw_data_list = self.raw_data_repository.get_by_id_dataset(
            db,
            idDataset
        )

        temp_zip = tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".zip"
        )

        with zipfile.ZipFile(temp_zip.name, "w") as zipf:

            for raw_data in raw_data_list:

                label_name = raw_data.label.labelName

                arcname = os.path.join(
                    label_name,
                    os.path.basename(raw_data.dataFilePath)
                )

                zipf.write(
                    raw_data.dataFilePath,
                    arcname
                )

        return FileResponse(
            temp_zip.name,
            filename=f"{dataset.datasetName}.zip",
            media_type="application/zip"
        )
    
    def get_label_with_total(
        self,
        db: Session
    ):
        results = self.label_repository.get_label_with_total(db)

        label = []

        for labelName, total in results:
            label.append({
                "labelName": labelName,
                "total": total
            })

        return label
    
    def get_all_label(
        self,
        db: Session
    ):
        return self.label_repository.get_all(db)
