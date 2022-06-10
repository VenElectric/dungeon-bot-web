<script setup lang="ts">
import ProgressBar from "primevue/progressbar";
import { computed, defineProps, ref, Ref } from "vue";

const props = defineProps({
  max: { type: Number, required: true },
  current: { type: Number, required: true },
  temp: { type: Number, required: true },
});

const currentref = ref(props.current);

const currentHP: Ref<number> = computed({
  get() {
    return currentref.value;
  },
  set(newValue: number) {
    if (newValue > maxHP.value) {
      currentref.value = maxHP.value;
    } else {
      currentref.value = newValue;
    }
  },
});
const tempHP = ref(props.temp);
const maxHP = ref(props.max);
</script>

<template>
  <div id="myProgress">
    <div id="maxHP">
      <label>Max</label><input type="text" v-model="maxHP" />
    </div>
    <div id="currentHP">
      <label>Current</label><input type="text" v-model="currentHP" />
      <label v-if="tempHP > 0"> Temp: {{ tempHP }}</label>
    </div>
    <ProgressBar :value="currentHP">
      {{ currentHP }}<em v-if="tempHP > 0">({{ tempHP }})</em>/{{ maxHP }}
    </ProgressBar>
  </div>
</template>

<style></style>
