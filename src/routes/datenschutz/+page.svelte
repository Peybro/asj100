<script lang="ts">
	import { browser } from '$app/environment';

	function clearLocalStorage() {
		if (browser) localStorage.removeItem('formValues');
	}
</script>

<h1>Datenschutzhinweis</h1>

<h3>Was passiert mit deinen Daten?</h3>
<p>
	Die von dir eingegebenen Daten werden auf Google Servern in Deutschland gespeichert und
	unterstehen daruch der DSGVO. Wir verwenden diese Daten, um dir unsere Dienstleistungen zur
	Verfügung zu stellen. Deine Daten werden nicht an Dritte weitergegeben.
</p>

<h3>Wie lange werden deine Daten gespeichert?</h3>

<h3>Auf deinem Gerät gespeicherte Daten</h3>
<p>{browser ? localStorage.getItem('formValues') ?? 'Keine' : 'Keine'}</p>
<button on:click={clearLocalStorage}>Löschen</button>

<hr />
<a href="/">zurück</a>
