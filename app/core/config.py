import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")
DATABASE_NAME = "PiliSeed"
HTTP_TIMEOUT = 60
MAX_RETRIES = 3
RETRY_DELAY = 2

DEFAULT_SENSOR_VALUES = {
    "soil_moisture_pct": 28,
    "temperature_c": 26.7,
    "humidity_pct": 78,
    "light_lux": 20000,
}

LOCATION = "Malolos, Bulacan, Philippines"
START_MONTH = 11
