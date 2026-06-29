import numpy as np
import cv2
import os

# =========================
# CONFIG
# =========================
NPY_PATH = "storage/landmarks/dataset_dummy/A_001.npy"
SAVE_DIR = "saved_frames"

os.makedirs(SAVE_DIR, exist_ok=True)

# =========================
# LOAD DATA
# =========================
data = np.load(NPY_PATH)

print("Shape asli:", data.shape)

# (30,126) -> (30,2,21,3)
data = data.reshape(-1, 2, 21, 3)

print("Shape baru:", data.shape)

# =========================
# HAND CONNECTIONS
# =========================
HAND_CONNECTIONS = [
    (0,1),(1,2),(2,3),(3,4),
    (0,5),(5,6),(6,7),(7,8),
    (0,9),(9,10),(10,11),(11,12),
    (0,13),(13,14),(14,15),(15,16),
    (0,17),(17,18),(18,19),(19,20)
]

# =========================
# WINDOW SIZE
# =========================
WIDTH = 800
HEIGHT = 800

frame_idx = 0

# =========================
# LOOP
# =========================
while True:

    # Background hitam
    canvas = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)

    frame = data[frame_idx]

    colors = [
        (255, 0, 0),   # tangan 1 = biru
        (0, 140, 255)  # tangan 2 = orange
    ]

    for hand_idx in range(2):

        landmarks = frame[hand_idx]

        points = []

        for lm in landmarks:

            SCALE = 150

            x = int(lm[0] * SCALE + WIDTH // 2)
            y = int(lm[1] * SCALE + HEIGHT // 2)

            # x = int(lm[0] * WIDTH)
            # y = int(lm[1] * HEIGHT)

            # mirror seperti kamera depan
            x = WIDTH - x

            points.append((x, y))

            # titik landmark
            cv2.circle(
                canvas,
                (x, y),
                5,
                colors[hand_idx],
                -1
            )

        # garis skeleton
        for connection in HAND_CONNECTIONS:

            start, end = connection

            cv2.line(
                canvas,
                points[start],
                points[end],
                colors[hand_idx],
                2
            )

    # info frame
    cv2.putText(
        canvas,
        f"Frame: {frame_idx}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (255,255,255),
        2
    )

    cv2.imshow("BISINDO Visualizer", canvas)

    key = cv2.waitKey(100)

    # =========================
    # KEYBOARD CONTROL
    # =========================

    # keluar
    if key == ord('q'):
        break

    # save image
    elif key == ord('y'):

        filename = os.path.join(
            SAVE_DIR,
            f"frame_{frame_idx}.png"
        )

        cv2.imwrite(filename, canvas)

        print(f"Gambar disimpan: {filename}")

    # next frame
    frame_idx += 1

    if frame_idx >= len(data):
        frame_idx = 0

cv2.destroyAllWindows()