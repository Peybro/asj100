<script lang="ts">
	import { browser, dev } from '$app/environment';

	import './../style.scss';
	browser && import('bootstrap');
</script>

<main class="container">
	<slot />
</main>
