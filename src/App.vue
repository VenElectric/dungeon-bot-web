<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { updateWidth } from "./data/windowStore";

updateWidth(window.innerWidth);

onMounted(() => {
  window.addEventListener("resize",() =>  updateWidth(window.innerWidth));
});

onUnmounted(() => {
  window.removeEventListener("resize",() =>  updateWidth(window.innerWidth));
});
</script>
<template>
  <!-- <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/monsterlist">Monster List</router-link>
    <router-link to="/characterlist">Character List</router-link>
    <router-link to="/gamesessions">Game Sessions</router-link>
    <Toast></Toast>
  </div> -->
  <div className="flex flex-column justify-content-center align-items-center">
    <span className="p-fieldset text-3xl p-4 mb-4 shadow-8">Dungeon Bot</span>
  </div>
  <router-view />
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: rgba(255, 255, 255, 0.87);
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
body {
  background-color: rgb(18, 4, 41);
}
</style>
