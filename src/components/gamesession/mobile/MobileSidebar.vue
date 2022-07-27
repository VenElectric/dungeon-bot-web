<script setup lang="ts">
import { ref } from "vue";
import Sidebar from "primevue/sidebar";
import Button from "primevue/button";

const display = ref(false);
</script>

<template>
  <Sidebar v-model:visible="display" class="p-sidebar-sm" position="left" :modal="false">
    <slot></slot>
  </Sidebar>
  <Button label="Open Menu" @click="display = true"></Button>
</template>

<style></style>
