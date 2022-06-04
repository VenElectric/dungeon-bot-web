<script setup lang="ts">
import { PropType, ref, defineProps, watchEffect } from "vue";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";
import serverLogger from "../../../Utils/LoggingClass";
import TieredMenu from "primevue/tieredmenu";
import Button from "primevue/button";
import DialogPopUp from "../DialogPopUp.vue";
import { SpellStoreInterface } from "../../../data/types";
import { createSpellMenu } from "../MenuItemSetup";
import Dialog from "primevue/dialog";

const props = defineProps({
  index: { type: Number, required: true },
});

const tierMenuRef = ref();
function toggleEdit(event: any) {
  (tierMenuRef.value as any).toggle(event);
}

const { menu, dialogRef, componentRef, headerText, indexRef } = createSpellMenu(
  props.index
);
</script>

<template>
  <Button icon="pi pi-ellipsis-v" @click="toggleEdit"></Button>
  <TieredMenu
    id="characterActions"
    ref="tierMenuRef"
    :model="menu"
    :popup="true"
  >
  </TieredMenu>
  <Dialog
    v-model:visible="dialogRef"
    :breakpoints="{ '960px': '75vw', '640px': '80vw' }"
    :header="headerText"
    :modal="true"
  >
    <DialogPopUp
      v-if="dialogRef"
      :index="indexRef"
      :componentRef="componentRef"
    ></DialogPopUp>
  </Dialog>
</template>

<style></style>
