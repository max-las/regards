<script>
  import { isAdventure, isCredits, musicMenu, menuClick, musicMuseeExt, musicMuseeExtAmbiance } from "../lib/stores";
  import { audioFadeIn, audioFadeOut } from "../lib/helpers";

  $: {
    audioFadeIn($musicMenu);
  }

  function handleStart(){
    $menuClick?.play();
    audioFadeOut($musicMenu);
    audioFadeIn($musicMuseeExt);
    audioFadeIn($musicMuseeExtAmbiance);
    $isAdventure = true;
  }
</script>

<div class="home">
  <div class="dark"></div>
  <div class="top">
    <div class="button">
      <p class="font-cinzel" on:click={() => {$isCredits = true;}}>CREDITS</p>
      <div class="underline"></div>
    </div>
  </div>
  <div class="bottom">
    <h1 class="font-cinzel">REGARDS</h1>
    <div class="button">
      <p class="font-cinzel" on:click={handleStart}>VIVRE L'EXPÉRIENCE</p>
      <div class="underline"></div>
    </div>
  </div>
</div>

<style lang="scss">
  @import "../scss/variables.scss";

  p, h1{
    color: $main-color;
    position: relative;
  }

  .home{
    background-image: url("/img/pictures/christ.png");
    width: 100%;
    height: 100%;
    background-position: center;
    background-size: 100%;

    .dark{
      background-color: black;
      opacity: 0.7;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
    }

    .top{
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-end;
      
      .button{
        margin: 15px;
      }
    }

    .bottom{
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      height: 80%;

      h1{
        font-size: 64px;
        font-weight: 100;
        margin: 0;
      }
    }
  }

  .button{
    width: fit-content;

    p{
      margin: 0;
    }

    .underline{
      border-bottom: 2px solid $main-color;
      animation: underline 3s ease-in-out 0s infinite alternate;
    }
  }
</style>