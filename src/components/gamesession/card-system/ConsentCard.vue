<script setup lang="ts">
import Card from "primevue/card";
import { ref, defineProps } from "vue";

const props = defineProps({
  bg: {
    type: String,
    required: true,
  },
});

const bgColor = ref(props.bg);
</script>

<template>
  <Card class="consent-card shadow-4">
    <template #header>
      <div></div>
    </template>
    <template #content>
      <h2 class="">{{ bgColor.toUpperCase }}</h2>
    </template>
  </Card>
</template>

<style>
.consent-card {
  background-color: v-bind(bgColor) !important;
  width: 10vw;
  height: 30vh;
  transition: 0.5s;
}
.consent-card:hover {
  width: 12vw;
  height: 32vh;
}
</style>
