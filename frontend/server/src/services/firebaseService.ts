import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Firestore, Timestamp } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";
import pino from "pino";
import { PortfolioStats } from "../models";
import { ChatLog } from "../models";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

export class FirebaseService {
  private db: Firestore | null = null;

  constructor() {
    try {
      const credPath = process.env.FIREBASE_CREDENTIALS_PATH || path.join(__dirname, "../../firebase_credentials.json");
      if (!fs.existsSync(credPath)) {
        logger.error({ credPath }, "Firebase credentials not found");
        this.db = null;
        return;
      }
      const serviceAccount = JSON.parse(fs.readFileSync(credPath, "utf-8"));
      if (getApps().length === 0) {
        initializeApp({ credential: cert(serviceAccount) });
      }
      this.db = getFirestore();
      logger.info("Firebase Admin initialized successfully");
    } catch (e) {
      logger.error({ err: e }, "Failed to initialize Firebase Admin");
      this.db = null;
    }
  }

  async getFullPortfolioContext(): Promise<Record<string, unknown>> {
    if (!this.db) return {};
    try {
      const loopsSnap = await this.db.collection("loops").get();
      const cexSnap = await this.db.collection("cex_positions").get();
      const defiSnap = await this.db.collection("positions").get();

      const loops = loopsSnap.docs.map(d => d.data());
      const cex = cexSnap.docs.map(d => d.data());
      const defi = defiSnap.docs.map(d => d.data());

      const context = {
        loops,
        cex_positions: cex,
        defi_positions: defi,
        timestamp: new Date().toISOString()
      };
      logger.info({ loops: loops.length, cex: cex.length, defi: defi.length }, "Fetched full portfolio context");
      return context;
    } catch (e) {
      logger.error({ err: e }, "Error fetching full context");
      return {};
    }
  }

  async getLatestAiAnalysis(): Promise<Record<string, any> | null> {
    if (!this.db) return null;
    try {
      // Primary: use Firestore Timestamp field
      try {
        const snap = await this.db
          .collection("ai_analyses")
          .orderBy("timestamp", "desc")
          .limit(1)
          .get();
        if (!snap.empty) {
          const doc = snap.docs[0];
          const data = doc.data();
          logger.info({ id: doc.id, hasInsights: Array.isArray((data as any).insights) ? (data as any).insights.length : 0 }, "Latest AI analysis fetched (timestamp)");
          return data;
        }
      } catch (primaryErr) {
        logger.warn({ err: primaryErr }, "Primary timestamp orderBy failed; will try timestamp_iso");
      }

      // Fallback: order by ISO string for older documents
      const isoSnap = await this.db
        .collection("ai_analyses")
        .orderBy("timestamp_iso", "desc")
        .limit(1)
        .get();
      if (isoSnap.empty) return null;
      const doc = isoSnap.docs[0];
      const data = doc.data();
      logger.info({ id: doc.id, hasInsights: Array.isArray((data as any).insights) ? (data as any).insights.length : 0 }, "Latest AI analysis fetched (timestamp_iso)");
      return data;
    } catch (e) {
      logger.error({ err: e }, "Error fetching latest analysis (both timestamp fields)");
      return null;
    }
  }

  async saveAiAnalysis(analysis: Record<string, any>): Promise<void> {
    if (!this.db) return;
    try {
      // Store canonical Firestore timestamp for reliable ordering
      analysis.timestamp = Timestamp.now();
      // Also store ISO string for readability
      analysis.timestamp_iso = new Date().toISOString();
      const docRef = await this.db.collection("ai_analyses").add(analysis);
      logger.info({ id: docRef.id, insightsCount: Array.isArray(analysis.insights) ? analysis.insights.length : 0 }, "Saved new AI analysis");
    } catch (e) {
      logger.error({ err: e }, "Error saving AI analysis");
    }
  }

