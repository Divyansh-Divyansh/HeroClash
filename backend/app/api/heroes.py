from fastapi import APIRouter
from app.services.clustering import load_deck

router = APIRouter()

@router.get("/deck")
def get_deck():
    """Return the 52 balanced hero cards."""
    deck = load_deck()
    
    # Clean up each hero to only send what the frontend needs
    cards = []
    for hero in deck:
        stats = hero["powerstats"]
        cards.append({
            "id": hero["id"],
            "name": hero["name"],
            "publisher": hero["biography"]["publisher"],
            "image": hero["image"]["url"],
            "stats": {
                "intelligence": int(stats["intelligence"]),
                "strength": int(stats["strength"]),
                "speed": int(stats["speed"]),
                "durability": int(stats["durability"]),
                "power": int(stats["power"]),
                "combat": int(stats["combat"])
            }
        })
    
    return {"cards": cards, "total": len(cards)}