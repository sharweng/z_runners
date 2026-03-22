import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  deleteUser,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

const hasFirebaseClientConfig = () => {
  return Object.values(firebaseConfig).every((value) => String(value || '').trim() !== '');
};

const ensureFirebaseClientConfig = () => {
  if (!hasFirebaseClientConfig()) {
    throw new Error('Firebase client config is missing. Set EXPO_PUBLIC_FIREBASE_* variables in Frontend/.env');
  }
};

const getFirebaseApp = () => {
  ensureFirebaseClientConfig();
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(firebaseConfig);
};

let firebaseAuthInstance;

const getFirebaseAuth = () => {
  if (firebaseAuthInstance) {
    return firebaseAuthInstance;
  }

  const app = getFirebaseApp();

  try {
    firebaseAuthInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // Hot reload can re-enter initializeAuth; getAuth returns existing instance.
    firebaseAuthInstance = getAuth(app);
  }

  return firebaseAuthInstance;
};

export const createFirebaseUser = (email, password) => {
  return createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
};

export const signInWithFirebaseEmail = (email, password) => {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
};

export const signInWithGoogleCredential = (idToken) => {
  if (!idToken) {
    throw new Error('Google ID token is required');
  }

  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(getFirebaseAuth(), credential);
};

export const signInWithFacebookCredential = (accessToken) => {
  if (!accessToken) {
    throw new Error('Facebook access token is required');
  }

  const credential = FacebookAuthProvider.credential(accessToken);
  return signInWithCredential(getFirebaseAuth(), credential);
};

export const deleteFirebaseSessionUser = async (user) => {
  if (!user) {
    return;
  }

  await deleteUser(user);
};

export const isFirebaseClientConfigured = hasFirebaseClientConfig;
