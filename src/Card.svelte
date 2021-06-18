<script lang="ts">
</script>

<div class={`flip-container${userAssignedPointValue === null ? "" : " flip"}`}>
  <div class="flipper">
    <div class="point-placeholder front" />
    <div class="point-placeholder back">
      {userAssignedPointValue === null ? "" : userAssignedPointValue}
    </div>
  </div>
</div>

<style lang="scss">
</style>
