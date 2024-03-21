import type { SettingsEntry } from '$lib/types.js';
import { db } from '$lib/services/firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

export async function load({ cookies, locals }) {
	// let user = null;
	// const uid = cookies.get('user');
	// if (!uid) return;
	// await auth
	// 	.verifyIdToken(uid)
	// 	.then((decodedToken) => {
	// 		user = decodedToken;
	// 	})
	// 	.catch((error) => {
	// 		console.error('Error while verifying token:', error);
	// 		cookies.delete('user', { path: '/' });
	// 	});

	// return {
	// 	user
	// };

	const settings = doc(db, 'settings', 'settings');
	const snapshot = await getDoc(settings);

	return {
		settings: snapshot.data() as SettingsEntry
	};
}
