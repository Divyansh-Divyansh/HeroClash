from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import game
from app.api import heroes, game as game_router

app = FastAPI(
    title="HeroClash API",
    description="Marvel vs DC card battle game backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(heroes.router, prefix="/api/heroes", tags=["Heroes"])
app.include_router(game_router.router, prefix="/api/game", tags=["Game"])

@app.get("/")
def root():
    return {"message": "HeroClash API is running!"}