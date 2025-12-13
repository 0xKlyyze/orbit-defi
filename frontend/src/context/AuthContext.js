import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from '@/services/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  resetPassword: async () => {},
  logout: async () => {},
  loginWithGoogle: async () => {},
  loginWithTwitter: async () => {},
  loginWithGithub: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      console.info('[Auth] onAuthStateChanged', {
        uid: u?.uid || null,
        email: u?.email || null,
        isLoggedIn: !!u,
      });
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async (email, password) => {
    console.info('[Auth] login start', { email });
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.info('[Auth] login success', { uid: cred.user?.uid });
      return cred.user;
    } catch (err) {
      console.error('[Auth] login failed', { code: err?.code, message: err?.message });
      throw err;
    }
  };

  const register = async (email, password) => {
    console.info('[Auth] register start', { email });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      console.info('[Auth] register success', { uid: cred.user?.uid });
      return cred.user;
    } catch (err) {
      console.error('[Auth] register failed', { code: err?.code, message: err?.message });
      throw err;
    }
  };

  const resetPassword = async (email) => {
    console.info('[Auth] resetPassword start', { email });
    try {
      await sendPasswordResetEmail(auth, email);
      console.info('[Auth] resetPassword sent');
    } catch (err) {
      console.error('[Auth] resetPassword failed', { code: err?.code, message: err?.message });
      throw err;
    }
  };

  const logout = async () => {
    console.info('[Auth] logout start');
    try {
      await signOut(auth);
      console.info('[Auth] logout success');
    } catch (err) {
      console.error('[Auth] logout failed', { code: err?.code, message: err?.message });
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    console.info('[Auth] loginWithGoogle start');
    const provider = new GoogleAuthProvider();
    try {
      const cred = await signInWithPopup(auth, provider);
      console.info('[Auth] loginWithGoogle success', { uid: cred.user?.uid });
      return cred.user;
    } catch (err) {
      console.error('[Auth] loginWithGoogle failed', { code: err?.code, message: err?.message });
      throw err;
    }
  };

  const loginWithTwitter = async () => {
    console.info('[Auth] loginWithTwitter start');
    const provider = new TwitterAuthProvider();
    try {
      const cred = await signInWithPopup(auth, provider);
      console.info('[Auth] loginWithTwitter success', { uid: cred.user?.uid });
      return cred.user;
    } catch (err) {
      console.error('[Auth] loginWithTwitter failed', { code: err?.code, message: err?.message });
      throw err;
    }
  };

  const loginWithGithub = async () => {
    console.info('[Auth] loginWithGithub start');
    const provider = new GithubAuthProvider();
    try {
      const cred = await signInWithPopup(auth, provider);
      console.info('[Auth] loginWithGithub success', { uid: cred.user?.uid });
      return cred.user;
    } catch (err) {
      console.error('[Auth] loginWithGithub failed', { code: err?.code, message: err?.message });
      throw err;
    }
  };

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    resetPassword,
    logout,
    loginWithGoogle,
    loginWithTwitter,
    loginWithGithub,
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);