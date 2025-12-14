import { db, auth } from './firebase';
import { collection, addDoc, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';

const CUSTOMER_COLLECTIONS = [
  process.env.REACT_APP_STRIPE_CUSTOMERS_COLLECTION || 'customers',
  'stripe_customers',
  'stripe-customers',
];

/**
 * Waits for the stripeId field to appear on the customer document.
 * Returns the collection name where the customer was found.
 */
const waitForStripeId = async (uid) => {
  // 1. Try to find an existing doc with stripeId across potential collections
  for (const coll of CUSTOMER_COLLECTIONS) {
    const ref = doc(db, coll, uid);
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data().stripeId) {
      return coll;
    }
  }

  // 2. If not found, create the doc in the primary collection and wait
  const primaryColl = CUSTOMER_COLLECTIONS[0];
  const customerRef = doc(db, primaryColl, uid);
  
  // Create doc if it doesn't exist (triggers the extension to create a Stripe Customer)
  const customerSnap = await getDoc(customerRef);
  if (!customerSnap.exists()) {
    await setDoc(customerRef, { uid, email: auth.currentUser?.email, createdAt: new Date().toISOString() }, { merge: true });
  } else if (customerSnap.data().stripeId) {
     return primaryColl;
  }

  // 3. Poll/Wait for the extension to write the stripeId
  return new Promise((resolve, reject) => {
    // Set a timeout to avoid infinite waiting (e.g., 10 seconds)
    const timeout = setTimeout(() => {
        unsubscribe();
        reject(new Error('Timeout: Stripe extension failed to generate stripeId for user.'));
    }, 10000);

    const unsubscribe = onSnapshot(customerRef, (snap) => {
      const data = snap.data();
      if (data && data.stripeId) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(primaryColl);
      }
    });
  });
};

export const startSubscriptionCheckout = async (priceId, options = {}) => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');

  const mode = options.mode || 'subscription';
  const successUrl = options.successUrl || `${window.location.origin}/profile?status=success`;
  const cancelUrl = options.cancelUrl || `${window.location.origin}/profile?status=cancel`;

  const payload = { price: priceId, mode, success_url: successUrl, cancel_url: cancelUrl };
  const listeners = [];

  // --- CHANGED: Wait for correct collection & stripeId BEFORE creating session ---
  let targetColl;
  try {
    targetColl = await waitForStripeId(uid);
  } catch (err) {
    console.error("Failed to locate/create Stripe customer:", err);
    throw err; 
  }

  return new Promise(async (resolve, reject) => {
    let resolved = false;
    const finish = (fn) => {
      if (resolved) return;
      resolved = true;
      listeners.forEach((u) => u());
      fn();
    };

    try {
      // We now know exactly which collection has the valid user doc
      const ref = collection(db, targetColl, uid, 'checkout_sessions');
      const docRef = await addDoc(ref, payload);
      
      const unsub = onSnapshot(docRef, (snap) => {
        const data = snap.data();
        if (!data) return;
        
        if (data.error) {
          const message = typeof data.error === 'string' ? data.error : (data.error.message || JSON.stringify(data.error));
          finish(() => reject(new Error(message || 'Checkout error')));
        } else if (data.url) {
          finish(() => {
            window.location.assign(data.url);
            resolve(data.url);
          });
        }
      });
      listeners.push(unsub);
    } catch (e) {
      finish(() => reject(e));
    }

    setTimeout(() => {
      if (!resolved) {
        finish(() => reject(new Error('Checkout session not processed by extension (timeout)')));
      }
    }, 15000);
  });
};

export const openBillingPortal = async (returnUrl) => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');

  const payload = { return_url: returnUrl || `${window.location.origin}/profile` };
  const listeners = [];

  // Reuse the same wait logic for billing portal
  let targetColl;
  try {
    targetColl = await waitForStripeId(uid);
  } catch (err) {
     throw err;
  }

  return new Promise(async (resolve, reject) => {
    let resolved = false;
    const finish = (fn) => {
      if (resolved) return;
      resolved = true;
      listeners.forEach((u) => u());
      fn();
    };

    try {
      const ref = collection(db, targetColl, uid, 'billing_portal_sessions');
      const docRef = await addDoc(ref, payload);
      
      const unsub = onSnapshot(docRef, (snap) => {
        const data = snap.data();
        if (!data) return;
        if (data.error) {
          const message = typeof data.error === 'string' ? data.error : (data.error.message || JSON.stringify(data.error));
          finish(() => reject(new Error(message || 'Portal error')));
        } else if (data.url) {
          finish(() => {
            window.location.assign(data.url);
            resolve(data.url);
          });
        }
      });
      listeners.push(unsub);
    } catch (e) {
      finish(() => reject(e));
    }

    setTimeout(() => {
      if (!resolved) {
        finish(() => reject(new Error('Billing portal session not processed by extension')));
      }
    }, 15000);
  });
};
