import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBPo_8nhRdBvELXfC6zJn8D_h8_iWPz1Fk",
  authDomain: "orbit-defi.firebaseapp.com",
  projectId: "orbit-defi",
  storageBucket: "orbit-defi.firebasestorage.app",
  messagingSenderId: "614830362243",
  appId: "1:614830362243:web:b7267dd7a243f35d0e95b6",
  measurementId: "G-RJSG1CECVC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const addPosition = async (position) => {
  try {
    const createdAt = new Date().toISOString();
    const docRef = await addDoc(collection(db, 'positions'), {
      ...position,
      createdAt
    });
    return { id: docRef.id, ...position, createdAt };
  } catch (error) {
    console.error('Error adding position:', error);
    throw error;
  }
};

export const updatePosition = async (id, updates) => {
  try {
    const positionRef = doc(db, 'positions', id);
    await updateDoc(positionRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return { id, ...updates };
  } catch (error) {
    console.error('Error updating position:', error);
    throw error;
  }
};

export const deletePosition = async (id) => {
  try {
    await deleteDoc(doc(db, 'positions', id));
    return id;
  } catch (error) {
    console.error('Error deleting position:', error);
    throw error;
  }
};

export const getPositions = async () => {
  try {
    const q = query(collection(db, 'positions'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const positions = [];
    querySnapshot.forEach((doc) => {
      positions.push({ id: doc.id, ...doc.data() });
    });
    return positions;
  } catch (error) {
    console.error('Error getting positions:', error);
    throw error;
  }
};

export { db };