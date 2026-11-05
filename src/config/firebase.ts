import {
    initializeApp,
    applicationDefault,
    getApps
} from "firebase-admin/app";

import {
    getFirestore,
    Firestore
} from "firebase-admin/firestore";

import { env } from "./env.js";

const firebaseApp =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            credential: applicationDefault(),
            projectId: env.FIREBASE_PROJECT_ID
        });

export const firestore: Firestore =
    getFirestore(firebaseApp);

console.log("Firebase Admin initialized successfully");