from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.game import GameSession
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class GameResult(BaseModel):
    winner: str
    total_rounds: int
    player_cards_won: int
    cpu_cards_won: int
    stats_used: dict
    winning_stat: Optional[str] = None

@router.post("/save")
def save_game(result: GameResult, db: Session = Depends(get_db)):
    """Save a completed game result to the database."""
    session = GameSession(
        winner=result.winner,
        total_rounds=result.total_rounds,
        player_cards_won=result.player_cards_won,
        cpu_cards_won=result.cpu_cards_won,
        stats_used=result.stats_used,
        winning_stat=result.winning_stat
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"message": "Game saved!", "id": session.id}

@router.get("/history")
def get_history(db: Session = Depends(get_db)):
    """Get all game results."""
    sessions = db.query(GameSession).order_by(GameSession.created_at.desc()).all()
    return {"games": [
        {
            "id": s.id,
            "winner": s.winner,
            "total_rounds": s.total_rounds,
            "player_cards_won": s.player_cards_won,
            "cpu_cards_won": s.cpu_cards_won,
            "stats_used": s.stats_used,
            "winning_stat": s.winning_stat,
            "created_at": s.created_at
        }
        for s in sessions
    ]}

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """Get aggregated game statistics for the dashboard."""
    sessions = db.query(GameSession).all()
    
    if not sessions:
        return {"message": "No games played yet"}
    
    total_games = len(sessions)
    player_wins = sum(1 for s in sessions if s.winner == "player")
    cpu_wins = sum(1 for s in sessions if s.winner == "cpu")
    avg_rounds = sum(s.total_rounds for s in sessions) / total_games
    
    # Aggregate stats used across all games
    all_stats = {}
    for s in sessions:
        if s.stats_used:
            for stat, count in s.stats_used.items():
                all_stats[stat] = all_stats.get(stat, 0) + count
    
    return {
        "total_games": total_games,
        "player_wins": player_wins,
        "cpu_wins": cpu_wins,
        "player_win_rate": round(player_wins / total_games * 100, 1),
        "cpu_win_rate": round(cpu_wins / total_games * 100, 1),
        "avg_rounds_per_game": round(avg_rounds, 1),
        "stats_used": all_stats
    }