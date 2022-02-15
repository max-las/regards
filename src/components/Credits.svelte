<script>
  import { isCredits } from "../lib/stores.js";
</script>

<div class="credits">
  <div class="top font-cinzel">
    <h1>Crédits</h1>
    <div class="button">
      <p on:click={() => {$isCredits = false;}}>Retour</p>
      <div class="underline"></div>
    </div>
  </div>

  <div class="bottom">
    <div class="left">
      <div class="block">
        <h2>Le Christ et la femme adultère</h2>
        <p>PORTA dit SALVIATI Le Jeune Giuseppe Della</p>
        <p>16e siècle</p>
      </div>

      <div class="block">
        <h2>Pierre, Jeanne et André enfants</h2>
        <p>SCHNEGG Gaston</p>
        <p>1911</p>
      </div>

      <div class="block">
        <h2>Portrait de femme</h2>
        <p>DUPAIN Edmond Louis</p>
        <p>1886</p>
      </div>

      <div class="block">
        <h2>Remerciements</h2>
        <p>Musée des beaux-arts & sara la dame du musée</p>
        <p>Alexis Benoit, Clément Casanas, Thibault Charron & Bastien De L’hermite</p>
      </div>
    </div>

    <div class="separator"></div>

    <div class="right">
      <div class="block music">
        <h2>Musiques</h2>
        <p>Vivaldi Winter</p>
        <p>Violin Concerto in A Minor RV356 presto</p>
        <p>Schumann - Les 13 Scènes d'enfants</p>
        <p>schubert symphony inachevée</p>
      </div>

      <div class="block">
        <h2>Notre équipe</h2>

        <div class="columns">
          <div class="column">
            <p>Maxime LASSERRE</p>
            <p>Samuel LABAGNERE</p>
            <p>Naja DALMAGNE</p>
            <p>Martin DUCONSEIL</p>
          </div>
  
          <div class="column">
            <p>Léa RAULT</p>
            <p>Emma FOUILLAT</p>
            <p>Enzo DURET</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  @import "../scss/variables.scss";

  .credits {
    color: $main-color;
    background-color: black;
    width: 100%;
    height: 100%;
    font-size: 12px;
    box-sizing: border-box;
    padding: 10px;
  }

  .top {
    height: 20%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .bottom {
    height: 80%;
    display: flex;
    justify-content: space-between;

    .left, .right {
      width: 45%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .right {
      .columns {
        display: flex;
        justify-content: space-between;
      }
    }

    .separator {
      height: 100%;
      border-left: 2px solid $main-color;
    }
  }

  .block {
    h2 {
      font-family: 'Cinzel', serif;
      margin-bottom: 0;
      font-weight: 100;
      font-size: 16px;
    }
    p {
      font-family: 'Montserrat', sans-serif;
      margin: 0;
    }
    &.music {
      p {
        margin-top: 10px;
        margin-bottom: 10px;
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