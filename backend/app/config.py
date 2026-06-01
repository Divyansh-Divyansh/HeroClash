from dotenv import load_dotenv
import os

load_dotenv()

SUPERHERO_API_KEY = os.getenv("SUPERHERO_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")