import os
import numpy as np


class DatasetLoader:

    def __init__(self, dataset_path: str):
        self.dataset_path = dataset_path

    def load(self):
        X = []
        y = []

        labels = sorted(os.listdir(self.dataset_path))

        for label in labels:

            label_path = os.path.join(
                self.dataset_path,
                label
            )

            if not os.path.isdir(label_path):
                continue

            for filename in os.listdir(label_path):

                if not filename.endswith(".npy"):
                    continue

                file_path = os.path.join(
                    label_path,
                    filename
                )

                data = np.load(file_path)

                X.append(data)
                y.append(label)

        return np.array(X), np.array(y)