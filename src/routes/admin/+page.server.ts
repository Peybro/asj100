import { auth, db } from '$lib/services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { browserLocalPersistence, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import type { PersonEntry } from '$lib/PersonEntry.ts';
import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';

export async function load({ cookies }) {
	// if (!cookies.get('user')) return;

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
		result: resultPromise
	};
}

export const actions = {
	login: async ({ cookies, request }) => {
		const data = await request.formData();

		const email = data.get('email');
		const password = data.get('password');

		await setPersistence(auth, browserLocalPersistence);
		signInWithEmailAndPassword(auth, email, password)
			.then(async (userCredential) => {
				//? Signed in
				const user = userCredential.user;
				// console.log(user);
				cookies.set('user', user.uid, {
					path: '/',
					httpOnly: true,
					sameSite: 'strict',
					secure: !dev,
					maxAge: 60 * 60 * 24 * 7
				});
				throw redirect(303, '/protected');
			})
			.catch((error) => {
				console.log(error);
				if (error.status === 301) {
					throw redirect(301, '/');
				}

				return {
					success: false,
					error: 'Falsches Passwort!'
				};
			});
	}
};
