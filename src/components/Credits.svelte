<script>
  import { isCredits } from "../lib/stores.js";
</script>

<div class="credits font-cinzel">
  <div class="dark"></div>
  <div class="top">
    <h1>CREDITS</h1>
    <div class="button">
      <p on:click={() => {$isCredits = false;}}>RETOUR</p>
      <div class="underline"></div>
    </div>
  </div>
  <div class="bottom">
    <div class="left">
      <div>
        <p class="large">Le Christ et la Femme Adultère</p>
        <p>PORTA dit SALVIATI Le Jeune Guiseppe Della</p>
        <p>16e siècle</p>
      </div>
      <div>
        <p class="large">Pierre, Jeanne et André enfants</p>
        <p>SCHNEGG Gaston</p>
        <p>1911</p>
      </div>
      <div>
        <p class="large">PORTRAIT DE FEMME</p>
        <p>Dupin Edmond Louis</p>
        <p>1886</p>
      </div>
    </div>
    <div class="line"></div>
    <div class="right">
      <div>
        <p class="large">NOTRE EQUIPE</p>
        <div class="right-top">
          <div>
            <p>Maxime LASSERRE</p>
            <p>Samuel LABAGNERE</p>
            <p>Naja DALMAGNE</p>
            <p>Martin DUCONSEIL</p>
          </div>
          <div>
            <p>Léa RAULT</p>
            <p>Emma FOUILLAT</p>
            <p>Enzo DURET</p>
          </div>
        </div>
      </div>
      <div>
        <p class="large">REMERCIEMENTS</p>
        <p>Musée des Beaux Arts & Sarah Choux</p>
        <p>Alexis Benoît, Clément Casanas, Thibault Charron & Bastien de l'Hermite</p>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  @import "../scss/variables.scss";

  .credits{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    margin: 0;
    height: 100vh;
    width: 100vw;

    background-image: url("/img/pictures/christ.png");
    background-position: center;
    background-size: 100%;

    font-size: 12px;
    color: $main-color;

    .dark{
      background-color: black;
      opacity: 0.7;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
    }

    .large{
      font-size: 18px;
    }

    h1{
      font-size: 36px;
    }

    .top{
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
      width: 90%;
      position: relative;

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
    }

    .bottom{
      width: 100%;
      height: 50%;
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      position: relative;

      p {
        margin: 0;
      }

      .line{
        border-left: 2px solid $main-color;
      }

      .left{
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 45%;
      }

      .right{
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 45%;

        .large{
          margin-bottom: 10px;
        }

        .right-top{
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }
      }
    }
  }

</style>