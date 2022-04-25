<script setup lang="ts">
import { SpellStoreInterface } from "../../../data/types";
import { SpellObject } from "../../../Interfaces/Spells";
import { inject, onMounted, ref } from "vue";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";
import serverLogger from "../../../Utils/LoggingClass";

const spellStore = inject<SpellStoreInterface>("spellStore");
const error = ref();
const loading = ref(true);

if (spellStore === undefined) {
  serverLogger(
    LoggingTypes.alert,
    `failed to inject store`,
    ComponentEnums.SPELLRECORD
  );
  error.value = Error("failed to inject store");
  throw new Error("Failed to inject store");
}

const spellSetters = spellStore.SPELL_FUNCS.SETTERS;
const spellGetters = spellStore.SPELL_FUNCS.GETTERS;
const spellEmits = spellStore.SPELL_FUNCS.EMITS;
const spellData = ref(spellGetters.getSpells());

onMounted(() => {
  spellEmits.getInitialSpells();
  loading.value = false;
  console.log(spellData.value);
});
</script>

<template>
  <div v-if="error">
    <h2>Error: {{ error }}</h2>
  </div>
  <div v-if="loading">
    <h2>Loading data...</h2>
  </div>
  <slot
    :spellData="spellData"
    :spellGetters="spellGetters"
    :spellEmits="spellEmits"
    :spellSetters="spellSetters"
  ></slot>
</template>
