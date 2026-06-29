# =========================================
# IMPORT
# =========================================
import csv
import json
import os
from datetime import datetime

import numpy as np

from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

from tensorflow.keras.callbacks import Callback
from tensorflow.keras.layers import Dense, Dropout, LSTM
from tensorflow.keras.models import Sequential
from tensorflow.keras.utils import to_categorical

from tqdm import tqdm
from colorama import Fore, init

init(autoreset=True)

# =========================================
# CUSTOM CALLBACK: PROGRESS BAR
# =========================================
class TQDMProgressBar(Callback):

    def on_train_begin(self, logs=None):
        self.epochs = self.params['epochs']

        self.progress_bar = tqdm(
            total=self.epochs,
            desc="🚀 Training"
        )

    def on_epoch_end(self, epoch, logs=None):

        logs = logs or {}

        msg = (
            f"loss: {logs.get('loss'):.4f} | "
            f"acc: {logs.get('accuracy'):.4f} | "
            f"val_loss: {logs.get('val_loss'):.4f} | "
            f"val_acc: {logs.get('val_accuracy'):.4f}"
        )

        self.progress_bar.set_postfix_str(msg)
        self.progress_bar.update(1)

    def on_train_end(self, logs=None):
        self.progress_bar.close()

# =========================================
# HELPER: CONFUSION MATRIX
# =========================================
def print_confusion_matrix(cm, labels):

    print(Fore.YELLOW + "\n📉 Confusion Matrix:\n")

    header = "      " + " ".join(
        f"{label[:4]:>6}"
        for label in labels
    )

    print(header)

    for i, row in enumerate(cm):

        row_str = " ".join(
            f"{num:>6}"
            for num in row
        )

        print(f"{labels[i][:4]:>6} {row_str}")

# =========================================
# FUNCTION: EVALUATION
# =========================================
def evaluate_model(model, X, y, labels, name="DATA"):

    print(Fore.CYAN + f"\n🎯 Evaluasi pada {name}")

    y_cat = to_categorical(y)

    loss, acc = model.evaluate(
        X,
        y_cat,
        verbose=0
    )

    print(Fore.GREEN + f"Accuracy: {acc:.4f}")

    y_pred = model.predict(
        X,
        verbose=0
    )

    y_pred_classes = np.argmax(
        y_pred,
        axis=1
    )

    print(Fore.YELLOW + f"\n📊 Classification Report ({name}):")

    print(
        classification_report(
            y,
            y_pred_classes,
            target_names=labels
        )
    )

    cm = confusion_matrix(
        y,
        y_pred_classes
    )

    print_confusion_matrix(cm, labels)

    report_dict = classification_report(
        y,
        y_pred_classes,
        target_names=labels,
        output_dict=True
    )

    return {
        "accuracy": acc,
        "loss": loss,
        "report": report_dict,
        "confusion_matrix": cm
    }

# =========================================
# EXPERIMENT CONFIG
# =========================================
MODEL_NAME = "bisindo_lstm"

SEQUENCE_LENGTH = 30

LSTM_1_UNITS = 128
LSTM_2_UNITS = 64

DROPOUT_RATE = 0.3

EPOCHS = 50
BATCH_SIZE = 16

TIMESTAMP = datetime.now().strftime(
    "%Y%m%d_%H%M%S"
)

# =========================================
# PATH CONFIG
# =========================================
BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "dataset_processed"
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "app",
    "ml",
    "models"
)

TRACKING_PATH = os.path.join(
    MODEL_PATH,
    "tracking"
)

os.makedirs(MODEL_PATH, exist_ok=True)
os.makedirs(TRACKING_PATH, exist_ok=True)

# =========================================
# LOAD DATASET
# =========================================
labels = sorted(os.listdir(DATA_PATH))

label_map = {
    label: idx
    for idx, label in enumerate(labels)
}

X = []
y = []

print(Fore.CYAN + "📦 Loading dataset...")

