<script setup lang="ts">
import { SpellObject } from "../../../Interfaces/initiative";
import { PropType, ref, defineProps, inject } from "vue";
import { IStore } from "../../../data/types";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";
import serverLogger from "../../../Utils/LoggingClass";
import TieredMenu from "primevue/tieredmenu";
import SpellEffectIcon from "./SpellEffectIcon.vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import SpellRecord from "./SpellRecord.vue";

const props = defineProps({
  spellData: { type: Object as PropType<SpellObject>, required: true },
  index: { type: Number, required: true },
  modalOpen: { type: Function, required: true },
});

const store = inject<IStore>("store");
const indexRef = ref(props.index);
const record = ref(props.spellData);
const editStatuses = ref(false);

if (store === undefined) {
  serverLogger(
    LoggingTypes.alert,
    `Failed to inject store`,
    ComponentEnums.INITIATIVESTATE
  );
  throw new Error("Failed to inject store");
}

const editRef = ref();
function toggleEdit(event: any) {
  (editRef.value as any).toggle(event);
}

function targetOpen() {
  editStatuses.value = true;
}

const menuItems = [
  {
    label: "Edit",
    icon: "pi pi-pencil",
    command: () => props.modalOpen(record.value),
  },
  {
    label: "Delete",
    icon: "pi pi-trash",
    command: () => {
      store.removeSpell(indexRef.value, record.value.id, true);
    },
  },
  {
    label: "Targets",
    icon: "pi pi-users",
    command: () => {
      targetOpen();
    },
  },
];
</script>

<template>
  <Button icon="pi pi-ellipsis-v" @click="toggleEdit"></Button>
  <TieredMenu
    id="characterActions"
    ref="editRef"
    :model="menuItems"
    :popup="true"
  >
  </TieredMenu>
  <Dialog
    v-model:visible="editStatuses"
    :style="{ width: '450px' }"
    header="Spell Targets"
    :modal="true"
  >
    <SpellRecord
      :characterIds="record.characterIds"
      :index="indexRef"
    ></SpellRecord>
  </Dialog>
</template>

<style></style>
