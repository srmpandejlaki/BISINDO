import os
import numpy as np


class DatasetLoader:

    def __init__(self, dataset_path: str):
        self.dataset_path = dataset_path

    def load(self):
        X = []
        y = []

        if not os.path.exists(self.dataset_path):
            return np.array(X), np.array(y)

        items = sorted(os.listdir(self.dataset_path))

        # Check if there are any subdirectories
        has_subdirs = any(os.path.isdir(os.path.join(self.dataset_path, item)) for item in items)

        if has_subdirs:
            # Folder-based structure (labels are folders)
            for label in items:
                label_path = os.path.join(self.dataset_path, label)
                if not os.path.isdir(label_path):
                    continue
                for filename in os.listdir(label_path):
                    if not filename.endswith(".npy"):
                        continue
                    file_path = os.path.join(label_path, filename)
                    data = np.load(file_path)
                    X.append(data)
                    y.append(label)
        else:
            # Flat structure (filenames like A_001.npy)
            for filename in items:
                if not filename.endswith(".npy"):
                    continue
                file_path = os.path.join(self.dataset_path, filename)
                data = np.load(file_path)
                X.append(data)
                # Parse label from filename prefix
                label = filename.split("_")[0].upper()
                y.append(label)

        return np.array(X), np.array(y)