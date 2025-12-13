import { Router } from "express";
import type { Request, Response } from "express";
import pino from "pino";
import { z } from "zod";
import { firebaseService } from "../services/firebaseService";
import { geminiService } from "../services/geminiService";
import { researchService } from "../services/researchService";
import { authMiddleware } from "../middleware/auth";
import {
  ChatRequestSchema,
  ChatResponseSchema,
  PortfolioStatsSchema,
  GenerateAnalysisRequestSchema,
  AnalysisResponseSchema,
  InsightSchema,
  InsightsResponseSchema
} from "../models";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });
export const dashboardRouter = Router();

dashboardRouter.get("/dashboard/stats", authMiddleware, async (
  req: Request & { user?: { uid: string; email?: string; role?: string } },
  res: Response
) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });
    const stats = await firebaseService.getAggregatedStats(uid);
    const parsed = PortfolioStatsSchema.safeParse(stats);
    if (!parsed.success) return res.status(500).json({ error: "Invalid stats structure" });
    res.json(parsed.data);
  } catch (e) {
    logger.error({ err: e }, "Error in /dashboard/stats");
    res.status(200).json({
      total_net_worth: 0,
      change_24h: 0,
      risk_score: 0,
      active_protocols: 0,
      yield_apy: 0,
      monthly_income: 0,
      breakdown: {
        loops: { value: 0, apy: 0, count: 0 },
        cex: { value: 0, apy: 0, count: 0 },
        defi: { value: 0, apy: 0, count: 0 }
      }
    });
  }
});

dashboardRouter.get("/dashboard/insights", authMiddleware, async (
  req: Request & { user?: { uid: string; email?: string; role?: string } },
  res: Response
) => {
  try {
    const reqId = cryptoRandomId();
    logger.info({ reqId }, "[insights] request received");
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });
    const latest = await firebaseService.getLatestAiAnalysis(uid);
    const latestTs: Date | null = (() => {
      const ts: any = latest?.timestamp;
      if (!ts) return null;
      try {
        if (typeof ts === 'string') {
          const d = new Date(ts);
          return Number.isFinite(d.getTime()) ? d : null;
        }
        if (ts && typeof ts.toDate === 'function') {
          const d = ts.toDate();
          return Number.isFinite(d.getTime()) ? d : null;
        }
        return null;
      } catch {
        return null;
      }
    })();
    logger.info({ reqId, hasLatest: !!latest, latestTimestampIso: latest?.timestamp_iso, latestTimestampType: typeof latest?.timestamp }, "[insights] latest analysis lookup");
    let shouldGenerateNew = true;
    if (latest && latestTs) {
      const diffDays = (Date.now() - latestTs.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays < 7) {
        shouldGenerateNew = false;
        logger.info({ reqId, diffDays }, "[insights] using cached AI analysis (<7d)");
        const insightsSafe = Array.isArray(latest.insights)
          ? latest.insights.map((i: any) => ({
              id: i.id || cryptoRandomId(),
              type: i.type || "info",
              title: i.title || "Insight",
              message: i.message || "",
              impact: i.impact || "",
              timestamp: i.timestamp || new Date().toISOString()
            }))
          : [];
        const riskMetricsSafe = Array.isArray(latest.risk_metrics) && latest.risk_metrics.length
          ? latest.risk_metrics
          : defaultRiskMetrics();
        const riskScoreSafe = typeof latest.risk_score === "number" ? latest.risk_score : 50;
        const summarySafe = latest.summary || "";
        logger.info({ reqId, insightsCount: insightsSafe.length, riskMetricsCount: riskMetricsSafe.length, riskScore: riskScoreSafe }, "[insights] return cached");
        return res.json(InsightsResponseSchema.parse({
          insights: insightsSafe,
          risk_metrics: riskMetricsSafe,
          risk_score: riskScoreSafe,
          summary: summarySafe
        }));
      }
    } else {
      logger.info({ reqId }, '[insights] latest timestamp missing or invalid; generating new');
    }

    if (shouldGenerateNew) {
      if (!geminiService) {
        if (latest) return res.json(latest);
        return res.status(503).json({ error: "AI Service unavailable" });
      }
      const context = await firebaseService.getFullPortfolioContext(uid);
      logger.info({ reqId, loops: Array.isArray((context as any).loops) ? (context as any).loops.length : 0, cex: Array.isArray((context as any).cex_positions) ? (context as any).cex_positions.length : 0, defi: Array.isArray((context as any).defi_positions) ? (context as any).defi_positions.length : 0 }, "[insights] context fetched");
      const analysis = await geminiService.generateWeeklyAnalysis(context);
      logger.info({ reqId, summaryLen: typeof analysis.summary === 'string' ? analysis.summary.length : 0, insightsCount: Array.isArray(analysis.insights) ? analysis.insights.length : 0, riskMetricsCount: Array.isArray(analysis.risk_metrics) ? analysis.risk_metrics.length : 0 }, "[insights] analysis generated");
      if (analysis.summary === "Analysis failed.") {
        logger.warn({ reqId }, "[insights] analysis failed; returning fallback");
        if (latest) return res.json(latest);
        return res.json({ insights: [], risk_metrics: defaultRiskMetrics(), risk_score: 50, summary: "System offline." });
      }
      if (Array.isArray(analysis.insights)) {
        analysis.insights = analysis.insights.map((i: any) => ({ ...i, id: cryptoRandomId() }));
      }
      await firebaseService.saveAiAnalysis(uid, analysis);
      logger.info({ reqId }, "[insights] analysis saved to firestore");
  return res.json(analysis);
  }
  } catch (e) {
    logger.error({ err: e }, "[insights] Error in /dashboard/insights");
    return res.json({ insights: [], risk_metrics: defaultRiskMetrics(), risk_score: 50, summary: "System offline." });
  }
});