for label in labels:

    folder = os.path.join(
        DATA_PATH,
        label
    )

    for file in os.listdir(folder):

        if file.endswith(".npy"):

            sequence = np.load(
                os.path.join(folder, file)
            )

            if sequence.shape == (
                SEQUENCE_LENGTH,
                126
            ):

                X.append(sequence)
                y.append(label_map[label])

            else:

                print(
                    Fore.RED +
                    f"⚠️ Skip {file} "
                    f"(shape salah: {sequence.shape})"
                )

X = np.array(X)
y = np.array(y)

print(Fore.GREEN + f"✅ Total data: {len(X)}")
print("X shape:", X.shape)
print("y shape:", y.shape)

# =========================================
# SPLIT DATA
# =========================================
X_train, X_temp, y_train, y_temp = train_test_split(
    X,
    y,
    test_size=0.3,
    stratify=y,
    random_state=42
)

X_val, X_test, y_val, y_test = train_test_split(
    X_temp,
    y_temp,
    test_size=0.5,
    stratify=y_temp,
    random_state=42
)

print(Fore.CYAN + f"Train: {X_train.shape}")
print(Fore.CYAN + f"Val  : {X_val.shape}")
print(Fore.CYAN + f"Test : {X_test.shape}")

# =========================================
# ONE HOT ENCODING
# =========================================
y_train_cat = to_categorical(y_train)
y_val_cat = to_categorical(y_val)

# =========================================
# BUILD MODEL
# =========================================
model = Sequential()

model.add(
    LSTM(
        LSTM_1_UNITS,
        return_sequences=True,
        input_shape=(SEQUENCE_LENGTH, 126)
    )
)

model.add(
    Dropout(DROPOUT_RATE)
)

model.add(
    LSTM(LSTM_2_UNITS)
)

model.add(
    Dropout(DROPOUT_RATE)
)

model.add(
    Dense(
        64,
        activation='relu'
    )
)

model.add(
    Dense(
        len(labels),
        activation='softmax'
    )
)

# =========================================
# COMPILE MODEL
# =========================================
model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print(Fore.MAGENTA + "\n🧠 Model Summary:")
model.summary()

# =========================================
# TRAINING
# =========================================
print(Fore.CYAN + "\n🚀 Training started...\n")

history = model.fit(
    X_train,
    y_train_cat,
    epochs=EPOCHS,
    batch_size=BATCH_SIZE,
    validation_data=(
        X_val,
        y_val_cat
    ),
    callbacks=[
        TQDMProgressBar()
    ],
    verbose=0
)

# =========================================
# TRAINING SUMMARY
# =========================================
final_train_acc = history.history['accuracy'][-1]
final_val_acc = history.history['val_accuracy'][-1]

best_val_acc = max(
    history.history['val_accuracy']
)

print(Fore.GREEN + "\n📌 Training Summary:")

print(
    f"Final Train Accuracy : "
    f"{final_train_acc:.4f}"
)

print(
    f"Final Val Accuracy   : "
    f"{final_val_acc:.4f}"
)

print(
    f"Best Val Accuracy    : "
    f"{best_val_acc:.4f}"
)

# =========================================
# VALIDATION EVALUATION
# =========================================
val_result = evaluate_model(
    model,
    X_val,
    y_val,
    labels,
    "VALIDATION SET"
)

# =========================================
# TEST EVALUATION
# =========================================
test_result = evaluate_model(
    model,
    X_test,
    y_test,
    labels,
    "TEST SET"
)

# =========================================
# SAVE MODEL
# =========================================
model_file = os.path.join(
    MODEL_PATH,
    f"{MODEL_NAME}_{TIMESTAMP}.h5"
)

model.save(model_file)

print(Fore.GREEN + "\n💾 Model saved:")
print(model_file)

# =========================================
# SAVE LABEL MAP
# =========================================
label_map_file = os.path.join(
    MODEL_PATH,
    f"{MODEL_NAME}_{TIMESTAMP}_label_map.json"
)

with open(label_map_file, "w") as f:
    json.dump(label_map, f)

print(Fore.GREEN + "🏷️ Label map saved")

