<script setup lang="ts">
import { InitiativeObject } from "../../../Interfaces/initiative";
import OverlayPanel from "primevue/overlaypanel";
import { PropType, ref, defineProps, inject } from "vue";
import { IStore } from "../../../data/types";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";
import serverLogger from "../../../Utils/LoggingClass";
import TieredMenu from "primevue/tieredmenu";
import SpellEffectIcon from "./SpellEffectIcon.vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";

const props = defineProps({
  characterData: { type: Object as PropType<InitiativeObject>, required: true },
  index: { type: Number, required: true },
  modalOpen: { type: Function, required: true },
});

const store = inject<IStore>("store");
const indexRef = ref(props.index);
const record = ref(props.characterData);
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

function modalOpen() {
  editStatuses.value = true;
}

function modalClose() {
  editStatuses.value = false;
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
      store.removeCharacter(indexRef.value, record.value.id, true);
    },
  },
  {
    label: "Status Effects",
    icon: "pi pi-exclamation-triangle",
    command: () => {
      modalOpen();
    },
  },
  {
    label: "Set as Current",
    icon: "pi pi-arrow-circle-right",
    command: () => {
      store.setCurrent(indexRef.value);
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
    header="Edit Initiative"
    :modal="true"
  >
    <SpellEffectIcon :statusEffects="record.statusEffects"></SpellEffectIcon>
  </Dialog>
</template>

<style></style>
