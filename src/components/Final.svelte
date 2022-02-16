<script>
  import { wait } from "../lib/helpers";

  let text = "“ La richesse d’une œuvre d’art est un ensemble d’interprétations variées, à travers différents . . . „";
  let arrText = text.split("");
  let finalText = "";

  for (const char of arrText) {
    finalText += `<span style="opacity: 0;">${char}</span>`;
  }
</script>

<div class="final">
  <p class="font-cinzel">{@html finalText}</p>
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