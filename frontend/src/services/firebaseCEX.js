import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';

export const addCEXPosition = async (position) => {
  try {
    const docRef = await addDoc(collection(db, 'cex_positions'), {
      ...position,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
    return { id: docRef.id, ...position };
  } catch (error) {
    console.error('Error adding CEX position:', error);
    throw error;
  }
};

export const updateCEXPosition = async (id, updates) => {
  try {
    const positionRef = doc(db, 'cex_positions', id);
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
    await deleteDoc(doc(db, 'cex_positions', id));
    return id;
  } catch (error) {
    console.error('Error deleting CEX position:', error);
    throw error;
  }
};

export const getCEXPositions = async () => {
  try {
    const q = query(collection(db, 'cex_positions'), orderBy('lastUpdated', 'desc'));
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

// Calculate withdrawal status based on staking type and dates
export const calculateWithdrawalStatus = (position) => {
  const now = new Date();
  const entryDate = new Date(position.entryDate);
  
  if (position.stakingType === 'Flexible') {
    return { status: 'Can Withdraw Now', color: 'emerald', priority: 1 };
  }
  
  if (position.stakingType === 'Locked' && position.unlockDate) {
    const unlockDate = new Date(position.unlockDate);
    if (now >= unlockDate) {
      return { status: 'Can Withdraw Now', color: 'emerald', priority: 1 };
    }
    return { status: 'Locked', color: 'red', priority: 3 };
  }
  
  if (position.stakingType === 'Withdraw-in-n-days' && position.lockPeriodDays) {
    const unlockDate = new Date(entryDate);
    unlockDate.setDate(unlockDate.getDate() + parseInt(position.lockPeriodDays));
    
    if (now >= unlockDate) {
      return { status: 'Can Withdraw Now', color: 'emerald', priority: 1 };
    }
    return { status: 'Pending', color: 'yellow', priority: 2 };
  }
  
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