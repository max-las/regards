<script>
  import { isCredits } from "../lib/stores.js";

  let page = 1;
</script>

<div class="credits">
  <div class="dark"></div>

  <div class="top font-cinzel">
    <h1>Crédits</h1>
    <div class="button">
      <p on:click={() => {$isCredits = false;}}>Retour</p>
      <div class="underline"></div>
    </div>
  </div>

  <div class="bottom">

  {#if page === 1}

  <div class="left">
    <div class="block">
      <div class="columns">
        <div class="column">
          <h2>Notre équipe</h2>
          <p>Maxime LASSERRE</p>
          <p>Samuel LABAGNERE</p>
          <p>Naja DALMAGNE</p>
          <p>Martin DUCONSEIL</p>
        </div>

        <div class="column">
          <p class="mmi"><img src="/img/deco/mmi.svg" alt>Bordeaux</p>
          <p>Léa RAULT</p>
          <p>Emma FOUILLAT</p>
          <p>Enzo DURET</p>
        </div>
      </div>
    </div>

    <div class="block">
      <h2>Remerciements</h2>
      <p>Musée des beaux-arts & sara la dame du musée</p>
      <p>Alexis Benoit, Clément Casanas, Thibault Charron & Bastien De L’hermite</p>
    </div>
  </div>

  <div class="middle">
    <h2>Musiques</h2>
    <div class="block">
      <h2>4 saisons - l'Hiver - Largo</h2>
      <p>Vivaldi</p>
    </div>

    <div class="block">
      <h2>Les 13 scènes d'enfants</h2>
      <p>Schumann</p>
    </div>

    <div class="block">
      <h2>Symphonie inachevée</h2>
      <p>Schubert</p>
    </div>
  </div>

  <div class="right arrow">
    <img src="/img/deco/creditsRight.svg" on:click={() => {page = 2;}} alt>
  </div>
    
  {:else if page === 2}

  <div class="left arrow">
    <img class="arrow" src="/img/deco/creditsLeft.svg" on:click={() => {page = 1;}} alt>
  </div>

  <div class="middle">
    <div class="block">
      <h2>le Christ et la femme adultère</h2>
      <p>PORTA dit SALVIATI Le Jeune Giuseppe Della</p>
      <p>16e siècle</p>
    </div>

    <div class="block">
      <h2>Portrait de Philippe Durand-Dassier</h2>
      <p>Charles Emile Auguste DURAND dit CAROLUS-DURAN</p>
      <p>1876</p>
    </div>
  </div>

  <div class="right">
    <div class="block">
      <h2>Portrait de femme</h2>
      <p>DUPAIN Edmond Louis</p>
      <p>1886</p>
    </div>

    <div class="block">
      <h2>Jeune pèlerin</h2>
      <p>GRIMOU Alexis</p>
      <p>1732</p>
    </div>

    <div class="block">
      <h2>Tête de fillette</h2>
      <p>LARÉE Antoine Marc Gustave</p>
      <p>1906</p>
    </div>
  </div>

  {/if}

  </div>

</div>
  

<style lang="scss">
  @import "../scss/variables.scss";

  .credits {
    color: $main-color;
    background-image: url("/img/pictures/christ.png");
    width: 100%;
    height: 100%;
    font-size: 12px;
    box-sizing: border-box;
    padding: 10px;
  }

  .dark{
    background-color: black;
    opacity: 0.7;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
  }

  .top {
    height: 20%;
    display: flex;
    justify-content: space-between;
    position: relative;
  }

  .bottom {
    height: 80%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;

    & > :not(.arrow) {
      width: 45%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .columns {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  h2 {
    font-family: 'Cinzel', serif;
    margin-bottom: 0;
    font-weight: 100;
    font-size: 18px;
  }

  .block {
    p {
      font-family: 'Montserrat', sans-serif;
      margin: 0;
    }
    .mmi {
      font-family: 'Cinzel', serif;
      img {
        height: 18px;
      }
    }
  }

  .button{
      font-size: 18px;
      width: fit-content;

      p{
        margin: 0;
        margin-top: 15px;
      }

      .underline{
        border-bottom: 2px solid $main-color;
        animation: underline 3s ease-in-out 0s infinite alternate;
      }
    }

  h1 {
    font-weight: 100;
    font-size: 36px;
    text-transform: uppercase;
  }
</style>