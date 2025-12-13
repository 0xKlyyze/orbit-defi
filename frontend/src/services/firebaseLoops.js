import { db, auth } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';

export const addLoop = async (loop) => {
  try {
    const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not authenticated');
    const docRef = await addDoc(collection(db, 'users', uid, 'loops'), {
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
    const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not authenticated');
    const loopRef = doc(db, 'users', uid, 'loops', id);
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
    const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not authenticated');
    await deleteDoc(doc(db, 'users', uid, 'loops', id));
    return id;
  } catch (error) {
    console.error('Error deleting loop:', error);
    throw error;
  }
};

export const getLoops = async () => {
  try {
    const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not authenticated');
    const q = query(collection(db, 'users', uid, 'loops'), orderBy('lastUpdated', 'desc'));
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