from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import random
from names import NAMES
from models_app import RaffleConfig, ThemeConfig
from typing import List

app = FastAPI()

origins = [
    "http://localhost:3000",
    "https://sorteios.henlau.com.br",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State
# Global State
class GameState:
    def __init__(self):
        self.mode = "names"
        
        # Current active pool
        self.participants: List[str] = NAMES.copy()
        self.original_participants: List[str] = NAMES.copy() 
        
        # Dedicated pools for Double Draw
        self.names_pool: List[str] = NAMES.copy()
        self.original_names_pool: List[str] = NAMES.copy()
        
        self.numbers_pool: List[str] = []
        self.original_numbers_pool: List[str] = []
        
        self.min_number = 1
        self.max_number = 100
        self.allow_repeat = False
        self.double_draw = False
        
        self.history: List[str] = []
        self.theme: ThemeConfig = ThemeConfig()

state = GameState()

@app.get("/api/state")
def get_state():
    return {
        "mode": state.mode,
        "participants": state.participants,
        "history": state.history,
        "theme": state.theme,
        "config": {
            "min_number": state.min_number,
            "max_number": state.max_number,
            "allow_repeat": state.allow_repeat,
            "double_draw": state.double_draw
        }
    }

@app.post("/api/config")
def update_config(config: RaffleConfig):
    state.allow_repeat = config.allow_repeat
    state.double_draw = config.double_draw
    
    # Process Names
    if config.participants:
        if len(config.participants) > 300:
             raise HTTPException(status_code=400, detail="Max 300 participants allowed")
        state.names_pool = config.participants
        state.original_names_pool = config.participants.copy()
    
    # Process Numbers
    if config.min_number is not None and config.max_number is not None:
        if config.min_number >= config.max_number:
            raise HTTPException(status_code=400, detail="Min number must be less than max number")
        
        count = config.max_number - config.min_number + 1
        if count > 300:
            raise HTTPException(status_code=400, detail="Range too large (max 300 items)")
            
        state.min_number = config.min_number
        state.max_number = config.max_number
        state.numbers_pool = [str(i) for i in range(config.min_number, config.max_number + 1)]
        state.original_numbers_pool = state.numbers_pool.copy()

    # Determine Active Mode/Pool
    if state.double_draw:
        # In double draw, we always start with 'names' unless user was already in numbers?
        # Let's enforce starting with names for consistency or keep current config mode
        state.mode = "names"
        state.participants = state.names_pool
        state.original_participants = state.names_pool.copy() # mostly irrelevant in mixed mode, handled dynamically
    else:
        state.mode = config.mode
        if state.mode == "names":
            state.participants = state.names_pool
            state.original_participants = state.original_names_pool
        else:
            state.participants = state.numbers_pool
            state.original_participants = state.original_numbers_pool
        
    return {"message": "Configuration updated", "count": len(state.participants)}

@app.get("/api/participants")
def get_participants():
    return {"participants": state.participants}

@app.get("/api/draw")
def draw_winner():
    if not state.participants:
         raise HTTPException(status_code=400, detail="No participants left to draw")
         
    winner = random.choice(state.participants)
    
    state.history.append(winner)

    if not state.allow_repeat:
        # Removal logic needs to be careful in Double Draw to remove from correct pool
        if state.double_draw:
            if state.mode == "names":
                if winner in state.names_pool: state.names_pool.remove(winner)
            else:
                if winner in state.numbers_pool: state.numbers_pool.remove(winner)
        
        # Always remove from active participants list
        if winner in state.participants:
            state.participants.remove(winner)
            
    # Double Draw Switching Logic
    if state.double_draw:
        if state.mode == "names":
            state.mode = "numbers"
            state.participants = state.numbers_pool
        else:
            state.mode = "names"
            state.participants = state.names_pool
            
    return {"winner": winner, "remaining_count": len(state.participants)}

@app.post("/api/reset")
def reset_game():
    # Restore both pools
    state.names_pool = state.original_names_pool.copy()
    state.numbers_pool = state.original_numbers_pool.copy()
    
    if state.double_draw:
        state.mode = "names" # Reset sequence to names
        state.participants = state.names_pool
    elif state.mode == "names":
        state.participants = state.names_pool
    else:
        state.participants = state.numbers_pool
        
    state.history = []
    return {"message": "Reset successful", "participants": state.participants}

@app.post("/api/reset-history")
def reset_history():
    state.history = []
    return {"message": "History cleared"}

@app.post("/api/restore-participants")
def restore_participants():
    state.names_pool = state.original_names_pool.copy()
    state.numbers_pool = state.original_numbers_pool.copy()
    
    # Restore active list based on current mode
    if state.mode == "names":
        state.participants = state.names_pool
    else:
        state.participants = state.numbers_pool
        
    return {"message": "Participants restored", "count": len(state.participants)}

@app.post("/api/theme")
def update_theme(theme: ThemeConfig):
    state.theme = theme
    return {"message": "Theme updated", "theme": state.theme}
