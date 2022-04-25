<script setup lang="ts">
import Button from "primevue/button";
import { defineProps, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import serverLogger from "../../Utils/LoggingClass";
import { LoggingTypes, ComponentEnums } from "../../Interfaces/LoggingTypes";

const confirm = useConfirm();
const toast = useToast();

const props = defineProps({
  label: { type: String, required: true },
  resetFunc: { type: Function, required: true },
  emitFunc: { type: Function, required: true },
});

const buttonLabel = ref(`Clear ${props.label}`);

const confirmReset = (event: MouseEvent) => {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: "Are you sure you want to proceed?",
    icon: "pi pi-exclamation-triangle",
    accept: () => {
      serverLogger(
        LoggingTypes.debug,
        `Adding toast and resetting ${props.label}`,
        `Reset Store`
      );
      props.resetFunc();
      props.emitFunc();
      toast.add({
        severity: "info",
        summary: "Confirmed",
        detail: `${props.label} Reset Accepted`,
        life: 3000,
      });
    },
    reject: () => {
      serverLogger(
        LoggingTypes.debug,
        `Adding toast, rejected confirmation to reset ${props.label}`,
        `Reset Store`
      );
      toast.add({
        severity: "error",
        summary: "Rejected",
        detail: `${props.label} Not Reset`,
        life: 3000,
      });
    },
  });
};
</script>

<template>
  <Button
    type="button"
    :label="buttonLabel"
    @click="(e) => confirmReset(e)"
    class="p-button-sm"
  />
</template>
