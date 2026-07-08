import { isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink } from 'firebase/auth';
import { auth, firebaseReady } from './firebase';

export function hasEmailLoginLink() {
  return firebaseReady && isSignInWithEmailLink(auth, window.location.href);
}

export async function sendEmailLoginLink(email) {
  if (!firebaseReady) throw new Error('Firebase is not configured yet.');
  const actionCodeSettings = {
    url: window.location.origin,
    handleCodeInApp: true
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  localStorage.setItem('parklink-login-email', email);
}

export async function completeEmailLoginLink() {
  if (!firebaseReady) throw new Error('Firebase is not configured yet.');
  const email = localStorage.getItem('parklink-login-email') || window.prompt('Confirm your email for ParkLink');
  if (!email) throw new Error('Email is required to finish login.');
  const result = await signInWithEmailLink(auth, email, window.location.href);
  localStorage.removeItem('parklink-login-email');
  return result.user;
}
