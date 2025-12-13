import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Firestore, Timestamp } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";
import pino from "pino";
import { PortfolioStats } from "../models";
import { ChatLog } from "../models";
import { createHash } from "crypto";

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

  /**
   * Migration: copy legacy top-level collections into a specific user's subcollections.
   * Collections migrated: ai_analyses, ai_chats, portfolio_snapshots, positions,
   * cex_positions, loops, and snapshot meta (portfolio_snapshot_meta or portfolio_snapshots_meta).
   * Uses bulk read, loop, bulk write with batching for efficiency and Firestore limits.
   */
  async migrateLegacyToUser(targetUid: string): Promise<{
    uid: string;
    copied: Record<string, number>;
    skipped: Record<string, number>;
    metaCopied: number;
  }> {
    if (!this.db) {
      logger.warn("Database not initialized, cannot run legacy migration");
      return { uid: targetUid, copied: {}, skipped: {}, metaCopied: 0 };
    }

    const copied: Record<string, number> = {};
    const skipped: Record<string, number> = {};
    const collections = [
      "ai_analyses",
      "ai_chats",
      "portfolio_snapshots",
      "positions",
      "cex_positions",
      "loops",
    ];

    const BATCH_LIMIT = 400; // Safe headroom under Firestore 500-op limit
    const userBase = this.db.collection('users').doc(targetUid);

    for (const col of collections) {
      try {
        const snap = await this.db.collection(col).get();
        copied[col] = 0;
        skipped[col] = 0;
        if (snap.empty) {
          logger.info({ col }, '[migration] collection empty; nothing to copy');
          continue;
        }

        let batch = this.db.batch();
        let ops = 0;
        for (const doc of snap.docs) {
          const data = doc.data();
          // If a doc with same ID already exists under user, skip to avoid overwrite
          const destRef = userBase.collection(col).doc(doc.id);
          const destSnap = await destRef.get();
          if (destSnap.exists) {
            skipped[col] += 1;
            continue;
          }
          batch.set(destRef, data, { merge: true });
          copied[col] += 1;
          ops += 1;
          if (ops >= BATCH_LIMIT) {
            await batch.commit();
            logger.info({ col, ops }, '[migration] committed batch');
            batch = this.db.batch();
            ops = 0;
          }
        }
        if (ops > 0) {
          await batch.commit();
          logger.info({ col, ops }, '[migration] committed final batch');
        }
        logger.info({ col, copied: copied[col], skipped: skipped[col] }, '[migration] collection migrated');
      } catch (e) {
        logger.error({ err: e, col }, '[migration] error migrating collection');
      }
    }

    // Migrate snapshot meta: support both possible legacy names
    let metaCopied = 0;
    const legacyMetaCandidates = [
      { collection: 'portfolio_snapshot_meta', docId: 'latest_signature' },
      { collection: 'portfolio_snapshots_meta', docId: 'latest_signature' },
    ];
    for (const cand of legacyMetaCandidates) {
      try {
        const ref = this.db.collection(cand.collection).doc(cand.docId);
        const snap = await ref.get();
        if (snap.exists) {
          const userMetaRef = userBase.collection('meta').doc('latest_signature');
          await userMetaRef.set(snap.data() || {}, { merge: true });
          metaCopied += 1;
          logger.info({ from: cand.collection, docId: cand.docId }, '[migration] copied snapshot meta');
          break; // Stop after first successful copy
        }
      } catch (e) {
        logger.warn({ err: e, from: cand.collection }, '[migration] failed reading legacy meta candidate');
      }
    }

    const result = { uid: targetUid, copied, skipped, metaCopied };
    logger.info(result, '[migration] legacy to user migration completed');
    return result;
  }

  async getFullPortfolioContext(uid: string): Promise<Record<string, unknown>> {
    if (!this.db) return {};
    if (!uid) {
      logger.warn("Missing uid in getFullPortfolioContext");
      return {};
    }
    try {
      const base = this.db.collection('users').doc(uid);
      const loopsSnap = await base.collection("loops").get();
      const cexSnap = await base.collection("cex_positions").get();
      const defiSnap = await base.collection("positions").get();

      const loops = loopsSnap.docs.map(d => d.data());
      const cex = cexSnap.docs.map(d => d.data());
      const defi = defiSnap.docs.map(d => d.data());

      const context = {
        loops,
        cex_positions: cex,
        defi_positions: defi,
        timestamp: new Date().toISOString()
      };
      logger.info({ uid, loops: loops.length, cex: cex.length, defi: defi.length }, "Fetched full portfolio context");
      return context;
    } catch (e) {
      logger.error({ err: e }, "Error fetching full context");
      return {};
    }
  }

  async getLatestAiAnalysis(uid: string): Promise<Record<string, any> | null> {
    if (!this.db) return null;
    if (!uid) {
      logger.warn("Missing uid in getLatestAiAnalysis");
      return null;
    }
    try {
      const base = this.db.collection('users').doc(uid).collection('ai_analyses');
      // Primary: use Firestore Timestamp field
      try {
        const snap = await base
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
      const isoSnap = await base
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

  async saveAiAnalysis(uid: string, analysis: Record<string, any>): Promise<void> {
    if (!this.db) return;
    try {
      // Store canonical Firestore timestamp for reliable ordering
      analysis.timestamp = Timestamp.now();
      // Also store ISO string for readability
      analysis.timestamp_iso = new Date().toISOString();
      const docRef = await this.db.collection('users').doc(uid).collection("ai_analyses").add(analysis);
      logger.info({ uid, id: docRef.id, insightsCount: Array.isArray(analysis.insights) ? analysis.insights.length : 0 }, "Saved new AI analysis");
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

  async saveSnapshot(stats: Record<string, any>, uid: string): Promise<void> {
    if (!this.db) return;
    if (!uid) {
      logger.warn("Missing uid in saveSnapshot");
      return;
    }
    try {
      const currentSig = stats?.state_signature ?? null;
      if (!currentSig) {
        logger.warn("Snapshot has no state_signature; writing without dedup");
        await this.db.collection('users').doc(uid).collection("portfolio_snapshots").add(stats);
        return;
      }

      // Transaction to avoid race conditions under React StrictMode double-render
      const metaRef = this.db.collection('users').doc(uid).collection("meta").doc("latest_signature");
      await this.db.runTransaction(async (t) => {
        const metaSnap = await t.get(metaRef);
        const latestSig: string | null = metaSnap.exists ? (metaSnap.data() as any).state_signature ?? null : null;
        if (latestSig && latestSig === currentSig) {
          logger.info({ currentSig }, "No portfolio changes detected in tx; skipping snapshot");
          return;
        }
        const newDocRef = this.db!.collection('users').doc(uid).collection("portfolio_snapshots").doc();
        t.set(newDocRef, stats);
        t.set(metaRef, {
          state_signature: currentSig,
          last_snapshot_id: newDocRef.id,
          updated_at: Timestamp.now(),
          updated_at_iso: new Date().toISOString(),
        }, { merge: true });
        logger.info({ uid, id: newDocRef.id, currentSig }, "Saved portfolio snapshot via transaction");
      });
    } catch (e) {
      logger.error({ err: e }, "Failed to save snapshot");
    }
  }

  async saveChatLog(uid: string, exchange: ChatLog): Promise<void> {
    if (!this.db) return;
    try {
      const payload: any = {
        ...exchange,
        timestamp: Timestamp.now(),
      };
      const ref = await this.db.collection('users').doc(uid).collection('ai_chats').add(payload);
      logger.info({ uid, id: ref.id }, 'Saved chat exchange');
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

  async getAggregatedStats(uid: string): Promise<PortfolioStats> {
    if (!this.db) {
      logger.warn("Database not initialized, returning empty stats");
      return this.getEmptyStats();
    }
    if (!uid) {
      logger.warn("Missing uid in getAggregatedStats");
      return this.getEmptyStats();
    }
    try {
      const reqId = Math.random().toString(36).slice(2);
      logger.info({ reqId }, "[stats] aggregation start");
      const base = this.db.collection('users').doc(uid);
      const loopsSnap = await base.collection("loops").get();
      const loopStats = { count: 0, total_usd: 0, weighted_apy_sum: 0 };
      let latestLoopUpdate: Date | null = null;
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
        const lu = (data.lastUpdated ?? data.createdAt) as any;
        try {
          if (lu) {
            let dt: Date | null = null;
            if (typeof lu === "object" && typeof (lu as any).toDate === "function") {
              const d = (lu as any).toDate();
              dt = Number.isFinite(d.getTime()) ? d : null;
            } else if (typeof lu === "string") {
              const d = new Date(lu);
              dt = Number.isFinite(d.getTime()) ? d : null;
            }
            if (dt && (!latestLoopUpdate || dt > latestLoopUpdate)) latestLoopUpdate = dt;
          }
        } catch {}
      }

      const cexSnap = await base.collection("cex_positions").get();
      const cexStats = { count: 0, total_usd: 0, weighted_apy_sum: 0 };
      let latestCexUpdate: Date | null = null;
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
        const lu = (data.lastUpdated ?? data.createdAt) as any;
        try {
          if (lu) {
            let dt: Date | null = null;
            if (typeof lu === "object" && typeof (lu as any).toDate === "function") {
              const d = (lu as any).toDate();
              dt = Number.isFinite(d.getTime()) ? d : null;
            } else if (typeof lu === "string") {
              const d = new Date(lu);
              dt = Number.isFinite(d.getTime()) ? d : null;
            }
            if (dt && (!latestCexUpdate || dt > latestCexUpdate)) latestCexUpdate = dt;
          }
        } catch {}
      }

      const posSnap = await base.collection("positions").get();
      const posStats = { total_usd: 0, weighted_apy_sum: 0, count: 0, active_count: 0 };
      const activeProtocols = new Set<string>();
      let latestPosUpdate: Date | null = null;
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
        const lu = (data.lastUpdated ?? data.createdAt) as any;
        try {
          if (lu) {
            let dt: Date | null = null;
            if (typeof lu === "object" && typeof (lu as any).toDate === "function") {
              const d = (lu as any).toDate();
              dt = Number.isFinite(d.getTime()) ? d : null;
            } else if (typeof lu === "string") {
              const d = new Date(lu);
              dt = Number.isFinite(d.getTime()) ? d : null;
            }
            if (dt && (!latestPosUpdate || dt > latestPosUpdate)) latestPosUpdate = dt;
          }
        } catch {}
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

      // Compute actual 7-day change using previous snapshots
      try {
        const now = new Date();
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        const threshold = new Date(now.getTime() - sevenDaysMs);
        let pastTotal = 0;

        // Primary: scan latest snapshots by Firestore Timestamp
        try {
          const recentSnap = await base
            .collection("portfolio_snapshots")
            .orderBy("timestamp", "desc")
            .limit(200)
            .get();
          for (const d of recentSnap.docs) {
            const data: any = d.data();
            const ts: any = data.timestamp;
            let dt: Date | null = null;
            if (ts && typeof ts.toDate === "function") {
              const conv = ts.toDate();
              dt = Number.isFinite(conv.getTime()) ? conv : null;
            }
            if (dt && dt.getTime() <= threshold.getTime()) {
              const val = Number(data.total_net_worth ?? 0);
              if (Number.isFinite(val) && val > 0) {
                pastTotal = val;
                break;
              }
            }
          }
        } catch (primaryErr) {
          logger.warn({ err: primaryErr }, "[stats] 7d change primary query (timestamp) failed; trying timestamp_iso fallback");
        }

        // Fallback: scan by ISO timestamps
        if (!pastTotal) {
          try {
            const isoSnap = await base
              .collection("portfolio_snapshots")
              .orderBy("timestamp_iso", "desc")
              .limit(200)
              .get();
            for (const d of isoSnap.docs) {
              const data: any = d.data();
              const tsIso: any = data.timestamp_iso;
              const dt = typeof tsIso === "string" ? new Date(tsIso) : null;
              if (dt && Number.isFinite(dt.getTime()) && dt.getTime() <= threshold.getTime()) {
                const val = Number(data.total_net_worth ?? 0);
                if (Number.isFinite(val) && val > 0) {
                  pastTotal = val;
                  break;
                }
              }
            }
          } catch (fallbackErr) {
            logger.warn({ err: fallbackErr }, "[stats] 7d change fallback query (timestamp_iso) failed");
          }
        }

        if (pastTotal > 0) {
          const changePct = ((stats.total_net_worth - pastTotal) / pastTotal) * 100;
          stats.change_24h = Number(changePct.toFixed(2));
          logger.info({ reqId, pastTotal, current: stats.total_net_worth, changePct: stats.change_24h }, "[stats] computed 7d change");
        } else {
          stats.change_24h = 0;
          logger.info({ reqId }, "[stats] 7d baseline snapshot not found; change set to 0");
        }
      } catch (deltaErr) {
        logger.error({ err: deltaErr }, "[stats] error computing 7d change; leaving change at 0");
      }

      const stateMeta = {
        loops: { count: loopStats.count, last_updated: latestLoopUpdate ? latestLoopUpdate.toISOString() : null },
        cex: { count: cexStats.count, last_updated: latestCexUpdate ? latestCexUpdate.toISOString() : null },
        defi: { count: posStats.active_count, last_updated: latestPosUpdate ? latestPosUpdate.toISOString() : null }
      };
      let stateSignature: string | null = null;
      try {
        const src = JSON.stringify(stateMeta);
        stateSignature = createHash("sha256").update(src).digest("hex");
      } catch {
        stateSignature = null;
      }

      const snapshotPayload: Record<string, any> = {
        ...stats,
        state_meta: stateMeta,
        state_signature: stateSignature,
        timestamp: Timestamp.now(),
        timestamp_iso: new Date().toISOString()
      };

      logger.info({ reqId, stateSignature, loopCount: loopStats.count, cexCount: cexStats.count, defiCount: posStats.active_count, latestLoopUpdate: stateMeta.loops.last_updated, latestCexUpdate: stateMeta.cex.last_updated, latestDefiUpdate: stateMeta.defi.last_updated }, "[stats] computed; attempting snapshot save");
      await this.saveSnapshot(snapshotPayload, uid);
      logger.info({ reqId }, "[stats] aggregation complete");
      return stats;
    } catch (e) {
      logger.error({ err: e }, "[stats] Error aggregating stats");
      return this.getEmptyStats();
    }
  }
}

export const firebaseService = new FirebaseService();