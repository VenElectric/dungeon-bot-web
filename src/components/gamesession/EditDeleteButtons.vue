<script setup lang="ts">
import { SpellObject } from "../../Interfaces/Spells";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { ref, defineProps, PropType, computed } from "vue";
import DialogPopUp from "./DialogPopUp.vue";
import { InitiativeObject } from "../../Interfaces/initiative";
import { ComponentIs } from "./componentTypes";

const props = defineProps({
  deleteItem: {
    type: Function as PropType<(id: string) => void>,
    required: true,
  },
  index: { type: Number, required: true },
  getRecord: {
    type: Function as PropType<
      ((index: number) => InitiativeObject) | ((index: number) => SpellObject)
    >,
    required: true,
  },
  emitDeleteFunction: {
    type: Function as PropType<(docId: string) => void>,
    required: true,
  },
  saveFunction: {
    type: Function as PropType<
      ((data: InitiativeObject) => void) | ((data: SpellObject) => void)
    >,
    required: true,
  },
  emitSaveFunction: {
    type: Function as PropType<
      ((data: InitiativeObject) => void) | ((data: SpellObject) => void)
    >,
    required: true,
  },
  componentType: {
    type: String as PropType<ComponentIs>,
    required: true,
  },
});

console.log(props.index);

const record = ref(props.getRecord(props.index));

function emitAndDelete() {
  props.deleteItem(record.value.id);
  props.emitDeleteFunction(record.value.id);
}

const headerText = computed(() => {
  return props.componentType == ComponentIs.InitiativeForm
    ? "Edit Initiative"
    : "Edit Spell";
});

const modalRef = ref(false);
const toggle = () => {
  modalRef.value = true;
};
</script>

<template>
  <Button
    icon="pi pi-pencil"
    class="p-button-rounded p-button-success mr-2"
    @click="toggle"
  />
  <Button
    icon="pi pi-trash"
    class="p-button-rounded p-button-danger"
    @click="() => emitAndDelete()"
  />
  <Dialog
    v-model:visible="modalRef"
    :style="{ width: '450px' }"
    :header="headerText"
    :modal="true"
  >
    <dialog-pop-up :index="index" :componentRef="componentType" />
  </Dialog>
</template>
