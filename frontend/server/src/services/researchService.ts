import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

export interface ResearchResult {
  title: string;
  url: string;
  snippet: string;
}

export class ResearchService {
  private enabled: boolean;
  private provider: string;

  constructor() {
    this.enabled = (process.env.RESEARCH_ENABLED || 'true').toLowerCase() === 'true';
    this.provider = process.env.RESEARCH_PROVIDER || 'coingecko';
    logger.info({ enabled: this.enabled, provider: this.provider }, '[research] service initialized');
  }

  async performResearch(query: string, context?: Record<string, unknown>): Promise<ResearchResult[]> {
    if (!this.enabled) {
      logger.warn('[research] disabled via env');
      return [];
    }

    try {
      if (this.provider === 'coingecko') {
        return await this.researchWithCoingecko();
      }
      logger.warn({ provider: this.provider }, '[research] unknown provider, returning empty results');
      return [];
    } catch (err) {
      logger.error({ err }, '[research] performResearch failed');
      return [];
    }
  }

  private async researchWithCoingecko(): Promise<ResearchResult[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const [globalResp, trendingResp] = await Promise.all([
        fetch('https://api.coingecko.com/api/v3/global', { signal: controller.signal }),
        fetch('https://api.coingecko.com/api/v3/search/trending', { signal: controller.signal })
      ]);

      clearTimeout(timeout);

      const globalJson = await globalResp.json();
      const trendingJson = await trendingResp.json();

      const mc = globalJson?.data?.total_market_cap?.usd;
      const vol = globalJson?.data?.total_volume?.usd;
      const btcDom = globalJson?.data?.market_cap_percentage?.btc;
      const defiDom = globalJson?.data?.defi_dominance;

      const trending = Array.isArray(trendingJson?.coins) ? trendingJson.coins.slice(0, 5) : [];

      const results: ResearchResult[] = [];

      results.push({
        title: 'Crypto Market Overview',
        url: 'https://www.coingecko.com/en/global-charts',
        snippet: `Market Cap: $${Number(mc || 0).toLocaleString()} | 24h Vol: $${Number(vol || 0).toLocaleString()} | BTC Dominance: ${Number(btcDom || 0).toFixed(2)}% | DeFi Dominance: ${Number(defiDom || 0).toFixed(2)}%`
      });

      for (const item of trending) {
        const c = item?.item;
        if (!c) continue;
        results.push({
          title: `Trending: ${c?.name} (${c?.symbol?.toUpperCase()})`,
          url: `https://www.coingecko.com/en/coins/${c?.id}`,
          snippet: `Score: ${c?.score} | Market Rank: ${c?.market_cap_rank ?? 'N/A'}`
        });
      }

      logger.info({ count: results.length }, '[research] coingecko results');
      return results;
    } catch (err) {
      logger.error({ err }, '[research] coingecko fetch failed');
      return [];
    }
  }
}

export const researchService = new ResearchService();