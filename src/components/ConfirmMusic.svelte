<script>
  import { confirmedMusic } from "../lib/stores.js";

  function handleClick() {
    if(typeof document.body.requestFullscreen == "function"){
      document.body.requestFullscreen();
    }
    $confirmedMusic = true;
  }
</script>

<div class="confirmMusic">
  <img src="/img/deco/casque.png" alt>
  <p class="font-montserrat">Pour une meilleure expérience, munissez vous d’écouteurs.</p>
  <div class="button font-montserrat" on:click={handleClick}>Compris</div>
</div>

<style lang="scss">
  @import "../scss/variables.scss";

  .confirmMusic {
    background-color: black;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    img {
      width: 10%;
    }

    p {
      color: $main-color;
      text-align: center;
    }
  }

  .button {
    background-color: $main-color;
    color: black;
    width: fit-content;
    padding: 20px;
  }
</style>