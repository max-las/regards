<script>
	import Adventure from "./components/Adventure.svelte";
	import PleaseTurn from "./components/PleaseTurn.svelte";

	let mustTurn;
	checkScreen();

	function checkScreen(){
		if(screen.height > screen.width){
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
		<Adventure />
	{/if}
</main>

<style lang="scss">
	main {
		width: 100vw;
		height: 100vh;
		position: relative;
	}
</style>