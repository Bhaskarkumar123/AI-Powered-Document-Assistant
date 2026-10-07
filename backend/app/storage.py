import os
from pathlib import Path


DATA_DIR = Path(os.getenv("DATA_DIR", "app"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
