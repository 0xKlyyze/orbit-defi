import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';

export const addLoop = async (loop) => {
  try {
    const docRef = await addDoc(collection(db, 'loops'), {
      ...loop,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
    return { id: docRef.id, ...loop };
  } catch (error) {
    console.error('Error adding loop:', error);
    throw error;
  }
};

export const updateLoop = async (id, updates) => {
  try {
    const loopRef = doc(db, 'loops', id);
    await updateDoc(loopRef, {
      ...updates,
      lastUpdated: new Date().toISOString()
    });
    return { id, ...updates };
  } catch (error) {
    console.error('Error updating loop:', error);
    throw error;
  }
};

export const deleteLoop = async (id) => {
  try {
    await deleteDoc(doc(db, 'loops', id));
    return id;
  } catch (error) {
    console.error('Error deleting loop:', error);
    throw error;
  }
};

export const getLoops = async () => {
  try {
    const q = query(collection(db, 'loops'), orderBy('lastUpdated', 'desc'));
    const querySnapshot = await getDocs(q);
    const loops = [];
    querySnapshot.forEach((doc) => {
      loops.push({ id: doc.id, ...doc.data() });
    });
    return loops;
  } catch (error) {
    console.error('Error getting loops:', error);
    throw error;
  }
};

export const calculateHealthFactor = (collateralValue, debtValue, liquidationThreshold = 0.75) => {
  if (debtValue === 0) return 999;
  return (collateralValue * liquidationThreshold) / debtValue;
};

export const calculateLeverageRatio = (collateralValue, debtValue) => {
  if (collateralValue === 0) return 1;
  return (parseFloat(collateralValue) + parseFloat(debtValue)) / parseFloat(collateralValue);
};

export const getRiskLevel = (healthFactor) => {
  if (healthFactor >= 2.0) return { level: 'Safe', color: 'emerald', status: 'Active' };
  if (healthFactor >= 1.5) return { level: 'Warning', color: 'yellow', status: 'In-risk' };
  return { level: 'Critical', color: 'red', status: 'In-risk' };
};