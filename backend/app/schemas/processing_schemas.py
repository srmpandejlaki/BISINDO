from pydantic import BaseModel


class ProcessingConfig(BaseModel):
  max_num_hands: int = 2
  min_detection_confidence: float = 0.5
  min_tracking_confidence: float = 0.5
  min_detection_ratio: float = 0.9

class AddRatio(BaseModel):
  trainRatio: str

class TestRatiosConfig(BaseModel):
  epoch: int
  batch_size: int
  learning_rate: float

class TrainModelConfig(BaseModel):
  modelName: str
  lstm_units1: int = 128
  lstm_units2: int = 128
  dropout1: float = 0.2
  dropout2: float = 0.2
  dense_units: int = 16
  epoch: int = 5
  batch_size: int = 32
  learning_rate: float = 0.001