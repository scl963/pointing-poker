<script>
  import { Router, Route } from "svelte-routing";
  import Home from "./Home.svelte";
  import Room from "./Room.svelte";
  import { io } from "socket.io-client";
  let socket = io();

  console.log(socket);

  export let url = "";
</script>

<Router {url}>
  <div>
    <Route path="/"><Home {socket} /></Route>
    <Route path="/room/:id" component={Room} {socket} />
  </div>
</Router>
