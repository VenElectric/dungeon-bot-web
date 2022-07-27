<script setup lang="ts">
import { onMounted, ref } from "vue";
import { LoggingTypes } from "../../../Interfaces/LoggingTypes";
import serverLogger from "../../../Utils/LoggingClass";
import INITIATIVE_FUNCS from "../../../data/initiativeStore";
import InitiativeContainer from "./InitiativeContainer.vue";
import ROLL_FUNCS from "../../../data/rollStore";

const errorRef = ref();
const loading = ref(true);

const initSetters = INITIATIVE_FUNCS.SETTERS;
const initGetters = INITIATIVE_FUNCS.GETTERS;
const initEmits = INITIATIVE_FUNCS.EMITS;
const initData = ref(initGetters.getInitiative());

onMounted(() => {
  try {
    initEmits.getInitial();
    ROLL_FUNCS.SETTERS.getInitialRolls();
    serverLogger(LoggingTypes.info, `retrieved spellData`, `SpellInitialize`);
    loading.value = false;
  } catch (error) {
    if (error instanceof Error) {
      errorRef.value = error.message;
    }
  }
});
</script>

<template>
  <div v-if="errorRef">
    <h2>Error: {{ errorRef }}</h2>
  </div>
  <div v-if="loading">
    <h2>Loading data...</h2>
  </div>
  <InitiativeContainer
    :initEmits="initEmits"
    :initGetters="initGetters"
    :initSetters="initSetters"
    :initData="initData"
  />
</template>
