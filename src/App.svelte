<script>
	import Dialog from "./components/Dialog.svelte";
	import pictures from './data/pictures.json';
	import dialogs from './data/dialogs.json';
	import coordinates from './data/coordinates.json'
	import { currentDialogIndex } from "./lib/stores.js";
	import { wait } from "./lib/helpers.js";

	let mainPictureBg;
	let nextPictureSafe = pictures[dialogs[$currentDialogIndex+1].picture];
	let pictureSafe = pictures[dialogs[$currentDialogIndex].picture];

	let clickCoords = null;
	let zoomCoords = null;
	let zoomCoordsPrev = null;
	let opacityTransitionOn = false;

	$: {
		if($currentDialogIndex){
			if(pictures[dialogs[$currentDialogIndex].picture] !== pictureSafe){
				pictureTransition();
			}else if(zoomCoords || zoomCoordsPrev){
				try {
					mainPictureBg.style.animation = 'none';
					mainPictureBg.offsetHeight; /* trigger reflow */
					mainPictureBg.style.animation = null; 
				} catch(err) {}
			}
		}
	}

	$: {
		if(typeof dialogs[$currentDialogIndex].click !== "undefined"){
			clickCoords = coordinates[dialogs[$currentDialogIndex].click];
		}else{
			clickCoords = null;
		}
	}

	$: {
		if(typeof dialogs[$currentDialogIndex].zoom !== "undefined"){
			zoomCoordsPrev = zoomCoords;
			zoomCoords = coordinates[dialogs[$currentDialogIndex].zoom];
		}else{
			zoomCoords = null;
		}
	}

	function handleClickDiv() {
		$currentDialogIndex += 1;
	}

	async function pictureTransition(){
		try {
			opacityTransitionOn = true;
			mainPictureBg.style.opacity = 0;
			await wait(1000);
			opacityTransitionOn = false;
			pictureSafe = pictures[dialogs[$currentDialogIndex].picture];
			await wait(100); // fix flash on transition
			mainPictureBg.style.opacity = null;
			let nextDialog = dialogs[$currentDialogIndex+1];
			if(nextDialog){
				if(nextDialog.picture){
					nextPictureSafe = pictures[nextDialog.picture];
				}
			}
		} catch (err) {}
	}
</script>

<main>
	<div class="pictureBg" style="background-image: url('/img/pictures/{nextPictureSafe}')"></div>
	<div 
		class="pictureBg"
		class:opacityTransition="{opacityTransitionOn}"
		bind:this={mainPictureBg}
		style="
			background-image: url('/img/pictures/{pictureSafe}'); 
			{zoomCoords || zoomCoordsPrev ? `
				--bgpos: ${zoomCoords ? zoomCoords.backgroundPosition : "center" };
				--bgsize: ${zoomCoords ? zoomCoords.backgroundSize : "100%"};
				--bgpos-prev: ${zoomCoordsPrev ? zoomCoordsPrev.backgroundPosition : "center"};
				--bgsize-prev: ${zoomCoordsPrev ? zoomCoordsPrev.backgroundSize : "100%"};
				animation: zoom 2s forwards;
			` : "" }
		"
	></div>
	{#if dialogs[$currentDialogIndex].text !== ""}
		<Dialog first={$currentDialogIndex} />
	{:else if clickCoords}
		<div class="clickDiv" on:click={handleClickDiv} style="width: {clickCoords.w}%; height: {clickCoords.h}%; bottom: {clickCoords.y}%; left: {clickCoords.x}%;"></div>
	{/if}
</main>

<style lang="scss">
	main {
		width: 100vw;
		height: 100vh;
		position: relative;
	}

	.pictureBg {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		background-position: center;
		background-size: 100%;
		&.opacityTransition {
			transition: opacity 1s;
		}
	}

	.clickDiv {
		position: absolute;
		border: 2px solid red;
	}
</style>