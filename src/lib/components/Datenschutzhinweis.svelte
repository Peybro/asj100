<script lang="ts">
	export let close: () => void;
</script>

<div class="d container">
	<h1>Datenschutzhinweis</h1>

	<h3>Was passiert mit deinen Daten?</h3>
	<p>
		Die von dir eingegebenen Daten werden auf Google Servern in Deutschland gespeichert und
		unterstehen daruch der DSGVO. Wir verwenden diese Daten, um dir unsere Dienstleistungen zur
		Verfügung zu stellen. Deine Daten werden nicht an Dritte weitergegeben.
	</p>

	<h3>Wie lange werden deine Daten gespeichert?</h3>
	<p>
		Deine Daten werden so lange gespeichert, wie es für die Bereitstellung unserer Dienstleistungen
		notwendig ist. Du kannst jederzeit die Löschung deiner Daten verlangen.
	</p>

	<hr />
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-missing-attribute -->
	<a on:click={close}>zurück</a>
</div>

<style lang="scss" scoped>
	.d {
		position: fixed;
		top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #13171f;
	}
</style>
