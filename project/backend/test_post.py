import asyncio
import httpx
import json

async def run():
    async with httpx.AsyncClient() as client:
        # Generate token
        token = "mock_jwt_u3_12345"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        payload = {
            "employee_id": "u4",
            "employee_name": "James Okafor",
            "reviewer_id": "u3",
            "reviewer_name": "Sarah Williams",
            "period": "H1 2025",
            "status": "Completed",
            "overall_score": 4.5,
            "goals": [],
            "competency_scores": []
        }
        
        print("POST /api/v1/reviews")
        res = await client.post("http://localhost:8000/api/v1/reviews", json=payload, headers=headers)
        print(f"Status: {res.status_code}")
        print(res.text)

        print("\nGET /api/v1/reviews")
        res2 = await client.get("http://localhost:8000/api/v1/reviews?limit=10", headers=headers)
        print(f"Status: {res2.status_code}")
        print(res2.text)

if __name__ == "__main__":
    asyncio.run(run())
