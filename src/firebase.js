export const firebaseReady = false;
export const auth = null;
export const db = null;

export async function sendFirebaseOtp() {
  return {
    confirm: async () => ({ user: null })
  };
}

export async function verifyFirebaseOtp(confirmationResult, code) {
  if (!confirmationResult) return null;
  return confirmationResult.confirm(code);
}

export function subscribeReservations() {
  return null;
}

export async function reserveSpotInFirebase() {
  return null;
}

export async function releaseSpotInFirebase() {
  return null;
}

export async function saveVehicleInFirebase() {
  return null;
}
