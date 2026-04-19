# =========================================
# IMPORT
# =========================================
import numpy as np
import os

from sklearn.model_selection import train_test_split
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping

# =========================================
# PATH CONFIG (PENTING!)
# =========================================
# Ambil root backend
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Path ke dataset
DATA_PATH = os.path.join(BASE_DIR, "dataset")

# Path untuk simpan model
MODEL_PATH = os.path.join(BASE_DIR, "app", "ml", "models")
os.makedirs(MODEL_PATH, exist_ok=True)

SEQUENCE_LENGTH = 30

# =========================================
# LOAD DATASET
# =========================================
labels = sorted(os.listdir(DATA_PATH))
label_map = {label: idx for idx, label in enumerate(labels)}

X = []
y = []

print("📦 Loading dataset...")

for label in labels:
    folder = os.path.join(DATA_PATH, label)

    for file in os.listdir(folder):
        if file.endswith(".npy"):
            file_path = os.path.join(folder, file)

            sequence = np.load(file_path)

            # Validasi shape (biar aman)
            if sequence.shape == (SEQUENCE_LENGTH, 126):
                X.append(sequence)
                y.append(label_map[label])
            else:
                print(f"⚠️ Skip {file} (shape salah: {sequence.shape})")

X = np.array(X)
y = np.array(y)

print(f"✅ Total data: {len(X)}")
print("X shape:", X.shape)
print("y shape:", y.shape)

# =========================================
# NORMALISASI
# =========================================
X = X / np.max(X)

# =========================================
# ONE HOT ENCODING
# =========================================
y = to_categorical(y)

# =========================================
# TRAIN TEST SPLIT
# =========================================
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

print("Train:", X_train.shape)
print("Test :", X_test.shape)

# =========================================
# BUILD MODEL (2-LAYER LSTM)
# =========================================
model = Sequential()

# LSTM Layer 1
model.add(LSTM(
    128,
    return_sequences=True,   # wajib True karena ada LSTM kedua
    input_shape=(SEQUENCE_LENGTH, 126)
))
model.add(Dropout(0.3))

# LSTM Layer 2
model.add(LSTM(64))
model.add(Dropout(0.3))

# Dense Layer
model.add(Dense(64, activation='relu'))

# Output Layer
model.add(Dense(len(labels), activation='softmax'))

# =========================================
# COMPILE
# =========================================
model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# =========================================
# CALLBACK
# =========================================
early_stopping = EarlyStopping(
    monitor='val_loss',
    patience=10,
    restore_best_weights=True
)

# =========================================
# TRAINING
# =========================================
print("🚀 Training started...")

history = model.fit(
    X_train,
    y_train,
    epochs=100,
    batch_size=16,
    validation_data=(X_test, y_test),
    callbacks=[early_stopping]
)

# =========================================
# EVALUASI
# =========================================
loss, acc = model.evaluate(X_test, y_test)
print(f"🎯 Accuracy: {acc:.4f}")

# =========================================
# SAVE MODEL
# =========================================
model_file = os.path.join(MODEL_PATH, "bisindo_lstm.h5")
model.save(model_file)

print(f"💾 Model saved at: {model_file}")