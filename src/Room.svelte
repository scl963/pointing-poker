<script>
  import { onMount } from "svelte";
  import { io } from "socket.io-client";
  import { navigate } from "svelte-routing";

  export let id;

  let socket = io();

  onMount(() => {
    socket.emit("join-room-by-id", id, (res) => {
      console.log(res);
      if (res.status === "error") {
        navigate("/");
      }
    });
  });
</script>

<div>Welcome to my room! {id}</div>
