<script>
	import Dialog from "./Dialog.svelte";
	import pictures from '../data/pictures.json';
	import dialogs from '../data/dialogs.json';
	import coordinates from '../data/coordinates.json'
	import { currentDialogIndex, prevDialogIndex, currentMusics, forwardDialog, backwardDialog } from "../lib/stores.js";
	import { wait, dialogIndexToBgpos } from "../lib/helpers.js";

	let frontPicture, nextPicture;
	let nextPictureSafe = pictures[dialogs[$currentDialogIndex+1].picture];
	let pictureSafe = pictures[dialogs[$currentDialogIndex].picture];
	let prevPictureSafe = null;
	let nextImgPos = dialogIndexToBgpos($currentDialogIndex+1);
	let currentImgPos = dialogIndexToBgpos($currentDialogIndex);
	let prevImgPos = null;

	let clickCoords = null;
	let opacityTransitionOn = false;
	let transform = "scale(1) translate(0vw, 0vw)";
	let displayClickDiv = false;

	$: {
		pictureTransition();

		if($currentDialogIndex >= 0 && $currentDialogIndex < 3){
			$currentMusics = ["musicMuseeExt", "musicMuseeExtAmbiance"];
		} else if($currentDialogIndex >= 3 && $currentDialogIndex < 10) {
			$currentMusics = ["musicMuseeExt", "musicMuseeAmbiance"];
		} else if($currentDialogIndex >= 10 && $currentDialogIndex < 25) {
			$currentMusics = ["musicLeo"];
		} else if($currentDialogIndex >= 25 && $currentDialogIndex < 28) {
			$currentMusics = ["musicMuseeExt", "musicMuseeAmbiance"];
		} else if($currentDialogIndex >= 28 && $currentDialogIndex < 41) {
			$currentMusics = ["musicAndre"];
		} else if($currentDialogIndex >= 41 && $currentDialogIndex < 44) {
			$currentMusics = ["musicMuseeExt", "musicMuseeAmbiance"];
		} else if($currentDialogIndex >= 44 && $currentDialogIndex < 63) {
			$currentMusics = ["musicCamille"];
		} else if($currentDialogIndex >= 63 && $currentDialogIndex < 67) {
			$currentMusics = ["musicMuseeExt", "musicMuseeAmbiance"];
		} else if($currentDialogIndex >= 67) {
			$currentMusics = ["musicIntervenante", "musicMuseeAmbiance"];
		}
	}

	$: {
		let prevTransform = transform;
		if(typeof dialogs[$currentDialogIndex].zoom !== "undefined"){
			transform = coordinates[dialogs[$currentDialogIndex].zoom].transform;
		}else{
			transform = "scale(1) translate(0vw, 0vw)";
		}

		if(typeof dialogs[$currentDialogIndex].click !== "undefined"){
			clickCoords = coordinates[dialogs[$currentDialogIndex].click];
			if(prevTransform !== transform){
				setTimeout(() => {
					displayClickDiv = true;
				}, 2000);
			}else if(pictures[dialogs[$currentDialogIndex].picture] !== pictureSafe){
				setTimeout(() => {
					displayClickDiv = true;
				}, 1000);
			}else{
				displayClickDiv = true;
			}
		}else{
			clickCoords = null;
			displayClickDiv = false;
		}
	}

	function handleClickDiv() {
		displayClickDiv = false;
		$forwardDialog();
	}

	function handleBackArrow() {
		$backwardDialog();
		// calcCoords();
	}

	function calcCoords(){
		let posX = 28.81;
		let posY = 35.78;
		let img = frontPicture.querySelector("img");
		let translateX = window.innerWidth * ((50 - posX) / 100);
		let translateY = img.offsetHeight * ((50 - posY) / 100);
		console.log(`translate(${translateX}px, ${translateY}px)`);
	}

	async function pictureTransition(){
		try {
			if(pictures[dialogs[$currentDialogIndex].picture] !== pictureSafe){
				opacityTransitionOn = true;
				frontPicture.style.opacity = 0;
				if($currentDialogIndex < $prevDialogIndex){
					nextPicture.style.opacity = 0;
				}
				await wait(1000);
				opacityTransitionOn = false;
				pictureSafe = pictures[dialogs[$currentDialogIndex].picture];
				currentImgPos = dialogIndexToBgpos($currentDialogIndex);
				await wait(100); // fix flash on transition
				frontPicture.style.opacity = null;
				nextPicture.style.opacity = null;
			}else{
				currentImgPos = dialogIndexToBgpos($currentDialogIndex);
			}

			let nextDialog = dialogs[$currentDialogIndex+1];
			if(nextDialog){
				if(nextDialog.picture){
					nextPictureSafe = pictures[nextDialog.picture];
					nextImgPos = dialogIndexToBgpos($currentDialogIndex+1);
				}
			}

			let prevDialog = dialogs[$currentDialogIndex-1];
			if(prevDialog){
				if(prevDialog.picture){
					prevPictureSafe = pictures[prevDialog.picture];
					prevImgPos = dialogIndexToBgpos($currentDialogIndex-1);
				}
			}
		} catch (err) {}
	}
</script>

{#if prevPictureSafe}
	<div class="pictureBg">
		<img src="/img/pictures/{prevPictureSafe}" class:center={prevImgPos === "center"} alt>
	</div>
{/if}
<div bind:this={nextPicture} class="pictureBg">
	<img src="/img/pictures/{nextPictureSafe}" class:opacityTransition="{opacityTransitionOn}" class:center={nextImgPos === "center"} alt>
</div>
<div bind:this={frontPicture} class="pictureBg" class:opacityTransition="{opacityTransitionOn}" style="--transform: {transform};">
	<img src="/img/pictures/{pictureSafe}" class:center={currentImgPos === "center"} alt>
</div>
{#if $currentDialogIndex > 0}
	<div class="backArrow" on:click={handleBackArrow}>
		<img src="/img/deco/backArrow.svg" alt>
	</div>
{/if}
{#if dialogs[$currentDialogIndex].text !== ""}
	<Dialog first={$currentDialogIndex} />
{:else if displayClickDiv}
	<div class="clickDiv" on:click={handleClickDiv} style="width: {clickCoords.w}%; height: {clickCoords.h}%; bottom: {clickCoords.y}%; left: {clickCoords.x}%;"></div>
{/if}

<style lang="scss">
	.pictureBg {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		transform: var(--transform);
		transition: transform 2s;
		&.opacityTransition {
			transition: opacity 1s;
		}
		img {
			width: 100%;
			position: relative;
			&.center {
				top: 50%;
				transform: translateY(-50%);
			}
		}
	}

	.clickDiv {
		position: absolute;
		border-radius: 50px;
		background-color: rgb(196,196,196);
		animation: blink 1s ease-in-out 0s infinite alternate;
		filter: blur(10px);
	}

	.backArrow {
		position: absolute;
		top: 30px;
		left: 30px;
		width: fit-content;
		height: fit-content;

		img {
			height: 30px;
			padding-left: 10px;
			padding-right: 10px;
		}
	}

	@keyframes blink {
		from {
			opacity: 0.3;
		}
		to {
			opacity: 0.1;
		}
	}
</style>