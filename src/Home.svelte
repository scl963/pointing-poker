<script>
  import { navigate } from "svelte-routing";
  let roomId = "";
  export let socket;

  function submitRoom() {
    console.log("submitting room!");
    socket.emit("chat message", "hello");
  }

  function createNewRoom() {
    console.log("Creating new room!");
    socket.emit("create-new-room", ({ roomId }) => {
      console.log("Room ID", roomId);
      navigate(`/room/${roomId}`);
    });
  }
</script>

<svelte:head>
  <title>ButcherBox Pointing Poker</title>
</svelte:head>

<main>
  <h1 class="header">ButcherBox Pointing Poker!</h1>
  <label class="input-label" for="room-number-input"
    >Enter room number to join or create a pointing session
  </label>
  <div class="column">
    <div>
      <input bind:value={roomId} type="text" id="room-number-input" />
      <button on:click={submitRoom}>Join Room</button>
    </div>
    <p class="large-text">OR</p>
    <button on:click={createNewRoom}>Create new room</button>
  </div>
</main>

<style lang="scss">
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    --barn-door-red: #ca3836;
    --crimson: #812221;
  }

  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }

  .header {
    color: var(--barn-door-red);
    font-size: 2rem;
    font-weight: bold;
  }

  .input-label {
    font-size: 1.5rem;
    font-weight: bold;
  }

  input {
    font-size: 1.5rem;
    margin-top: 1rem;
    padding: 0.5rem;
    min-width: 20rem;
  }

  button {
    background-color: var(--barn-door-red);
    border: 2px solid;
    border-color: var(--barn-door-red);
    color: white;
    cursor: pointer;
    font-size: 1.5rem;
    padding: 0.5rem 2rem;
    &:hover {
      background-color: var(--crimson);
      border-color: var(--crimson);
    }
  }

  .column {
    align-items: center;
    display: flex;
    flex-direction: column;
  }

  .large-text {
    font-size: 2rem;
    font-weight: bold;
  }

  @media (max-width: 480px) {
    #room-number-input {
      margin-bottom: 1rem;
    }
  }
</style>
