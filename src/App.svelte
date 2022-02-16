<script>
	import Adventure from "./components/Adventure.svelte";
	import PleaseTurn from "./components/PleaseTurn.svelte";
	import HomePage from "./components/HomePage.svelte";
	import Credits from "./components/Credits.svelte";
	import Final from "./components/Final.svelte";
	import ConfirmMusic from "./components/ConfirmMusic.svelte";
	import { 
		isAdventure, 
		isCredits, 
		currentDialogIndex,
		confirmedMusic,
		musicMenu,
		menuClick,
		musicMuseeExtAmbiance,
		musicMuseeExt,
		musicMuseeAmbiance,
		musicAndre,
		musicCamille,
		musicLeo,
		musicCitation,
		musicIntervenante
	} from "./lib/stores.js";
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

<audio bind:this={$menuClick}>
	<source src="/audio/1_-_Menu_-_click_(touche_clavier).mp3" type="audio/mpeg">
</audio>

<audio bind:this={$musicMenu}>
	<source src="/audio/1_-_Menu_-_musique.mp3" type="audio/mpeg">
</audio>

<audio bind:this={$musicMuseeExtAmbiance}>
	<source src="/audio/2_-_Musee_exterieur_-_ambiance_de_fond.mp3" type="audio/mpeg">
</audio>

<audio bind:this={$musicMuseeExt}>
	<source src="/audio/2_-_Musee_exterieur_-_musique.mp3" type="audio/mpeg">
</audio>

<audio bind:this={$musicMuseeAmbiance}>
	<source src="/audio/3_-_Musee_-_ambiance_de_fond.mp3" type="audio/mpeg">
</audio>

<audio bind:this={$musicAndre}>
	<source src="/audio/3_-_Musee_-_andre.mp3" type="audio/mpeg">
</audio>

<audio bind:this={$musicCamille}>
	<source src="/audio/3_-_Musee_-_camille.mp3" type="audio/mpeg">
</audio>

<audio bind:this={$musicLeo}>
	<source src="/audio/3_-_Musee_-_leo.mp3" type="audio/mpeg">
</audio>

<audio bind:this={$musicCitation}>
	<source src="/audio/4_-_Fin_-_citation_-_musique.mp3" type="audio/mpeg">
</audio>

<audio bind:this={$musicIntervenante}>
	<source src="/audio/4_-_Fin_-_sequence_intervenante_-_musique.mp3" type="audio/mpeg">
</audio>

<main>
	{#if mustTurn}
		<PleaseTurn />
	{:else}
		{#if $confirmedMusic}
			{#if $isAdventure}
				<Adventure />
			{:else if $isCredits}
				<Credits />
			{:else if $currentDialogIndex === dialogs.length -1}
				<Final />
			{:else}
				<HomePage />
			{/if}
		{:else}
			<ConfirmMusic />
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