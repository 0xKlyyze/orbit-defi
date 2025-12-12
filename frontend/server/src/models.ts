import { z } from "zod";

export const InsightSchema = z.object({
  id: z.string(),
  type: z.enum(["warning", "opportunity", "info"]),
  title: z.string(),
  message: z.string(),
  impact: z.string(),
  timestamp: z.string()
});

export const BreakdownSchema = z.object({
  loops: z.object({ value: z.number(), apy: z.number(), count: z.number() }),
  cex: z.object({ value: z.number(), apy: z.number(), count: z.number() }),
  defi: z.object({ value: z.number(), apy: z.number(), count: z.number() })
});

export const PortfolioStatsSchema = z.object({
  total_net_worth: z.number(),
  change_24h: z.number(),
  risk_score: z.number(),
  active_protocols: z.number(),
  yield_apy: z.number(),
  monthly_income: z.number(),
  breakdown: BreakdownSchema,
  timestamp: z.string().optional()
});

export type PortfolioStats = z.infer<typeof PortfolioStatsSchema>;
export type Breakdown = z.infer<typeof BreakdownSchema>;
export type Insight = z.infer<typeof InsightSchema>;

export const ChatMessageSchema = z.object({
  role: z.string(),
  content: z.string()
});

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
  context: z.string().optional(),
  include_context: z.boolean().optional(),
  enable_research: z.boolean().optional(),
  research_query: z.string().optional()
});

export const ChatResponseSchema = z.object({ response: z.string() });

export const ChatLogSchema = z.object({
  messages: z.array(ChatMessageSchema),
  response: z.string(),
  include_context: z.boolean().default(true),
  enable_research: z.boolean().default(true),
  timestamp_iso: z.string(),
});

export const RiskMetricSchema = z.object({
  subject: z.enum(["Liquidation", "Volatility", "Protocol", "Peg", "Strategy"]),
  A: z.number().min(0).max(100),
  fullMark: z.number().min(100).max(100)
});

export const GenerateAnalysisRequestSchema = z.object({
  portfolio_data: z.record(z.any())
});

export const AnalysisResponseSchema = z.object({
  analysis: z.string(),
  insights: z.array(InsightSchema)
});

export const InsightsResponseSchema = z.object({
  insights: z.array(z.record(z.any())),
  risk_metrics: z.array(RiskMetricSchema),
  risk_score: z.number(),
  summary: z.string().optional()
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type ChatLog = z.infer<typeof ChatLogSchema>;
export type GenerateAnalysisRequest = z.infer<typeof GenerateAnalysisRequestSchema>;
export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;
export type RiskMetric = z.infer<typeof RiskMetricSchema>;
export type InsightsResponse = z.infer<typeof InsightsResponseSchema>;