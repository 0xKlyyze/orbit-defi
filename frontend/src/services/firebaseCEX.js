import { db, auth } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';

export const addCEXPosition = async (position) => {
  try {
    const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not authenticated');
    const createdAt = new Date().toISOString();
    const lastUpdated = createdAt;
    const docRef = await addDoc(collection(db, 'users', uid, 'cex_positions'), {
      ...position,
      createdAt,
      lastUpdated
    });
    return { id: docRef.id, ...position, createdAt, lastUpdated };
  } catch (error) {
    console.error('Error adding CEX position:', error);
    throw error;
  }
};

export const updateCEXPosition = async (id, updates) => {
  try {
    const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not authenticated');
    const positionRef = doc(db, 'users', uid, 'cex_positions', id);
    await updateDoc(positionRef, {
      ...updates,
      lastUpdated: new Date().toISOString()
    });
    return { id, ...updates };
  } catch (error) {
    console.error('Error updating CEX position:', error);
    throw error;
  }
};

export const deleteCEXPosition = async (id) => {
  try {
    const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not authenticated');
    await deleteDoc(doc(db, 'users', uid, 'cex_positions', id));
    return id;
  } catch (error) {
    console.error('Error deleting CEX position:', error);
    throw error;
  }
};

export const getCEXPositions = async () => {
  try {
    const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not authenticated');
    const q = query(collection(db, 'users', uid, 'cex_positions'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const positions = [];
    querySnapshot.forEach((doc) => {
      positions.push({ id: doc.id, ...doc.data() });
    });
    return positions;
  } catch (error) {
    console.error('Error getting CEX positions:', error);
    throw error;
  }
};

// Calculate withdrawal status based on position.status and unlockDate
export const calculateWithdrawalStatus = (position) => {
  const now = new Date();
  const { status, unlockDate: unlockDateStr } = position || {};

  // Withdrawn / Closed positions are considered historical
  if (status === 'Withdrawn' || status === 'Closed') {
    return { status: 'Withdrawn', color: 'gray', priority: 5 };
  }

  // Flexible / Active positions can withdraw anytime
  if (status === 'Active') {
    return { status: 'Can Withdraw Now', color: 'emerald', priority: 1 };
  }

  // Locked positions depend on unlockDate
  if (status === 'Locked') {
    if (unlockDateStr) {
      const unlockDate = new Date(unlockDateStr);
      if (now >= unlockDate) {
        return { status: 'Can Withdraw Now', color: 'emerald', priority: 1 };
      }
      const msRemaining = unlockDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
      return { status: 'Locked', color: 'red', priority: 3, daysRemaining };
    }
    return { status: 'Locked', color: 'red', priority: 3 };
  }

  // Fallback if unknown schema
  return { status: 'Unknown', color: 'gray', priority: 4 };
};

// Calculate unlock date
export const calculateUnlockDate = (entryDate, stakingType, lockPeriodDays) => {
  if (stakingType === 'Flexible') return null;
  
  const entry = new Date(entryDate);
  const unlock = new Date(entry);
  unlock.setDate(unlock.getDate() + parseInt(lockPeriodDays || 0));
  
  return unlock.toISOString().split('T')[0];
};