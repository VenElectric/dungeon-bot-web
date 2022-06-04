<script setup lang="ts">
import { SpellStoreInterface } from "../../../data/types";
import { inject, onMounted, ref } from "vue";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";
import serverLogger from "../../../Utils/LoggingClass";
import SPELL_FUNCS from "../../../data/spellStore";
import SpellState from "./SpellState.vue";
import SpellSocketReceiver from "./SpellSocketReceiver.vue";

const error = ref();
const loading = ref(true);

const spellSetters = SPELL_FUNCS.SETTERS;
const spellGetters = SPELL_FUNCS.GETTERS;
const spellEmits = SPELL_FUNCS.EMITS;
const spellData = ref(spellGetters.getSpells());

onMounted(() => {
  spellEmits.getInitialSpells();
  serverLogger(LoggingTypes.info, `retrieved spellData`, `SpellInitialize`);
  loading.value = false;
});
</script>

<template>
  <div v-if="error">
    <h2>Error: {{ error }}</h2>
  </div>
  <div v-if="loading">
    <h2>Loading data...</h2>
  </div>
  <SpellSocketReceiver></SpellSocketReceiver>
  <SpellState
    :spellEmits="spellEmits"
    :spellGetters="spellGetters"
    :spellSetters="spellSetters"
    :spellData="spellData"
  ></SpellState>
</template>
