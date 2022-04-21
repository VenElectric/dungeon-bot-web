<template>
  <SocketReceiver />
  <Toolbar class="shadow-8">
    <template #start>
      <Toast />
      <ConfirmPopup></ConfirmPopup>
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
        @click="(e) => confirm1(e)"
        class="p-button p-button-info p-button-sm"
      />
      <Button
        label="Custom Rolls"
        @click="modalOpen"
        class="p-button p-button-info p-button-sm"
      />
    </template>
  </Toolbar>

  <div class="session-large flex-row flex-wrap justify-content-evenly">
    <!-- Initiative List -->
    <div class="flex flex-column column-container md:col-4">
      <h1>Initiative List</h1>
      <InitiativeState></InitiativeState>
    </div>
    <!-- Spell List -->

    <div class="flex flex-column column-container md:col-4">
      <h1>Spell List</h1>
      <SpellState></SpellState>
    </div>
  </div>
  <div class="session-small mt-4">
    <TabView>
      <TabPanel header="Initiative">
        <div class="flex flex-column column-container">
          <InitiativeState />
        </div>
      </TabPanel>
      <TabPanel header="Spells">
        <div class="flex flex-column column-container">
          <SpellState />
        </div>
      </TabPanel>
    </TabView>
  </div>
  <Dialog
    v-model:visible="display"
    :style="{ width: '450px' }"
    header="Custom Rolls"
    :modal="true"
    ><CustomRoll></CustomRoll
  ></Dialog>
</template>

<script lang="ts">
import { defineComponent, ref, inject, onMounted } from "vue";
import { useRoute } from "vue-router";
import InitiativeState from "../components/gamesession/initiative/InitiativeState.vue";
import Toolbar from "primevue/toolbar";
import Button from "primevue/button";
import { IStore } from "../data/types";
import SpellState from "../components/gamesession/spells/SpellState.vue";
import { CollectionTypes } from "../Interfaces/ContextEnums";
import SocketReceiver from "../components/gamesession/SocketReceiver.vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import ConfirmPopup from "primevue/confirmpopup";
import Toast from "primevue/toast";
import serverLogger from "../Utils/LoggingClass";
import { LoggingTypes, ComponentEnums } from "../Interfaces/LoggingTypes";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import Dialog from "primevue/dialog";
import CustomRoll from "../components/gamesession/CustomRoll.vue";
import { updateId } from "../data/sessionStore";

// css to make columns instead of rows for each item (init, spell, info)
export default defineComponent({
  name: "GameSession",
  components: {
    Toolbar,
    Button,
    InitiativeState,
    SpellState,
    SocketReceiver,
    ConfirmPopup,
    Toast,
    TabView,
    TabPanel,
    Dialog,
    CustomRoll,
  },
  setup() {
    const route = useRoute();
    const store = inject<IStore>("store");
    const message = ref();
    const display = ref(false);
    const confirm = useConfirm();
    const toast = useToast();
    const paramsId = String(route.params.id);
    if (store && paramsId) {
      store.updateId(paramsId);
      updateId(paramsId);
      serverLogger(
        LoggingTypes.debug,
        `updating session Id`,
        ComponentEnums.GAMESESSION,
        paramsId
      );
    }
    if (store === undefined) {
      serverLogger(
        LoggingTypes.alert,
        `Failed to inject store`,
        ComponentEnums.GAMESESSION
      );
      throw new Error("Failed to inject store");
    }
    let op = ref(null);

    function spellMessage() {
      store?.toDiscord(CollectionTypes.SPELLS);
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
      store?.toDiscord(CollectionTypes.INITIATIVE);
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

    const confirm1 = (event: any) => {
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
          store.resetAll(true);
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
            severity: "error",
            summary: "Rejected",
            detail: "Session Not Reset",
            life: 3000,
          });
        },
      });
    };

    onMounted(() => {
      if (paramsId !== undefined) {
        store.roomSetup();
        store.getInitialRolls();
        serverLogger(
          LoggingTypes.info,
          `Onmounted, sending emit to create room`,
          ComponentEnums.GAMESESSION
        );
      }
    });

    return {
      spellMessage,
      initiativeMessage,
      confirm1,
      display,
      modalOpen,
    };
  },
});
</script>

<style>
.column-container {
  width: fit-content;
}
.p-tooltip-text {
  font-size: 0.8em;
}
.message-container {
  font-size: 1em !important;
}
.p-message-icon {
  font-size: 1em !important;
}
.p-message {
  font-size: 1em !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  padding-left: 0.1em !important;
  padding-right: 0.2em !important;
  margin: 0 !important;
}
.p-message-wrapper {
  font-size: 1em !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  padding-left: 0.1em !important;
  padding-right: 0.2em !important;
  margin: 0 !important;
}
.session-large {
  display: flex !important;
}
.session-small {
  display: none !important;
}
@media only screen and (max-width: 480px) {
  .session-large {
    display: none !important;
  }
  .session-small {
    display: flex !important;
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>
