import { initializeApp, getApps, cert } from 'firebase-admin/app';

const firebaseAdminConfig = {
    apiKey: "AIzaSyBdi0jX2jAEZUjlKBlwuJCDl0ExP_9NYIw",
    authDomain: "asj-100.firebaseapp.com",
    projectId: "asj-100",
    storageBucket: "asj-100.appspot.com",
    messagingSenderId: "406706093300",
    appId: "1:406706093300:web:e79770b38f0ddb29c9b2a1"
  };
  

export function customInitApp() {
    if (getApps().length <= 0) {
        initializeApp(firebaseAdminConfig);
    }
}

