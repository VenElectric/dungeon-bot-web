<template>
  <div v-if="!loading" class="w-auto">
    <Toast />
    <ConfirmPopup></ConfirmPopup>
    <ToolBar class="shadow-8">
      <template #start>
        <Button
          type="button"
          label="Clear Spells"
          @click="(e) => confirm1(e)"
          class="p-button-sm"
        />
      </template>
      <template #end>
        <Button
          type="button"
          label="Add Spell"
          @click="toggle"
          class="p-button-sm"
        />
        <OverlayPanel ref="op" :showCloseIcon="true" :dismissable="true">
          <AddSpell :spellFunction="addSpell" :isUpdate="false" />
        </OverlayPanel>
      </template>
    </ToolBar>
    <DataTable
      :value="spells"
      :paginator="true"
      :rows="10"
      class="shadow-8 p-datatable-sm"
      responsiveLayout="scroll"
    >
      <Column header="Spell Name">
        <template #body="record">
          <div>{{ record.data.effectName }}</div>
        </template>
      </Column>
      <Column header="Duration">
        <template #body="record">
          <div>
            {{ `${record.data.durationTime} ${record.data.durationType}` }}
          </div>
        </template>
      </Column>
      <Column header="Targets" field="characterIds" class="column-large-screen">
        <template #body="{ index }">
          <Button
            type="button"
            label="Targets"
            @click="(e) => togglePickList(e, index)"
            class="p-button-sm"
          />
          <OverlayPanel
            ref="pickListRef"
            :showCloseIcon="true"
            :dismissable="true"
          >
            <SpellRecord
              :characterIds="pickListTargets"
              :index="pickListIndex"
            />
          </OverlayPanel>
        </template>
      </Column>
      <Column header="Edit/Delete" class="column-large-screen">
        <template #body="{ data, index }">
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-success mr-2"
            @click="modalOpen(data, index)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-danger"
            @click="() => store.removeSpell(index, data.id, true)"
          />
        </template>
      </Column>
      <Column header="Spell Options" class="column-small-screen">
        <template #body="{ data, index }">
          <SpellActions
            :spellData="data"
            :index="index"
            :modalOpen="modalOpen"
          ></SpellActions>
        </template>
      </Column>
    </DataTable>
    <Dialog
      v-model:visible="editSpell"
      :style="{ width: '450px' }"
      header="Edit Spell"
      :modal="true"
    >
      <AddSpell
        :spellFunction="store.updateSpell"
        :isUpdate="true"
        :spell="recordValue"
        :index="indexValue"
      ></AddSpell>
    </Dialog>
  </div>
  <div v-else>Loading...</div>
</template>

<script lang="ts">
import {
  defineComponent,
  inject,
  ref,
  onMounted,
  onBeforeUnmount,
  computed,
} from "vue";
import AddSpell from "./AddSpell.vue";
import { IStore } from "../../../data/types";
import { SpellObject } from "../../../Interfaces/initiative";
import Button from "primevue/button";
import OverlayPanel from "primevue/overlaypanel";
import ToolBar from "primevue/toolbar";
import SpellRecord from "./SpellRecord.vue";
import serverLogger from "../../../Utils/LoggingClass";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import ConfirmPopup from "primevue/confirmpopup";
import Toast from "primevue/toast";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dialog from "primevue/dialog";
import TieredMenu from "primevue/tieredmenu";
import SpellActions from "./SpellActions.vue";

