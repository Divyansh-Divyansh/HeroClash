from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base

class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(Integer, primary_key=True, index=True)
    winner = Column(String)           # "player" or "cpu"
    total_rounds = Column(Integer)    # how many rounds the game lasted
    player_cards_won = Column(Integer)  # how many cards player won
    cpu_cards_won = Column(Integer)     # how many cards CPU won
    stats_used = Column(JSON)         # which stats were picked each round
    winning_stat = Column(String)     # the stat that won the most rounds
    created_at = Column(DateTime, default=func.now())