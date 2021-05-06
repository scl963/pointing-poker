<script>
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";

  export let id;
  export let socket;

  let roomSize = 1;

  const pointValues = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
  let assignedPoints = {};
  $: assignedPointsArray =
    Object.keys(assignedPoints).map((userId) => {
      console.log(userId);
      return assignedPoints[userId];
    }) || [];
  console.log(assignedPointsArray);
  $: placeholderArray = Array(
    roomSize - Object.keys(assignedPoints).length
  ).fill(null);

  function assignPointValue(pointValue) {
    assignedPoints["localUser"] = pointValue;
    socket.emit("assign-point-value", id, pointValue, (res) => {
      console.error("Error assigning point value");
    });
  }

  onMount(() => {
    socket.emit("join-room-by-id", id, (res) => {
      console.log(res);
      if (res.status === "error") {
        navigate("/");
      }
    });

    socket.on("Room size changed", (newSize) => {
      roomSize = newSize;
    });

    socket.on("point-value-assigned", (userId, pointValue) => {
      const prevAssignedPoints = { ...assignedPoints };
      prevAssignedPoints[userId] = pointValue;
      assignedPoints = prevAssignedPoints;
    });
  });
</script>

<div>Welcome to my room! {id}</div>

<div class="pointing-cards">
  {#each assignedPointsArray as assignedPointValue}
    <div class="point-placeholder">
      {assignedPointValue}
    </div>
  {/each}
  {#each placeholderArray as placeholder}
    <div class="point-placeholder" />
  {/each}
</div>

<div class="pointing-cards">
  {#each pointValues as pointValue}
    <button class="point-button" on:click={() => assignPointValue(pointValue)}>
      {pointValue}
    </button>
  {/each}
</div>

<style lang="scss">
  .pointing-cards {
    display: flex;
    direction: row;
  }

  .point-placeholder {
    align-items: center;
    border: 1px solid gray;
    border-radius: 4px;
    display: flex;
    height: 4rem;
    justify-content: center;
    width: 3rem;
  }

  .point-button {
    border-radius: 4px;
    cursor: pointer;
    height: 4rem;
    width: 3rem;

    &:hover {
      background-color: #ebe7e7;
    }
  }
</style>
