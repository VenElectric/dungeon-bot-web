<script setup lang="ts">
import { getSocket } from "../../../data/sessionStore";
import SPELL_FUNCS from "../../../data/spellStore";
import { SpellObject } from "../../../Interfaces/Spells";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";
import { EmitTypes } from "../../../Interfaces/EmitTypes";
import serverLogger from "../../../Utils/LoggingClass";
import { SpellObjectEnums } from "../../../Interfaces/Enums";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";
import { onMounted } from "vue";

const toast = useToast();
const socket = getSocket();

onMounted(() => {
  socket.on(EmitTypes.CREATE_NEW_SPELL, (data: SpellObject) => {
    /// check if any data is undefined and then send a request to server for updated spell list.
    try {
      // add a function to store to add this instead of using the store.store
      SPELL_FUNCS.SETTERS.pushNewSpell(data);
      serverLogger(
        LoggingTypes.info,
        `${EmitTypes.CREATE_NEW_SPELL} spell object added`,
        ComponentEnums.SOCKETRECEIVER,
        data.id
      );
      return;
    } catch (error) {
      if (error instanceof Error) {
        serverLogger(
          LoggingTypes.alert,
          `${error.message} at ${EmitTypes.CREATE_NEW_SPELL}`,
          ComponentEnums.SOCKETRECEIVER
        );
      }
    }
  });
  socket.on(EmitTypes.UPDATE_ALL_SPELL, (data: SpellObject[]) => {
    /// check if any data is undefined and then send a request to server for updated spell list.
    if (data.length < 1) {
      return;
    }
    try {
      SPELL_FUNCS.SETTERS.updateAllSpells(data);
      serverLogger(
        LoggingTypes.info,
        `${EmitTypes.UPDATE_ALL_SPELL} update complete`,
        ComponentEnums.SOCKETRECEIVER
      );
      return;
    } catch (error) {
      if (error instanceof Error) {
        serverLogger(
          LoggingTypes.alert,
          `${error.message} at ${EmitTypes.UPDATE_ALL_SPELL}`,
          ComponentEnums.SOCKETRECEIVER
        );
      }
    }
  });

  socket.on(EmitTypes.UPDATE_RECORD_SPELL, (data: SpellObject) => {
    console.log("update record spell");
    try {
      SPELL_FUNCS.SETTERS.updateSpell(data);
      serverLogger(
        LoggingTypes.info,
        `${EmitTypes.UPDATE_RECORD_SPELL} update complete`,
        ComponentEnums.SOCKETRECEIVER,
        data.id
      );
    } catch (error) {
      if (error instanceof Error) {
        serverLogger(
          LoggingTypes.alert,
          `${error.message} at ${EmitTypes.UPDATE_RECORD_SPELL}`,
          ComponentEnums.SOCKETRECEIVER
        );
      }
    }
  });

  socket.on(
    EmitTypes.UPDATE_ITEM_SPELL,
    (data: { toUpdate: any; ObjectType: SpellObjectEnums; docId: string }) => {
      try {
        serverLogger(
          LoggingTypes.debug,
          `${EmitTypes.UPDATE_ITEM_SPELL} item to update: ${data.ObjectType} value: ${data.toUpdate}`,
          ComponentEnums.SOCKETRECEIVER,
          data.docId
        );
        const spellIndex = SPELL_FUNCS.GETTERS.getSpellIndexbyId(data.docId);
        SPELL_FUNCS.SETTERS.updateSpellItem(
          data.ObjectType,
          data.toUpdate,
          spellIndex
        );
        serverLogger(
          LoggingTypes.info,
          `${EmitTypes.UPDATE_ITEM_SPELL} update complete`,
          ComponentEnums.SOCKETRECEIVER,
          data.docId
        );
      } catch (error) {
        if (error instanceof Error) {
          serverLogger(
            LoggingTypes.alert,
            `${error.message} at ${EmitTypes.UPDATE_ITEM_SPELL}`,
            ComponentEnums.SOCKETRECEIVER
          );
        }
      }
    }
  );

  socket.on(EmitTypes.DELETE_ONE_SPELL, (docId: string) => {
    try {
      SPELL_FUNCS.SETTERS.deleteSpell(docId);
      serverLogger(
        LoggingTypes.info,
        `${EmitTypes.DELETE_ONE_SPELL} spell deletion completed`,
        ComponentEnums.SOCKETRECEIVER,
        docId
      );
    } catch (error) {
      if (error instanceof Error) {
        serverLogger(
          LoggingTypes.alert,
          `${error.message} at ${EmitTypes.DELETE_ONE_SPELL}`,
          ComponentEnums.SOCKETRECEIVER
        );
      }
    }
  });

  socket.on(EmitTypes.DELETE_ALL_SPELL, () => {
    try {
      SPELL_FUNCS.SETTERS.resetSpells();
      toast.add({
        severity: "warn",
        summary: "Warning Message",
        detail: "Spells have been reset.",
        life: 3000,
      });
      serverLogger(
        LoggingTypes.info,
        `${EmitTypes.DELETE_ALL_SPELL} reset complete`,
        ComponentEnums.SOCKETRECEIVER
      );
    } catch (error) {
      if (error instanceof Error) {
        serverLogger(
          LoggingTypes.alert,
          `${error.message} at ${EmitTypes.DELETE_ALL_SPELL}`,
          ComponentEnums.SOCKETRECEIVER
        );
      }
    }
  });
});
</script>

<template>
  <Toast />
</template>
