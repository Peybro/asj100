<script lang="ts">
	import { browser } from '$app/environment';
	export let data;
	import { enhance } from '$app/forms';
	import { auth, db, storage } from '$lib/services/firebase.js';
	import { redirect } from '@sveltejs/kit';
	import {
		browserLocalPersistence,
		setPersistence,
		signInWithEmailAndPassword
	} from 'firebase/auth';
	import { collection, deleteDoc, getDocs, query, where } from 'firebase/firestore';
	import { ref, getDownloadURL } from 'firebase/storage';

	async function getPictureUrl(pictureName: string) {
		const pathReference = ref(storage, `portraits/${pictureName}`);
		const url = await getDownloadURL(pathReference);
		return url;
	}

	async function login(event: Event) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		const email = formData.get('email');
		const password = formData.get('password');

		await setPersistence(auth, browserLocalPersistence);
		signInWithEmailAndPassword(auth, email, password)
			.then(async (userCredential) => {
				//? Signed in
				const user = userCredential.user;
				if (browser) {
					document.cookie = `user=${user.stsTokenManager.accessToken}; path=/;`;
					location.reload();
				}
			})
			.catch((error) => {
				if (error.status === 301) {
					throw redirect(301, '/');
				}

				return {
					success: false,
					error: 'Falsches Passwort!'
				};
			});
	}

	async function logout() {
		await auth.signOut();
		if (browser) {
			document.cookie = `user=; path=/;`;
			location.reload();
		}
	}

	function downloadAll() {
		console.log('Download all');
	}

	function downloadOne() {
		console.log('Download one');
	}

	let editMode = false;

	function handleEditMode() {
		if (editMode) {
			location.reload();
		} else {
			editMode = true;
		}
	}

	let willBeDeleted: number[] = [];

	async function deleteOne(id: number, index: number) {
		willBeDeleted = [...willBeDeleted, index];

		const docRef = query(collection(db, 'kurzinterviews'), where('id', '==', id));
		const querySnapshot = await getDocs(docRef);

		querySnapshot.forEach(async (doc) => {
			await deleteDoc(doc.ref);
		});
	}
</script>

<h1>Dashboard</h1>

{#if data.user}
	<div class="toolbar">
		{#if !editMode}
			<button>Alle downloaden</button>
		{/if}
		<button on:click={handleEditMode}>{editMode ? 'Fertig' : 'Löschmodus'}</button>
		{#if !editMode}
			<button class="secondary" on:click={logout}>Logout</button>
		{/if}
		<hr />
	</div>

	{#await data.result}
		<span aria-busy="true">Lade Daten...</span>
	{:then res}
		<div class="grid">
			{#each res as result, i}
				{#if !willBeDeleted.some((nr) => nr === i)}
					<article>
						{#await getPictureUrl(result.picture)}
							<span aria-busy="true">Lade Bild...</span>
						{:then pictureUrl}
							<img src={pictureUrl} alt={result.picture} />
						{:catch error}
							<p>{error.message}</p>
						{/await}
						<div class="container">
							<h1>{result.name}</h1>
							{#each result.questions as answer, j}
								<h5>{data.settings.questions[j].question}</h5>
								<p>{answer}</p>
							{/each}
						</div>

						{#if editMode}
							<button class="danger" on:click={() => deleteOne(result.id, i)}>Löschen</button>
						{:else}
							<button>Download</button>
						{/if}
					</article>
				{/if}
			{/each}
		</div>
	{:catch error}
		<h4>{error.message}</h4>
	{/await}
{:else}
	<form method="post" enctype="multipart/form-data" on:submit|preventDefault={login}>
		<label
			>Email
			<input type="text" name="email" />
		</label>

		<label>Passwort<input type="password" name="password" /></label>

		<input type="submit" value="Login" />
	</form>
	<!-- <form 
	action="?/login" 
	method="post" enctype="multipart/form-data" use:enhance>
		<label
			>Email
			<input type="text" name="email" />
		</label>

		<label>Passwort<input type="password" name="password" /></label>

		<input type="submit" value="Login" />
	</form> -->
{/if}

<style lang="scss" scoped>
	.toolbar {
		position: sticky;
		top: 0;
		background-color: #13171f;
	}

	.grid {
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));

		.danger {
			background-color: red;
			border: none;
		}
	}
</style>
