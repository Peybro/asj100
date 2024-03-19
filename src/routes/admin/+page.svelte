<script lang="ts">
	export let data;
	import { enhance } from '$app/forms';
</script>

{#if data.user}
	<div class="alert alert-info" role="alert">
		<div>Du bist bereits eingeloggt.</div>
	</div>
{:else}
	<form action="?/login" method="post" enctype="multipart/form-data" use:enhance>
		<div>
			<label for="email">Email</label>
			<input type="text" id="email" name="email" />
		</div>

		<div>
			<label for="password">Passwort</label>
			<input type="password" id="password" name="password" />
		</div>

		<input type="submit" value="Login" />
	</form>
{/if}

{#await data.result}
	<p>loading...</p>
{:then result}
	{#each result as result, i}
		<div class="card">
			<img src={result.picture} class="w-100 rounded-top p-1" alt={result.picture} />
			<div class="container">
				<h1>{result.name}</h1>
				{#each result.questions as answer, j}
					<div class="fw-bold">{result.questions[j]}</div>
					<p>{answer}</p>
				{/each}
			</div>
		</div>
	{/each}
{:catch error}
	<p>{error.message}</p>
{/await}
