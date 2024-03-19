import { auth, db } from '$lib/services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { browserLocalPersistence, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import type { PersonEntry } from '$lib/PersonEntry.ts';
import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';

async function getDownloadUrl(pictureName: string) {
	const storage = getStorage();
	const pathReference = ref(storage, `portraits/${pictureName}`);

	const url = await getDownloadURL(pathReference);

	return url;
}

export async function load({ cookies }) {
	// if (!cookies.get('user')) return;

	const interviewRef = collection(db, 'kurzinterviews');
	const snapshot = await getDocs(interviewRef);

	const resultPromise = new Promise<PersonEntry[]>((resolve, reject) => {
		const result: PersonEntry[] = [];

		snapshot.forEach((doc) => {
			result.push(doc.data() as PersonEntry);
		});

		for (let i = 0; i < result.length; i++) {
			const pictureName = result[i].picture;

			getDownloadUrl(pictureName).then((url) => (result[i].picture = url));
		}

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
