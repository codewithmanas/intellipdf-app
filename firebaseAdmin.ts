import { App, cert, getApp, getApps, initializeApp, ServiceAccount } from "firebase-admin/app";

import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import serviceAccountKey from "@/serviceAccountKey.json";
let app: App;

if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(serviceAccountKey as ServiceAccount),
  });
} else {
  app = getApp();
}

const adminDb = getFirestore(app);
const adminStorage = getStorage(app);

export { app as adminApp, adminDb, adminStorage };
