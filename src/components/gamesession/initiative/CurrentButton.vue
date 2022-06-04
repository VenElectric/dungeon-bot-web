<script setup lang="ts">
import { PropType, defineProps, computed } from "vue";
import Button from "primevue/button";

const props = defineProps({
  index: { type: Number, required: true },
  setCurrent: {
    type: Function as PropType<(index: number) => void>,
    required: true,
  },
  getCurrent: {
    type: Function as PropType<(index: number) => boolean>,
    required: true,
  },
});

const isCurrent = computed(() => {
  return props.getCurrent(props.index);
});
</script>

<template>
  <Button
    v-if="isCurrent"
    icon="pi pi-arrow-circle-right"
    class="p-button-raised p-button-rounded p-mr-3 p-button-success"
  />
  <Button
    v-if="!isCurrent"
    icon="pi pi-minus-circle"
    v-tooltip.top="'Click to set this record as the current turn.'"
    class="p-button-raised p-button-rounded p-mr-3 p-button-danger"
    @click.prevent="() => setCurrent(index)"
  />
</template>
