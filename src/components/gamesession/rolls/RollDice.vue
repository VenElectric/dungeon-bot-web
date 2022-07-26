<script setup lang="ts">
import { ref, defineProps, PropType } from "vue";
import { RollObject } from "../../../Interfaces/Rolls";
import RollIcon from "./RollIcon.vue";
import ROLL_FUNCS from "../../../data/rollStore";
import { useToast } from "primevue/usetoast";

const props = defineProps({
  rollProp: { type: Object as PropType<RollObject>, required: true },
});

const rollData = ref(props.rollProp);
const rollDice = ROLL_FUNCS.GETTERS.rollDice;

const toast = useToast();

function rollandEmit() {
  const roll = rollDice(rollData.value.rollValue);
  ROLL_FUNCS.EMITS.discordRoll(roll, rollData.value.rollName);
  toast.add({
    severity: "success",
    summary: "Roll Results",
    detail: `${roll.total}`,
    life: 3000,
  });
}
</script>

<template>
  <RollIcon @click="rollandEmit" />
</template>
