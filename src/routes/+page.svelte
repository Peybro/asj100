<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	const initialData = {
		name: '',
		picture: '',
		answer1: '',
		answer2: '',
		answer3: '',
		agreeConditions: false
	};

	const formValues: {
		name: string;
		picture: string;
		answer1: string;
		answer2: string;
		answer3: string;
		agreeConditions: boolean;
	} = browser
		? JSON.parse(localStorage.getItem('formValues') ?? JSON.stringify(initialData))
		: initialData;

	$: {
		if (browser) localStorage.setItem('formValues', JSON.stringify(formValues));
	}

	export let data;

	function handleSubmit() {
		localStorage.removeItem('formValues');
		goto('/danke');
	}
</script>

<svelte:window
	on:unload={(event) => {
		event.preventDefault();
		localStorage.removeItem('formValues');
		return '[This text is not visible]';
	}}
/>

<img src="100JahreASJLogo_RGB_4zu3.png" alt="Logo" style="height: 100px;" />

<form
	class=""
	action="?/upload"
	method="post"
	enctype="multipart/form-data"
	on:submit|preventDefault={handleSubmit}
	use:enhance
>
	<fieldset>
		<label class="form-label" for="name">Wie heißt du?</label>
		<input
			type="text"
			class="form-control"
			id="name"
			name="name"
			bind:value={formValues.name}
			placeholder="Name"
			aria-describedby="name-helper"
			required
		/>
		{#if formValues.name}
			<small id="name-helper">
				Hallo {formValues.name}, danke dass du an dieser Umfrage teilnimmst!
			</small>
		{/if}

		<label class="form-label" for="picture">Bild</label>
		<input
			type="file"
			class="form-control"
			id="picture"
			name="picture"
			accept="image/*;capture=camera"
			bind:value={formValues.picture}
			aria-describedby="picture-helper"
			required
		/>
		<small id="picture-helper"> Zeig uns dein schönstes Lächeln! </small>

		<label class="form-label" for="question1">{data.settings.questions[0].question}</label>
		<input
			type="text"
			class="form-control"
			id="question1"
			name="question1"
			bind:value={formValues.answer1}
			placeholder="Frage 1"
			required
		/>

		<label class="form-label" for="question2">{data.settings.questions[1].question}</label>
		<input
			type="text"
			class="form-control"
			id="question2"
			name="question2"
			bind:value={formValues.answer2}
			placeholder="Frage 2"
			required
		/>

		<label class="form-label" for="question3">{data.settings.questions[2].question}</label>
		<input
			type="text"
			class="form-control"
			id="question3"
			name="question3"
			bind:value={formValues.answer3}
			placeholder="Frage 3"
			required
		/>

		<div class="form-check">
			<input
				class="form-check-input"
				type="checkbox"
				value=""
				id="agree"
				name="agreeConditions"
				bind:checked={formValues.agreeConditions}
				required
			/>
			<label class="form-check-label" for="agree">
				Ich habe den <a href="/datenschutz">Datenschutzhinweis</a> gelesen und bin mit dem Speichern
				meiner Daten einverstanden.
			</label>
		</div>
	</fieldset>

	<input
		type="submit"
		class="btn btn-primary"
		value="Abschicken"
		disabled={!formValues.name ||
			!formValues.picture ||
			!formValues.answer1 ||
			!formValues.answer2 ||
			!formValues.answer3 ||
			!formValues.agreeConditions}
	/>
</form>
