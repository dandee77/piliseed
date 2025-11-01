# PiliSeed API

Intelligent crop recommendation system for Philippine farmers.

## Project Structure

```
piliseed/
├── app/
│   ├── core/
│   │   ├── config.py          # Configuration and environment variables
│   │   └── database.py        # MongoDB connection management
│   ├── models/
│   │   └── schemas.py         # Pydantic models for request/response
│   ├── routers/
│   │   ├── sensors.py         # Sensor data endpoints
│   │   └── recommendations.py # Recommendation endpoints
│   ├── services/
│   │   ├── gemini_service.py  # Gemini AI integration
│   │   ├── database_service.py # Database operations
│   │   └── prompts.py         # AI prompts
│   └── main.py                # FastAPI application
├── run.py                     # Application entry point
└── requirements.txt           # Python dependencies
```

## Running the Server

```bash
python run.py
```

Server will start at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## API Endpoints

### 1. Update Sensor Data (PUT)
**Endpoint:** `PUT /sensors/update`

Update hardware sensor readings.

**Request Body:**
```json
{
  "soil_moisture_pct": 35.5,
  "temperature_c": 28.3,
  "humidity_pct": 82.0,
  "light_lux": 25000
}
```

### 2. Get Current Sensors (GET)
**Endpoint:** `GET /sensors/current`

Retrieve current sensor values.

### 3. Generate Recommendations (POST)
**Endpoint:** `POST /recommendations/generate`

Generate crop recommendations using current sensor data or defaults.

**Request Body:**
```json
{
  "farmer": {
    "crop_category": "Vegetables",
    "budget_php": 15000,
    "waiting_tolerance_days": 90,
    "land_size_ha": 1.5,
    "manpower": 5,
    "location": "Davao",
    "start_month": 11
  },
  "sensors": {
    "soil_moisture_pct": 30,
    "temperature_c": 27,
    "humidity_pct": 80,
    "light_lux": 22000
  }
}
```

If `sensors` is omitted, current sensor data from hardware will be used. If no hardware data exists, default values are used.

### 4. Context Analysis Only (POST)
**Endpoint:** `POST /recommendations/context-analysis`

Get only agricultural context analysis without crop recommendations.

## MongoDB Collections

- `context_analysis` - Stage 1 outputs (weather, market, season data)
- `crop_recommendations` - Stage 2 outputs (full recommendations)

## Environment Variables

Create `.env` file:
```
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
MONGODB_URL=mongodb://localhost:27017/
```
