<script lang="ts">
	import { enhance } from '$app/forms';

	let slideIndex = 0;

	let formValues = { name: '', picture: '', answer1: '', answer2: '', answer3: '' };
</script>

<img src="100JahreASJLogo_RGB_4zu3.png" class="w-50" alt="Logo" />

<div class="d-flex justify-content-between">
	<button
		class="btn btn-primary"
		on:click={() => {
			if (slideIndex > 0) {
				slideIndex--;
			}
		}}
		disabled={slideIndex === 0}>zurück</button
	>
	{#if slideIndex < 5}
		<button
			class="btn btn-primary"
			on:click={() => {
				if (slideIndex < 5) {
					slideIndex++;
				}
			}}
			disabled={(slideIndex === 0 && !formValues.name) ||
				(slideIndex === 1 && !formValues.picture) ||
				(slideIndex === 2 && !formValues.answer1) ||
				(slideIndex === 3 && !formValues.answer2) ||
				(slideIndex === 4 && !formValues.answer3)}>nächste</button
		>
	{/if}
</div>

<form
	class="card container pt-2 pb-5 my-3"
	action="?/upload"
	method="post"
	enctype="multipart/form-data"
	use:enhance
>
	{#if slideIndex === 0}
		<label class="form-label" for="name">Wie heißt du?</label>
		<input type="text" class="form-control" id="name" name="name" bind:value={formValues.name} />
		{#if formValues.name}
			<div>Hallo {formValues.name}, danke dass du hieran teilnimmst!</div>
		{/if}
	{/if}

	{#if slideIndex === 1}
		<label class="form-label" for="picture">Bild</label>
		<input
			type="file"
			class="form-control"
			id="picture"
			name="picture"
			accept="image/*;capture=camera"
			bind:value={formValues.picture}
		/>
	{/if}

	{#if slideIndex === 2}
		<label class="form-label" for="question1">Was ist deine Lieblingsfarbe?</label>
		<input
			type="text"
			class="form-control"
			id="question1"
			name="question1"
			bind:value={formValues.answer1}
		/>
	{/if}

	{#if slideIndex === 3}
		<label class="form-label" for="question2">Was ist deine Lieblingszahl?</label>
		<input
			type="text"
			class="form-control"
			id="question2"
			name="question2"
			bind:value={formValues.answer2}
		/>
	{/if}

	{#if slideIndex === 4}
		<label class="form-label" for="question3">Was ist deine Lieblingspizza?</label>
		<input
			type="text"
			class="form-control"
			id="question3"
			name="question3"
			bind:value={formValues.answer3}
		/>
	{/if}

	{#if slideIndex === 5}
		<h4>Zusammenfassung</h4>

		<p>Name: {formValues.name}</p>
		<p>Bild: {formValues.picture}</p>
		<p>Frage 1: {formValues.answer1}</p>
		<p>Frage 2: {formValues.answer2}</p>
		<p>Frage 3: {formValues.answer3}</p>

		<div class="form-check">
			<input
				class="form-check-input"
				type="checkbox"
				value=""
				id="agree"
				name="agreeConditions"
				required
			/>
			<label class="form-check-label" for="agree"> Agree to terms and conditions </label>
		</div>

		<input type="submit" class="btn btn-primary" value="Abschicken" />
	{/if}
</form>
