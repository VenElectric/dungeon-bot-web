<template>
  <DataTable
    :value="reactiveList"
    @row-reorder="reOrderInitiative"
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
      <template #body="{ data, field, index }">
        <Button
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
        />
      </template>
    </Column>
    <Column header="Re-Order" class="column-small-screen">
      <template #body="{ index }">
        <div class="flex flex-row">
          <Button
            icon="pi pi-arrow-up"
            @click="store.moveUp(index)"
            class="p-button-sm"
          ></Button>
          <Button
            icon="pi pi-arrow-down"
            @click="store.moveDown(index)"
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
      <template #body="{ data, index }">
        <div class="flex justify-content-center">
          <CharacterActions
            :characterData="data"
            :index="index"
            :modalOpen="modalOpen"
          ></CharacterActions>
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
      <template #body="{ data, index }">
        <Button
          icon="pi pi-pencil"
          class="p-button-rounded p-button-success mr-2"
          @click="modalOpen(data)"
        />
        <Button
          icon="pi pi-trash"
          class="p-button-rounded p-button-danger"
          @click="() => store.removeCharacter(index, data.id, true)"
        />
      </template>
    </Column>
  </DataTable>

  <Dialog
    v-model:visible="editInit"
    :style="{ width: '450px' }"
    header="Edit Initiative"
    :modal="true"
  >
    <InitiativeData
      :initiativeRecord="recordValue"
      :saveCharacter="modalClose"
    ></InitiativeData>
  </Dialog>
</template>

<script lang="ts">
import { defineComponent, inject, ref, computed } from "vue";
import { InitiativeObject } from "../../../Interfaces/initiative";
import { IStore } from "../../../data/types";
import serverLogger from "../../../Utils/LoggingClass";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import SpellEffectIcon from "./SpellEffectIcon.vue";
import InitiativeData from "./InitiativeData.vue";
import { updateRecordInitiative } from "../../../data/emitFunctions";
import { useToast } from "primevue/usetoast";
import CharacterActions from "./CharacterActions.vue";
//  editMode="cell"
//     @cell-edit-complete="handleChange"
//  InitRecord,
//     OverlayPanel,
export default defineComponent({
  name: "SortableList",
  components: {
    DataTable,
    Column,
    Button,
    Dialog,
    SpellEffectIcon,
    InitiativeData,
    CharacterActions,
  },
  setup() {
    const store = inject<IStore>("store");
    const toast = useToast();
    if (store === undefined) {
      serverLogger(
        LoggingTypes.alert,
        `Failed to inject store`,
        ComponentEnums.INITIATIVESTATE
      );
      throw new Error("Failed to inject store");
    }
    const editInit = ref(false);
    const recordValue = ref<InitiativeObject>({} as InitiativeObject);
    const reactiveList = computed(() => store?.getInitiative());
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
      if (store) {
        store.updateCharacterRecord(data, false);
        updateRecordInitiative(data, store.store.sessionId);
        toast.add({
          severity: "info",
          summary: "Character Saved",
          detail: `${data.characterName} successfully saved.`,
          life: 3000,
        });
      }
    }

    function reOrderInitiative(e: any) {
      store?.onDrop(e);
    }

    return {
      store,
      reactiveList,
      reOrderInitiative,
      editInit,
      modalOpen,
      recordValue,
      modalClose,
    };
  },
});
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
