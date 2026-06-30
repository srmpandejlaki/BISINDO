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
        epoch,
        batch_size,
        learning_rate,
        test_size=0.2,
        val_size=0.2
    ):
        self.dataset_path = dataset_path

        self.lstm_units1 = lstm_units1
        self.lstm_units2 = lstm_units2

        self.dropout1 = dropout1
        self.dropout2 = dropout2

        self.dense_units = dense_units

        self.epoch = epoch
        self.batch_size = batch_size
        self.learning_rate = learning_rate
        self.test_size = test_size
        self.val_size = val_size

    def train(self, epoch_callback=None):
        from tensorflow.keras import backend as K
        K.clear_session()

        loader = DatasetLoader(
            self.dataset_path
        )

        X, y = loader.load()

        y_encoded, encoder = (
            LabelEncoderService.encode(y)
        )

        # Split off test set — stratify on raw labels so every class is represented
        X_trainval, X_test, y_trainval, y_test, y_raw_trainval, _ = train_test_split(
            X,
            y_encoded,
            y,
            test_size=self.test_size,
            random_state=42,
            stratify=y
        )

        # Split validation from train — use dynamically computed val_size relative to trainval
        X_train, X_val, y_train, y_val = train_test_split(
            X_trainval,
            y_trainval,
            test_size=self.val_size,
            random_state=42,
            stratify=y_raw_trainval
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

        from tensorflow.keras.callbacks import Callback

        callbacks = []
        if epoch_callback:
            class KerasProgressCallback(Callback):
                def on_epoch_end(self, epoch, logs=None):
                    epoch_callback(epoch + 1, logs or {})
            callbacks.append(KerasProgressCallback())

        history = model.fit(
            X_train,
            y_train,
            validation_data=(X_val, y_val),
            epochs=self.epoch,
            batch_size=self.batch_size,
            callbacks=callbacks,
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

        from sklearn.metrics import classification_report, confusion_matrix
        report = classification_report(y_true, y_pred, output_dict=True)
        cm = confusion_matrix(y_true, y_pred)
        results["confusionMatrix"] = cm.tolist()
        results["macroAverage"] = float(report["macro avg"]["f1-score"])
        results["weightedAverage"] = float(report["weighted avg"]["f1-score"])

        return (
            model,
            encoder,
            results
        )