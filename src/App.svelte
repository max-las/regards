<script>
	import Adventure from "./components/Adventure.svelte";
	import PleaseTurn from "./components/PleaseTurn.svelte";
	import HomePage from "./components/HomePage.svelte";
	import Credits from "./components/Credits.svelte";
	import { isAdventure, isCredits } from "./lib/stores.js";

	let mustTurn;
	checkScreen();

	function checkScreen(){
		if(window.innerHeight > window.innerWidth){
			mustTurn = true;
		}else{
			mustTurn = false;
		}
	}
</script>

<svelte:window on:resize={checkScreen}/>

<main>
	{#if mustTurn}
		<PleaseTurn />
	{:else}
		{#if $isAdventure}
			<Adventure />
		{:else if $isCredits}
			<Credits />
		{:else}
			<HomePage />
		{/if}
	{/if}
</main>

<style lang="scss">
	main {
		width: 100vw;
		height: 100vh;
		position: relative;
	}
</style>