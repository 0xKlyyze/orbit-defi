import firebase_admin
from firebase_admin import credentials, firestore
import logging
from pathlib import Path

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
                # Use netExposure if available, else calc collateral - debt
                # Based on structure: netExposure, or collateralValue - debtValue
                
                # Check for netExposure first
                net_val = 0.0
                if 'netExposure' in data:
                    net_val = float(data['netExposure'])
                elif 'collateralValue' in data and 'debtValue' in data:
                    net_val = float(data['collateralValue']) - float(data['debtValue'])
                
                # Aggregate APY (yieldApyAggregate)
                apy = float(data.get('yieldApyAggregate', 0.0))
                
                loop_stats['count'] += 1
                loop_stats['total_usd'] += net_val
                loop_stats['weighted_apy_sum'] += (net_val * apy)

            # 2. Fetch CEX Positions
            cex_ref = self.db.collection('cex_positions')
            cex_docs = cex_ref.stream()
            
            cex_stats = {
                'total_usd': 0.0,
                'weighted_apy_sum': 0.0
            }

            for doc in cex_docs:
                data = doc.to_dict()
                usd_val = float(data.get('usdValue', 0.0))
                
                # Parse APY (might be string "2.17%" or number)
                raw_apy = data.get('apy', 0)
                apy = 0.0
                if isinstance(raw_apy, (int, float)):
                    apy = float(raw_apy)
                elif isinstance(raw_apy, str):
                    apy = float(raw_apy.replace('%', '').strip())
                
                cex_stats['total_usd'] += usd_val
                cex_stats['weighted_apy_sum'] += (usd_val * apy)

            # 3. Fetch Standard Positions
            pos_ref = self.db.collection('positions')
            pos_docs = pos_ref.stream()
            
            pos_stats = {
                'total_usd': 0.0,
                'weighted_apy_sum': 0.0,
                'count': 0 # Active protocols count approximation
            }
            
            active_protocols = set()

            for doc in pos_docs:
                data = doc.to_dict()
                usd_val = float(data.get('usdValue', 0.0))
                apy = float(data.get('yieldAPY', 0.0))
                
                if 'platform' in data:
                    active_protocols.add(data['platform'])
                
                pos_stats['total_usd'] += usd_val
                pos_stats['weighted_apy_sum'] += (usd_val * apy)
            
            # --- Aggregation ---
            total_net_worth = loop_stats['total_usd'] + cex_stats['total_usd'] + pos_stats['total_usd']
            total_weighted_apy = loop_stats['weighted_apy_sum'] + cex_stats['weighted_apy_sum'] + pos_stats['weighted_apy_sum']
            
            avg_apy = 0.0
            if total_net_worth > 0:
                avg_apy = total_weighted_apy / total_net_worth

            monthly_income = (total_net_worth * (avg_apy / 100)) / 12
            
            # Count active protocols (Loops are also protocols, usually multi)
            # Simplification: Active Loops + Unique Standard Protocols
            total_active_protocols = loop_stats['count'] + len(active_protocols)

            return {
                "total_net_worth": round(total_net_worth, 2),
                "change_24h": 0.0, # Not tracking history yet
                "risk_score": 75, # Placeholder until AI analysis
                "active_protocols": total_active_protocols,
                "yield_apy": round(avg_apy, 2),
                "monthly_income": round(monthly_income, 2),
                "breakdown": {
                    "loops": loop_stats['total_usd'],
                    "cex": cex_stats['total_usd'],
                    "defi": pos_stats['total_usd']
                }
            }

        except Exception as e:
            logger.error(f"Error aggregating stats: {e}")
            return self._get_empty_stats()

    def _get_empty_stats(self):
        return {
            "total_net_worth": 0.0,
            "change_24h": 0.0,
            "risk_score": 0,
            "active_protocols": 0,
            "yield_apy": 0.0,
            "monthly_income": 0.0
        }

# Singleton
firebase_service = FirebaseService()
