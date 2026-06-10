from pathlib import Path
from fastapi import UploadFile
import shutil
import uuid


UPLOAD_FOLDER = Path(
    "storage/uploads"
)

UPLOAD_FOLDER.mkdir(
    parents=True,
    exist_ok=True
)


def save_uploaded_zip(
    file: UploadFile
) -> str:

    unique_name = (
        f"{uuid.uuid4()}_{file.filename}"
    )

    file_path = (
        UPLOAD_FOLDER /
        unique_name
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    return str(file_path)