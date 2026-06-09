from pathlib import Path
import zipfile


def get_dataset_root(extract_dir: Path) -> Path:
    items = list(extract_dir.iterdir())

    if len(items) == 1 and items[0].is_dir():
        return items[0]

    return extract_dir


def validate_dataset_structure(dataset_path: Path):
    label_folders = [
        folder
        for folder in dataset_path.iterdir()
        if folder.is_dir()
    ]

    if not label_folders:
        raise ValueError(
            "Dataset tidak memiliki folder label"
        )


def extract_zip(zip_path: str) -> str:
    zip_path = Path(zip_path)

    extract_dir = (
        Path("storage/datasets")
        / zip_path.stem
    )

    extract_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    with zipfile.ZipFile(
        zip_path,
        "r"
    ) as zip_ref:

        zip_ref.extractall(
            extract_dir
        )

    dataset_root = get_dataset_root(
        extract_dir
    )

    validate_dataset_structure(
        dataset_root
    )

    return str(
        dataset_root
    )