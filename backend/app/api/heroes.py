from fastapi import APIRouter
from app.services.clustering import load_heroes, parse_stats
import random

router = APIRouter()

@router.get("/deck")
def get_deck():
    """Return 52 randomly sampled heroes AND villains from all publishers."""
    heroes = load_heroes()

    # Filter only by valid stats — include everyone
    valid = []
    for hero in heroes:
        stats = parse_stats(hero)
        if stats is None:
            continue
        valid.append(hero)

    # Split by universe for balance
    marvel = [h for h in valid if "Marvel" in h["biography"]["publisher"]]
    dc = [h for h in valid if "DC" in h["biography"]["publisher"]]
    others = [h for h in valid if 
              "Marvel" not in h["biography"]["publisher"] and 
              "DC" not in h["biography"]["publisher"]]

    # Sample 22 Marvel + 22 DC + 8 wildcards (other publishers)
    marvel_sample = random.sample(marvel, min(22, len(marvel)))
    dc_sample = random.sample(dc, min(22, len(dc)))
    other_sample = random.sample(others, min(8, len(others)))

    deck = marvel_sample + dc_sample + other_sample
    random.shuffle(deck)

    cards = []
    for hero in deck:
        stats = hero["powerstats"]
        try:
            cards.append({
                "id": hero["id"],
                "name": hero["name"],
                "publisher": hero["biography"]["publisher"],
                "alignment": hero["biography"]["alignment"],
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
        except:
            continue

    return {"cards": cards, "total": len(cards)}