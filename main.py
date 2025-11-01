import os
import sys
import json
import time
import datetime
import requests
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")
HTTP_TIMEOUT = 30
MAX_RETRIES = 3
RETRY_DELAY = 2

SENSOR_CONSTANTS = {
    "soil_moisture_pct": 28,
    "temperature_c": 26.7,
    "humidity_pct": 78,
    "light_lux": 20000,
}

@dataclass
class FarmerInputs:
    crop_category: str
    budget_php: float
    waiting_tolerance_days: int
    land_size_ha: float
    manpower: int
    location: str
    start_month: int

def safe_input(prompt: str, default: str) -> str:
    try:
        v = input(f"{prompt} [{default}]: ").strip()
        return v if v != "" else default
    except EOFError:
        return default


def collect_user_inputs() -> FarmerInputs:
    print("=== Plant Recommender System ===")
    cat = safe_input("Crop category (Vegetables/Fruits/Cereals/Legumes/Cash/Fodder/Herbs/Ornamentals/Any)", "Any")
    budget = float(safe_input("Budget in PHP", "10000"))
    wait = int(safe_input("Waiting tolerance (days)", "90"))
    land = float(safe_input("Land size (ha)", "0.5"))
    manpower = int(safe_input("Manpower (number of workers)", "2"))
    location = safe_input("Location (province/city)", "Bulacan")
    start_month = int(safe_input("Start month (1-12)", str(datetime.datetime.now().month)))
    return FarmerInputs(cat, budget, wait, land, manpower, location, start_month)

AI_PROMPT_TEMPLATE = r"""
You are an expert agronomist and data scientist. Given the farm sensor readings and farmer constraints
provided as JSON, return a JSON array named "recommendations". Each element must be a JSON object
with the exact fields described below. Output ONLY valid JSON (no extra commentary).

Input keys:
- sensors: {soil_moisture_pct, temperature_c, humidity_pct, light_lux}
- farmer: {crop_category, budget_php, waiting_tolerance_days, land_size_ha, manpower, location, start_month}

For each recommended crop provide these fields (exact names):
- crop: string (name of crop)
- category: string
- raw_score: number (0.0-1.0 where 1 is perfect match)
- confidence_pct: integer (0-100)
- breakdown: object with keys env_score, econ_score, time_fit_score, season_score, labor_score (each 0..1)
- estimated_revenue_php: number
- estimated_cost_php: number
- suggested_markets: array of strings
- reasoning: short string (one sentence explaining why it's recommended)

Requirements:
- Return at most 8 recommendations ranked by raw_score desc.
- Ensure the confidence_pct accounts for missing sensors (if pH/EC not available, reduce confidence accordingly).
- Use Philippines seasonality (Nov-Apr dry/cool, May-Oct wet/storm-prone) and current month (start_month) provided.
- Respect hard constraints: if waiting_tolerance_days < crop cycle length, reduce time_fit_score accordingly.

Use the sensor constants and farmer inputs directly. When computing estimated revenue/cost,
assume plausible yields/prices based on Philippines contexts. You can estimate values but do not invent impossible numbers.

Now produce the JSON response given this input:
{input_payload}
"""

def call_gemini(prompt: str) -> Dict[str, Any]:
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    
    headers = {"Content-Type": "application/json"}
    
    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.2,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 2048,
        }
    }
    
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=HTTP_TIMEOUT)
            response.raise_for_status()
            
            data = response.json()
            
            if "candidates" not in data or not data["candidates"]:
                raise ValueError("No candidates in response")
            
            text_content = data["candidates"][0]["content"]["parts"][0]["text"]
            
            text_content = text_content.strip()
            if text_content.startswith("```json"):
                text_content = text_content[7:]
            elif text_content.startswith("```"):
                text_content = text_content[3:]
            if text_content.endswith("```"):
                text_content = text_content[:-3]
            text_content = text_content.strip()
            
            return json.loads(text_content)
            
        except Exception as e:
            last_error = e
            if attempt < MAX_RETRIES - 1:
                wait_time = RETRY_DELAY * (attempt + 1)
                print(f"Attempt {attempt + 1} failed: {e}. Retrying in {wait_time}s...", file=sys.stderr)
                time.sleep(wait_time)
    
    raise RuntimeError(f"Failed after {MAX_RETRIES} attempts. Last error: {last_error}")


def main():
    farmer = collect_user_inputs()

    input_payload = {
        "sensors": SENSOR_CONSTANTS,
        "farmer": asdict(farmer)
    }

    prompt = AI_PROMPT_TEMPLATE.replace("{input_payload}", json.dumps(input_payload, ensure_ascii=False))

    if not GEMINI_API_KEY:
        print("Error: GEMINI_API_KEY environment variable not set.")
        sys.exit(1)

    print("Calling Gemini API...")
    ai_response = call_gemini(prompt)

    if isinstance(ai_response, dict) and "recommendations" in ai_response:
        output = ai_response
    elif isinstance(ai_response, list):
        output = {"recommendations": ai_response}
    else:
        if isinstance(ai_response, dict):
            recs = ai_response.get("data") or ai_response.get("items") or []
        else:
            recs = []
        output = {"recommendations": recs}

    print(json.dumps(output, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()