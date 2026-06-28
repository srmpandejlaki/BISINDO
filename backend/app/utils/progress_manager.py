class ProgressManager:

    def __init__(self):
        self.reset()

    def reset(self):
        self.progress = {
            "status": "idle",
            "current": 0,
            "total": 0,
            "currentVideo": "",
            "percentage": 0
        }

    def start(self, total):
        self.progress = {
            "status": "running",
            "current": 0,
            "total": total,
            "currentVideo": "",
            "percentage": 0
        }

    def update(self, current, current_video):
        self.progress["current"] = current
        self.progress["currentVideo"] = current_video

        if self.progress["total"] > 0:
            self.progress["percentage"] = round(
                current / self.progress["total"] * 100
            )

    def finish(self):
        self.progress["status"] = "finished"
        self.progress["percentage"] = 100

    def get(self):
        return self.progress


progress_manager = ProgressManager()