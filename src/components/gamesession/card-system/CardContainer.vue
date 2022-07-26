<script setup lang="ts">
import ConsentCard from "./ConsentCard.vue";

const consentcolors = ["green", "yellow", "red", "white", "blue"];
</script>

<template>
  <div class="flex justify-content-evenly">
    <ConsentCard v-for="color in consentcolors" :bg="color" :key="color" />
  </div>
</template>

<style></style>
