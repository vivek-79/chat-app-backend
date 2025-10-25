import admin from 'firebase-admin';
import { env } from './Env';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(env.firebaseJson))
    });
}

export const firebaseAdmin = admin;
