<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Toolbar from "primevue/toolbar";
import Button from "primevue/button";
import RollIcon from "./RollIcon.vue";
import Dialog from "primevue/dialog";
import { computed, inject, ref } from "vue";
import { IStore, RollStoreInterface } from "../../../data/types";
import { ComponentEnums, LoggingTypes } from "../../../Interfaces/LoggingTypes";
import serverLogger from "../../../Utils/LoggingClass";
import { useToast } from "primevue/usetoast";
import { isError } from "../../typeChecking";
import RollForm from "./RollForm.vue";

const store = inject<IStore>("store");
const rollData = inject<RollStoreInterface>("rollData");
const toast = useToast();

if (store === undefined || rollData === undefined) {
  serverLogger(
    LoggingTypes.alert,
    `Failed to inject store`,
    ComponentEnums.SPELLSTATE
  );
  throw new Error("Failed to inject stores");
}
// data refs
const rolls = ref(computed(() => rollData?.ROLL_FUNCS.GETTERS.getRolls()));

// add roll
const addRollName = ref("");
const addRollValue = ref("");

// edit roll
const editIndex = ref(0);
const editRollName = ref("");
const editRollValue = ref("");

const showError = ref(false);
const errorClass = ref("");

// modal refs
const rollModal = ref(false);
const addModal = ref(false);
const editModal = ref(false);

function addRoll(e: any) {
  const rollObject = rollData?.ROLL_FUNCS.SETTERS.addRoll(
    addRollName.value,
    addRollValue.value
  );
  if (errorMessage(addRollValue.value)) return;
  closeAdd();
  if (rollObject) {
    rollData?.ROLL_FUNCS.EMITS.emitAddRoll(rollObject);
  }
  addRollName.value = "";
  addRollValue.value = "";
}

function editRoll() {
  if (errorMessage(editRollValue.value)) return;
  closeEdit();
  console.log(editRollValue);
  rollData?.ROLL_FUNCS.SETTERS.updateRoll(
    editRollName.value,
    editRollValue.value,
    editIndex.value
  );
  rollData?.ROLL_FUNCS.EMITS.emitUpdateRoll({
    id: rolls.value[editIndex.value].id,
    rollName: editRollName.value,
    rollValue: editRollValue.value,
  });
  editIndex.value = 0;
  editRollName.value = "";
  editRollValue.value = "";
}

function errorMessage(rollValue: string) {
  const isValid = rollData?.ROLL_FUNCS.GETTERS.tryRoll(rollValue);
  if (isError(isValid)) {
    errorClass.value = "p-invalid";
    showError.value = true;
    toast.add({
      severity: "error",
      summary: "Invalid",
      detail: "Roll Format is Invalid",
      life: 3000,
    });
    return true;
  } else return false;
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
      <template #body="{ data, index }">
        <Button
          icon="pi pi-pencil"
          class="p-button-rounded p-button-success mr-2"
          @click="openEdit(index)"
        />
        <Dialog
          v-model:visible="editModal"
          :style="{ width: '450px' }"
          header="Edit Roll"
          :modal="true"
        >
          <RollForm
            :rollName="editRollName"
            :rollValue="editRollValue"
            @save="editRoll"
          />
        </Dialog>
        <Button
          icon="pi pi-trash"
          class="p-button-rounded p-button-danger"
          @click="() => rollData.ROLL_FUNCS.SETTERS.deleteRoll(data.id, index)"
        />
      </template>
    </Column>
  </DataTable>
</template>
