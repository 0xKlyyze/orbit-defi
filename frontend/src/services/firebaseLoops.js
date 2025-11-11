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

// Calculation functions moved to /utils/loopCalculations.js