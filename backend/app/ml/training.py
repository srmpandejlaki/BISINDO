# =========================================
# IMPORT
# =========================================
import numpy as np
import os
import json

from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

from tensorflow.keras.utils import to_categorical
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import Callback

from tqdm import tqdm
from colorama import Fore, init

init(autoreset=True)

# =========================================
# CUSTOM CALLBACK: PROGRESS BAR
# =========================================
class TQDMProgressBar(Callback):
    def on_train_begin(self, logs=None):
        self.epochs = self.params['epochs']
        self.progress_bar = tqdm(total=self.epochs, desc="🚀 Training")

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

    header = "      " + " ".join(f"{label[:4]:>6}" for label in labels)
    print(header)

    for i, row in enumerate(cm):
        row_str = " ".join(f"{num:>6}" for num in row)
        print(f"{labels[i][:4]:>6} {row_str}")

# =========================================
# PATH CONFIG
# =========================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_PATH = os.path.join(BASE_DIR, "dataset_processed_v2")

MODEL_PATH = os.path.join(BASE_DIR, "app", "ml", "models")
os.makedirs(MODEL_PATH, exist_ok=True)

SEQUENCE_LENGTH = 60

# =========================================
# LOAD DATASET
# =========================================
labels = sorted(os.listdir(DATA_PATH))
label_map = {label: idx for idx, label in enumerate(labels)}

X = []
y = []

print(Fore.CYAN + "📦 Loading dataset...")

for label in labels:
    folder = os.path.join(DATA_PATH, label)

    for file in os.listdir(folder):
        if file.endswith(".npy"):
            sequence = np.load(os.path.join(folder, file))

            if sequence.shape == (SEQUENCE_LENGTH, 126):
                X.append(sequence)
                y.append(label_map[label])
            else:
                print(Fore.RED + f"⚠️ Skip {file} (shape salah: {sequence.shape})")

X = np.array(X)
y = np.array(y)

print(Fore.GREEN + f"✅ Total data: {len(X)}")
print("X shape:", X.shape)
print("y shape:", y.shape)

# =========================================
# SPLIT DATA
# =========================================
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.3, stratify=y, random_state=42
)

X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, stratify=y_temp, random_state=42
)

print(Fore.CYAN + f"Train: {X_train.shape}")
print(Fore.CYAN + f"Val  : {X_val.shape}")
print(Fore.CYAN + f"Test : {X_test.shape}")

# =========================================
# ONE HOT
# =========================================
y_train_cat = to_categorical(y_train)
y_val_cat   = to_categorical(y_val)
y_test_cat  = to_categorical(y_test)

# =========================================
# BUILD MODEL
# =========================================
model = Sequential()

model.add(LSTM(128, return_sequences=True, input_shape=(SEQUENCE_LENGTH, 126)))
model.add(Dropout(0.3))

model.add(LSTM(64))
model.add(Dropout(0.3))

model.add(Dense(64, activation='relu'))
model.add(Dense(len(labels), activation='softmax'))

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

EPOCHS = 50

history = model.fit(
    X_train,
    y_train_cat,
    epochs=EPOCHS,
    batch_size=16,
    validation_data=(X_val, y_val_cat),
    callbacks=[TQDMProgressBar()],
    verbose=0
)

# =========================================
# TRAINING SUMMARY
# =========================================
print(Fore.GREEN + "\n📌 Training Summary:")
print(f"Final Train Accuracy : {history.history['accuracy'][-1]:.4f}")
print(f"Final Val Accuracy   : {history.history['val_accuracy'][-1]:.4f}")
print(f"Best Val Accuracy    : {max(history.history['val_accuracy']):.4f}")

# =========================================
# EVALUASI TEST
# =========================================
print(Fore.CYAN + "\n🎯 Evaluasi pada TEST SET")

loss, acc = model.evaluate(X_test, y_test_cat, verbose=0)
print(Fore.GREEN + f"Accuracy: {acc:.4f}")

# =========================================
# PREDIKSI
# =========================================
y_pred = model.predict(X_test, verbose=0)
y_pred_classes = np.argmax(y_pred, axis=1)

# =========================================
# REPORT
# =========================================
print(Fore.YELLOW + "\n📊 Classification Report:")
print(classification_report(y_test, y_pred_classes, target_names=labels))

# =========================================
# CONFUSION MATRIX
# =========================================
cm = confusion_matrix(y_test, y_pred_classes)
print_confusion_matrix(cm, labels)

# =========================================
# SAVE MODEL
# =========================================
model_file = os.path.join(MODEL_PATH, "bisindo_lstm_no_es_v2.h5")
model.save(model_file)

print(Fore.GREEN + f"\n💾 Model saved at: {model_file}")

# =========================================
# SAVE HISTORY
# =========================================
history_file = os.path.join(MODEL_PATH, "training_history_no_es_v2.json")

with open(history_file, "w") as f:
    json.dump(history.history, f)

print(Fore.GREEN + f"📁 History saved at: {history_file}")