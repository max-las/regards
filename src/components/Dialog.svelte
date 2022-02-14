<script>
  import dialogs from '../data/dialogs.json'
  import { currentDialogIndex } from "../lib/stores.js";
  import { animationReflow } from "../lib/helpers.js";

  export let first;
  $currentDialogIndex = first;
  let p_text;

  function next() {
    $currentDialogIndex += 1;
    animationReflow(p_text);
  }
</script>

<div class="dialog" on:click={next}>
  <p bind:this={p_text}>{dialogs[$currentDialogIndex].text}</p>
</div>

<style lang="scss">
  @import "../scss/variables.scss";

  .dialog {
    background-color: rgba(1,1,1,0.3);
    width: 100vw;
    height: 95px;
    position: absolute;
    bottom: 0;
    left: 0;
  }

  p {
    color: $main-color;
    margin: 0;
    text-align: center;

    overflow: hidden; /* Ensures the content is not revealed until the animation */
    white-space: nowrap; /* Keeps the content on a single line */
    margin: 0 auto; /* Gives that scrolling effect as the typing happens */
    animation: typing 3s steps(40, end);
  }

  @keyframes typing {
    from { width: 0 }
    to { width: 100% }
  }
</style>