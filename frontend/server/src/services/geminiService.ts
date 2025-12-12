import pino from "pino";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

// Ensure environment variables are loaded even if server boot order changes
if (process.env.API_ENV_PATH) {
  dotenv.config({ path: process.env.API_ENV_PATH });
}
dotenv.config({ path: path.resolve(process.cwd(), "server/.env") });
dotenv.config();

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

export class GeminiService {
  private client: GoogleGenerativeAI | null;
  private modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.error("GEMINI_API_KEY not set");
      this.client = null;
      this.modelName = "";
      return;
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    logger.info({ model: this.modelName }, "Initialized Gemini Service");
  }

  async generateChatResponse(messages: { role: string; content: string }[], context?: string): Promise<string> {
    if (!this.client) return "Orbit AI is offline. Please try again later.";
    try {
      const model = this.client.getGenerativeModel({ model: this.modelName });
      const systemInstruction = [
        "You are Orbit AI, an advanced DeFi portfolio manager and assistant.",
        "Your goal is to help users manage their crypto investments, analyze risks, and find yield opportunities.",
        "Tone: Professional, futuristic, concise, and helpful.",
        "Do not give financial advice, but provide data-driven insights."
      ].join("\n");

      const history = messages.map(m => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] }));
      const finalParts = context ? [{ text: `${systemInstruction}\n\nUser Context:\n${context}` }] : [{ text: systemInstruction }];

      const res = await model.generateContent({ contents: [...history, { role: "user", parts: finalParts }] });
      const text = res.response.text();
      return text || "No response generated.";
    } catch (e) {
      logger.error({ err: e }, "Error generating chat response");
      return "I'm having trouble connecting to the Orbit mainframe. Please try again later.";
    }
  }

  async generateWeeklyAnalysis(portfolioData: Record<string, unknown>): Promise<Record<string, any>> {
    if (!this.client) return { risk_metrics: [], insights: [], risk_score: 0, summary: "Analysis failed." };
    try {
      const start = Date.now();
      const model = this.client.getGenerativeModel({ model: this.modelName });
      const prompt = `Analyze the following COMPLETE DeFi portfolio data (Loops, CEX Positions, Standard DeFi Positions) and generate a comprehensive weekly report.\n\nPopulate: Risk Heatmap + Orbit Intelligence Stream. Stick to the required fields only.\n\nPortfolio Data:\n${JSON.stringify(portfolioData, null, 2)}`;

      const generationConfig = {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            risk_metrics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  subject: { type: "string", enum: ["Liquidation", "Volatility", "Protocol", "Peg", "Strategy"] },
                  A: { type: "integer", minimum: 0, maximum: 100 },
                  fullMark: { type: "integer", minimum: 100, maximum: 100 }
                },
                required: ["subject", "A", "fullMark"]
              }
            },
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["warning", "opportunity", "info"] },
                  title: { type: "string" },
                  message: { type: "string" },
                  impact: { type: "string" }
                },
                required: ["type", "title", "message", "impact"]
              }
            },
            risk_score: { type: "integer", minimum: 0, maximum: 100 },
            summary: { type: "string" }
          },
          required: ["risk_metrics", "insights", "risk_score", "summary"]
        }
      } as any;

      const res = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig });
      let jsonText = res.response.text();
      const durationMs = Date.now() - start;
      logger.info({ durationMs, textLen: jsonText?.length || 0, sample: jsonText ? jsonText.slice(0, 180) : "" }, "Gemini weekly analysis raw response");
      try {
        // Some models still wrap JSON in markdown fences; strip them if present
        if (jsonText && jsonText.trim().startsWith("```")) {
          jsonText = jsonText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
        }
        return JSON.parse(jsonText);
      } catch (parseErr) {
        logger.error({ err: parseErr, sample: jsonText ? jsonText.slice(0, 180) : "" }, "Failed to parse Gemini analysis JSON");
        return { risk_metrics: [], insights: [], risk_score: 0, summary: "Analysis failed." };
      }
    } catch (e) {
      logger.error({ err: e }, "Error generating analysis");
      return { risk_metrics: [], insights: [], risk_score: 0, summary: "Analysis failed." };
    }
  }
}

export const geminiService = new GeminiService();