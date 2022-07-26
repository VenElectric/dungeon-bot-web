<template>
  <Toast />
  <div class="w-max">
    <ToolBar class="shadow-8 button-toolbar-lg">
      <template #start>
        <div v-if="!isSorted">
          <Button
            label="Start Rounds"
            class="p-button-sm p-button-info"
            @click="initEmits.roundStart"
          ></Button>
        </div>
        <div v-else class="btn-cage">
          <Button
            label="Sort"
            class="p-button-sm p-button-info"
            @click="initEmits.reSort"
          />
          <Button
            label="Previous"
            class="p-button-sm p-button-info"
            @click="initEmits.previousTurn"
          />
          <Button
            label="Next"
            class="p-button-sm p-button-info"
            @click="initEmits.nextTurn"
          />
        </div>
      </template>
      <template #end>
        <ResetStore
          label="Initiative"
          :resetFunc="initSetters.resetInitiative"
          :emitFunc="initEmits.emitResetInitiative"
        />
        <Button
          type="button"
          label="Add Initiative"
          @click="toggleAdd"
          class="p-button-sm"
        />
        <OverlayPanel ref="op" :showCloseIcon="true" :dismissable="true">
          <InitiativeData :toggle="toggleAdd" />
        </OverlayPanel>
      </template>
    </ToolBar>
    <ToolBar class="shadow-8 button-toolbar-sm">
      <template #start>
        <ConfirmPopup></ConfirmPopup>
        <Button icon="pi pi-bars" @click="toggleHam" />
        <TieredMenu
          id="overlay_tmenu"
          ref="hamRef"
          :model="sortedMenuItems"
          :popup="true"
          v-if="isSorted"
        />
        <TieredMenu
          id="overlay_tmenu"
          ref="hamRef"
          :model="unsortedMenuItems"
          :popup="true"
          v-else
        />
      </template>
      <template #end>
        <Button icon="pi pi-plus" @click="toggleAdd"></Button>
        <OverlayPanel ref="op" :showCloseIcon="true" :dismissable="true">
          <InitiativeData :toggle="toggleAdd" />
        </OverlayPanel>
      </template>
    </ToolBar>
    <SortableList
      :initData="initData"
      :initEmits="initEmits"
      :initGetters="initGetters"
      :initSetters="initSetters"
    />
  </div>
</template>

<script setup lang="ts">
import { PropType, defineProps } from "vue";
import { InitiativeStoreInterface } from "../../../data/types";
import { ref } from "vue";
import OverlayPanel from "primevue/overlaypanel";
import ToolBar from "primevue/toolbar";
import Button from "primevue/button";
import SortableList from "./SortableList.vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import ConfirmPopup from "primevue/confirmpopup";
import Toast from "primevue/toast";
import serverLogger from "../../../Utils/LoggingClass";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";
import InitiativeData from "./InitiativeData.vue";
import { InitiativeObject } from "@/src/Interfaces/initiative";
import TieredMenu from "primevue/tieredmenu";
import ResetStore from "../ResetStore.vue";

const props = defineProps({
  initSetters: {
    type: Object as PropType<InitiativeStoreInterface["SETTERS"]>,
    required: true,
  },
  initGetters: {
    type: Object as PropType<InitiativeStoreInterface["GETTERS"]>,
    required: true,
  },
  initEmits: {
    type: Object as PropType<InitiativeStoreInterface["EMITS"]>,
    required: true,
  },
  initData: {
    type: Object as PropType<InitiativeObject[]>,
    required: true,
  },
});

const isSorted = ref(props.initGetters.getSorted());
const toast = useToast();
const confirm = useConfirm();
const op = ref(null);
const hamRef = ref(null);

function toggleAdd(event: any) {
  (op.value as any).toggle(event);
}

function toggleHam(event: any) {
  (hamRef.value as any).toggle(event);
}

function addCharacter(e: any, data: InitiativeObject) {
  // toggle add menu off
  toggleAdd(e);
  serverLogger(
    LoggingTypes.info,
    `adding toast and adding character`,
    ComponentEnums.INITIATIVESTATE
  );
  toast.add({
    severity: "info",
    summary: "Info Message",
    detail: `Adding ${data.characterName} to the list.`,
    life: 3000,
  });

  if (props.initGetters.getSorted().value === true) {
    props.initSetters.updateSorted(false);
    toast.add({
      severity: "warn",
      summary: "Reset",
      detail:
        "Sort has been reset due to added character. Click Round Start to sort.",
      life: 3000,
    });
  }
  try {
    props.initSetters.addCharacter(data);
    serverLogger(
      LoggingTypes.info,
      `adding toast and adding character`,
      ComponentEnums.INITIATIVESTATE
    );
  } catch (error) {
    if (error instanceof Error) {
      serverLogger(
        LoggingTypes.alert,
        error.message,
        ComponentEnums.INITIATIVESTATE
      );
    }
  }
}

const confirmReset = (event: MouseEvent) => {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: "Are you sure you want to proceed?",
    icon: "pi pi-exclamation-triangle",
    accept: () => {
      serverLogger(
        LoggingTypes.debug,
        `Adding toast and resetting Initiative`,
        `Reset Store`
      );
      props.initSetters.resetInitiative();
      props.initEmits.emitResetInitiative();
      toast.add({
        severity: "info",
        summary: "Confirmed",
        detail: `Initiative Reset Accepted`,
        life: 3000,
      });
    },
    reject: () => {
      serverLogger(
        LoggingTypes.debug,
        `Adding toast, rejected confirmation to reset Initiative`,
        `Reset Store`
      );
      toast.add({
        severity: "error",
        summary: "Rejected",
        detail: `Initiative Not Reset`,
        life: 3000,
      });
    },
  });
};

const sortedMenuItems = [
  {
    label: "Sort",
    icon: "pi pi-sync",
    command: () => {
      props.initEmits.reSort();
    },
  },
  {
    label: "Next",
    icon: "pi pi-angle-double-right",
    command: () => {
      props.initEmits.nextTurn();
    },
  },
  {
    label: "Previous",
    icon: "pi pi-angle-double-left",

    command: () => {
      props.initEmits.previousTurn();
    },
  },
  {
    label: "Reset Initiative",
    icon: "pi pi-trash",
    command: (e: any) => {
      confirmReset(e);
    },
  },
];

const unsortedMenuItems = [
  {
    label: "Round Start",
    icon: "pi pi-caret-right",
    command: () => {
      props.initEmits.roundStart();
    },
  },
];
</script>

<style>
.record {
  width: 100%;
  border: 2px solid black;
}
.btn-cage {
  display: flex;
  justify-content: space-between;
}

.p-button-sm {
  font-size: 0.7em !important;
}
.button-toolbar-lg {
  display: flex !important;
}
.button-toolbar-sm {
  display: none !important;
}
@media only screen and (max-width: 480px) {
  .button-toolbar-lg {
    display: none !important;
  }
  .button-toolbar-sm {
    display: flex !important;
  }
}
</style>
