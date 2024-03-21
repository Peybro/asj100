<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { goto, pushState, replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import Datenschutzhinweis from '$lib/components/Datenschutzhinweis.svelte';
	import { onMount } from 'svelte';

	export let data;

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
	} = { ...initialData };

	function handleSubmit() {
		goto('/danke');
	}

	function showDatenschutzhinweis() {
		pushState('#datenschutzhinweis', { datenschutzhinweis: true });
	}

	onMount(() => {
		if ($page.url.hash === '#datenschutzhinweis') showDatenschutzhinweis();
	});
</script>

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
		<label
			>Wie heißt du?
			<input
				type="text"
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
		</label>

		<label
			>Bild
			<input
				type="file"
				name="picture"
				accept="image/*;capture=camera"
				bind:value={formValues.picture}
				aria-describedby="picture-helper"
				required
			/>
			<small id="picture-helper"> Zeig uns dein schönstes Lächeln! </small>
		</label>

		<label
			>{data.settings.questions[0].question}
			<input
				type="text"
				name="question1"
				bind:value={formValues.answer1}
				placeholder="Frage 1"
				required
			/>
		</label>

		<label
			>{data.settings.questions[1].question}
			<input
				type="text"
				name="question2"
				bind:value={formValues.answer2}
				placeholder="Frage 2"
				required
			/>
		</label>

		<label
			>{data.settings.questions[2].question}
			<input
				type="text"
				name="question3"
				bind:value={formValues.answer3}
				placeholder="Frage 3"
				required
			/>
		</label>

		<label>
			<input
				type="checkbox"
				role="switch"
				name="agreeConditions"
				bind:checked={formValues.agreeConditions}
				required
			/>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-missing-attribute -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			Ich habe den
			<a on:click|stopPropagation={showDatenschutzhinweis}>Datenschutzhinweis</a> gelesen und bin mit
			dem Speichern meiner Daten einverstanden.
		</label>
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

{#if $page.state.datenschutzhinweis}
	<Datenschutzhinweis />
{/if}

<style lang="scss" scoped>
</style>
