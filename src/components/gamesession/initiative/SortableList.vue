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
    <Column header="Current Turn" field="isCurrent" class="column-large-screen">
      <template #body="{ index }">
        <current-button
          :index="index"
          :setCurrent="initSetters.setCurrent"
          :getCurrent="initGetters.getCurrent"
        />
        <!-- <Button
          v-if="data[field]"
          icon="pi pi-arrow-circle-right"
          class="p-button-raised p-button-rounded p-mr-3 p-button-success"
        />
        <Button
          v-if="!data[field]"
          icon="pi pi-minus-circle"
          v-tooltip.top="'Click to set this record as the current turn.'"
          class="p-button-raised p-button-rounded p-mr-3 p-button-danger"
          @click.prevent="() => store.setCurrent(index)"
        /> -->
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
        {{ data[field] }}
      </template>
    </Column>
    <Column
      header="Actions"
      class="column-small-screen center-button text-center w-auto"
    >
      <template #body="{ index }">
        <div class="flex justify-content-center">
          <mobile-menu
            :index="index"
            :componentType="ReturnTypes.INITIATIVE"
          ></mobile-menu>
          <!-- <CharacterActions
            :characterData="data"
            :index="index"
            :modalOpen="modalOpen"
          ></CharacterActions> -->
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
          :componentType="ComponentIs.InitiativeData"
        />
        <!-- <Button
          icon="pi pi-pencil"
          class="p-button-rounded p-button-success mr-2"
          @click="modalOpen(data)"
        />
        <Button
          icon="pi pi-trash"
          class="p-button-rounded p-button-danger"
          @click="() => initSetters.removeCharacter(index, data.id)"
        /> -->
      </template>
    </Column>
  </DataTable>

  <!-- <Dialog
    v-model:visible="editInit"
    :style="{ width: '450px' }"
    header="Edit Initiative"
    :modal="true"
  >
    <InitiativeData
      :initiativeRecord="recordValue"
      :saveCharacter="modalClose"
    ></InitiativeData>
  </Dialog> -->
</template>

<script setup lang="ts">
import {
  defineComponent,
  inject,
  ref,
  computed,
  PropType,
  defineProps,
  watchEffect,
  watch,
} from "vue";
import { InitiativeObject } from "../../../Interfaces/initiative";
import { InitiativeStoreInterface, IStore } from "../../../data/types";
import serverLogger from "../../../Utils/LoggingClass";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import SpellEffectIcon from "./SpellEffectIcon.vue";
import InitiativeData from "./InitiativeData.vue";
import { SERVER_EMITS } from "../../../data/emitFunctions";
import { useToast } from "primevue/usetoast";
import CharacterActions from "./CharacterActions.vue";
import CurrentButton from "./CurrentButton.vue";
import { getsessionId } from "../../../data/sessionStore";
import EditDeleteButtons from "../EditDeleteButtons.vue";
import { ComponentIs } from "../componentTypes";
import MobileMenu from "../spells/MobileMenu.vue";
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
