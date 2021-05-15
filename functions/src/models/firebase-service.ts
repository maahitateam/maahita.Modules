
import * as admin from "firebase-admin";
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
import * as serviceAccount from "../config/serviceAccount.json";
import * as firebaseConfig from '../config/firebaseConfig.json';
let isAdminInitialized: boolean = false;
if (!isAdminInitialized) {
    firebase.initializeApp(firebaseConfig);
    admin.initializeApp({
        databaseURL: firebaseConfig.databaseURL,
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        storageBucket: firebaseConfig.storageBucket
    });
    isAdminInitialized = true;
}
export const auth = firebase.auth;
export const storage = firebase.storage;
export default admin;