import firebase_admin
from firebase_admin import credentials, firestore
import logging
from pathlib import Path
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class FirebaseService:
    def __init__(self):
        try:
            cred_path = Path(__file__).parent.parent / 'firebase_credentials.json'
            if not cred_path.exists():
                logger.error(f"Firebase credentials not found at {cred_path}")
                self.db = None
                return

            cred = credentials.Certificate(str(cred_path))
            # Check if already initialized to avoid error on reload
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)
            
            self.db = firestore.client()
            logger.info("Firebase Admin initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin: {e}")
            self.db = None

    def get_full_portfolio_context(self):
        if not self.db:
            return {}
        
        try:
            # Fetch all raw data for AI context
            loops = [doc.to_dict() for doc in self.db.collection('loops').stream()]
            cex = [doc.to_dict() for doc in self.db.collection('cex_positions').stream()]
            defi = [doc.to_dict() for doc in self.db.collection('positions').stream()]
            
            return {
                "loops": loops,
                "cex_positions": cex,
                "defi_positions": defi,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error fetching full context: {e}")
            return {}

    def get_latest_ai_analysis(self):
        if not self.db:
            return None
            
        try:
            # Get the most recent analysis document
            docs = self.db.collection('ai_analyses') \
                .order_by('timestamp', direction=firestore.Query.DESCENDING) \
                .limit(1) \
                .stream()
            
            for doc in docs:
                return doc.to_dict()
            return None
        except Exception as e:
            logger.error(f"Error fetching latest analysis: {e}")
            return None

    def save_ai_analysis(self, analysis_data):
        if not self.db:
            return
        
        try:
            analysis_data['timestamp'] = datetime.now().isoformat()
            self.db.collection('ai_analyses').add(analysis_data)
            logger.info("Saved new AI analysis")
        except Exception as e:
            logger.error(f"Error saving AI analysis: {e}")

    def save_chat(self, chat_data):
        if not self.db:
            logger.error("Cannot save chat: Firestore client not initialized")
            return
        try:
            chat_data['timestamp'] = datetime.now().isoformat()
            self.db.collection('ai_chats').add(chat_data)
            logger.info("Saved AI chat message")
        except Exception as e:
            logger.error(f"Error saving chat message: {e}")

    def get_aggregated_stats(self):
        if not self.db:
            logger.warning("Database not initialized, returning empty stats")
            return self._get_empty_stats()

        try:
            # 1. Fetch Loops
            loops_ref = self.db.collection('loops')
            loops_docs = loops_ref.stream()
            
            loop_stats = {
                'count': 0,
                'total_usd': 0.0,
                'weighted_apy_sum': 0.0
            }

            for doc in loops_docs:
                data = doc.to_dict()
                
                # Check for netExposure first
                net_val = 0.0
                if 'netExposure' in data:
                    try:
                        net_val = float(data['netExposure'])
                    except:
                        net_val = 0.0
                elif 'collateralValue' in data and 'debtValue' in data:
                    try:
                        net_val = float(data['collateralValue']) - float(data['debtValue'])
                    except:
                        net_val = 0.0
                
                # Aggregate APY (yieldApyAggregate)
                try:
                    apy = float(data.get('yieldApyAggregate', 0.0))
                except:
                    apy = 0.0
                
                # Count every loop document, even if value is 0 or negative (though usually positive)
                loop_stats['count'] += 1
                
                if net_val > 0:
                    loop_stats['total_usd'] += net_val
                    loop_stats['weighted_apy_sum'] += (net_val * apy)

            # 2. Fetch CEX Positions
            cex_ref = self.db.collection('cex_positions')
            cex_docs = cex_ref.stream()
            
            cex_stats = {
                'count': 0,
                'total_usd': 0.0,
                'weighted_apy_sum': 0.0
            }

            for doc in cex_docs:
                data = doc.to_dict()
                try:
                    usd_val = float(data.get('usdValue', 0.0))
                except:
                    usd_val = 0.0
                
                # Parse APY (might be string "2.17%" or number)
                raw_apy = data.get('apy', 0)
                apy = 0.0
                try:
                    if isinstance(raw_apy, (int, float)):
                        apy = float(raw_apy)
                    elif isinstance(raw_apy, str):
                        clean_apy = raw_apy.replace('%', '').strip()
                        if clean_apy:
                             apy = float(clean_apy)
                except:
                    apy = 0.0
                
                cex_stats['count'] += 1
                
                if usd_val > 0:
                    cex_stats['total_usd'] += usd_val
                    cex_stats['weighted_apy_sum'] += (usd_val * apy)

            # 3. Fetch Standard Positions
            pos_ref = self.db.collection('positions')
            pos_docs = pos_ref.stream()
            
            pos_stats = {
                'total_usd': 0.0,
                'weighted_apy_sum': 0.0,
                'count': 0,
                'active_count': 0
            }
            
            active_protocols = set()

            for doc in pos_docs:
                data = doc.to_dict()
                try:
                    usd_val = float(data.get('usdValue', 0.0))
                except:
                    usd_val = 0.0
                    
                try:
                    apy = float(data.get('yieldAPY', 0.0))
                except:
                    apy = 0.0
                
                if 'platform' in data:
                    active_protocols.add(data['platform'])
                
                pos_stats['active_count'] += 1
                
                if usd_val > 0:
                    pos_stats['total_usd'] += usd_val
                    pos_stats['weighted_apy_sum'] += (usd_val * apy)
            
            # --- Aggregation ---
            total_net_worth = loop_stats['total_usd'] + cex_stats['total_usd'] + pos_stats['total_usd']
            total_weighted_apy = loop_stats['weighted_apy_sum'] + cex_stats['weighted_apy_sum'] + pos_stats['weighted_apy_sum']
            
            avg_apy = 0.0
            if total_net_worth > 0:
                avg_apy = total_weighted_apy / total_net_worth

            monthly_income = (total_net_worth * (avg_apy / 100)) / 12
            
            # Segment APYs
            loop_apy = loop_stats['weighted_apy_sum'] / loop_stats['total_usd'] if loop_stats['total_usd'] > 0 else 0
            cex_apy = cex_stats['weighted_apy_sum'] / cex_stats['total_usd'] if cex_stats['total_usd'] > 0 else 0
            defi_apy = pos_stats['weighted_apy_sum'] / pos_stats['total_usd'] if pos_stats['total_usd'] > 0 else 0

            # Count active protocols
            total_active_protocols = loop_stats['count'] + len(active_protocols)

            stats_data = {
                "total_net_worth": round(total_net_worth, 2),
                "change_24h": 0.0, 
                "risk_score": 75,
                "active_protocols": total_active_protocols,
                "yield_apy": round(avg_apy, 2),
                "monthly_income": round(monthly_income, 2),
                "breakdown": {
                    "loops": {
                        "value": round(loop_stats['total_usd'], 2), 
                        "apy": round(loop_apy, 2),
                        "count": loop_stats['count']
                    },
                    "cex": {
                        "value": round(cex_stats['total_usd'], 2), 
                        "apy": round(cex_apy, 2),
                        "count": cex_stats['count']
                    },
                    "defi": {
                        "value": round(pos_stats['total_usd'], 2), 
                        "apy": round(defi_apy, 2),
                        "count": pos_stats['active_count']
                    }
                },
                "timestamp": datetime.now().isoformat()
            }
            
            # Save Snapshot
            self.save_snapshot(stats_data)
            
            return stats_data

        except Exception as e:
            logger.error(f"Error aggregating stats: {e}")
            return self._get_empty_stats()

    def save_snapshot(self, stats):
        try:
            # Create a new document in 'portfolio_snapshots'
            self.db.collection('portfolio_snapshots').add(stats)
            logger.info("Saved portfolio snapshot")
        except Exception as e:
            logger.error(f"Failed to save snapshot: {e}")

    def _get_empty_stats(self):
        return {
            "total_net_worth": 0.0,
            "change_24h": 0.0,
            "risk_score": 0,
            "active_protocols": 0,
            "yield_apy": 0.0,
            "monthly_income": 0.0,
            "breakdown": {
                "loops": {"value": 0, "apy": 0, "count": 0},
                "cex": {"value": 0, "apy": 0, "count": 0},
                "defi": {"value": 0, "apy": 0, "count": 0}
            }
        }

# Singleton
firebase_service = FirebaseService()
