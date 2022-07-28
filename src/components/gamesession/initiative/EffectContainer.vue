<script setup lang="ts">
import { computed, ref } from "vue";
import { StatusEffect } from "../../../Interfaces/initiative";
import serverLogger from "../../../Utils/LoggingClass";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";
import INITIATIVE_FUNCS from "../../../data/initiativeStore";

const {
  GETTERS: initGetters,
  SETTERS: initSetters,
  EMITS: initEmits,
} = INITIATIVE_FUNCS;

const props = defineProps({
  index: { type: Number, required: true },
});

const statusEffects = ref(initGetters.getInitbyIndex(props.index).statusEffects)
const lengthNumber = computed(() => statusEffects.value.length);
serverLogger(
  LoggingTypes.debug,
  `container created`,
  ComponentEnums.EFFECTCONTAINER
);
</script>

<template>
  <h3 class="mt-0">Effects</h3>
  <div v-if="lengthNumber > 0" class="flex flex-column align-content-center">
    <em v-for="status in statusEffects" :key="status.id">
      {{ status.spellName }}
    </em>
  </div>
  <div v-else>No Effects to Display</div>
</template>

<style scoped>
.effect-cage {
  display: flex;
  justify-content: space-around;
}
</style>