  /**
   * One-time migration: normalize ai_analyses.timestamp to Firestore Timestamp
   * and ensure ai_analyses.timestamp_iso exists for readability.
   * Uses bulk read, loop, bulk write pattern and batches to respect Firestore limits.
   */
  async migrateAiAnalysesTimestamps(): Promise<{ total: number; updated: number; unchanged: number; invalid: number; isoAdded: number }>{
    if (!this.db) {
      logger.warn("Database not initialized, cannot run migration");
      return { total: 0, updated: 0, unchanged: 0, invalid: 0, isoAdded: 0 };
    }

    const snap = await this.db.collection("ai_analyses").get();
    const total = snap.size;
    let updated = 0;
    let unchanged = 0;
    let invalid = 0;
    let isoAdded = 0;

    const docs = snap.docs;
    const BATCH_LIMIT = 400; // keep under 500 limit with headroom
    let batch = this.db.batch();
    let ops = 0;

    for (const doc of docs) {
      const data = doc.data() as any;
      const ts: any = data.timestamp;
      const tsIso: any = data.timestamp_iso;

      let needsUpdate = false;
      let date: Date | null = null;

      if (ts && typeof ts === 'object' && typeof ts.toDate === 'function') {
        // Already Firestore Timestamp
        date = ts.toDate();
        // Ensure timestamp_iso exists
        if (!tsIso || typeof tsIso !== 'string') {
          needsUpdate = true;
          isoAdded += 1;
        }
      } else if (typeof ts === 'string') {
        const parsed = new Date(ts);
        if (Number.isFinite(parsed.getTime())) {
          date = parsed;
          needsUpdate = true;
        } else {
          invalid += 1;
        }
      } else if (typeof tsIso === 'string') {
        const parsed = new Date(tsIso);
        if (Number.isFinite(parsed.getTime())) {
          date = parsed;
          needsUpdate = true;
        } else {
          invalid += 1;
        }
      } else {
        // No timestamp fields; set to current time
        date = new Date();
        needsUpdate = true;
      }

      if (needsUpdate && date) {
        batch.update(doc.ref, {
          timestamp: Timestamp.fromDate(date),
          timestamp_iso: date.toISOString(),
        });
        updated += 1;
        ops += 1;
      } else {
        unchanged += 1;
      }

      if (ops >= BATCH_LIMIT) {
        await batch.commit();
        logger.info({ ops }, 'Committed batch of ai_analyses timestamp migration');
        batch = this.db.batch();
        ops = 0;
      }
    }

    if (ops > 0) {
      await batch.commit();
      logger.info({ ops }, 'Committed final batch of ai_analyses timestamp migration');
    }

    logger.info({ total, updated, unchanged, invalid, isoAdded }, 'Migration completed for ai_analyses timestamps');
    return { total, updated, unchanged, invalid, isoAdded };
  }

