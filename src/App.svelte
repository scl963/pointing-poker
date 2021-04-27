<script>
  import { Router, Route } from "svelte-routing";
  import Home from "./Home.svelte";
  import Room from "./Room.svelte";

  export let url = "";
</script>

<Router {url}>
  <div>
    <Route path="/"><Home /></Route>
    <Route path="/room/:id" component={Room} />
  </div>
</Router>
