<script>
  export let first;
  let current = first;
</script>

<div class="dialog" on:click={() => {current = current.next()}}>
  <img src="/img/decoration_left.png" alt="" />

  <div class="content">
    <p>{current.text()}</p>
    <img src="/img/arrow.png" alt="" />
  </div>

  <img src="/img/decoration_right.png" alt="" />
</div>

<style lang="scss">
  .dialog {
    background-color: rgba(1,1,1,0.3);
    width: 100vw;
    height: 95px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: stretch;
  }

  .content{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    p {
      color: white;
    }
  }
</style>