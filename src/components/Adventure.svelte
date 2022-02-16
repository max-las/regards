<script>
	import Dialog from "./Dialog.svelte";
	import pictures from '../data/pictures.json';
	import dialogs from '../data/dialogs.json';
	import coordinates from '../data/coordinates.json'
	import { currentDialogIndex } from "../lib/stores.js";
	import { wait, dialogIndexToBgpos } from "../lib/helpers.js";

	let mainPictureBg;
	let nextPictureSafe = pictures[dialogs[$currentDialogIndex+1].picture];
	let pictureSafe = pictures[dialogs[$currentDialogIndex].picture];
	let clickCoords = null;
	let opacityTransitionOn = false;
	let transform = "scale(1) translate(0vw, 0vw)";
	let backImgPos = dialogIndexToBgpos($currentDialogIndex+1);
	let frontImgPos = dialogIndexToBgpos($currentDialogIndex);
	let displayClickDiv = false;

	$: {
		if($currentDialogIndex){
			pictureTransition();
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
		$currentDialogIndex += 1;
	}

	async function pictureTransition(){
		try {
			if(pictures[dialogs[$currentDialogIndex].picture] !== pictureSafe){
				opacityTransitionOn = true;
				mainPictureBg.style.opacity = 0;
				await wait(1000);
				opacityTransitionOn = false;
				pictureSafe = pictures[dialogs[$currentDialogIndex].picture];
				frontImgPos = dialogIndexToBgpos($currentDialogIndex);
				await wait(100); // fix flash on transition
				mainPictureBg.style.opacity = null;
			}else{
				frontImgPos = dialogIndexToBgpos($currentDialogIndex);
			}

			let nextDialog = dialogs[$currentDialogIndex+1];
			if(nextDialog){
				if(nextDialog.picture){
					nextPictureSafe = pictures[nextDialog.picture];
					backImgPos = dialogIndexToBgpos($currentDialogIndex+1);
				}
			}
		} catch (err) {}
	}
</script>

<div class="pictureBg">
	<img src="/img/pictures/{nextPictureSafe}" class:center={backImgPos === "center"} alt>
</div>
<div class="pictureBg" class:opacityTransition="{opacityTransitionOn}" bind:this={mainPictureBg} style="--transform: {transform};">
	<img src="/img/pictures/{pictureSafe}" class:center={frontImgPos === "center"} alt>
</div>
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