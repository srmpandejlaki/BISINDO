from pydantic import BaseModel


class AddRatio(BaseModel):
  trainRatio: str

class TestRatiosConfig(BaseModel):
  epochs: int
  batch_size: int
  learning_rate: float

class TrainModelConfig(BaseModel):
  modelName: str
  lstm_units1: int = 128
  lstm_units2: int = 128
  dropout1: float = 0.2
  dropout2: float = 0.2
  dense_units: int = 16
  epochs: int = 5
  batch_size: int = 32
  learning_rate: float = 0.001