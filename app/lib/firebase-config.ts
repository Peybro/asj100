import { initializeApp } from "firebase/app";
import { getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBdi0jX2jAEZUjlKBlwuJCDl0ExP_9NYIw",
    authDomain: "asj-100.firebaseapp.com",
    projectId: "asj-100",
    storageBucket: "asj-100.appspot.com",
    messagingSenderId: "406706093300",
    appId: "1:406706093300:web:e79770b38f0ddb29c9b2a1"
};


const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app)

export { auth, db, storage }
