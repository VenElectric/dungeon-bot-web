<script setup lang="ts">
import { PropType, defineProps, ref, watch } from "vue";
import Button from "primevue/button";
import { InitiativeObject } from "../../../Interfaces/initiative";

const props = defineProps({
  index: { type: Number, required: true },
  record: { type: Object as PropType<InitiativeObject>, required: true },
  setCurrent: {
    type: Function as PropType<(index: number) => void>,
    required: true,
  },
});

const recordRef = ref(props.record);

watch(
  () => props.record,
  () => {
    recordRef.value = props.record;
  },
  { deep: true }
);
</script>

<template>
  <Button
    v-if="recordRef.isCurrent"
    icon="pi pi-arrow-circle-right"
    class="p-button-raised p-button-rounded p-mr-3 p-button-success"
  />
  <Button
    v-if="!recordRef.isCurrent"
    icon="pi pi-minus-circle"
    v-tooltip.top="'Click to set this record as the current turn.'"
    class="p-button-raised p-button-rounded p-mr-3 p-button-danger"
    @click.prevent="() => setCurrent(index)"
  />
</template>