dashboardRouter.post("/dashboard/chat", authMiddleware, async (
  req: Request & { user?: { uid: string; email?: string; role?: string } },
  res: Response
) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });
    const parse = ChatRequestSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Invalid request" });
    if (!geminiService) return res.status(503).json({ error: "AI Service unavailable" });

    const includeContext = parse.data.include_context ?? true;
    const enableResearch = parse.data.enable_research ?? true;
    const userQuery = parse.data.research_query || parse.data.messages?.[parse.data.messages.length - 1]?.content || '';

    let combinedContext = parse.data.context || '';
    if (includeContext) {
      const full = await firebaseService.getFullPortfolioContext(uid);
      const fullJson = JSON.stringify(full);
      combinedContext += `\n\nUser Portfolio Context (JSON):\n${fullJson}`;
      logger.info({ ctxLen: fullJson.length }, '[chat] included portfolio context');
    }

    if (enableResearch) {
      const research = await researchService.performResearch(userQuery, undefined);
      if (research.length) {
        const summary = research.map(r => `- ${r.title}: ${r.snippet} (${r.url})`).join('\n');
        combinedContext += `\n\nWeb Research Summary (latest market/trending):\n${summary}`;
        logger.info({ researchCount: research.length }, '[chat] appended web research');
      } else {
        logger.info('[chat] research returned no results');
      }
    }

    const responseText = await geminiService.generateChatResponse(parse.data.messages, combinedContext);

    // Persist chat exchange for future history
    await firebaseService.saveChatLog(uid, {
      messages: parse.data.messages,
      response: responseText,
      include_context: includeContext,
      enable_research: enableResearch,
      timestamp_iso: new Date().toISOString(),
    });

    return res.json(ChatResponseSchema.parse({ response: responseText }));
  } catch (e) {
    logger.error({ err: e }, "Error in /dashboard/chat");
    return res.status(500).json({ error: "Chat failed" });
  }
});

dashboardRouter.post("/dashboard/generate-analysis", authMiddleware, async (
  req: Request & { user?: { uid: string; email?: string; role?: string } },
  res: Response
) => {
  try {
    const parse = GenerateAnalysisRequestSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Invalid request" });
    if (!geminiService) return res.status(503).json({ error: "AI Service unavailable" });
    const result = await geminiService.generateWeeklyAnalysis(parse.data.portfolio_data);
    const insights = Array.isArray(result.insights)
      ? result.insights.map((item: any) => InsightSchema.parse({
          id: cryptoRandomId(),
          type: item.type || "info",
          title: item.title || "Insight",
          message: item.message || "",
          impact: item.impact || "",
          timestamp: new Date().toISOString()
        }))
      : [];
    return res.json(AnalysisResponseSchema.parse({ analysis: result.summary || "", insights }));
  } catch (e) {
    logger.error({ err: e }, "Error in /dashboard/generate-analysis");
    return res.status(500).json({ error: "Analysis failed" });
  }
});

// Auth-enabled health endpoint to validate token verification
dashboardRouter.get('/dashboard/health/auth', authMiddleware, async (
  req: Request & { user?: { uid: string; email?: string; role?: string } },
  res: Response
) => {
  return res.json({ status: 'ok', uid: req.user?.uid, role: req.user?.role || 'user' });
});

function cryptoRandomId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function defaultRiskMetrics() {
  return [
    { subject: "Liquidation", A: 50, fullMark: 100 },
    { subject: "Volatility", A: 50, fullMark: 100 },
    { subject: "Protocol", A: 50, fullMark: 100 },
    { subject: "Peg", A: 50, fullMark: 100 },
    { subject: "Strategy", A: 50, fullMark: 100 }
  ];
}
// One-time migration endpoint to normalize ai_analyses timestamps
dashboardRouter.post('/dashboard/migrate-ai-analyses', async (req, res) => {
  try {
    const secret = process.env.MIGRATION_SECRET;
    const header = req.headers['x-migration-secret'];
    if (secret) {
      if (!header || header !== secret) {
        return res.status(403).json({ error: 'Forbidden: invalid migration secret' });
      }
    }
    const result = await firebaseService.migrateAiAnalysesTimestamps();
    return res.json({ status: 'ok', ...result });
  } catch (e) {
    logger.error({ err: e }, '[migration] Error migrating ai_analyses timestamps');
    return res.status(500).json({ error: 'Migration failed' });
  }
});

// Migration: copy legacy collections into users/{uid} subcollections
dashboardRouter.post('/dashboard/migrate-legacy-to-user', async (req, res) => {
  try {
    const secret = process.env.MIGRATION_SECRET;
    const header = req.headers['x-migration-secret'];
    if (secret) {
      if (!header || header !== secret) {
        return res.status(403).json({ error: 'Forbidden: invalid migration secret' });
      }
    }

    const BodySchema = z.object({ uid: z.string().min(1) }).strict();
    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid body: { uid: string } required' });
    }
    const { uid } = parsed.data;
    const result = await firebaseService.migrateLegacyToUser(uid);
    return res.json({ status: 'ok', result });
  } catch (e) {
    logger.error({ err: e }, '[migration] Error migrating legacy collections to user');
    return res.status(500).json({ error: 'Migration failed' });
  }
});