export default defineComponent({
  name: "SpellList",
  components: {
    AddSpell,
    Button,
    OverlayPanel,
    ToolBar,
    Toast,
    ConfirmPopup,
    DataTable,
    Column,
    SpellRecord,
    Dialog,
    SpellActions,
  },
  setup() {
    interface CharacterInterface {
      characterId: string;
      characterName: string;
    }
    const store = inject<IStore>("store");
    const loading = ref(true);
    const op = ref(null);
    const pickListRef = ref(null);
    const confirm = useConfirm();
    const toast = useToast();
    const editSpell = ref(false);
    const pickListTargets = ref();
    const pickListIndex = ref(0);
    const recordValue = ref<SpellObject>({} as SpellObject);
    const indexValue = ref(0);
    const tierMenuRef = ref();

    if (store === undefined) {
      serverLogger(
        LoggingTypes.alert,
        `Failed to inject store`,
        ComponentEnums.SPELLSTATE
      );
      throw new Error("Failed to inject store");
    }

    const spells = computed(() => store.getSpells());
    onBeforeUnmount(() => {
      store?.resetSpells(false);
    });
    onMounted(() => {
      store.getInitialSpells();
      serverLogger(
        LoggingTypes.info,
        `spells retrieved`,
        ComponentEnums.SPELLSTATE
      );
      setTimeout(() => {
        loading.value = false;
        serverLogger(
          LoggingTypes.info,
          `adding characterids`,
          ComponentEnums.SPELLSTATE
        );
      }, 500);
    });

    function toggle(event: any) {
      (op.value as any).toggle(event);
    }

    function tieredToggle(event: any, data: SpellObject, index: number) {
      pickListTargets.value = data.characterIds;
      pickListIndex.value = index;
      (tierMenuRef.value as any).toggle(event);
    }

    function togglePickList(event: any, index: number) {
      pickListTargets.value = spells.value[index].characterIds;
      pickListIndex.value = index;
      (pickListRef.value as any).toggle(event);
    }

    function addSpell(event: any, data: any) {
      toggle(event);
      serverLogger(
        LoggingTypes.info,
        `adding new spell`,
        ComponentEnums.SPELLSTATE
      );
      store?.addSpell(data);
    }

    const confirm1 = (event: any) => {
      confirm.require({
        target: event.currentTarget,
        message: "Are you sure you want to proceed?",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          serverLogger(
            LoggingTypes.debug,
            `Adding toast and resetting spells`,
            ComponentEnums.SPELLSTATE
          );
          store.resetSpells(true);
          toast.add({
            severity: "info",
            summary: "Confirmed",
            detail: "Spell Reset Accepted",
            life: 3000,
          });
        },
        reject: () => {
          serverLogger(
            LoggingTypes.debug,
            `Adding toast, rejected confirmation to reset spells`,
            ComponentEnums.SPELLSTATE
          );
          toast.add({
            severity: "error",
            summary: "Rejected",
            detail: "Spells Not Reset",
            life: 3000,
          });
        },
      });
    };

    function modalOpen(data: SpellObject, index: number) {
      recordValue.value = data;
      indexValue.value = index;
      editSpell.value = true;
    }

    return {
      store,
      loading,
      op,
      toggle,
      addSpell,
      spells,
      confirm1,
      pickListRef,
      togglePickList,
      modalOpen,
      editSpell,
      recordValue,
      indexValue,
      pickListTargets,
      pickListIndex,
      tierMenuRef,
      tieredToggle,
    };
  },
});
</script>

<style scoped>
.table-header {
  font-size: 2em;
}
.spell-items {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.spell-item {
  display: flex;
  justify-content: center;
  width: 100%;
  box-shadow: inset 0 1px 4px 0 rgba(77, 74, 74, 0.596),
    2px 1px 0 1px rgba(77, 74, 74, 0.247), -1px -1px 0 0 rgba(77, 74, 74, 0.247);
  border: 2px solid rgba(128, 128, 128, 0.555);
  background: linear-gradient(90deg, grey 0%, rgba(77, 74, 74, 0.247) 100%);
}
.spell-item:hover {
  border: 2px solid black;
}
.p-multiselect {
  width: 10vw;
}
:deep(.column-small-screen) {
  display: none;
}
@media only screen and (max-width: 480px) {
  :deep(.column-large-screen) {
    display: none;
  }
  :deep(.column-small-screen) {
    display: flex;
    justify-content: center;
  }
}
</style>
