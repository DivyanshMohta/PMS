import os
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "hrms_db"
    secret_key: str = "super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480  # 8 hours

    class Config:
        env_file = ".env"


settings = Settings()

client: AsyncIOMotorClient = None  # type: ignore
db = None


async def connect_db():
    """Open the MongoDB connection. Call at application startup."""
    global client, db
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    # Verify connection
    await client.admin.command("ping")
    print(f"[DB] Connected to MongoDB: {settings.database_name}")


async def close_db():
    """Close the MongoDB connection. Call at application shutdown."""
    global client
    if client:
        client.close()
        print("[DB] MongoDB connection closed.")


def get_db():
    """Return the active database instance."""
    return db


# ── Collection helpers ─────────────────────────────────────────────────────────
def users_collection():
    return db["users"]


def reviews_collection():
    return db["reviews"]


def competencies_collection():
    return db["competencies"]


def development_plans_collection():
    return db["development_plans"]


def goals_collection():
    return db["goals"]
