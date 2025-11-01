import datetime
from typing import Dict, Any
from app.core.database import mongodb

async def save_to_mongodb(collection_name: str, data: Dict[str, Any]) -> str:
    db = mongodb.get_database()
    collection = db[collection_name]
    
    document = {
        "timestamp": datetime.datetime.utcnow(),
        "data": data
    }
    
    result = await collection.insert_one(document)
    return str(result.inserted_id)
