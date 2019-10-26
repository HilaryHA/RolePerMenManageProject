<template>
  <div id="app">
    <no-network></no-network>
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App"
};
</script>

<style lang="scss">
@import "../static/css/reset";
@import "../static/css/common";
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
}
</style>
