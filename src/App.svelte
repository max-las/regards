<script>
	import Adventure from "./components/Adventure.svelte";
	import PleaseTurn from "./components/PleaseTurn.svelte";
	import HomePage from "./components/HomePage.svelte";
	import Credits from "./components/Credits.svelte";
	import Final from "./components/Final.svelte";
	import { isAdventure, isCredits, currentDialogIndex } from "./lib/stores.js";
	import dialogs from "./data/dialogs.json";

	let mustTurn;
	checkScreen();

	function checkScreen(){
		let vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);

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
		{:else if $currentDialogIndex === dialogs.length -1}
			<Final />
		{:else}
			<HomePage />
		{/if}
	{/if}
</main>

<style lang="scss">
	main {
		height: 100vh;
		height: calc(var(--vh, 1vh) * 100);
		width: 100vw;
		position: relative;
	}
</style>