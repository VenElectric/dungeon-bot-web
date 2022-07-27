<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Toolbar from "primevue/toolbar";
import Button from "primevue/button";
import RollIcon from "./RollIcon.vue";
import Dialog from "primevue/dialog";
import { Ref, ref } from "vue";
import { ComponentEnums, LoggingTypes } from "../../../Interfaces/LoggingTypes";
import serverLogger from "../../../Utils/LoggingClass";
import { useToast } from "primevue/usetoast";
import RollForm from "./RollForm.vue";
import ROLL_FUNCS from "../../../data/rollStore";

const {
  GETTERS: rollGetters,
  SETTERS: rollSetters,
  EMITS: rollEmits,
} = ROLL_FUNCS;
const toast = useToast();
// data refs
const rolls = ref(rollGetters.getRolls());

// add roll
// don't need for adding a roll, though I would rather require the value and send a blank string 
// instead of not requiring a value
const addRollName = ref("");
const addRollValue = ref("");

// edit roll
const editIndex = ref(0);
const editRollName = ref("");
const editRollValue = ref("");

// modal refs
const addModal = ref(false);
const editModal = ref(false);

function addRoll(e: Ref<{rollName: string, rollValue: string}>) {
  const rollObject = rollSetters.addRoll(e.value.rollName, e.value.rollValue);
  closeAdd();
  if (rollObject) {
    console.log("emitting")
    ROLL_FUNCS.EMITS.emitAddRoll(rollObject);
  }
}

function editRoll() {
  closeEdit();
  rollSetters.updateRoll(
    {
      id: rolls.value[editIndex.value].id,
      rollName: editRollName.value,
      rollValue: editRollValue.value,
    },
    editIndex.value
  );
  ROLL_FUNCS.EMITS.emitUpdateRoll({
    id: rolls.value[editIndex.value].id,
    rollName: editRollName.value,
    rollValue: editRollValue.value,
  });
  editIndex.value = 0;
  editRollName.value = "";
  editRollValue.value = "";
}

function deleteRoll(index: number) {
  const rollID = rolls.value[index].id
  rollSetters.deleteRoll(index)
  rollEmits.emitDeleteRoll(rollID)
}

function rollDiceDiscord(index: number) {
  const newRoll = rollGetters.rollDice(rolls.value[index].rollValue);

  toast.add({
    severity: "success",
    summary: "Roll Results",
    detail: `${newRoll}`,
    life: 3000,
  });
  if (newRoll) {
    ROLL_FUNCS.EMITS.discordRoll(newRoll, rolls.value[index].rollName);
  }
}

const openAdd = (): void => {
  addModal.value = true;
};
const closeAdd = (): void => {
  addModal.value = false;
};
const openEdit = (index: number): void => {
  editIndex.value = index;
  editRollName.value = rolls.value[index].rollName;
  editRollValue.value = rolls.value[index].rollValue;
  editModal.value = true;
};
const closeEdit = (): void => {
  editModal.value = false;
};

// add in edit and delete
// transfer rolladd to it's own component
// use dialogue component to open up rolladd for adding or updating rolls
</script>

<template>
  <Toolbar>
    <template #start>
      <Button icon="pi pi-plus" @click="openAdd" />
      <Dialog
        v-model:visible="addModal"
        :style="{ width: '450px' }"
        header="Add Custom Roll"
        :modal="true"
      >
        <RollForm
          :rollName="addRollName"
          :rollValue="addRollValue"
          @save="addRoll"
          :tryRoll="rollGetters.tryRoll"
        />
      </Dialog>
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
    <Column header="Edit/Delete" class="column-large-screen">
      <template #body="{ index }">
        <Button
          icon="pi pi-pencil"
          class="p-button-rounded p-button-success mr-2"
          @click="openEdit(index)"
        />
        <Dialog
          v-model:visible="editModal"
          :style="{ width: '450px' }"
          header="Edit Roll"
        >
          <RollForm
            :rollName="editRollName"
            :rollValue="editRollValue"
            @save="editRoll"
            :tryRoll="rollGetters.tryRoll"
          />
        </Dialog>
        <Button
          icon="pi pi-trash"
          class="p-button-rounded p-button-danger"
          @click="deleteRoll(index)"
        />
      </template>
    </Column>
  </DataTable>
</template>
