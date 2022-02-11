<script>
	import Dialog from "./components/Dialog.svelte";
	import { picture } from "./lib/stores.js";
	import pictures from "./data/pictures.json";

	let picsCount = Object.keys(pictures).length;
	let picsLoaded = 0;
	let percent = 0;

	$: {
		percent = (picsLoaded / picsCount) * 100;
	}

	for (const [key, pic] of Object.entries(pictures)) {
		let img = new Image();
		img.onload = () => {
			picsLoaded += 1;
		};
		img.src = "/img/pictures/" + pic;
	}
</script>

{#if percent === 100}
	<main style="background-image: url('/img/pictures/{$picture}')">
		<Dialog first={0} />
	</main>
{:else}
	<p>{percent}%</p>
{/if}

<style>
	main {
		width: 100vw;
		height: 100vh;
		background-position: center;
		background-size: cover;
	}
</style>