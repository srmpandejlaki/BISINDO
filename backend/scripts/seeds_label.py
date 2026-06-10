# seed_labels.py

from app.database.connection import SessionLocal
from app.database.models.label import Label

db = SessionLocal()

for letter in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":

    exists = (
        db.query(Label)
        .filter(Label.labelName == letter)
        .first()
    )

    if not exists:
        db.add(
            Label(
                labelName=letter
            )
        )

db.commit()

print("Labels seeded")