import { getFirebaseAdmin } from "../../../infrastructure/providers/firebase.provider.js";

export async function verifyFirebasePhoneToken(idToken, expectedPhone) {
  const admin = getFirebaseAdmin();
  const decoded = await admin.auth().verifyIdToken(idToken);

  if (expectedPhone && decoded.phone_number && decoded.phone_number !== expectedPhone) {
    throw Object.assign(new Error("Phone number does not match Firebase token"), { statusCode: 401 });
  }

  return { uid: decoded.uid, phone: decoded.phone_number };
}
