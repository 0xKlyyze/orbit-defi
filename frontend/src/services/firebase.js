import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Basic configuration validation to surface clear errors during development
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missing = requiredKeys.filter((k) => !firebaseConfig[k]);
if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(
    `[Firebase] Missing configuration keys: ${missing.join(', ')}. ` +
    `Ensure .env.local is populated with REACT_APP_FIREBASE_* values.`,
  );
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const requireUid = () => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');
  return uid;
};

// Persistence ensures sessions survive reloads; errors are logged without breaking app
setPersistence(auth, browserLocalPersistence).catch((err) => {
  // eslint-disable-next-line no-console
  console.warn('[Firebase] Failed to set auth persistence:', err?.message || err);
});

export const addPosition = async (position) => {
  try {
    const uid = requireUid();
    const createdAt = new Date().toISOString();
    const docRef = await addDoc(collection(db, 'users', uid, 'positions'), {
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
    const uid = requireUid();
    const positionRef = doc(db, 'users', uid, 'positions', id);
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
    const uid = requireUid();
    await deleteDoc(doc(db, 'users', uid, 'positions', id));
    return id;
  } catch (error) {
    console.error('Error deleting position:', error);
    throw error;
  }
};

export const getPositions = async () => {
  try {
    const uid = requireUid();
    const q = query(collection(db, 'users', uid, 'positions'), orderBy('createdAt', 'desc'));
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

export { db, auth };