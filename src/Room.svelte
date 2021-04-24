<script>
  import { onMount } from "svelte";
  import { io } from "socket.io-client";

  export let id;

  let socket = io();

  onMount(() => {
    socket.emit("join-room", id);
  });
</script>

<div>Welcome to my room! {id}</div>
