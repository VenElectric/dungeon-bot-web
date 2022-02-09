<template>
  <DataTable
    :value="reactiveList"
    @row-reorder="reOrderInitiative"
    :paginator="true"
    :rows="10"
    :rowClass="rowClass"
    class="p-datatable-sm"
  >
    <Column
      :rowReorder="true"
      headerStyle="width: 3rem"
      :reorderableColumn="false"
    ></Column>
    <Column header="Current Turn" field="isCurrent">
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
    <Column header="Character Name" field="characterName">
      <template #body="{ data, field }">
        {{ data[field] }}
      </template>
    </Column>
    <Column header="Edit/Delete">
      <template #body="{ data, index }">
        <Button
          icon="pi pi-pencil"
          class="p-button-rounded p-button-success mr-2"
          @click="modalOpen(data, index)"
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
    <InitRecord :initiative="recordValue" :index="indexValue"></InitRecord>
  </Dialog>
</template>

<script lang="ts">
import {
  defineComponent,
  inject,
  watch,
  reactive,
  ref,
  PropType,
  computed,
} from "vue";
import { InitiativeObject } from "../../../Interfaces/initiative";
import { IStore } from "../../../data/types";
import serverLogger from "../../../Utils/LoggingClass";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { InitiativeObjectEnums } from "../../../Interfaces/ContextEnums";
import InputText from "primevue/inputtext";
import InitRecord from "./InitRecord.vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
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
    InitRecord,
  },
  props: {
    initiativeList: {
      type: Object as PropType<InitiativeObject[]>,
      required: true,
    },
  },
  setup(props) {
    const store = inject<IStore>("store");
    const editInit = ref(false);
    const recordValue = ref<InitiativeObject>({} as InitiativeObject);
    const reactiveList = computed(() => props.initiativeList);
    const indexValue = ref(0);
    let op = ref(null);

    function toggle(event: any) {
      (op.value as any).toggle(event);
    }
    serverLogger(
      LoggingTypes.debug,
      `sortable list component created`,
      ComponentEnums.SORTABLELIST
    );
    if (store === undefined) {
      serverLogger(
        LoggingTypes.alert,
        `Failed to inject store`,
        ComponentEnums.SORTABLELIST
      );
      throw new Error("Failed to inject store");
    }

    function handleTextChange(event: any) {
      let { data, newValue, field, index } = event;

      switch (field) {
        case "characterName":
          store?.updateCharacterItem(
            InitiativeObjectEnums.characterName,
            newValue,
            index,
            true,
            data.id
          );
          break;
        case InitiativeObjectEnums.initiative:
          break;
        case InitiativeObjectEnums.initiativeModifier:
          break;
      }
    }

    function handleNumberChange(
      e: number | undefined,
      valueName: string,
      index: number
    ) {
      if (e !== undefined) {
        serverLogger(
          LoggingTypes.info,
          `updating character info`,
          ComponentEnums.SORTABLELIST
        );
        switch (valueName) {
          case InitiativeObjectEnums.initiative:
            store?.updateCharacterItem(
              InitiativeObjectEnums.initiative,
              Number(e),
              index,
              true,
              reactiveList.value[index].id
            );
            serverLogger(
              LoggingTypes.debug,
              `${valueName} updated`,
              ComponentEnums.SORTABLELIST,
              reactiveList.value[index].id
            );
            break;
          case InitiativeObjectEnums.initiativeModifier:
            store?.updateCharacterItem(
              InitiativeObjectEnums.initiativeModifier,
              Number(e),
              index,
              true,
              reactiveList.value[index].id
            );
            serverLogger(
              LoggingTypes.debug,
              `${valueName} updated`,
              ComponentEnums.SORTABLELIST,
              reactiveList.value[index].id
            );
            break;
        }
      }
    }

    function modalOpen(data: InitiativeObject, index: number) {
      recordValue.value = data;
      indexValue.value = index;
      editInit.value = true;
    }

    function reOrderInitiative(e: any) {
      store?.onDrop(e);
    }

    const rowClass = (data: InitiativeObject) => {
      return data.isCurrent ? "current" : "none";
    };

    return {
      store,
      reactiveList,
      reOrderInitiative,
      handleTextChange,
      handleNumberChange,
      op,
      toggle,
      InitiativeObjectEnums,
      editInit,
      modalOpen,
      recordValue,
      indexValue,
      rowClass,
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
</style>
