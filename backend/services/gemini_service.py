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
            # Convert messages to Gemini format
            gemini_messages = []
            
            # Add system instruction/context if provided
            if context:
                # Gemini often works better if context is added to the first user message or as system instruction
                # Here we'll treat it as a system instruction logic by prepending
                pass 

            for msg in messages:
                gemini_messages.append(types.Content(
                    role=msg.role if msg.role == 'user' else 'model',
                    parts=[types.Part(text=msg.content)]
                ))

            # System instruction for Orbit Persona
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
            Analyze the following DeFi portfolio data and generate a weekly summary.
            Identify key trends, risks, and opportunities.
            
            Portfolio Data:
            {json.dumps(portfolio_data, indent=2)}
            
            Output format:
            Provide a concise 'Executive Summary' and 3 key 'Strategic Insights' (Warning, Opportunity, or Info).
            Return the result as valid JSON with keys: 'summary' (string) and 'insights' (list of objects with type, title, message, impact).
            """
            
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.5
                )
            )
            
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Error generating analysis: {str(e)}")
            # Return mock data on failure to not break UI
            return {
                "summary": "Unable to generate real-time analysis. Showing cached data.",
                "insights": []
            }

# Singleton instance
try:
    gemini_service = GeminiService()
except Exception as e:
    logger.error(f"Failed to initialize GeminiService: {e}")
    gemini_service = None
