import json
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    ContextAnalysisResponse,
    RecommendationRequest,
    RecommendationResponse,
    SensorData
)
from app.services.gemini_service import call_gemini
from app.services.database_service import save_to_mongodb
from app.services.prompts import CONTEXT_ANALYSIS_PROMPT, RECOMMENDATION_PROMPT
from app.core.config import DEFAULT_SENSOR_VALUES, LOCATION, START_MONTH
from app.routers.sensors import current_sensor_data

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.get("/context-analysis", response_model=ContextAnalysisResponse)
async def analyze_context():
    sensors = current_sensor_data
    
    input_payload = {
        "sensors": sensors,
        "location": LOCATION,
        "start_month": START_MONTH
    }
    
    try:
        context_prompt = CONTEXT_ANALYSIS_PROMPT.replace(
            "{input_payload}", 
            json.dumps(input_payload, ensure_ascii=False)
        )
        context_prompt = context_prompt.replace("{location}", LOCATION)
        
        context_data = call_gemini(context_prompt)
        
        document_id = await save_to_mongodb("context_analysis", {
            "input": input_payload,
            "output": context_data
        })
        
        return ContextAnalysisResponse(
            id=document_id,
            **context_data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Context analysis failed: {str(e)}")

@router.post("/generate", response_model=RecommendationResponse)
async def generate_recommendations(request: RecommendationRequest):
    sensors = request.sensors.dict() if request.sensors else current_sensor_data
    
    input_payload = {
        "sensors": sensors,
        "farmer": request.farmer.dict(),
        "location": LOCATION,
        "start_month": START_MONTH
    }
    
    try:
        context_prompt = CONTEXT_ANALYSIS_PROMPT.replace(
            "{input_payload}", 
            json.dumps(input_payload, ensure_ascii=False)
        )
        context_prompt = context_prompt.replace("{location}", LOCATION)
        
        context_data = call_gemini(context_prompt)
        
        await save_to_mongodb("context_analysis", {
            "input": input_payload,
            "output": context_data
        })
        
        recommendation_prompt = RECOMMENDATION_PROMPT.replace(
            "{context_data}", 
            json.dumps(context_data, ensure_ascii=False, indent=2)
        )
        recommendation_prompt = recommendation_prompt.replace(
            "{input_payload}", 
            json.dumps(input_payload, ensure_ascii=False)
        )
        recommendation_prompt = recommendation_prompt.replace(
            "{start_month}", 
            str(START_MONTH)
        )
        
        ai_response = call_gemini(recommendation_prompt)
        
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
        
        document_id = await save_to_mongodb("crop_recommendations", {
            "input": input_payload,
            "context_data": context_data,
            "output": output
        })
        
        return RecommendationResponse(
            id=document_id,
            recommendations=output["recommendations"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation generation failed: {str(e)}")
