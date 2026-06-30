from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (LSTM, Dense, Dropout)
from tensorflow.keras.optimizers import Adam


class LSTMModelBuilder:

    @staticmethod
    def build(
        input_shape,
        num_classes,
        lstm_units1,
        lstm_units2,
        dropout1,
        dropout2,
        dense_units,
        learning_rate
    ):

        model = Sequential()

        model.add(
            LSTM(
                lstm_units1,
                return_sequences=True,
                input_shape=input_shape
            )
        )

        model.add(
            Dropout(dropout1)
        )

        model.add(
            LSTM(
                lstm_units2
            )
        )

        model.add(
            Dropout(dropout2)
        )

        model.add(
            Dense(
                dense_units,
                activation="relu"
            )
        )

        model.add(
            Dense(
                num_classes,
                activation="softmax"
            )
        )

        model.compile(
            optimizer=Adam(
                learning_rate=learning_rate
            ),
            loss="categorical_crossentropy",
            metrics=["accuracy"]
        )

        return model