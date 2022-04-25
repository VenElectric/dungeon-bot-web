<template>
  <Toast />
  <div v-if="!loading">
    <div class="w-max">
      <ToolBar class="shadow-8 button-toolbar-lg">
        <template #start>
          <div v-if="!isSorted">
            <Button
              label="Start Rounds"
              class="p-button-sm p-button-info"
              @click="store.roundStart"
            ></Button>
          </div>
          <div v-else class="btn-cage">
            <Button
              label="Sort"
              class="p-button-sm p-button-info"
              @click="store.reSort"
            />
            <Button
              label="Previous"
              class="p-button-sm p-button-info"
              @click="store.previousTurn"
            />
            <Button
              label="Next"
              class="p-button-sm p-button-info"
              @click="store.nextTurn"
            />
          </div>
        </template>
        <template #end>
          <ConfirmPopup></ConfirmPopup>
          <Button
            type="button"
            label="Clear Initiative"
            @click="(e) => confirm1(e)"
            class="p-button-sm"
          />
          <!-- <ResetStore
            label="Spells"
            :resetFunc="store.resetInitiative"
            :emitFunc="store."
          /> -->
          <Button
            type="button"
            label="Add Initiative"
            @click="toggleAdd"
            class="p-button-sm"
          />
          <OverlayPanel ref="op" :showCloseIcon="true" :dismissable="true">
            <InitiativeData :saveCharacter="addCharacter" />
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
            <InitiativeData :saveCharacter="addCharacter" />
          </OverlayPanel>
        </template>
      </ToolBar>
      <SortableList></SortableList>
    </div>
  </div>
  <div class="record" v-else>
    <Skeleton width="100%" height="2rem" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, inject, watch, computed } from "vue";
import OverlayPanel from "primevue/overlaypanel";
import ToolBar from "primevue/toolbar";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import { IStore, RollStoreInterface } from "../../../data/types";
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

export default defineComponent({
  name: "InitiativeState",
  components: {
    OverlayPanel,
    ToolBar,
    Button,
    Skeleton,
    SortableList,
    Toast,
    ConfirmPopup,
    InitiativeData,
    TieredMenu,
  },
  setup() {
    const store = inject<IStore>("store");
    const rollData = inject<RollStoreInterface>("rollData");
    const loading = ref(true);
    const isSorted = computed({
      get() {
        return store?.getSorted();
      },
      set(newValue) {
        newValue;
      },
    });
    const toast = useToast();
    const confirm = useConfirm();
    const op = ref(null);
    const hamRef = ref(null);
    if (store === undefined) {
      serverLogger(
        LoggingTypes.alert,
        `Failed to inject store`,
        ComponentEnums.INITIATIVESTATE
      );
      throw new Error("Failed to inject store");
    }
    const initiativeList = computed(() => store.getInitiative());

    onMounted(() => {
      loading.value = true;
      store.getInitial();
      rollData?.ROLL_FUNCS.SETTERS.getInitialRolls();
      serverLogger(
        LoggingTypes.info,
        `retrieved initial init state`,
        ComponentEnums.INITIATIVESTATE
      );
      setTimeout(() => {
        loading.value = false;
        serverLogger(
          LoggingTypes.info,
          `loading complete`,
          ComponentEnums.INITIATIVESTATE
        );
      }, 500);
    });

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

      if (store?.getSorted() === true) {
        store?.updateSorted(false);
        toast.add({
          severity: "warn",
          summary: "Reset",
          detail:
            "Sort has been reset due to added character. Click Round Start to sort.",
          life: 3000,
        });
      }
      try {
        store?.addCharacter(data);
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

    const confirm1 = (event: any) => {
      confirm.require({
        target: event.currentTarget,
        message: "Are you sure you want to proceed?",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          serverLogger(
            LoggingTypes.debug,
            `Adding toast and resetting initiative`,
            ComponentEnums.INITIATIVESTATE
          );
          store.resetInitiative(true);
          toast.add({
            severity: "info",
            summary: "Confirmed",
            detail: "Initiative Reset Accepted",
            life: 3000,
          });
        },
        reject: () => {
          serverLogger(
            LoggingTypes.debug,
            `Adding toast, rejected confirmation to reset initiative`,
            ComponentEnums.INITIATIVESTATE
          );
          toast.add({
            severity: "error",
            summary: "Rejected",
            detail: "Initiative Not Reset",
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
          store.reSort();
        },
      },
      {
        label: "Next",
        icon: "pi pi-angle-double-right",
        command: () => {
          store.nextTurn();
        },
      },
      {
        label: "Previous",
        icon: "pi pi-angle-double-left",

        command: () => {
          store.previousTurn();
        },
      },
      {
        label: "Reset Initiative",
        icon: "pi pi-trash",
        command: (e: any) => {
          confirm1(e);
        },
      },
    ];

    const unsortedMenuItems = [
      {
        label: "Round Start",
        icon: "pi pi-caret-right",
        command: () => {
          store.roundStart();
        },
      },
    ];
    return {
      loading,
      store,
      toggleAdd,
      op,
      addCharacter,
      confirm1,
      isSorted,
      initiativeList,
      sortedMenuItems,
      unsortedMenuItems,
      hamRef,
      toggleHam,
    };
  },
});
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
