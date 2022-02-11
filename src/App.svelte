<script>
	import Dialog from "./components/Dialog.svelte";
	import { picture, nextPicture } from "./lib/stores.js";

	let mainPictureBg;
	let nextPictureSafe = $nextPicture;
	let pictureSafe = $picture;

	$: {
		if($picture){
			pictureTransition();
		}
	}

	function pictureTransition(){
		try {
			mainPictureBg.style.opacity = 0;
			setTimeout(() => {
				pictureSafe = $picture;
				mainPictureBg.style.opacity = null;
				setTimeout(() => {
					nextPictureSafe = $nextPicture;
				}, 1000);
			}, 1000);
		} catch (err) {}
	}
</script>

<main>
	<div class="pictureBg" style="background-image: url('/img/pictures/{nextPictureSafe}')"></div>
	<div class="pictureBg" bind:this={mainPictureBg} style="background-image: url('/img/pictures/{pictureSafe}')"></div>
	<Dialog first={0} />
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
</style>