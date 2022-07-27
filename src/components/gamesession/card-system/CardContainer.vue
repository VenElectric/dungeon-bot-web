<script setup lang="ts">
import ConsentCard from "./ConsentCard.vue";

const consentcolors = [
  { color: "green", icon: "pi pi-check-circle" },
  { color: "yellow", icon: "pi pi-exclamation-triangle" },
  { color: "red", icon: "pi pi-times-circle" },
  { color: "white", icon: "pi pi-clock" },
  { color: "blue", icon: "pi pi-comment" },
];
</script>

<template>
    <ConsentCard
      v-for="record in consentcolors"
      :color="record.color"
      :icon="record.icon"
      :key="record.color"
    />
</template>

<style></style>
