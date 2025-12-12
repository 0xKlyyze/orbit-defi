from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class Insight(BaseModel):
    id: str
    type: str  # 'warning', 'opportunity', 'info'
    title: str
    message: str
    impact: str
    timestamp: str

class PortfolioStats(BaseModel):
    total_net_worth: float
    change_24h: float
    risk_score: int
    active_protocols: int
    yield_apy: float
    monthly_income: float
    
class ChatMessage(BaseModel):
    breakdown: Dict[str, Any] = {}
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    
class GenerateAnalysisRequest(BaseModel):
    portfolio_data: Dict[str, Any]
    
class AnalysisResponse(BaseModel):
    analysis: str
    insights: List[Insight]
