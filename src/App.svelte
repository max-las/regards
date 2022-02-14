<script>
	import Dialog from "./components/Dialog.svelte";
	import pictures from './data/pictures.json';
	import dialogs from './data/dialogs.json';
	import coordinates from './data/coordinates.json'
	import { currentDialogIndex } from "./lib/stores.js";

	let mainPictureBg;
	let nextPictureSafe = pictures[dialogs[$currentDialogIndex+1].picture];
	let pictureSafe = pictures[dialogs[$currentDialogIndex].picture];

	let clickCoords = null;

	$: {
		if($currentDialogIndex){
			pictureTransition();
		}
	}

	$: {
		if(dialogs[$currentDialogIndex].click !== "undefined"){
			clickCoords = coordinates[dialogs[$currentDialogIndex].click];
		}else{
			clickCoords = null;
		}
	}

	function handleClickDiv() {
		$currentDialogIndex += 1;
	}

	function pictureTransition(){
		try {
			mainPictureBg.style.opacity = 0;
			setTimeout(() => {
				pictureSafe = pictures[dialogs[$currentDialogIndex].picture];
				mainPictureBg.style.opacity = null;
				setTimeout(() => {
					let nextDialog = dialogs[$currentDialogIndex+1];
					if(nextDialog){
						if(nextDialog.picture){
							nextPictureSafe = pictures[nextDialog.picture];
						}
					}
				}, 1000);
			}, 1000);
		} catch (err) {}
	}
</script>

<main>
	<div class="pictureBg" style="background-image: url('/img/pictures/{nextPictureSafe}')"></div>
	<div class="pictureBg" bind:this={mainPictureBg} style="background-image: url('/img/pictures/{pictureSafe}')"></div>
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
		background-size: cover;
		transition: opacity 1s;
	}

	.clickDiv {
		position: absolute;
	}
</style>