# =========================================
# IMPORT
# =========================================
import numpy as np
import os

from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

from tensorflow.keras.utils import to_categorical
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping

# =========================================
# PATH CONFIG
# =========================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_PATH = os.path.join(BASE_DIR, "dataset_processed")

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
            sequence = np.load(os.path.join(folder, file))

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
# X = X / np.max(X)

# =========================================
# SPLIT: TRAIN / VAL / TEST
# =========================================
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, stratify=y_temp, random_state=42
)

print("Train:", X_train.shape)
print("Val  :", X_val.shape)
print("Test :", X_test.shape)

# =========================================
# ONE HOT ENCODING
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
    y_train_cat,
    epochs=100,
    batch_size=16,
    validation_data=(X_val, y_val_cat),
    callbacks=[early_stopping]
)

# =========================================
# EVALUASI FINAL (TEST SET)
# =========================================
print("\n🎯 Evaluasi pada TEST SET")

loss, acc = model.evaluate(X_test, y_test_cat)
print(f"Accuracy: {acc:.4f}")

# =========================================
# PREDIKSI
# =========================================
y_pred = model.predict(X_test)
y_pred_classes = np.argmax(y_pred, axis=1)

# =========================================
# CLASSIFICATION REPORT
# =========================================
print("\n📊 Classification Report:")
print(classification_report(y_test, y_pred_classes, target_names=labels))

# =========================================
# CONFUSION MATRIX
# =========================================
print("\n📉 Confusion Matrix:")
cm = confusion_matrix(y_test, y_pred_classes)
print(cm)

# =========================================
# SAVE MODEL
# =========================================
model_file = os.path.join(MODEL_PATH, "bisindo_lstm.h5")
model.save(model_file)

print(f"\n💾 Model saved at: {model_file}")