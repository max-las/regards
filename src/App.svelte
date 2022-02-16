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
		currentMusics,
		soundEffects
	} from "./lib/stores.js";
	import { audioFadeIn, audioFadeOut } from "./lib/helpers";
	import dialogs from "./data/dialogs.json";

	let audios = {
		musicMenu: null,
		musicMuseeExtAmbiance: null,
		musicMuseeExt: null,
		musicMuseeAmbiance: null,
		musicAndre: null,
		musicCamille: null,
		musicLeo: null,
		musicCitation: null,
		musicIntervenante: null
	}

	let audiosReady = false;

	let i;
	$: {
		const entries = Object.entries(audios);

		for (i = 0; i < entries.length; i++) {
			if(!entries[i][1]){
				break;
			}
		}
		if(i === entries.length){
			audiosReady = true;
		}
	}

	$: {
		if(audiosReady){
			for (const [audioName, audio] of Object.entries(audios)) {
				if($currentMusics.includes(audioName)){
					if(audio.paused){
						audioFadeIn(audio);
					}
				}else{
					if(!audio.paused){
						audioFadeOut(audio);
					}
				}
			}
		}
	}

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

<audio bind:this={$soundEffects.menuClick}>
	<source src="/audio/1_-_Menu_-_click_(touche_clavier).mp3" type="audio/mpeg">
</audio>

<audio bind:this={audios.musicMenu}>
	<source src="/audio/1_-_Menu_-_musique.mp3" type="audio/mpeg">
</audio>

<audio bind:this={audios.musicMuseeExtAmbiance}>
	<source src="/audio/2_-_Musee_exterieur_-_ambiance_de_fond.mp3" type="audio/mpeg">
</audio>

<audio bind:this={audios.musicMuseeExt}>
	<source src="/audio/2_-_Musee_exterieur_-_musique.mp3" type="audio/mpeg">
</audio>

<audio bind:this={audios.musicMuseeAmbiance}>
	<source src="/audio/3_-_Musee_-_ambiance_de_fond.mp3" type="audio/mpeg">
</audio>

<audio bind:this={audios.musicAndre}>
	<source src="/audio/3_-_Musee_-_andre.mp3" type="audio/mpeg">
</audio>

<audio bind:this={audios.musicCamille}>
	<source src="/audio/3_-_Musee_-_camille.mp3" type="audio/mpeg">
</audio>

<audio bind:this={audios.musicLeo}>
	<source src="/audio/3_-_Musee_-_leo.mp3" type="audio/mpeg">
</audio>

<audio bind:this={audios.musicCitation}>
	<source src="/audio/4_-_Fin_-_citation_-_musique.mp3" type="audio/mpeg">
</audio>

<audio bind:this={audios.musicIntervenante}>
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