  async saveSnapshot(stats: Record<string, any>): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.collection("portfolio_snapshots").add(stats);
      logger.info("Saved portfolio snapshot");
    } catch (e) {
      logger.error({ err: e }, "Failed to save snapshot");
    }
  }

  async saveChatLog(exchange: ChatLog): Promise<void> {
    if (!this.db) return;
    try {
      const payload: any = {
        ...exchange,
        timestamp: Timestamp.now(),
      };
      const ref = await this.db.collection('ai_chats').add(payload);
      logger.info({ id: ref.id }, 'Saved chat exchange');
    } catch (e) {
      logger.error({ err: e }, 'Failed to save chat exchange');
    }
  }

  private getEmptyStats(): PortfolioStats {
    return {
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
      },
      timestamp: new Date().toISOString()
    };
  }

  async getAggregatedStats(): Promise<PortfolioStats> {
    if (!this.db) {
      logger.warn("Database not initialized, returning empty stats");
      return this.getEmptyStats();
    }
    try {
      const loopsSnap = await this.db.collection("loops").get();
      const loopStats = { count: 0, total_usd: 0, weighted_apy_sum: 0 };
      for (const doc of loopsSnap.docs) {
        const data = doc.data() as any;
        let netVal = 0;
        if (typeof data.netExposure !== "undefined") {
          const n = Number(data.netExposure);
          netVal = Number.isFinite(n) ? n : 0;
        } else if (typeof data.collateralValue !== "undefined" && typeof data.debtValue !== "undefined") {
          const c = Number(data.collateralValue);
          const d = Number(data.debtValue);
          netVal = Number.isFinite(c) && Number.isFinite(d) ? c - d : 0;
        }
        const apy = Number(data.yieldApyAggregate ?? 0);
        loopStats.count += 1;
        if (netVal > 0) {
          loopStats.total_usd += netVal;
          loopStats.weighted_apy_sum += netVal * (Number.isFinite(apy) ? apy : 0);
        }
      }

      const cexSnap = await this.db.collection("cex_positions").get();
      const cexStats = { count: 0, total_usd: 0, weighted_apy_sum: 0 };
      for (const doc of cexSnap.docs) {
        const data = doc.data() as any;
        const usdVal = Number(data.usdValue ?? 0);
        let apy = 0;
        const rawApy = data.apy ?? 0;
        if (typeof rawApy === "number") apy = rawApy;
        else if (typeof rawApy === "string") {
          const clean = rawApy.replace("%", "").trim();
          apy = clean ? Number(clean) : 0;
        }
        cexStats.count += 1;
        if (usdVal > 0) {
          cexStats.total_usd += usdVal;
          cexStats.weighted_apy_sum += usdVal * (Number.isFinite(apy) ? apy : 0);
        }
      }

      const posSnap = await this.db.collection("positions").get();
      const posStats = { total_usd: 0, weighted_apy_sum: 0, count: 0, active_count: 0 };
      const activeProtocols = new Set<string>();
      for (const doc of posSnap.docs) {
        const data = doc.data() as any;
        const usdVal = Number(data.usdValue ?? 0);
        const apy = Number(data.yieldAPY ?? 0);
        if (data.platform) activeProtocols.add(String(data.platform));
        posStats.active_count += 1;
        if (usdVal > 0) {
          posStats.total_usd += usdVal;
          posStats.weighted_apy_sum += usdVal * (Number.isFinite(apy) ? apy : 0);
        }
      }

      const total_net_worth = loopStats.total_usd + cexStats.total_usd + posStats.total_usd;
      const total_weighted_apy = loopStats.weighted_apy_sum + cexStats.weighted_apy_sum + posStats.weighted_apy_sum;
      const avg_apy = total_net_worth > 0 ? total_weighted_apy / total_net_worth : 0;
      const monthly_income = (total_net_worth * (avg_apy / 100)) / 12;

      const loop_apy = loopStats.total_usd > 0 ? loopStats.weighted_apy_sum / loopStats.total_usd : 0;
      const cex_apy = cexStats.total_usd > 0 ? cexStats.weighted_apy_sum / cexStats.total_usd : 0;
      const defi_apy = posStats.total_usd > 0 ? posStats.weighted_apy_sum / posStats.total_usd : 0;

      const stats: PortfolioStats = {
        total_net_worth: Number(total_net_worth.toFixed(2)),
        change_24h: 0,
        risk_score: 75,
        active_protocols: loopStats.count + activeProtocols.size,
        yield_apy: Number(avg_apy.toFixed(2)),
        monthly_income: Number(monthly_income.toFixed(2)),
        breakdown: {
          loops: { value: Number(loopStats.total_usd.toFixed(2)), apy: Number(loop_apy.toFixed(2)), count: loopStats.count },
          cex: { value: Number(cexStats.total_usd.toFixed(2)), apy: Number(cex_apy.toFixed(2)), count: cexStats.count },
          defi: { value: Number(posStats.total_usd.toFixed(2)), apy: Number(defi_apy.toFixed(2)), count: posStats.active_count }
        },
        timestamp: new Date().toISOString()
      };

      await this.saveSnapshot(stats);
      return stats;
    } catch (e) {
      logger.error({ err: e }, "Error aggregating stats");
      return this.getEmptyStats();
    }
  }
}

export const firebaseService = new FirebaseService();