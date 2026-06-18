import numpy as np

from sklearn.model_selection import train_test_split

from app.ml.training import DatasetLoader, LabelEncoderService, LSTMModelBuilder, Evaluator


class TrainingDataset:

    def __init__(
        self,
        dataset_path,
        lstm_units1,
        lstm_units2,
        dropout1,
        dropout2,
        dense_units,
        epochs,
        batch_size,
        learning_rate
    ):
        self.dataset_path = dataset_path

        self.lstm_units1 = lstm_units1
        self.lstm_units2 = lstm_units2

        self.dropout1 = dropout1
        self.dropout2 = dropout2

        self.dense_units = dense_units

        self.epochs = epochs
        self.batch_size = batch_size
        self.learning_rate = learning_rate

    def train(self):

        loader = DatasetLoader(
            self.dataset_path
        )

        X, y = loader.load()

        y_encoded, encoder = (
            LabelEncoderService.encode(y)
        )

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y_encoded,
            test_size=0.2,
            random_state=42,
            stratify=y
        )

        model = LSTMModelBuilder.build(
            input_shape=(
                X.shape[1],
                X.shape[2]
            ),

            num_classes=y_encoded.shape[1],

            lstm_units1=self.lstm_units1,
            lstm_units2=self.lstm_units2,

            dropout1=self.dropout1,
            dropout2=self.dropout2,

            dense_units=self.dense_units,

            learning_rate=self.learning_rate
        )

        history = model.fit(
            X_train,
            y_train,
            validation_split=0.2,
            epochs=self.epochs,
            batch_size=self.batch_size,
            verbose=1
        )

        y_pred_prob = model.predict(
            X_test
        )

        y_pred = np.argmax(
            y_pred_prob,
            axis=1
        )

        y_true = np.argmax(
            y_test,
            axis=1
        )

        results = Evaluator.evaluate(
            y_true,
            y_pred,
            history
        )

        return (
            model,
            encoder,
            results
        )