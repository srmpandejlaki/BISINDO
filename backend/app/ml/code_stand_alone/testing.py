# =========================================
# IMPORT
# =========================================
import numpy as np
import os

from tensorflow.keras.models import load_model
from tensorflow.keras.utils import to_categorical

from sklearn.metrics import classification_report, confusion_matrix

from colorama import Fore, init
init(autoreset=True)

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
DATA_PATH = os.path.join(BASE_DIR, "dataset_processed")

MODEL_PATH = os.path.join(BASE_DIR, "app", "ml", "models", "bisindo_lstm_no_es.h5")

SEQUENCE_LENGTH = 30

# =========================================
# LOAD MODEL
# =========================================
print(Fore.CYAN + "📥 Loading model...")
model = load_model(MODEL_PATH)
print(Fore.GREEN + "✅ Model loaded")

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

# =========================================
# OPTIONAL: PILIH DATA (VAL / TEST STYLE)
# =========================================
from sklearn.model_selection import train_test_split

# Sama seperti training
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.3, stratify=y, random_state=42
)

X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, stratify=y_temp, random_state=42
)

# 👉 GANTI DI SINI kalau mau pilih:
X_eval = X_test      # atau X_val
y_eval = y_test      # atau y_val
EVAL_NAME = "TEST SET"  # atau "VALIDATION SET"

# =========================================
# EVALUASI
# =========================================
print(Fore.CYAN + f"\n🎯 Evaluasi pada {EVAL_NAME}")

loss, acc = model.evaluate(X_eval, to_categorical(y_eval), verbose=0)
print(Fore.GREEN + f"Accuracy: {acc:.4f}")

# =========================================
# PREDIKSI
# =========================================
y_pred = model.predict(X_eval, verbose=0)
y_pred_classes = np.argmax(y_pred, axis=1)

# =========================================
# REPORT
# =========================================
print(Fore.YELLOW + f"\n📊 Classification Report ({EVAL_NAME}):")
print(classification_report(y_eval, y_pred_classes, target_names=labels))

# =========================================
# CONFUSION MATRIX
# =========================================
cm = confusion_matrix(y_eval, y_pred_classes)
print_confusion_matrix(cm, labels)