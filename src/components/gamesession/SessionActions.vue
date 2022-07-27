<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { ref } from "vue";
import INITIATIVE_FUNCS from "../../data/initiativeStore";
import SPELL_FUNCS from "../../data/spellStore";
import { toDiscord } from "../../data/utilities";
import { CollectionTypes } from "../../Interfaces/ContextEnums";
import { LoggingTypes, ComponentEnums } from "../../Interfaces/LoggingTypes";
import serverLogger from "../../Utils/LoggingClass";
import CustomRoll from "./rolls/CustomRoll.vue";
import ConfirmPopup from "primevue/confirmpopup";

const toast = useToast();
const display = ref(false);
const confirm = useConfirm();

function spellMessage() {
  toDiscord(CollectionTypes.SPELLS);
  toast.add({
    severity: "success",
    summary: "Success Message",
    detail: "Spells Sent to Discord",
    life: 3000,
  });
  serverLogger(
    LoggingTypes.info,
    `Adding toast and sending spells to discord`,
    ComponentEnums.GAMESESSION
  );
}
function initiativeMessage() {
  toDiscord(CollectionTypes.INITIATIVE);
  toast.add({
    severity: "success",
    summary: "Success Message",
    detail: "Initiative Sent to Discord",
    life: 3000,
  });
  serverLogger(
    LoggingTypes.info,
    `Adding toast and sending initiative to discord`,
    ComponentEnums.GAMESESSION
  );
}

const modalOpen = () => {
  display.value = true;
};

const confirmReset = (event: any) => {
  confirm.require({
    target: event.currentTarget,
    message: "Are you sure you want to proceed?",
    icon: "pi pi-exclamation-triangle",
    accept: () => {
      serverLogger(
        LoggingTypes.debug,
        `Adding toast and resetting game session`,
        ComponentEnums.GAMESESSION
      );
      INITIATIVE_FUNCS.SETTERS.resetInitiative();
      SPELL_FUNCS.SETTERS.resetSpells();
      INITIATIVE_FUNCS.EMITS.emitResetInitiative();
      SPELL_FUNCS.EMITS.emitResetSpells();
      toast.add({
        severity: "info",
        summary: "Confirmed",
        detail: "Session Reset Accepted",
        life: 3000,
      });
    },
    reject: () => {
      serverLogger(
        LoggingTypes.debug,
        `Adding toast, rejected confirmation to reset game session`,
        ComponentEnums.GAMESESSION
      );
      toast.add({
        severity: "info",
        summary: "Rejected",
        detail: "Session Not Reset",
        life: 3000,
      });
    },
  });
};
</script>

<template>
  <Button
    label="Discord: Spells"
    class="p-button p-button-info p-button-sm"
    @click="spellMessage"
  />
  <Button
    label="Discord: Initiative"
    class="p-button p-button-info p-button-sm"
    @click="initiativeMessage"
  />
  <Button
    label="Clear Session"
    v-tooltip.top="'This will clear all Spells and Initiative'"
    @click="(e) => confirmReset(e)"
    class="p-button p-button-info p-button-sm"
  />
  <Button
    label="Custom Rolls"
    @click="modalOpen"
    class="p-button p-button-info p-button-sm"
  />

  <Dialog
    v-model:visible="display"
    :style="{ width: '450px' }"
    header="Custom Rolls"
  >
    <CustomRoll></CustomRoll>
  </Dialog>
<ConfirmPopup autoZIndex="false" />

</template>

<style>
.p-confirm-popup.p-component.p-ripple-disabled {
  z-index: 2000 !important;
}
</style>