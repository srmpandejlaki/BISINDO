from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    matthews_corrcoef
)


class Evaluator:

    @staticmethod
    def evaluate(
        y_true,
        y_pred,
        history
    ):

        return {
            "accuracy": float(
                accuracy_score(
                    y_true,
                    y_pred
                )
            ),

            "precision": float(
                precision_score(
                    y_true,
                    y_pred,
                    average="weighted"
                )
            ),

            "recall": float(
                recall_score(
                    y_true,
                    y_pred,
                    average="weighted"
                )
            ),

            "f1score": float(
                f1_score(
                    y_true,
                    y_pred,
                    average="weighted"
                )
            ),

            "mcc": float(
                matthews_corrcoef(
                    y_true,
                    y_pred
                )
            ),

            "trainLoss": float(
                history.history["loss"][-1]
            ),

            "valLoss": float(
                history.history["val_loss"][-1]
            )
        }