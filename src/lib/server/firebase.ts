import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyBdi0jX2jAEZUjlKBlwuJCDl0ExP_9NYIw',
	authDomain: 'asj-100.firebaseapp.com',
	projectId: 'asj-100',
	storageBucket: 'asj-100.appspot.com',
	messagingSenderId: '406706093300',
	appId: '1:406706093300:web:e79770b38f0ddb29c9b2a1'
};

// Initialize Firebase
function makeApp() {
	const apps = getApps();
	if (apps.length > 0) {
		return apps[0];
	}

	return initializeApp(firebaseConfig);
}

const firebaseApp = makeApp();
export const auth = getAuth(firebaseApp);
