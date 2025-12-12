from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import random
from names import NAMES
from models import RaffleConfig, DrawResult
from typing import List

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State
class GameState:
    def __init__(self):
        self.mode = "names"
        self.participants: List[str] = NAMES.copy()
        self.original_participants: List[str] = NAMES.copy() # To reset/reference
        self.min_number = 1
        self.max_number = 100
        self.allow_repeat = False

state = GameState()

@app.get("/api/state")
def get_state():
    return {
        "mode": state.mode,
        "participants": state.participants,
        "config": {
            "min_number": state.min_number,
            "max_number": state.max_number,
            "allow_repeat": state.allow_repeat
        }
    }

@app.post("/api/config")
def update_config(config: RaffleConfig):
    state.mode = config.mode
    state.allow_repeat = config.allow_repeat
    
    if config.mode == "names":
        if not config.participants:
             raise HTTPException(status_code=400, detail="Participants list cannot be empty in 'names' mode")
        # limit to 300
        if len(config.participants) > 300:
             raise HTTPException(status_code=400, detail="Max 300 participants allowed")
             
        state.participants = config.participants
        state.original_participants = config.participants.copy()
        
    elif config.mode == "numbers":
        if config.min_number >= config.max_number:
            raise HTTPException(status_code=400, detail="Min number must be less than max number")
        
        count = config.max_number - config.min_number + 1
        if count > 300:
            raise HTTPException(status_code=400, detail="Range too large (max 300 items)")
            
        state.min_number = config.min_number
        state.max_number = config.max_number
        # Generate numbers list for drawing
        state.participants = [str(i) for i in range(config.min_number, config.max_number + 1)]
        state.original_participants = state.participants.copy()
        
    return {"message": "Configuration updated", "count": len(state.participants)}

@app.get("/api/participants")
def get_participants():
    return {"participants": state.participants}

@app.get("/api/draw")
def draw_winner():
    if not state.participants:
         raise HTTPException(status_code=400, detail="No participants left to draw")
         
    winner = random.choice(state.participants)
    
    if not state.allow_repeat:
        state.participants.remove(winner)
        
    return {"winner": winner, "remaining_count": len(state.participants)}

@app.post("/api/reset")
def reset_game():
    state.participants = state.original_participants.copy()
    return {"message": "Reset successful", "participants": state.participants}
