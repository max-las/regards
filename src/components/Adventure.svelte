<script>
	import Dialog from "./Dialog.svelte";
	import pictures from '../data/pictures.json';
	import dialogs from '../data/dialogs.json';
	import coordinates from '../data/coordinates.json'
	import { currentDialogIndex } from "../lib/stores.js";
	import { wait } from "../lib/helpers.js";

	let mainPictureBg;
	let nextPictureSafe = pictures[dialogs[$currentDialogIndex+1].picture];
	let pictureSafe = pictures[dialogs[$currentDialogIndex].picture];
	let clickCoords = null;
	let opacityTransitionOn = false;
	let transform = "scale(1) translate(0vw, 0vw)";

	$: {
		if($currentDialogIndex){
			if(pictures[dialogs[$currentDialogIndex].picture] !== pictureSafe){
				pictureTransition();
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
			transform = coordinates[dialogs[$currentDialogIndex].zoom].transform;
		}else{
			transform = "scale(1) translate(0vw, 0vw)";
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
	<div 
		class="pictureBg"
		style="
			background-image: url('/img/pictures/{nextPictureSafe}');
	">
	</div>
	<div 
		class="pictureBg"
		class:opacityTransition="{opacityTransitionOn}"
		bind:this={mainPictureBg}
		style="
			background-image: url('/img/pictures/{pictureSafe}');
			--transform: {transform};
	">
	</div>
	{#if dialogs[$currentDialogIndex].text !== ""}
		<Dialog first={$currentDialogIndex} />
	{:else if clickCoords}
		<div class="clickDiv" on:click={handleClickDiv} style="width: {clickCoords.w}%; height: {clickCoords.h}%; bottom: {clickCoords.y}%; left: {clickCoords.x}%;"></div>
	{/if}
</main>

<style lang="scss">
	.pictureBg {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		background-position: center;
		background-size: cover;
		transform: var(--transform);
		transition: transform 2s;
		&.opacityTransition {
			transition: opacity 1s;
		}
	}

	.clickDiv {
		position: absolute;
		border: 2px solid red;
	}
</style>