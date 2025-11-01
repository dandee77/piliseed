from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import MONGODB_URL, DATABASE_NAME

class MongoDB:
    client: AsyncIOMotorClient = None
    
    @classmethod
    async def connect(cls):
        cls.client = AsyncIOMotorClient(MONGODB_URL)
    
    @classmethod
    async def disconnect(cls):
        if cls.client:
            cls.client.close()
    
    @classmethod
    def get_database(cls):
        return cls.client[DATABASE_NAME]

mongodb = MongoDB()
