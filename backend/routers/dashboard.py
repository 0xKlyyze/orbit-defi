from fastapi import APIRouter, HTTPException, BackgroundTasks
from models import ChatRequest, ChatResponse, GenerateAnalysisRequest, AnalysisResponse, Insight, PortfolioStats
from services.gemini_service import gemini_service
from services.firebase_service import firebase_service
import logging
from datetime import datetime, timedelta
import uuid
import json

router = APIRouter()
logger = logging.getLogger(__name__)

# Mock Data for initial load (fallback)
MOCK_STATS = PortfolioStats(
    total_net_worth=0.0,
    change_24h=0.0,
    risk_score=0,
    active_protocols=0,
    yield_apy=0.0,
    monthly_income=0.0,
    breakdown={}
)

@router.get("/dashboard/stats", response_model=PortfolioStats)
async def get_dashboard_stats():
    # Use real data from Firebase
    stats = firebase_service.get_aggregated_stats()
    return PortfolioStats(**stats)

@router.get("/dashboard/insights")
async def get_insights():
    try:
        # 1. Check for cached analysis
        latest_analysis = firebase_service.get_latest_ai_analysis()
        
        should_generate_new = True
        
        if latest_analysis and 'timestamp' in latest_analysis:
            last_date = datetime.fromisoformat(latest_analysis['timestamp'])
            # Check if less than 1 week old
            if datetime.now() - last_date < timedelta(days=7):
                should_generate_new = False
                logger.info("Using cached AI analysis (less than 7 days old)")
                return {
                    "insights": latest_analysis.get('insights', []),
                    "risk_metrics": latest_analysis.get('risk_metrics', []),
                    "risk_score": latest_analysis.get('risk_score', 50),
                    "summary": latest_analysis.get('summary', "")
                }

        # 2. Generate New Analysis if needed
        if should_generate_new:
            logger.info("Generating NEW AI analysis...")
            if not gemini_service:
                raise HTTPException(status_code=503, detail="AI Service unavailable")
            
            # Fetch FULL context
            full_context = firebase_service.get_full_portfolio_context()
            
            # Generate via Gemini
            analysis_result = gemini_service.generate_weekly_analysis(full_context)
            
            # Add IDs to insights for React keys
            if 'insights' in analysis_result:
                for insight in analysis_result['insights']:
                    insight['id'] = str(uuid.uuid4())
            
            # Save to Firebase
            firebase_service.save_ai_analysis(analysis_result)
            
            return analysis_result

    except Exception as e:
        logger.error(f"Error in get_insights: {e}")
        # Return fallback structure to not break UI
        return {
            "insights": [],
            "risk_metrics": [
                { "subject": 'Liquidation', "A": 50, "fullMark": 100 },
                { "subject": 'Volatility', "A": 50, "fullMark": 100 },
                { "subject": 'Protocol', "A": 50, "fullMark": 100 },
                { "subject": 'Peg', "A": 50, "fullMark": 100 },
                { "subject": 'Strategy', "A": 50, "fullMark": 100 },
            ],
            "risk_score": 50,
            "summary": "System offline."
        }

@router.post("/dashboard/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    if not gemini_service:
        raise HTTPException(status_code=503, detail="AI Service unavailable")
    
    # Optional: Enhance context with live stats
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
