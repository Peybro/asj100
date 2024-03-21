<script lang="ts">
	import { enhance } from '$app/forms';
	import { db, storage } from '$lib/services/firebase.js';
	import { collection, deleteDoc, getDocs, query, where } from 'firebase/firestore';
	import { ref, getDownloadURL } from 'firebase/storage';

	export let data;

	async function getPictureUrl(pictureName: string) {
		const pathReference = ref(storage, `portraits/${pictureName}`);
		const url = await getDownloadURL(pathReference);
		return url;
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
			<form action="?/logout" method="post" enctype="multipart/form-data" use:enhance>
				<input type="button" class="secondary" value="Logout" />
			</form>
		{/if}
		{#if !editMode}
			<button>Alle downloaden</button>
		{/if}
		<button on:click={handleEditMode}>{editMode ? 'Fertig' : 'Löschmodus'}</button>

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
						<div>
							<h1>{result.name}</h1>
							{#each result.questions as answer, j}
								<label
									>{data.settings.questions[j].question}
									<input type="text" value={answer} readonly /></label
								>
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
	<form action="?/login" method="post" enctype="multipart/form-data" use:enhance>
		<label
			>Email
			<input type="text" name="email" />
		</label>

		<label>Passwort<input type="password" name="password" /></label>

		<input type="submit" value="Login" />
	</form>
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
