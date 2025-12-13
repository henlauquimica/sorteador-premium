from pydantic import BaseModel
from typing import List, Optional

class RaffleConfig(BaseModel):
    mode: str 
    participants: Optional[List[str]] = []
    min_number: Optional[int] = 1
    max_number: Optional[int] = 100
    allow_repeat: bool = False
    double_draw: bool = False
    
class DrawResult(BaseModel):
    winner: str
    remaining_count: int

class ThemeConfig(BaseModel):
    app_name: str = "Sorteador Premium"
    primary_color: str = "#9333ea" # purple-600
    secondary_color: str = "#db2777" # pink-600
    effect_color: str = "#3b82f6" # blue-500
    is_dark_mode: bool = True
