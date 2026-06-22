from pydantic import BaseModel


class AddRatio(BaseModel):
  trainRatio: str

class TestRatiosConfig(BaseModel):
  epochs: int
  batch_size: int
  learning_rate: float