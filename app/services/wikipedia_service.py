import httpx
from typing import Optional

async def fetch_wikipedia_thumbnail(searchable_name: str) -> Optional[str]:
    try:
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{searchable_name.replace(' ', '_')}"
        
        headers = {
            "User-Agent": "PiliSeed/1.0 (Agricultural Recommendation System; https://github.com/dandee77/piliseed)"
        }
        
        async with httpx.AsyncClient(timeout=10.0, headers=headers) as client:
            response = await client.get(url)
            
            if response.status_code == 200:
                data = response.json()
                thumbnail = data.get("thumbnail")
                
                if thumbnail and "source" in thumbnail:
                    return thumbnail["source"]
                
                original = data.get("originalimage")
                if original and "source" in original:
                    return original["source"]
        
        return None
    except Exception as e:
        print(f"Error fetching Wikipedia thumbnail for {searchable_name}: {str(e)}")
        return None
