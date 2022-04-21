<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Toolbar from "primevue/toolbar";
import Button from "primevue/button";
import RollIcon from "../RollIcon.vue";
import InputText from "primevue/inputtext";
import OverlayPanel from "primevue/overlaypanel";
import Dialog from "primevue/dialog";
import { computed, inject, onMounted, ref } from "vue";
import { RollObject } from "../../Interfaces/Rolls";
import { IStore, RollStore } from "../../data/types";
import {
  ComponentEnums,
  LoggingTypes,
  StoreEnums,
} from "../../Interfaces/LoggingTypes";
import serverLogger from "../../Utils/LoggingClass";
import { v4 as uuidv4 } from "uuid";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { useToast } from "primevue/usetoast";

const store = inject<IStore>("store");
const rollData = inject<RollStore>("rollData");
const toast = useToast();

if (store === undefined || rollData === undefined) {
  serverLogger(
    LoggingTypes.alert,
    `Failed to inject store`,
    ComponentEnums.SPELLSTATE
  );
  throw new Error("Failed to inject stores");
}
const rolls = ref(computed(() => rollData?.ROLL_FUNCS.GETTERS.getRolls()));
console.table(rolls.value);
const rollModal = ref(false);
const addRollRef = ref();
const addRollName = ref("");
const addRollValue = ref("");
const showError = ref(false);
const errorClass = ref("");

function tryRoll(roll: string) {
  let errorMsg;

  try {
    console.log(roll);
    rollData?.ROLL_FUNCS.GETTERS.rollDice(roll);
  } catch (error) {
    console.log(error);
    errorMsg = error;
  }

  return errorMsg;
}

function updateRecordRoll(event: any) {
  let { data, newValue, field } = event;

  const rollIndex = rolls.value
    .map((item: RollObject) => item.id)
    .indexOf(data.id);

  rollData?.ROLL_FUNCS.SETTERS.updateRoll(data[field] as RollObject, rollIndex);
}

function saveRoll(e: any) {
  const isValid = tryRoll(addRollValue.value);
  if (isValid instanceof Error) {
    errorClass.value = "p-invalid";
    showError.value = true;
    toast.add({
      severity: "error",
      summary: "Invalid",
      detail: "Roll Format is Invalid",
      life: 3000,
    });
    return;
  } else {
    toggleAdd(e);
  }
  const rollId = uuidv4();
  const rollObject = {
    rollName: addRollName.value,
    rollValue: addRollValue.value,
    id: rollId,
  };
  rollData?.ROLL_FUNCS.SETTERS.addRoll(rollObject);
  rollData?.ROLL_FUNCS.EMITS.emitAddRoll(rollObject);
  addRollName.value = "";
  addRollValue.value = "";
}

function toggleAdd(event: any) {
  (addRollRef.value as any).toggle(event);
}

function rollDiceDiscord(index: number) {
  const newRoll = rollData?.ROLL_FUNCS.GETTERS.rollDice(
    rolls.value[index].rollValue
  );

  toast.add({
    severity: "success",
    summary: "Roll Results",
    detail: `${newRoll}`,
    life: 3000,
  });
  if (newRoll) {
    rollData?.ROLL_FUNCS.EMITS.discordRoll(
      newRoll,
      rolls.value[index].rollName
    );
  }
}

function openModal() {
  rollModal.value = true;
}
function closeModal(data: RollObject) {
  rollData?.ROLL_FUNCS.SETTERS.addRoll(data);
}

// add in edit and delete
// transfer rolladd to it's own component
// use dialogue component to open up rolladd for adding or updating rolls
</script>

<template>
  <Toolbar>
    <template #start>
      <Button icon="pi pi-plus" @click="toggleAdd" />
      <OverlayPanel ref="addRollRef" :showCloseIcon="true" :dismissable="true">
        <div class="flex flex-column justify-content-center">
          <InputText placeholder="Roll Name" v-model="addRollName" />
          <InputText
            placeholder="d20+3-2"
            v-model="addRollValue"
            v-tooltip.top="'The dice and modifiers to be rolled I.E. d4+d20+3'"
            :class="errorClass"
          />
          <small id="username1-help" v-show="showError">
            Roll Format should be similar to: d20+3-4
          </small>
          <Button label="Save" @click="saveRoll" />
        </div>
      </OverlayPanel>
    </template>
  </Toolbar>
  <DataTable
    :value="rolls"
    :paginator="true"
    :rows="10"
    class="shadow-8 p-datatable-sm"
    responsiveLayout="scroll"
  >
    <Column header="Name" field="rollName">
      <template #body="{ data, field }">
        {{ data[field] }}
      </template>
    </Column>
    <Column header="Value" field="rollValue">
      <template #body="{ data, field }">
        {{ data[field] }}
      </template>
    </Column>
    <Column header="Roll" field="rollId">
      <template #body="{ index }">
        <RollIcon @click.prevent="() => rollDiceDiscord(index)"></RollIcon>
      </template>
    </Column>
  </DataTable>
</template>
