<div class="credits">
  <div class="top">
    <h1>CREDITS</h1>
    <div class="button">
      <p>RETOUR</p>
      <div class="underline"></div>
    </div>
  </div>
  <div class="bottom">
    <div class="left">
      <div>

      </div>
      <div>

      </div>
      <div>

      </div>
    </div>
    <div class="line"></div>
    <div class="right">
      <div>

      </div>
      <div>

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

    .top{
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      width: 100%;
    }

    .bottom{
      width: 100%;

      .line{
        border-left: 2px solid $main-color;
      }
    }
  }

</style>