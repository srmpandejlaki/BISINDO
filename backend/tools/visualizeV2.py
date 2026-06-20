import numpy as np
import cv2
import os
import mediapipe as mp

# =========================================
# CONFIG
# =========================================

NPY_PATH = "dataset_processedV2/B/B_019.npy"
SAVE_DIR = "saved_frames"

WIDTH = 800
HEIGHT = 800

SCALE = 250

os.makedirs(SAVE_DIR, exist_ok=True)

# =========================================
# LOAD DATA
# =========================================

data = np.load(NPY_PATH)

print("Shape asli :", data.shape)

# Expected:
# (60,126)
# ->
# (60,2,21,3)

if data.shape[1] != 126:
    raise ValueError(
        f"Dataset harus memiliki 126 fitur. Shape saat ini: {data.shape}"
    )

data = data.reshape(-1, 2, 21, 3)

print("Shape reshape :", data.shape)

# =========================================
# MEDIAPIPE CONNECTIONS
# =========================================

HAND_CONNECTIONS = list(
    mp.solutions.hands.HAND_CONNECTIONS
)

# =========================================
# COLORS
# =========================================

LEFT_COLOR = (255, 0, 0)      # Biru
RIGHT_COLOR = (0, 255, 0)     # Hijau

# =========================================
# VISUALIZATION LOOP
# =========================================

frame_idx = 0

while True:

    canvas = np.zeros(
        (HEIGHT, WIDTH, 3),
        dtype=np.uint8
    )

    frame = data[frame_idx]

    hand_names = [
        "LEFT",
        "RIGHT"
    ]

    hand_colors = [
        LEFT_COLOR,
        RIGHT_COLOR
    ]

    # =====================================
    # DRAW HANDS
    # =====================================

    for hand_idx in range(2):

        landmarks = frame[hand_idx]

        # ---------------------------------
        # Skip jika tangan tidak ada
        # ---------------------------------

        if np.all(landmarks == 0):
            continue

        points = []

        for lm in landmarks:

            x = int(
                lm[0] * SCALE +
                WIDTH // 2
            )

            y = int(
                lm[1] * SCALE +
                HEIGHT // 2
            )

            # mirror agar mirip kamera depan
            x = WIDTH - x

            points.append((x, y))

        # ---------------------------------
        # Draw Skeleton
        # ---------------------------------

        for start, end in HAND_CONNECTIONS:

            cv2.line(
                canvas,
                points[start],
                points[end],
                hand_colors[hand_idx],
                2
            )

        # ---------------------------------
        # Draw Landmark
        # ---------------------------------

        for point in points:

            cv2.circle(
                canvas,
                point,
                5,
                hand_colors[hand_idx],
                -1
            )

        # ---------------------------------
        # Label Hand
        # ---------------------------------

        wrist_point = points[0]

        cv2.putText(
            canvas,
            hand_names[hand_idx],
            (
                wrist_point[0] + 10,
                wrist_point[1] - 10
            ),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            hand_colors[hand_idx],
            2
        )

    # =====================================
    # INFO
    # =====================================

    cv2.putText(
        canvas,
        f"Frame : {frame_idx + 1}/{len(data)}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 255),
        2
    )

    cv2.putText(
        canvas,
        "Q = Quit",
        (20, 80),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (255, 255, 255),
        2
    )

    cv2.putText(
        canvas,
        "Y = Save Frame",
        (20, 120),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (255, 255, 255),
        2
    )

    # =====================================
    # SHOW
    # =====================================

    cv2.imshow(
        "BISINDO Preprocessed Visualizer",
        canvas
    )

    key = cv2.waitKey(100)

    # =====================================
    # KEYBOARD
    # =====================================

    if key == ord("q"):
        break

    elif key == ord("y"):

        filename = os.path.join(
            SAVE_DIR,
            f"frame_{frame_idx:03d}.png"
        )

        cv2.imwrite(
            filename,
            canvas
        )

        print(
            f"Frame disimpan: {filename}"
        )

    # =====================================
    # NEXT FRAME
    # =====================================

    frame_idx += 1

    if frame_idx >= len(data):
        frame_idx = 0

# =========================================
# CLOSE
# =========================================

cv2.destroyAllWindows()