from fastapi import APIRouter, HTTPException, BackgroundTasks
from backend.models import ChatRequest, ChatResponse, GenerateAnalysisRequest, AnalysisResponse, Insight, PortfolioStats
from backend.services.gemini_service import gemini_service
import logging
from datetime import datetime
import uuid

router = APIRouter()
logger = logging.getLogger(__name__)

# Mock Data for initial load
MOCK_STATS = PortfolioStats(
    total_net_worth=124500.00,
    change_24h=2.4,
    risk_score=65,
    active_protocols=4,
    yield_apy=8.5,
    monthly_income=850.00
)

MOCK_INSIGHTS = [
    Insight(
        id="1",
        type="warning",
        title="Impermanent Loss Risk",
        message="High volatility detected in ETH/USDC pool on Uniswap.",
        impact="High Risk",
        timestamp=datetime.now().isoformat()
    ),
    Insight(
        id="2",
        type="opportunity",
        title="Yield Optimization",
        message="Aave USDC rates have increased to 12%. Consider shifting funds.",
        impact="+$410/yr",
        timestamp=datetime.now().isoformat()
    ),
    Insight(
        id="3",
        type="info",
        title="Protocol Update",
        message="Compound V3 governance proposal passed.",
        impact="Info",
        timestamp=datetime.now().isoformat()
    )
]

@router.get("/dashboard/stats", response_model=PortfolioStats)
async def get_dashboard_stats():
    return MOCK_STATS

@router.get("/dashboard/insights", response_model=list[Insight])
async def get_insights():
    # In a real app, this would fetch from DB
    return MOCK_INSIGHTS

@router.post("/dashboard/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    if not gemini_service:
        raise HTTPException(status_code=503, detail="AI Service unavailable")
    
    response_text = gemini_service.generate_chat_response(request.messages, request.context)
    return ChatResponse(response=response_text)

@router.post("/dashboard/generate-analysis", response_model=AnalysisResponse)
async def generate_analysis(request: GenerateAnalysisRequest):
    if not gemini_service:
        raise HTTPException(status_code=503, detail="AI Service unavailable")
        
    result = gemini_service.generate_weekly_analysis(request.portfolio_data)
    
    # Transform result to match model if needed
    insights = []
    if 'insights' in result:
        for item in result['insights']:
            insights.append(Insight(
                id=str(uuid.uuid4()),
                type=item.get('type', 'info'),
                title=item.get('title', 'Insight'),
                message=item.get('message', ''),
                impact=item.get('impact', ''),
                timestamp=datetime.now().isoformat()
            ))
            
    return AnalysisResponse(
        analysis=result.get('summary', ''),
        insights=insights
    )
