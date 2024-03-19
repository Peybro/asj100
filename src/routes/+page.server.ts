import { db, storage } from '$lib/services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { fail } from '@sveltejs/kit';

export const actions = {
	upload: async ({ cookies, request }) => {
		try {
			const data = await request.formData();

			const name = data.get('name');

			const picture = data.get('picture') as File;

			const answer1 = data.get('question1');
			const answer2 = data.get('question2');
			const answer3 = data.get('question3');

			const agreeConditions = data.get('agreeConditions');

			// upload to firestore
			const timestamp = new Date().getTime();
			const pictureName = `${name}_${timestamp}.jpg`;

			await setDoc(doc(db, 'kurzinterviews', '' + timestamp), {
				name: name,
				picture: picture.name !== '' ? pictureName : 'Kein Bild',
				questions: [answer1, answer2, answer3]
			});

			if (picture.name !== '') {
				// upload to storage
				const storageRef = ref(storage, `/portraits/${pictureName}`);

				uploadBytes(storageRef, new Uint8Array(await picture.arrayBuffer())).then((snapshot) => {
					console.log('Uploaded an array!');
				});
			}

			console.log(name, picture, answer1, answer2, answer3, agreeConditions);
		} catch (error) {
			console.log(error);
		}

		return { success: true };
	}
};
