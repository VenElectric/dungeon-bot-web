<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getSocket } from "../../../data/sessionStore";
import INIT_FUNCS from "../../../data/initiativeStore";
import { InitiativeObject } from "../../../Interfaces/initiative";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";
import { EmitTypes } from "../../../Interfaces/EmitTypes";
import serverLogger from "../../../Utils/LoggingClass";
import ROLL_FUNCS from "../../../data/rollStore";
import { RollObject } from "../../../Interfaces/Rolls";

const socket = getSocket();

onMounted(() => {
  socket.on(EmitTypes.CREATE_NEW_ROLL, (data: RollObject) => {
    serverLogger(LoggingTypes.info,"adding new roll to store",EmitTypes.CREATE_NEW_ROLL)
    ROLL_FUNCS.SETTERS.pushNewRoll(data);
  });
  socket.on(EmitTypes.UPDATE_ROLL_RECORD, (data: RollObject) => {
    const rollIndex = ROLL_FUNCS.GETTERS.getRollIndexbyId(data.id);
    serverLogger(LoggingTypes.info,"updating roll record",EmitTypes.UPDATE_ROLL_RECORD)
    ROLL_FUNCS.SETTERS.updateRoll(data, rollIndex);
  });
  socket.on(EmitTypes.DELETE_ONE_ROLL, (docId: string) => {
    const rollIndex = ROLL_FUNCS.GETTERS.getRollIndexbyId(docId);
    serverLogger(LoggingTypes.info,"deleting roll from store",EmitTypes.DELETE_ONE_ROLL)
    ROLL_FUNCS.SETTERS.deleteRoll(rollIndex);
  });
});
</script>

<template>
  <!-- <Dialog
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
  </Dialog> -->
</template>

<style scoped>
.status-container {
  display: flex;
  flex-direction: column;
  align-content: center;
  width: 10vw;
}
</style>
