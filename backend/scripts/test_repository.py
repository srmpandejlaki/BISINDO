# test_repository.py

from app.database.connection import SessionLocal
from app.repositories.label_repository import LabelRepository

db = SessionLocal()

repo = LabelRepository()

label = repo.get_by_name(
    db,
    "B"
)

print(label)