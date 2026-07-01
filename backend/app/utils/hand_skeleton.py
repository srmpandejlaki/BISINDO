import cv2
import numpy as np
import mediapipe as mp

WIDTH = 400
HEIGHT = 400
SCALE = 200

LEFT_COLOR = (255, 0, 0)
RIGHT_COLOR = (0, 255, 0)

HAND_CONNECTIONS = list(
    mp.solutions.hands.HAND_CONNECTIONS
)


def draw_hand_skeleton(
    frame: np.ndarray,
    frame_index: int = 0,
    total_frames: int = 1,
    mirror: bool = False,
):
    """
    frame shape:
        (2,21,3)

    return:
        canvas (numpy image)
    """

    canvas = np.zeros(
        (HEIGHT, WIDTH, 3),
        dtype=np.uint8
    )

    hand_names = [
        "LEFT",
        "RIGHT"
    ]

    hand_colors = [
        LEFT_COLOR,
        RIGHT_COLOR
    ]

    for hand_idx in range(2):

        landmarks = frame[hand_idx]

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

            if mirror:
                x = WIDTH - x

            points.append((x, y))

        # Skeleton
        for start, end in HAND_CONNECTIONS:

            cv2.line(
                canvas,
                points[start],
                points[end],
                hand_colors[hand_idx],
                2
            )

        # Landmark
        for point in points:

            cv2.circle(
                canvas,
                point,
                5,
                hand_colors[hand_idx],
                -1
            )

        # Label
        # wrist = points[0]

        # cv2.putText(
        #     canvas,
        #     hand_names[hand_idx],
        #     (
        #         wrist[0] + 10,
        #         wrist[1] - 10
        #     ),
        #     cv2.FONT_HERSHEY_SIMPLEX,
        #     0.6,
        #     hand_colors[hand_idx],
        #     2
        # )

    # cv2.putText(
    #     canvas,
    #     f"Frame : {frame_index + 1}/{total_frames}",
    #     (20, 40),
    #     cv2.FONT_HERSHEY_SIMPLEX,
    #     0.8,
    #     (255, 255, 255),
    #     2
    # )

    return canvas