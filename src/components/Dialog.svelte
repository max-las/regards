<script>
  import dialogs from '../data/dialogs.json'
  import { currentDialogIndex } from "../lib/stores.js";

  export let first;
  $currentDialogIndex = first;

  let canContinue = true;

  function next() {
    if(canContinue){
      $currentDialogIndex += 1;
      canContinue = false;
      setTimeout(() => {
        canContinue = true;
      }, 1000);
    }
  }
</script>

<div class="dialog" on:click={next}>
  <div class="content">
    <img class="character" src="img/characters/andre.png" alt="" />
    <p class="font-montserrat text">{dialogs[$currentDialogIndex].text}</p>
    <div style="width: fit-content;">
      <p class="font-cinzel nextButton">SUIVANT</p>
      <div class="underline"></div>
    </div>
  </div>
  <img class="decoration" src="img/deco/cadre_decors.png" alt>
</div>

<style lang="scss">
  @import "../scss/variables.scss";

  .dialog {
    background-color: rgba(1,1,1,0.5);
    width: 100vw;
    height: 95px;
    position: absolute;
    bottom: 0;
    left: 0;

    .content{
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      align-items: center;
      width: 100%;
      height: 100%;

      .character{
        width: 10%;
      }
    }

    .decoration {
      position: absolute;
      bottom: 0;
      left: 0;
      box-sizing: border-box;
      padding: 5px;
      height: 100%;
      width: 100%;
    }
  }

  p {
    color: $main-color;
    margin: 0;

    &.nextButton {
      font-size: 18px;
    }

    &.text{
      width: 60%;
      font-size: 16px;
    }
  }

  .underline {
    border-bottom: 1px solid $main-color;
    animation: underline 2s infinite alternate;
  }
</style>