import type { SettingsEntry } from '$lib/types.js';
import { db } from '$lib/services/firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { auth } from '$lib/server/firebase';

export async function load({ cookies, locals }) {
	const settings = doc(db, 'settings', 'settings');
	const snapshot = await getDoc(settings);

	return {
		settings: snapshot.data() as SettingsEntry
	};
}
