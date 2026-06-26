import admin from "firebase-admin";
import { getServiceEnv } from "@finboard/config";

function buildCredential() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return admin.credential.applicationDefault();
  }

  const env = getServiceEnv();
  if (env.firebase.projectId && env.firebase.clientEmail && env.firebase.privateKey) {
    return admin.credential.cert({
      projectId: env.firebase.projectId,
      clientEmail: env.firebase.clientEmail,
      privateKey: env.firebase.privateKey
    });
  }

  return admin.credential.applicationDefault();
}

export function getFirebaseAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: buildCredential()
    });
  }

  return admin;
}
