from google import genai
from google.genai import types
import os
import logging
import json
from datetime import datetime

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables")
            raise ValueError("GEMINI_API_KEY not set")
            
        self.client = genai.Client(api_key=api_key)
        self.model = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash-exp") 
        logger.info(f"Initialized Gemini Service with model: {self.model}")

    def generate_chat_response(self, messages: list, context: str = None) -> str:
        try:
            gemini_messages = []
            
            for msg in messages:
                gemini_messages.append(types.Content(
                    role=msg.role if msg.role == 'user' else 'model',
                    parts=[types.Part(text=msg.content)]
                ))

            system_instruction = """
            You are Orbit AI, an advanced DeFi portfolio manager and assistant.
            Your goal is to help users manage their crypto investments, analyze risks, and find yield opportunities.
            Tone: Professional, futuristic, concise, and helpful. 
            Do not give financial advice, but provide data-driven insights.
            """
            
            if context:
                system_instruction += f"\n\nUser Context:\n{context}"

            response = self.client.models.generate_content(
                model=self.model,
                contents=gemini_messages,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.7
                )
            )
            
            return response.text
        except Exception as e:
            logger.error(f"Error generating chat response: {str(e)}")
            return "I'm having trouble connecting to the Orbit mainframe. Please try again later."

    def generate_weekly_analysis(self, portfolio_data: dict):
        try:
            prompt = f"""
            Analyze the following COMPLETE DeFi portfolio data (Loops, CEX Positions, Standard DeFi Positions) and generate a comprehensive weekly report.
            
            Portfolio Data:
            {json.dumps(portfolio_data, indent=2, default=str)}
            
            Your task is to populate the 'Risk Heatmap' and 'Orbit Intelligence Stream' widgets of the dashboard.
            
            OUTPUT REQUIREMENTS (Strict JSON):
            
            1. 'risk_metrics': An array of 5 objects for the Radar Chart.
               Each object must have: 
               - 'subject': string (Must be exactly these 5: 'Liquidation', 'Volatility', 'Protocol', 'Peg', 'Strategy')
               - 'A': integer (0-100, where 100 is perfectly safe/good, 0 is critical risk)
               - 'fullMark': integer (always 100)
               
            2. 'insights': An array of 3-5 insight objects.
               Each object must have:
               - 'type': string ('warning', 'opportunity', 'info')
               - 'title': string (Short, punchy header)
               - 'message': string (Actionable advice or observation)
               - 'impact': string (e.g. 'High Risk', '+$450/yr', 'Liquidity')
               
            3. 'risk_score': integer (0-100 overall safety score)
            
            4. 'summary': string (Brief executive summary)

            Make the analysis realistic based on the provided data. If data is sparse, make reasonable assumptions for a general crypto portfolio but be conservative.
            """
            
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.4
                )
            )
            
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Error generating analysis: {str(e)}")
            return {
                "risk_metrics": [],
                "insights": [],
                "risk_score": 0,
                "summary": "Analysis failed."
            }

# Singleton instance
try:
    gemini_service = GeminiService()
except Exception as e:
    logger.error(f"Failed to initialize GeminiService: {e}")
    gemini_service = None
