<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";

  export let id;
  export let socket;

  type CurrentState = {
    admin: string | null;
    points: object;
    showPoints: boolean;
  };

  const pointValues = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
  let currentState: CurrentState = {
    admin: null,
    points: {},
    showPoints: false,
  };

  $: assignedPointsArray =
    Object.keys(currentState?.points || {})
      .filter((userId) => userId != socket.id)
      .map((userId) => {
        return currentState.points[userId];
      })
      .sort() || [];
  $: userAssignedPointValue = currentState?.points[socket.id];
  $: isAdmin = currentState?.admin === socket.id;

  function assignPointValue(pointValue: number) {
    if (currentState.showPoints === true) return;
    currentState.points[socket.id] = pointValue;
    socket.emit("assign-point-value", id, pointValue, (res) => {
      console.error("Error assigning point value", res);
      currentState.points[socket.id] = null;
    });
  }

  function adminShowPoints() {
    socket.emit("admin-show-points", id);
  }

  function adminResetPoints() {
    socket.emit("admin-reset-points", id);
  }

  onMount(() => {
    socket.emit("join-room-by-id", id, (res) => {
      if (res.status === "error") {
        navigate("/");
      }

      currentState = res.data;
    });

    socket.on("state-change", (state) => {
      currentState = state;
    });
  });
</script>

<div class="page-layout">
  <div class="cards-container">
    <div class="pointing-cards">
      <div
        class={`flip-container${
          userAssignedPointValue === null ? "" : " flip"
        }`}
      >
        <div class="flipper">
          <div class="point-placeholder front" />
          <div class="point-placeholder back">
            {userAssignedPointValue === null ? "" : userAssignedPointValue}
          </div>
        </div>
      </div>
      {#each assignedPointsArray as assignedPointValue}
        <div class="point-placeholder">
          {#if assignedPointValue === null}
            ...
          {:else if assignedPointValue && !currentState.showPoints}
            ?
          {:else}
            {assignedPointValue}
          {/if}
        </div>
      {/each}
    </div>

    <div class="pointing-cards">
      {#each pointValues as pointValue}
        <button
          class="point-button"
          on:click={() => assignPointValue(pointValue)}
        >
          {pointValue}
        </button>
      {/each}
    </div>
  </div>

  {#if isAdmin}
    <div class="admin-controls">
      <button class="admin-button" on:click={adminShowPoints}
        >Display points</button
      >
      <button class="admin-button" on:click={adminResetPoints}
        >Reset points</button
      >
    </div>
  {/if}
</div>

<style lang="scss">
  .page-layout {
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: center;
    padding: 1rem;
    max-width: 100vw;
  }

  .pointing-cards {
    display: flex;
    flex-direction: row;
    font-size: 1.5rem;
    font-weight: bold;
    justify-content: flex-start;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .point-placeholder {
    align-items: center;
    border: 1px solid gray;
    border-radius: 4px;
    box-shadow: 5px 5px rgba(0, 0, 255, 0.05);
    display: flex;
    font-size: 1.5rem;
    font-weight: bold;
    height: 4rem;
    justify-content: center;
    margin-bottom: 0.5rem;
    margin-right: 0.5rem;
    width: 3rem;
  }

  .point-button {
    border-radius: 4px;
    cursor: pointer;
    height: 4rem;
    margin-right: 0.5rem;
    width: 3rem;

    &:hover {
      background-color: #ebe7e7;
    }
  }

  .admin-button {
    cursor: pointer;
  }

  .flip-container {
    perspective: 2000px;
    margin-right: 0.5rem;
  }

  .flip-container,
  .front,
  .back {
    width: 3rem;
    height: 4rem;
  }

  .flipper {
    transition: 0.6s;
    transform-style: preserve-3d;

    position: relative;
  }

  .flip-container.flip .flipper {
    transform: rotateY(180deg);
  }

  .front,
  .back {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;

    position: absolute;
    top: 0;
    left: 0;
  }

  .front {
    z-index: 2;
    /* for firefox 31 */
    transform: rotateY(0deg);
  }

  /* back, initially hidden pane */
  .back {
    transform: rotateY(180deg);
  }

  @media (min-width: 600px) {
    .page-layout {
      padding: 0;
    }
  }
</style>
