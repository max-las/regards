<script>
	import Dialog from "./components/Dialog.svelte";
	import { picture, nextPicture } from "./lib/stores.js";
	import pictures from "./data/pictures.json";
	import characters from "./data/characters.json";

	let picsCount = Object.keys(pictures).length + Object.keys(characters).length;
	let picsLoaded = 0;
	let percent = 0;

	$: {
		percent = (picsLoaded / picsCount) * 100;
	}

	for (const [_, picFile] of Object.entries(pictures)) {
		preloadWithProgress(`/img/pictures/${picFile}`);
	}

	for (const [_, charProps] of Object.entries(characters)) {
		preloadWithProgress(`/img/characters/${charProps.icon}`);
	}

	function preloadWithProgress(url){
		let xhr = new XMLHttpRequest();
		let previousLoad = 0;
		xhr.onprogress = (e) => {
			const newLoad = e.loaded / e.total;
			picsLoaded += newLoad - previousLoad;
			previousLoad = newLoad;
		};
		xhr.onload = () => {
			if(xhr.status >= 400){
				console.log("yep");
				picsLoaded += 1 - previousLoad;
			}
		}
		xhr.open("GET", url, true);
		xhr.send();
	}

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

{#if percent >= 99.99}
	<main>
		<div class="pictureBg" style="background-image: url('/img/pictures/{nextPictureSafe}')"></div>
		<div class="pictureBg" bind:this={mainPictureBg} style="background-image: url('/img/pictures/{pictureSafe}')"></div>
		<Dialog first={0} />
	</main>
{:else}
	<div class="preload">
		<p>{Math.floor(percent)}%</p>
	</div>
{/if}

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

	.preload {
		width: 100vw;
		height: 100vh;
		background-color: black;
		display: flex;
		justify-content: center;
		align-items: center;
		p {
			color: white;
			font-size: 40px;
		}
	}
</style>