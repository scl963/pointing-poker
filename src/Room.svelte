<script>
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";

  export let id;
  export let socket;

  const pointValues = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
  let currentState = { admin: null, points: {} };

  $: assignedPointsArray =
    Object.keys(currentState?.points || {})
      .filter((userId) => userId != socket.id)
      .map((userId) => {
        console.log(userId);
        return currentState.points[userId];
      }) || [];
  $: userAssignedPointValue = currentState?.points[socket.id];

  function assignPointValue(pointValue) {
    console.log("current state", currentState, socket.id);
    currentState.points[socket.id] = pointValue;
    socket.emit("assign-point-value", id, pointValue, (res) => {
      console.error("Error assigning point value");
      console.log(res);
      currentState.points[socket.id] = null;
    });
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
      <div class="point-placeholder">
        {!!userAssignedPointValue ? userAssignedPointValue : ""}
      </div>
      {#each assignedPointsArray as assignedPointValue}
        <div class="point-placeholder">
          {!!assignedPointValue ? assignedPointValue : ""}
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
</div>

<style lang="scss">
  .page-layout {
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: center;
    padding: 1rem;
    width: 100vw;
  }

  .pointing-cards {
    display: flex;
    direction: row;
    justify-content: flex-start;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .point-placeholder {
    align-items: center;
    border: 1px solid gray;
    border-radius: 4px;
    display: flex;
    height: 4rem;
    justify-content: center;
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

  @media (min-width: 600px) {
    .page-layout {
      padding: 0;
    }
  }
</style>
