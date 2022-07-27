<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getSocket } from "../../../data/sessionStore";
import INIT_FUNCS from "../../../data/initiativeStore";
import { InitiativeObject } from "../../../Interfaces/initiative";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";
import { EmitTypes } from "../../../Interfaces/EmitTypes";
import serverLogger from "../../../Utils/LoggingClass";
import { useToast } from "primevue/usetoast";
import SPELL_FUNCS from "../../../data/spellStore";
import ROLL_FUNCS from "../../../data/rollStore";
import Toast from "primevue/toast";
import Dialog from "primevue/dialog";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { RollObject } from "../../../Interfaces/Rolls";

const toast = useToast();
const socket = getSocket();

const display = ref(false);
const currentName = ref();
const statuses = ref();
const isArray = ref();

const columns = [
  { field: "spellName", header: "Name" },
  { field: "effectDescription", header: "Description" },
];

onMounted(() => {
  console.log("Mounted Socket Receiver");
  socket.on(EmitTypes.UPDATE_SESSION, (isSorted: boolean) => {
    if (isSorted === undefined) {
      console.log("undefined");
      /// logic here to retrieve session data
    }
    serverLogger(
      LoggingTypes.debug,
      `${EmitTypes.UPDATE_SESSION} Updating isSorted: ${isSorted}`,
      ComponentEnums.SOCKETRECEIVER
    );
    try {
      INIT_FUNCS.SETTERS.updateSorted(isSorted);
    } catch (error) {
      if (error instanceof Error) {
        serverLogger(
          LoggingTypes.alert,
          error.message,
          ComponentEnums.SOCKETRECEIVER
        );
      }
    }
  });

  socket?.on(EmitTypes.CREATE_NEW_INITIATIVE, (data: InitiativeObject) => {
    /// check if any data is undefined and then send a request to server for updating initiative list.
    const isSorted = INIT_FUNCS.GETTERS.getSorted();
    if (isSorted) {
      INIT_FUNCS.SETTERS.updateSorted(false);
      toast.add({
        severity: "warn",
        summary: "Warning Message",
        detail:
          "Initiative has been reset. Please click Round Start to resort.",
        life: 3000,
      });
    }
    serverLogger(
      LoggingTypes.info,
      `${EmitTypes.CREATE_NEW_INITIATIVE} toast added`,
      ComponentEnums.SOCKETRECEIVER,
      data.id
    );
    try {
      INIT_FUNCS.SETTERS.alltoFalse();
      INIT_FUNCS.SETTERS.addCharacter(data);
      serverLogger(
        LoggingTypes.debug,
        `${EmitTypes.CREATE_NEW_INITIATIVE} added initiative to list`,
        ComponentEnums.SOCKETRECEIVER,
        data.id
      );
    } catch (error) {
      if (error instanceof Error) {
        serverLogger(
          LoggingTypes.alert,
          `${error.message} at ${EmitTypes.CREATE_NEW_INITIATIVE}`,
          ComponentEnums.SOCKETRECEIVER
        );
      }
    }
  });

  socket?.on(EmitTypes.UPDATE_RECORD_INITIATIVE, (data: InitiativeObject) => {
    try {
      serverLogger(
        LoggingTypes.debug,
        `${EmitTypes.UPDATE_RECORD_INITIATIVE} updating initiative`,
        ComponentEnums.SOCKETRECEIVER,
        data.id
      );
      INIT_FUNCS.SETTERS.updateCharacterRecord(data);
      serverLogger(
        LoggingTypes.debug,
        `${EmitTypes.UPDATE_RECORD_INITIATIVE}  update complete`,
        ComponentEnums.SOCKETRECEIVER
      );
      return;
    } catch (error) {
      if (error instanceof Error) {
        serverLogger(
          LoggingTypes.alert,
          `${error.message} at ${EmitTypes.UPDATE_RECORD_INITIATIVE}`,
          ComponentEnums.SOCKETRECEIVER
        );
      }
    }
  });

  socket?.on(
    EmitTypes.UPDATE_ALL_INITIATIVE,
    (data: { payload: InitiativeObject[]; isSorted: boolean }) => {
      /// check if any data is undefined and then send a request to server for updated initiative list.
      if (data.payload.length < 1) {
        return;
      }
      serverLogger(
        LoggingTypes.info,
        `${EmitTypes.UPDATE_ALL_INITIATIVE} updating all initiative`,
        ComponentEnums.SOCKETRECEIVER,
        data.payload[0].id
      );
      try {
        INIT_FUNCS.SETTERS.updateAllInitiative(data.payload);
        serverLogger(
          LoggingTypes.info,
          `${EmitTypes.UPDATE_ALL_INITIATIVE} update complete`,
          ComponentEnums.SOCKETRECEIVER,
          data.payload[0].id
        );
        if (data.isSorted !== undefined) {
          serverLogger(
            LoggingTypes.info,
            `${EmitTypes.UPDATE_ALL_INITIATIVE} updating isSorted`,
            ComponentEnums.SOCKETRECEIVER,
            data.payload[0].id
          );
          INIT_FUNCS.SETTERS.updateSorted(data.isSorted);
          serverLogger(
            LoggingTypes.info,
            `${EmitTypes.UPDATE_ALL_INITIATIVE} isSorted updated: ${data.isSorted}`,
            ComponentEnums.SOCKETRECEIVER,
            data.payload[0].id
          );
          return;
        }
      } catch (error) {
        if (error instanceof Error) {
          serverLogger(
            LoggingTypes.alert,
            `${error.message} at ${EmitTypes.UPDATE_ALL_INITIATIVE}`,
            ComponentEnums.SOCKETRECEIVER
          );
        }
      }
    }
  );

  socket.on(EmitTypes.DELETE_ONE_INITIATIVE, (docId: string) => {
    serverLogger(
      LoggingTypes.info,
      `${EmitTypes.DELETE_ONE_INITIATIVE} deleting`,
      ComponentEnums.SOCKETRECEIVER,
      docId
    );

    try {
      serverLogger(
        LoggingTypes.debug,
        `${EmitTypes.DELETE_ONE_INITIATIVE} deleting initiative`,
        ComponentEnums.SOCKETRECEIVER,
        docId
      );
      INIT_FUNCS.SETTERS.deleteInitiative(docId);
      SPELL_FUNCS.SETTERS.removeCharacterFromSpells(docId);
      toast.add({
        severity: "warn",
        summary: "Warning Message",
        detail:
          "Initiative has been reset. Please click Round Start to Resort.",
        life: 3000,
      });
      serverLogger(
        LoggingTypes.info,
        `${EmitTypes.DELETE_ONE_INITIATIVE} toast added, init deletion completed`,
        ComponentEnums.SOCKETRECEIVER,
        docId
      );
      return;
    } catch (error) {
      if (error instanceof Error) {
        serverLogger(
          LoggingTypes.alert,
          `${error.message} at ${EmitTypes.DELETE_ONE_INITIATIVE}`,
          ComponentEnums.SOCKETRECEIVER
        );
      }
    }
  });
  socket.on(EmitTypes.DELETE_ALL_INITIATIVE, () => {
    try {
      INIT_FUNCS.SETTERS.resetInitiative();
      SPELL_FUNCS.SETTERS.removeAllCharactersFromSpells();
      toast.add({
        severity: "warn",
        summary: "Warning Message",
        detail: "Rounds have been reset.",
        life: 3000,
      });
      serverLogger(
        LoggingTypes.info,
        `${EmitTypes.DELETE_ALL_INITIATIVE} reset complete`,
        ComponentEnums.SOCKETRECEIVER
      );
    } catch (error) {
      if (error instanceof Error) {
        serverLogger(
          LoggingTypes.alert,
          `${error.message} at ${EmitTypes.DELETE_ALL_INITIATIVE}`,
          ComponentEnums.SOCKETRECEIVER
        );
      }
    }
  });
  socket.on(EmitTypes.NEXT, (record: InitiativeObject) => {
    try {
      INIT_FUNCS.SETTERS.alltoFalse();
      INIT_FUNCS.SETTERS.updateCharacterRecord(record);
      serverLogger(
        LoggingTypes.debug,
        `${EmitTypes.NEXT} update record complete`,
        ComponentEnums.SOCKETRECEIVER,
        record.id
      );
      currentName.value = record.characterName;
      if (record.statusEffects.length >= 1) {
        statuses.value = record.statusEffects;
        isArray.value = true;
      } else {
        isArray.value = false;
      }
      display.value = true;
      console.log("next");
      serverLogger(
        LoggingTypes.info,
        `${EmitTypes.NEXT} modal launched`,
        ComponentEnums.SOCKETRECEIVER,
        record.id
      );
    } catch (error) {
      if (error instanceof Error) {
        serverLogger(
          LoggingTypes.alert,
          `${error.message} at ${EmitTypes.NEXT}`,
          ComponentEnums.SOCKETRECEIVER
        );
      }
    }
  });
  socket.on(EmitTypes.PREVIOUS, (record: InitiativeObject) => {
    try {
      INIT_FUNCS.SETTERS.alltoFalse();
      INIT_FUNCS.SETTERS.updateCharacterRecord(record);
      serverLogger(
        LoggingTypes.info,
        `${EmitTypes.PREVIOUS} update complete`,
        ComponentEnums.SOCKETRECEIVER,
        record.id
      );
      currentName.value = record.characterName;
      if (record.statusEffects.length >= 1) {
        statuses.value = record.statusEffects;
        isArray.value = true;
      } else {
        isArray.value = false;
      }
      display.value = true;
      serverLogger(
        LoggingTypes.info,
        `${EmitTypes.PREVIOUS} modal launched`,
        ComponentEnums.SOCKETRECEIVER,
        record.id
      );
    } catch (error) {
      if (error instanceof Error) {
        serverLogger(
          LoggingTypes.alert,
          `${error.message} at ${EmitTypes.PREVIOUS}`,
          ComponentEnums.SOCKETRECEIVER
        );
      }
    }
  });
  socket?.on(EmitTypes.ROUND_START, () => {
    toast.add({
      severity: "info",
      summary: "Round Start",
      detail: "Initiative has been sorted. Rounds have started.",
      life: 3000,
    });
  });
  socket.on(EmitTypes.CREATE_NEW_ROLL, (data: RollObject) => {
    ROLL_FUNCS.SETTERS.pushNewRoll(data);
  });
  socket.on(EmitTypes.UPDATE_ROLL_RECORD, (data: RollObject) => {
    const rollIndex = ROLL_FUNCS.GETTERS.getRollIndexbyId(data.id);
    ROLL_FUNCS.SETTERS.updateRoll(data, rollIndex);
  });
  socket.on(EmitTypes.DELETE_ONE_ROLL, (docId: string) => {
    const rollIndex = ROLL_FUNCS.GETTERS.getRollIndexbyId(docId);
    ROLL_FUNCS.SETTERS.deleteRoll(rollIndex);
  });
});
</script>

<template>
  <Dialog
    v-model:visible="display"
    header="Turn Status"
    :closable="true"
    :dismissableMask="true"
  >
    <h3>Current Turn: {{ currentName }}</h3>
    <div v-if="isArray" class="status-container">
      <DataTable :value="statuses" class="shadow-8 p-datatable-sm">
        <Column
          v-for="col of columns"
          :field="col.field"
          :header="col.header"
          :key="col.field"
        />
      </DataTable>
    </div>
    <div v-else>No Status Effects</div>
  </Dialog>
</template>

<style scoped>
.status-container {
  display: flex;
  flex-direction: column;
  align-content: center;
  width: 10vw;
}
</style>
