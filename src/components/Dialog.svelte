<script>
  import dialogs from '../data/dialogs.json'
  import pictures from '../data/pictures.json'
  import { picture } from "../lib/stores.js";

  export let first;
  let current = first;
  let p_text;

  function next() {
    current += 1;
    $picture = pictures[dialogs[current].picture];

    p_text.style.animation = 'none';
    p_text.offsetHeight; /* trigger reflow */
    p_text.style.animation = null; 
  }
</script>

<div class="dialog" on:click={next}>
  <p bind:this={p_text}>{dialogs[current].text}</p>
</div>

<style lang="scss">
  .dialog {
    background-color: rgba(1,1,1,0.3);
    width: 100vw;
    height: 95px;
    position: absolute;
    bottom: 0;
    left: 0;
  }

  p {
    color: white;
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