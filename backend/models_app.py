from pydantic import BaseModel
from typing import List, Optional

class RaffleConfig(BaseModel):
    mode: str 
    participants: Optional[List[str]] = []
    min_number: Optional[int] = 1
    max_number: Optional[int] = 100
    allow_repeat: bool = False
    
class DrawResult(BaseModel):
    winner: str
    remaining_count: int
