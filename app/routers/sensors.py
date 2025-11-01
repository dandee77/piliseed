from fastapi import APIRouter, HTTPException
from app.models.schemas import SensorData, SensorUpdateResponse
from app.core.config import DEFAULT_SENSOR_VALUES

router = APIRouter(prefix="/sensors", tags=["sensors"])

current_sensor_data = DEFAULT_SENSOR_VALUES.copy()

@router.put("/update", response_model=SensorUpdateResponse)
async def update_sensors(sensors: SensorData):
    global current_sensor_data
    current_sensor_data = sensors.dict()
    return SensorUpdateResponse(
        message="Sensor data updated successfully",
        sensors=sensors
    )

@router.get("/current", response_model=SensorData)
async def get_current_sensors():
    return SensorData(**current_sensor_data)
