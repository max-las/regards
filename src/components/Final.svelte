<script>
  import { wait } from "../lib/helpers";
  import { currentDialogIndex, currentMusics } from "../lib/stores";

  $currentMusics = ["musicCitation"];

  let text = "“ La richesse d’une œuvre d’art est aussi un ensemble d’interprétations variées, à travers différents . . . „";
  let arrText = text.split("");
  let pText = null;

  $: {
    if(pText){
      for (const char of arrText) {
        let span = document.createElement("span");
        span.style.opacity = 0;
        span.style.transition = "opacity 1s";
        span.innerHTML = char;
        pText.appendChild(span);
      }
      writeText();
    }
  }

  async function writeText(){
    let spans = pText.querySelectorAll("span");
    for(let i = 0; i < arrText.length; i++){
      await wait(100);
      spans[i].style.opacity = 1;
    }
    await wait(2000);
    $currentDialogIndex = 0;
  }
</script>

<div class="final">
  <p class="font-cinzel" bind:this={pText}></p>
</div>

<style lang="scss">
  @import "../scss/variables.scss";

  .final {
    width: 100%;
    height: 100%;
    background-color: black;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  p {
    font-size: 30px;
    color: $main-color;
    text-align: center;
  }
</style>