<script setup lang="ts">
import { onUnmounted, PropType, Ref, ref, watchEffect } from "vue";
import SPELL_FUNCS from "../../data/spellStore";
import INITIATIVE_FUNCS from "../../data/initiativeStore";
import { toDiscord } from "../../data/utilities";
import { CollectionTypes } from "../../Interfaces/ContextEnums";
import { LoggingTypes, ComponentEnums } from "../../Interfaces/LoggingTypes";
import serverLogger from "../../Utils/LoggingClass";
import { useToast } from "primevue/usetoast";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Toolbar from "primevue/toolbar";
import { useConfirm } from "primevue/useconfirm";
import CustomRoll from "./rolls/CustomRoll.vue";
import CardContainer from "./card-system/CardContainer.vue";
import ConfirmPopup from "primevue/confirmpopup";
import { getWindowWidth } from "../../data/windowStore";
import MobileSidebar from "./mobile/MobileSidebar.vue";

const toast = useToast();
const display = ref(false);
const confirm = useConfirm();

const props = defineProps({
  windowProp: { type: Number, required: true },
});

const windowSize = ref(props.windowProp);

const stop = watchEffect(() => (windowSize.value = props.windowProp));

function zIndexStyle() {
  const styleIndex = windowSize.value > 1000 ? "z-index: 2000" : ""
  console.log(styleIndex)
  return styleIndex
}

onUnmounted(() => stop());

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
  <Toolbar class="shadow-8">
    <template #start>
      <div v-if="windowSize > 1000">
      <slot></slot>
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
      </div>
      <div v-if="windowSize < 1000">
        <MobileSidebar>
          <div class="flex flex-column gap-6 mt-5 mx-auto w-12">
            <slot></slot>
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
            <CardContainer />
          </div>
        </MobileSidebar>
      </div>
    </template>
    <template #end>
      <slot></slot>
      <CardContainer v-if="windowSize > 1000" />
    </template>
  </Toolbar>
  <Dialog
    v-model:visible="display"
    :style="{ width: '450px' }"
    header="Custom Rolls"
  >
    <CustomRoll></CustomRoll>
  </Dialog>
<ConfirmPopup :style="zIndexStyle" autoZIndex="false" />
</template>

<style>
.p-confirm-popup.p-component.p-ripple-disabled {
  z-index: 2000 !important;
}
</style>
