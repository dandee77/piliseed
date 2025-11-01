CONTEXT_ANALYSIS_PROMPT = r"""
You are an agricultural data analyst specializing in Philippine farming conditions. Analyze the current agricultural context for the given location and timeframe.

Input data:
{input_payload}

Provide a comprehensive analysis in JSON format with these exact keys:

{{
  "location_analysis": {{
    "province": "string",
    "region": "string",
    "climate_type": "string (Type I-IV Philippine classification)",
    "current_season": "string (Dry/Wet/Transition)",
    "season_end_month": "integer (1-12)"
  }},
  "weather_forecast": {{
    "current_month_rainfall_mm": "number (estimated average)",
    "next_3months_rainfall_mm": "number (estimated average)",
    "temperature_range_c": "string (e.g., 24-32)",
    "typhoon_risk": "string (Low/Moderate/High)",
    "el_nino_la_nina": "string (Normal/El Niño/La Niña)"
  }},
  "market_conditions": {{
    "high_demand_crops": ["array of crop names currently in high demand"],
    "price_trends": "string (Rising/Stable/Declining for common crops)",
    "export_opportunities": ["array of crops with export potential"],
    "local_market_saturation": ["array of oversupplied crops to avoid"]
  }},
  "agricultural_calendar": {{
    "optimal_planting_window": "string (e.g., November-January)",
    "harvest_season_conflict": "string (describe if harvest timing conflicts with typhoon season)",
    "recommended_crop_cycles": ["Fast (30-60d)", "Medium (60-120d)", "Long (120d+)"]
  }},
  "risk_factors": {{
    "pest_disease_season": ["array of common pests/diseases active in this period"],
    "water_availability": "string (Abundant/Moderate/Scarce)",
    "soil_degradation_risk": "string (Low/Moderate/High)"
  }}
}}

Base your analysis on typical Philippine agricultural patterns, regional climate data, and current month context. Be realistic and specific to {location}.
"""

RECOMMENDATION_PROMPT = r"""
You are an expert agronomist AI system providing personalized crop recommendations for Philippine farmers.

CONTEXTUAL DATA:
{context_data}

FARMER PROFILE & SENSORS:
{input_payload}

Generate detailed crop recommendations as a JSON object with key "recommendations" containing an array of crop objects.

Each recommendation must include ALL these fields:

{{
  "crop": "string (specific variety if applicable, e.g., 'Ampalaya - Jade 20')",
  "scientific_name": "string",
  "category": "string (Vegetables/Fruits/Cereals/Legumes/Cash/Fodder/Herbs/Ornamentals)",
  
  "scores": {{
    "overall_score": "number 0.0-1.0 (weighted composite)",
    "confidence_pct": "integer 0-100",
    "env_score": "number 0.0-1.0",
    "econ_score": "number 0.0-1.0", 
    "time_fit_score": "number 0.0-1.0",
    "season_score": "number 0.0-1.0",
    "labor_score": "number 0.0-1.0",
    "risk_score": "number 0.0-1.0 (higher is better, means lower risk)",
    "market_score": "number 0.0-1.0"
  }},
  
  "growth_requirements": {{
    "crop_cycle_days": "integer",
    "water_requirement": "string (Low/Moderate/High, with liters/plant/day if applicable)",
    "sunlight_hours_daily": "integer",
    "optimal_temp_range_c": "string (e.g., 20-30)",
    "soil_ph_range": "string (e.g., 5.5-6.5)",
    "soil_type_preferred": "string"
  }},
  
  "tolerances": {{
    "drought_tolerance": "string (Low/Moderate/High)",
    "flood_tolerance": "string (Low/Moderate/High)",
    "salinity_tolerance": "string (Low/Moderate/High)",
    "frost_tolerance": "string (Low/Moderate/High)",
    "shade_tolerance": "string (Low/Moderate/High)",
    "pest_disease_resistance": "string (Low/Moderate/High)"
  }},
  
  "management": {{
    "management_intensity": "string (Low/Moderate/High)",
    "labor_hours_per_ha_per_week": "number",
    "organic_suitable": "boolean",
    "mechanization_possible": "boolean",
    "requires_irrigation": "boolean",
    "requires_trellising": "boolean"
  }},
  
  "economics": {{
    "estimated_cost_php": "number (total for farmer's land size)",
    "cost_breakdown": {{
      "seeds_php": "number",
      "fertilizer_php": "number",
      "pesticides_php": "number",
      "labor_php": "number",
      "irrigation_php": "number",
      "others_php": "number"
    }},
    "estimated_yield_kg_per_ha": "number",
    "estimated_revenue_php": "number (total for farmer's land size)",
    "profit_margin_pct": "number",
    "roi_pct": "number",
    "break_even_days": "integer"
  }},
  
  "market_strategy": {{
    "best_selling_locations": ["array of specific markets/cities"],
    "current_market_price_php_per_kg": "number",
    "projected_harvest_price_php_per_kg": "number",
    "price_volatility": "string (Low/Moderate/High)",
    "demand_level": "string (Low/Moderate/High/Very High)",
    "export_potential": "boolean",
    "buyer_types": ["array: e.g., Wet market, Supermarket, Restaurant, Processor, Exporter"]
  }},
  
  "planting_schedule": {{
    "recommended_planting_date": "string (e.g., November 15-30, 2025)",
    "expected_harvest_date": "string (e.g., February 15-28, 2026)",
    "succession_planting_possible": "boolean",
    "intercropping_compatible_with": ["array of crop names"]
  }},
  
  "risk_assessment": {{
    "weather_risks": ["array of specific risks based on season"],
    "pest_disease_risks": ["array of likely threats in the planting period"],
    "market_risks": ["array of economic risks"],
    "mitigation_strategies": ["array of 2-3 actionable recommendations"]
  }},
  
  "reasoning": "string (2-3 sentences explaining why this crop is recommended for this specific farmer)"
}}

CRITICAL REQUIREMENTS:
1. Return maximum 8 recommendations, ranked by overall_score descending
2. Consider the waiting_tolerance_days: heavily penalize time_fit_score if crop_cycle_days exceeds it
3. Use the contextual weather and market data to influence season_score and market_score
4. Confidence_pct should be reduced if sensor data is incomplete (no pH, EC, NPK sensors)
5. Risk_score should account for typhoon season, pest outbreaks, and market saturation from context
6. All financial figures must be realistic for Philippines 2025 and scaled to farmer's land_size_ha
7. Consider the current month ({start_month}) and ensure harvest doesn't coincide with worst weather
8. Respect budget constraint strictly - do not recommend crops where estimated_cost_php > budget_php

Output ONLY valid JSON. No markdown, no explanations outside the JSON structure.
"""
