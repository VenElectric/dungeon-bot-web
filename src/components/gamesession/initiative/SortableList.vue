<template>
  <DataTable
    :value="reactiveList"
    @row-reorder="initSetters.onDrop"
    :paginator="true"
    :rows="10"
    class="shadow-8 p-datatable-sm"
    responsiveLayout="scroll"
  >
    <Column
      :rowReorder="true"
      headerStyle="width: 3rem"
      :reorderableColumn="false"
      class="column-large-screen"
    ></Column>
    <Column header="Current Turn" field="isCurrent">
      <template #body="{ index }">
        <current-button
          :record="initData[index]"
          :index="index"
          :setCurrent="initSetters.setCurrent"
        />
      </template>
    </Column>
    <Column header="Re-Order" class="column-small-screen">
      <template #body="{ index }">
        <div class="flex flex-row">
          <Button
            icon="pi pi-arrow-up"
            @click="initSetters.moveUp(index)"
            class="p-button-sm"
          ></Button>
          <Button
            icon="pi pi-arrow-down"
            @click="initSetters.moveDown(index)"
            class="p-button-sm"
          ></Button>
        </div>
      </template>
    </Column>
    <Column header="Character Name" field="characterName" class="text-center">
      <template #body="{ data, field }">
        <span>{{ data[field] }}</span>
      </template>
    </Column>
    <Column
      header="Actions"
      class="column-small-screen center-button text-center w-auto"
    >
      <template #body="{ index }">
        <div class="flex justify-content-center">
          <MobileMenu
            :index="index"
            :componentType="ReturnTypes.INITIATIVE"
          ></MobileMenu>
        </div>
      </template>
    </Column>
    <Column
      header="Spell Effects"
      field="statusEffects"
      class="column-large-screen"
    >
      <template #body="{ data, field }">
        <SpellEffectIcon :statusEffects="data[field]"></SpellEffectIcon>
      </template>
    </Column>
    <Column header="Edit/Delete" class="column-large-screen">
      <template #body="{ index }">
        <edit-delete-buttons
          :deleteItem="initSetters.deleteInitiative"
          :index="index"
          :getRecord="initGetters.getRecord"
          :emitDeleteFunction="initEmits.deleteOneInitiative"
          :emitSaveFunction="initEmits.updateRecordInitiative"
          :saveFunction="initSetters.updateCharacterRecord"
          :componentType="ComponentIs.InitiativeForm"
        />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { ref, PropType, defineProps } from "vue";
import { InitiativeObject } from "../../../Interfaces/initiative";
import { InitiativeStoreInterface, IStore } from "../../../data/types";
import serverLogger from "../../../Utils/LoggingClass";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import SpellEffectIcon from "./SpellEffectIcon.vue";
import { useToast } from "primevue/usetoast";
import CurrentButton from "./CurrentButton.vue";
import EditDeleteButtons from "../EditDeleteButtons.vue";
import { ComponentIs } from "../componentTypes";
import MobileMenu from "../mobile/MobileMenu.vue";
import { ReturnTypes } from "../MenuItemSetup";

const props = defineProps({
  initSetters: {
    type: Object as PropType<InitiativeStoreInterface["SETTERS"]>,
    required: true,
  },
  initGetters: {
    type: Object as PropType<InitiativeStoreInterface["GETTERS"]>,
    required: true,
  },
  initEmits: {
    type: Object as PropType<InitiativeStoreInterface["EMITS"]>,
    required: true,
  },
  initData: {
    type: Object as PropType<InitiativeObject[]>,
    required: true,
  },
});
const toast = useToast();
const editInit = ref(false);
const recordValue = ref<InitiativeObject>({} as InitiativeObject);
const reactiveList = ref(props.initGetters.getInitiative());
serverLogger(
  LoggingTypes.debug,
  `sortable list component created`,
  ComponentEnums.SORTABLELIST
);

function modalOpen(data: InitiativeObject) {
  recordValue.value = data;
  editInit.value = true;
}

function modalClose(e: any, data: InitiativeObject) {
  editInit.value = false;
  props.initSetters.updateCharacterRecord(data);
  props.initEmits.updateRecordInitiative(data);
  toast.add({
    severity: "info",
    summary: "Character Saved",
    detail: `${data.characterName} successfully saved.`,
    life: 3000,
  });
}
</script>

<style scoped lang="scss">
.record {
  padding: 1em;
  width: 100% !important;
  display: flex !important;
  flex-direction: row !important;
  justify-content: space-evenly !important;
  align-items: center !important;
}

:slotted(.current-turn) {
  background: rgb(53, 230, 44) !important;
}
.p-fieldset .p-fieldset-content .p-toggleable-content {
  padding: 0 !important;
  width: 100% !important;
  display: flex !important;
  flex-direction: row !important;
  justify-content: space-evenly !important;
  align-items: center !important;
}
.p-inputnumber-input .p-inputnumber-input {
  width: 50% !important;
}
.button-large-screen {
  display: inline;
}
:deep(.column-small-screen) {
  display: none;
}
@media only screen and (max-width: 480px) {
  :deep(.column-large-screen) {
    display: none;
  }
  :deep(.column-small-screen) {
    display: table-cell;
  }
  .button-large-screen {
    display: none;
  }
}
</style>
