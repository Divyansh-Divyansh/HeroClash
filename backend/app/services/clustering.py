import requests
import json
import os
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from app.config import SUPERHERO_API_KEY

DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/heroes.json")

def fetch_all_heroes():
    """Fetch all 731 heroes from Superhero API and save locally."""
    print("Fetching heroes from Superhero API...")
    heroes = []

    for hero_id in range(1, 732):
        url = f"https://superheroapi.com/api/{SUPERHERO_API_KEY}/{hero_id}"
        response = requests.get(url)
        data = response.json()

        if data.get("response") == "success":
            heroes.append(data)
            print(f"Fetched {hero_id}/731 — {data['name']}")

    with open(DATA_PATH, "w") as f:
        json.dump(heroes, f)

    print(f"Done! {len(heroes)} heroes saved.")
    return heroes


def load_heroes():
    """Load heroes from local file. Fetch if file doesn't exist."""
    if os.path.exists(DATA_PATH):
        with open(DATA_PATH, "r") as f:
            return json.load(f)
    return fetch_all_heroes()


def parse_stats(hero):
    """Extract the 6 stats from a hero as a list of floats."""
    stats = hero["powerstats"]
    try:
        return [
            float(stats["intelligence"]),
            float(stats["strength"]),
            float(stats["speed"]),
            float(stats["durability"]),
            float(stats["power"]),
            float(stats["combat"])
        ]
    except (ValueError, TypeError):
        return None


def build_deck():
    """
    Use K-Means clustering to select a balanced 52-card deck.
    26 Marvel + 26 DC heroes sampled evenly from clusters.
    """
    heroes = load_heroes()

    # Step 1 — Separate Marvel and DC, filter out heroes with null stats
    marvel = []
    dc = []

    for hero in heroes:
        stats = parse_stats(hero)
        if stats is None:
            continue
        publisher = hero["biography"]["publisher"]
        if "Marvel" in publisher:
            marvel.append(hero)
        elif "DC" in publisher:
            dc.append(hero)

    print(f"Valid Marvel heroes: {len(marvel)}")
    print(f"Valid DC heroes: {len(dc)}")

    # Step 2 — Run K-Means on each universe separately, pick 26 from each
    marvel_deck = cluster_and_sample(marvel, n_cards=26, universe="Marvel")
    dc_deck = cluster_and_sample(dc, n_cards=26, universe="DC")

    deck = marvel_deck + dc_deck
    print(f"Final deck: {len(deck)} cards")
    return deck


def cluster_and_sample(heroes, n_cards, universe):
    """
    Run K-Means clustering on heroes by their stats.
    Sample evenly from each cluster to get n_cards heroes.
    """
    # Build stat matrix — each row is one hero's 6 stats
    stat_matrix = []
    for hero in heroes:
        stats = parse_stats(hero)
        stat_matrix.append(stats)

    X = np.array(stat_matrix)

    # Normalise stats so no single stat dominates clustering
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Run K-Means — split into n_cards clusters
    kmeans = KMeans(n_clusters=n_cards, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_scaled)

    # Pick one hero per cluster (closest to cluster centre)
    selected = []
    for cluster_id in range(n_cards):
        # Get all heroes in this cluster
        cluster_indices = np.where(labels == cluster_id)[0]
        cluster_heroes = [heroes[i] for i in cluster_indices]
        cluster_stats = X_scaled[cluster_indices]

        # Pick the hero closest to the cluster centre
        centre = kmeans.cluster_centers_[cluster_id]
        distances = np.linalg.norm(cluster_stats - centre, axis=1)
        closest = cluster_heroes[np.argmin(distances)]
        selected.append(closest)

    print(f"{universe}: selected {len(selected)} heroes from {len(heroes)} via K-Means")
    return selected

DECK_PATH = os.path.join(os.path.dirname(__file__), "../data/deck.json")

def save_deck():
    """Build and save the deck to disk."""
    deck = build_deck()
    with open(DECK_PATH, "w") as f:
        json.dump(deck, f)
    print(f"Deck saved to {DECK_PATH}")
    return deck

def load_deck():
    """Load deck from file. Build if it doesn't exist."""
    if os.path.exists(DECK_PATH):
        with open(DECK_PATH, "r") as f:
            return json.load(f)
    return save_deck()