from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.utils import to_categorical


class LabelEncoderService:

    def encode(labels):

        encoder = LabelEncoder()

        encoded = encoder.fit_transform(labels)

        categorical = to_categorical(encoded)

        return (
            categorical,
            encoder
        )