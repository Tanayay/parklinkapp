import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain);

const app = firebaseReady ? initializeApp(firebaseConfig) : null;
export const auth = firebaseReady ? getAuth(app) : null;
export const db = firebaseReady ? getFirestore(app) : null;

function normalizePhone(phone) {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (phone.startsWith('+')) return phone;
  return `+${digits}`;
}

export async function sendFirebaseOtp(phone) {
  return {
    phoneNumber: normalizePhone(phone),
    confirm: async (code) => {
      if (code !== '123456') throw new Error('Wrong code. Use 123456 for prototype login.');
      return { user: { phoneNumber: normalizePhone(phone) } };
    }
  };
}

export async function verifyFirebaseOtp(confirmationResult, code) {
  if (!confirmationResult) throw new Error('No OTP request found.');
  return confirmationResult.confirm(code);
}

export function subscribeReservations(callback) {
  if (!firebaseReady) return null;
  return onSnapshot(collection(db, 'reservations'), (snapshot) => {
    const now = Date.now();
    const reservations = {};
    snapshot.forEach((item) => {
      const data = item.data();
      const expiresAt = data.expiresAt?.toMillis ? data.expiresAt.toMillis() : data.expiresAt;
      if (expiresAt && expiresAt > now) {
        reservations[item.id] = {
          ...data,
          expiresAt
        };
      }
    });
    callback(reservations);
  });
}

export async function reserveSpotInFirebase({ spotId, userName, phone, expiresAt }) {
  if (!firebaseReady) throw new Error('Firebase is not configured yet.');
  const reservationRef = doc(db, 'reservations', spotId);
  await runTransaction(db, async (transaction) => {
    const allReservations = await getDocs(collection(db, 'reservations'));
    const activeUserReservation = allReservations.docs.find((item) => {
      const data = item.data();
      const itemExpiresAt = data.expiresAt?.toMillis ? data.expiresAt.toMillis() : data.expiresAt;
      return itemExpiresAt > Date.now() && data.phone === phone && item.id !== spotId;
    });
    if (activeUserReservation) throw new Error('You already have an active reservation.');

    const current = await transaction.get(reservationRef);
    if (current.exists()) {
      const data = current.data();
      const currentExpiresAt = data.expiresAt?.toMillis ? data.expiresAt.toMillis() : data.expiresAt;
      if (currentExpiresAt > Date.now()) throw new Error('That spot was just reserved by someone else.');
    }

    transaction.set(reservationRef, {
      spotId,
      userName,
      phone,
      expiresAt: Timestamp.fromMillis(expiresAt),
      createdAt: serverTimestamp()
    });
  });
}

export async function releaseSpotInFirebase(spotId) {
  if (!firebaseReady) throw new Error('Firebase is not configured yet.');
  await deleteDoc(doc(db, 'reservations', spotId));
}

export async function saveVehicleInFirebase(phone, vehicle) {
  if (!firebaseReady) throw new Error('Firebase is not configured yet.');
  const safePhone = phone.replace(/[^0-9]/g, '') || 'demo';
  await setDoc(doc(db, 'users', safePhone, 'vehicles', vehicle.id), vehicle, { merge: true });
}
