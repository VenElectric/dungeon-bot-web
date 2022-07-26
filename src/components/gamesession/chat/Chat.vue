<script setup lang="ts">
import { defineProps, ref } from "vue";
const props = defineProps({
  chatMsg: { type: String, required: true },
});

const chat = ref(props.chatMsg);
</script>

<template>
  <div>{{ chat }}</div>
</template>

<style></style>