# =========================================
# SAVE REPORT CSV
# =========================================
report_file = os.path.join(
    TRACKING_PATH,
    f"{MODEL_NAME}_{TIMESTAMP}_report.csv"
)

with open(
    report_file,
    mode="w",
    newline="",
    encoding="utf-8"
) as csvfile:

    writer = csv.writer(csvfile)

    # =====================================
    # MODEL INFO
    # =====================================
    writer.writerow(["nama model:", MODEL_NAME])
    writer.writerow([])

    # =====================================
    # PARAMETERS
    # =====================================
    writer.writerow(["parameter yang digunakan:"])

    writer.writerow([
        "sequence_length",
        SEQUENCE_LENGTH
    ])

    writer.writerow([
        "lstm_units1",
        LSTM_1_UNITS
    ])

    writer.writerow([
        "lstm_units2",
        LSTM_2_UNITS
    ])

    writer.writerow([
        "dropout",
        DROPOUT_RATE
    ])

    writer.writerow([
        "epoch",
        EPOCHS
    ])

    writer.writerow([
        "batch_size",
        BATCH_SIZE
    ])

    writer.writerow([])

    # =====================================
    # TRAINING RESULT
    # =====================================
    writer.writerow([
        "hasil training / training section:"
    ])

    writer.writerow([
        "final_train_acc",
        final_train_acc
    ])

    writer.writerow([
        "final_val_acc",
        final_val_acc
    ])

    writer.writerow([
        "best_val_acc",
        best_val_acc
    ])

    writer.writerow([
        "test_accuracy",
        test_result["accuracy"]
    ])

    writer.writerow([
        "test_loss",
        test_result["loss"]
    ])

    writer.writerow([])

    # =====================================
    # EPOCH HISTORY
    # =====================================
    writer.writerow([
        "epoch",
        "train_accuracy",
        "val_accuracy",
        "train_loss",
        "val_loss"
    ])

    for epoch in range(EPOCHS):

        writer.writerow([

            epoch + 1,

            history.history['accuracy'][epoch],

            history.history['val_accuracy'][epoch],

            history.history['loss'][epoch],

            history.history['val_loss'][epoch]
        ])

    writer.writerow([])

    # =====================================
    # CLASSIFICATION REPORT
    # =====================================
    writer.writerow([
        "classification report:"
    ])

    writer.writerow([
        "label",
        "precision",
        "recall",
        "f1-score",
        "support"
    ])

    report = test_result["report"]

    for label_name, metrics in report.items():

        if isinstance(metrics, dict):

            writer.writerow([

                label_name,

                metrics.get(
                    "precision",
                    ""
                ),

                metrics.get(
                    "recall",
                    ""
                ),

                metrics.get(
                    "f1-score",
                    ""
                ),

                metrics.get(
                    "support",
                    ""
                )
            ])

    writer.writerow([])

    # =====================================
    # CONFUSION MATRIX VALIDATION
    # =====================================
    writer.writerow([
        "confusion matrix (validation):"
    ])

    writer.writerow([
        "actual/predict",
        *labels
    ])

    val_cm = val_result["confusion_matrix"]

    for i, label in enumerate(labels):

        writer.writerow([
            label,
            *val_cm[i]
        ])

    writer.writerow([])

    # =====================================
    # TESTING RESULT
    # =====================================
    writer.writerow([
        "hasil testing:"
    ])

    writer.writerow([
        "accuracy",
        test_result["accuracy"]
    ])

    writer.writerow([
        "loss",
        test_result["loss"]
    ])

    writer.writerow([])

    # =====================================
    # CONFUSION MATRIX TESTING
    # =====================================
    writer.writerow([
        "confusion matrix (testing):"
    ])

    writer.writerow([
        "actual/predict",
        *labels
    ])

    test_cm = test_result["confusion_matrix"]

    for i, label in enumerate(labels):

        writer.writerow([
            label,
            *test_cm[i]
        ])

print(Fore.GREEN + "\n📁 CSV Report saved:")
print(report_file)

print(Fore.CYAN + "\n✅ ALL PROCESS COMPLETED")