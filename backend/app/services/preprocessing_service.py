from sqlalchemy.orm import Session

import os

from app.repositories import DatasetRepository, LabelRepository, RawDataRepository
from app.database.models import Dataset, Label, RawData

from app.ml.preprocessing.preprocess import PreprocessDataset

class PreprocessingService:
  def __init__(self):
    self.dataset_repository = DatasetRepository()
    self.raw_data_repository = RawDataRepository()
    self.label_repository = LabelRepository()

  def preprocess_dataset(self, db: Session, idDataset: int, config: dict):
    # Get dataset
    dataset = self.dataset_repository.get_by_id(db, idDataset, Dataset.idDataset)

    if not dataset:
      raise ValueError("Dataset not found")

    # Get all raw data for this dataset
    raw_data_list = self.raw_data_repository.get_by_id_dataset(db, idDataset)

    if not raw_data_list:
      raise ValueError("Dataset tidak memiliki raw data")

    # Setup paths
    input_path = dataset.folderPath
    output_path = os.path.join("storage", "preprocessed", dataset.datasetName)

    # Extract config
    sequence_length = config.get("sequence_length", 60)
    feature_size = config.get("feature_size", 126)
    use_augmentation = config.get("use_augmentation", True)
    noise_level = config.get("noise_level", 0.01)
    scale_range_min = config.get("scale_range_min", 0.9)
    scale_range_max = config.get("scale_range_max", 1.1)
    use_frame_dropout = config.get("use_frame_dropout", False)
    frame_dropout_prob = config.get("frame_dropout_prob", 0.1)

    # Initialize preprocessor
    preprocessor = PreprocessDataset(
      input_path=input_path,
      output_path=output_path,
      sequence_length=sequence_length,
      feature_size=feature_size,
      use_augmentation=use_augmentation,
      noise_level=noise_level,
      scale_range=(scale_range_min, scale_range_max),
      use_frame_dropout=use_frame_dropout,
      frame_dropout_prob=frame_dropout_prob
    )

    # Run preprocessing
    result = preprocessor.preprocess(raw_data_list)

    # Update dataset with preprocessing result path
    dataset.preprocessingResultPath = output_path
    db.commit()
    db.refresh(dataset)

    return {
      "dataset": dataset,
      "result": result
    }