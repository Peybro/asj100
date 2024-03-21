import { db } from '$lib/services/firebase';

import { collection, getDocs } from 'firebase/firestore';
import type { PersonEntry } from '$lib/types';
import { auth } from '$lib/server/firebase';
import { auth as authen } from '$lib/services/firebase';
import { browser, dev } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { setPersistence, browserLocalPersistence, signInWithEmailAndPassword } from 'firebase/auth';

export async function load({ cookies }) {
	let user = null;
	const uid = cookies.get('user');
	if (!uid) return;
	await auth
		.verifyIdToken(uid)
		.then((decodedToken) => {
			user = decodedToken;
		})
		.catch((error) => {
			console.log(error);
			cookies.delete('user', { path: '/' });
		});

	if (!user) return;
	const interviewRef = collection(db, 'kurzinterviews');
	const snapshot = await getDocs(interviewRef);

	const resultPromise = new Promise<PersonEntry[]>((resolve, reject) => {
		let result: PersonEntry[] = [];

		snapshot.forEach(async (doc) => {
			const entry = doc.data() as PersonEntry;

			result = [...result, { ...entry }];
		});

		resolve(result);
	});

	return {
		user,
		result: resultPromise
	};
}

export const actions = {
	login: async ({ cookies, request }) => {
		const data = await request.formData();

		const email = data.get('email');
		const password = data.get('password');

		await setPersistence(authen, browserLocalPersistence);
		const user = (await signInWithEmailAndPassword(authen, email, password)).user;
		cookies.set('user', await user.getIdToken(true), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: 60 * 60 * 24 * 7
		});
		throw redirect(307, '/admin');
	},
	logout: async ({ cookies }) => {
		cookies.delete('user', { path: '/' });
		throw redirect(307, '/admin');
	}
};
