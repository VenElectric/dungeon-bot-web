import { EmitTypes } from "../Interfaces/EmitTypes";
import { InitiativeObject } from "../Interfaces/initiative";
import { SpellObject } from "../Interfaces/Spells";
import { InitiativeObjectEnums, SpellObjectEnums } from "../Interfaces/Enums";
import { CollectionTypes } from "../Interfaces/ContextEnums";
import store from "./store";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { LoggingTypes, StoreEnums } from "../Interfaces/LoggingTypes";
import serverLogger from "../Utils/LoggingClass";
import { RollObject } from "../Interfaces/Rolls";

// todo
// Server Logging
// error catch

export const SERVER_EMITS = {
  roomSetup(sessionId: string): void {
    store.store.socket.emit("create", sessionId);
  },
  createNewInitiative(initiative: InitiativeObject, sessionId: string): void {
    store.store.socket.emit(EmitTypes.CREATE_NEW_INITIATIVE, {
      payload: initiative,
      sessionId: sessionId,
    });
  },
  createNewSpell(spell: SpellObject, sessionId: string): void {
    store.store.socket.emit(EmitTypes.CREATE_NEW_SPELL, {
      payload: spell,
      sessionId: sessionId,
    });
  },
  updateRecordInitiative(
    initiative: InitiativeObject,
    sessionId: string
  ): void {
    store.store.socket.emit(EmitTypes.UPDATE_RECORD_INITIATIVE, {
      payload: initiative,
      sessionId: sessionId,
      docId: initiative.id,
    });
  },
  updateRecordSpell(spell: SpellObject, sessionId: string): void {
    store.store.socket.emit(EmitTypes.UPDATE_RECORD_SPELL, {
      payload: spell,
      sessionId: sessionId,
      docId: spell.id,
    });
  },
  updateItemInitiative(data: {
    toUpdate: any;
    sessionId: string;
    objectType: InitiativeObjectEnums;
    docId: string;
  }): void {
    store.store.socket.emit(EmitTypes.UPDATE_RECORD_INITIATIVE, {
      toUpdate: data.toUpdate,
      sessionId: data.sessionId,
      docId: data.docId,
      objectType: data.objectType,
    });
  },
  updateItemSpell(
    toUpdate: any,
    sessionId: string,
    objectType: SpellObjectEnums,
    docId: string
  ): void {
    store.store.socket.emit(EmitTypes.UPDATE_RECORD_INITIATIVE, {
      toUpdate: toUpdate,
      sessionId: sessionId,
      docId: docId,
      objectType: objectType,
    });
  },
  updateAllInitiative(
    initiativeList: InitiativeObject[],
    sessionId: string,
    resetOnDeck: boolean,
    isSorted: boolean
  ): void {
    store.store.socket.emit(EmitTypes.UPDATE_ALL_INITIATIVE, {
      payload: initiativeList,
      sessionId: sessionId,
      resetOnDeck: resetOnDeck,
      isSorted: isSorted,
    });
  },
  updateAllSpell(spells: SpellObject[], sessionId: string): void {
    store.store.socket.emit(EmitTypes.UPDATE_ALL_INITIATIVE, {
      payload: spells,
      sessionId: sessionId,
    });
  },
  deleteAllInitiative(sessionId: string): void {
    store.store.socket.emit(EmitTypes.DELETE_ALL_INITIATIVE, sessionId);
  },
  deleteAllSpell(sessionId: string): void {
    store.store.socket.emit(EmitTypes.DELETE_ALL_SPELL, sessionId);
  },
  deleteOneInitiative(sessionId: string, docId: string): void {
    store.store.socket.emit(EmitTypes.DELETE_ONE_INITIATIVE, {
      sessionId: sessionId,
      docId: docId,
    });
  },
  deleteOneSpell(sessionId: string, docId: string): void {
    store.store.socket.emit(EmitTypes.DELETE_ONE_SPELL, {
      sessionId: sessionId,
      docId: docId,
    });
  },
  emitNext(sessionId: string): void {
    store.store.socket.emit(EmitTypes.NEXT, sessionId);
  },
  emitPrevious(sessionId: string): void {
    store.store.socket.emit(EmitTypes.PREVIOUS, sessionId);
  },
  emitResort(sessionId: string): void {
    store.store.socket.emit(EmitTypes.RESORT, sessionId);
  },
  emitDiscord(sessionId: string, collectionType: CollectionTypes): void {
    store.store.socket.emit(EmitTypes.DISCORD, {
      sessionId: sessionId,
      collectionType: collectionType,
    });
  },
  discordRoll(toRoll: DiceRoll, comment: string, sessionId: string): void {
    try {
      store.store.socket.emit(EmitTypes.DISCORD_ROLL, {
        payload: toRoll,
        comment: comment,
        sessionId: sessionId,
      });
    } catch (error) {
      if (error instanceof Error) {
        serverLogger(LoggingTypes.alert, error.message, StoreEnums.toDiscord);
      }
    }
  },
  emitAddRoll(data: RollObject, sessionId: string): void {
    store.store.socket.emit(EmitTypes.CREATE_NEW_ROLL, {
      rollData: data,
      sessionId: sessionId,
    });
    serverLogger(LoggingTypes.debug, `Adding roll ${data.id}`, "emitAddRoll");
  },
  emitUpdateRoll(data: RollObject, sessionId: string): void {
    store.store.socket.emit(EmitTypes.UPDATE_ROLL_RECORD, {
      rollObject: data,
      sessionId: sessionId,
    });
  },
  emitDeleteRoll(id: string, sessionId: string): void {
    store.store.socket.emit(EmitTypes.DELETE_ONE_ROLL, {
      docId: id,
      sessionId: sessionId,
    });
  },
};

// will include in future.
// Todo: research retries if necessary

// export function retryInitiative(sessionId: string): void {
//   console.log("todo");
// }

// export function retrySpells(sessionId: string): void {
//   console.log("todo");
// }
