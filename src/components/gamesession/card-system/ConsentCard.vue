<script setup lang="ts">
import Button from "primevue/button";
import { ref, defineProps } from "vue";

const props = defineProps({
  color: {
    type: String,
    required: true,
  },
  icon: { type: String, required: true}
});

const bgColor = ref(props.color);

function consentClick(color: string){
  console.log(color)
}
</script>

<template>
  <Button
        class="p-button mx-2 consent-button text-center"
        :icon="icon"
        @click.prevent="consentClick(color)"
        :style="{ backgroundColor: bgColor, borderColor: bgColor, color: 'black' }"
      />
</template>

<style>
.consent-button {
  transition: 1s;
}
.consent-button:hover {
  box-shadow: 0 0 0 2px rgba(0, 191, 255, 0.637),
    0 0 0 5px rgba(0, 190, 255, 0.2);
}
</style>
