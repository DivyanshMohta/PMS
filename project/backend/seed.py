"""
Seed script — run once to populate the database with initial data.

Usage:
    python seed.py

Requires MongoDB running locally and MONGODB_URL set in .env
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = "hrms_db"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]

    # Clear collections
    for col in ["users", "competencies"]:
        await db[col].delete_many({})

    # Users
    users = [
        {"name": "Alexandra Chen", "email": "admin@hrms.com", "password_hash": pwd_context.hash("admin123"), "role": "Admin", "department": "HR", "title": "HR Director"},
        {"name": "Marcus Thompson", "email": "hr@hrms.com", "password_hash": pwd_context.hash("hr123"), "role": "HR", "department": "HR", "title": "HR Business Partner"},
        {"name": "Sarah Williams", "email": "manager@hrms.com", "password_hash": pwd_context.hash("manager123"), "role": "Manager", "department": "Engineering", "title": "Engineering Manager"},
        {"name": "James Okafor", "email": "employee@hrms.com", "password_hash": pwd_context.hash("employee123"), "role": "Employee", "department": "Engineering", "title": "Senior Software Engineer"},
        {"name": "Priya Sharma", "email": "priya@hrms.com", "password_hash": pwd_context.hash("priya123"), "role": "Employee", "department": "Engineering", "title": "Software Engineer"},
    ]
    result = await db["users"].insert_many(users)
    print(f"[Seed] Inserted {len(result.inserted_ids)} users")

    # Competencies
    competencies = [
        {"name": "Technical Expertise", "category": "Technical", "description": "Depth and breadth of technical knowledge relevant to role",
         "levels": [{"level": 1, "label": "Foundational", "description": "Basic understanding, requires guidance"}, {"level": 2, "label": "Developing", "description": "Applies independently on routine tasks"}, {"level": 3, "label": "Proficient", "description": "Tackles complex problems, mentors others"}, {"level": 4, "label": "Expert", "description": "Recognized expert, shapes strategy"}], "applicable_roles": ["Software Engineer", "Senior Software Engineer"]},
        {"name": "Communication", "category": "Core", "description": "Clarity and effectiveness in written and verbal communication",
         "levels": [{"level": 1, "label": "Foundational", "description": "Communicates basic information"}, {"level": 2, "label": "Developing", "description": "Adapts style for audience"}, {"level": 3, "label": "Proficient", "description": "Facilitates complex discussions"}, {"level": 4, "label": "Expert", "description": "Executive-level communicator"}], "applicable_roles": ["All"]},
        {"name": "Leadership", "category": "Leadership", "description": "Ability to guide, inspire, and develop team members",
         "levels": [{"level": 1, "label": "Foundational", "description": "Leads self effectively"}, {"level": 2, "label": "Developing", "description": "Informal leadership, guides peers"}, {"level": 3, "label": "Proficient", "description": "Manages team, fosters growth"}, {"level": 4, "label": "Expert", "description": "Builds high-performing organizations"}], "applicable_roles": ["Engineering Manager", "HR Director"]},
    ]
    result = await db["competencies"].insert_many(competencies)
    print(f"[Seed] Inserted {len(result.inserted_ids)} competencies")

    client.close()
    print("[Seed] Done!")


if __name__ == "__main__":
    asyncio.run(seed())
