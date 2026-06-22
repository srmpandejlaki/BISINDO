from pydantic import BaseModel


class AddRatio(BaseModel):
  trainRatio: str

class TestRatiosConfig(BaseModel):
  epochs: int = 50
  batch_size: int = 16
  learning_rate: float = 0.001