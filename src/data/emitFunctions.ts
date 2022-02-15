import { EmitTypes } from "../Interfaces/EmitTypes";
import { InitiativeObject, SpellObject } from "../Interfaces/initiative";
import { InitiativeObjectEnums, SpellObjectEnums } from "../Interfaces/Enums";
import { stringify } from "@firebase/util";
import { CollectionTypes } from "../Interfaces/ContextEnums";
import store from "./store";

export function createNewInitiative(
  initiative: InitiativeObject,
  sessionId: string
): void {
  store.store.socket.emit(EmitTypes.CREATE_NEW_INITIATIVE, {
    payload: initiative,
    sessionId: sessionId,
  });
}

export function createNewSpell(spell: SpellObject, sessionId: string): void {
  store.store.socket.emit(EmitTypes.CREATE_NEW_INITIATIVE, {
    payload: spell,
    sessionId: sessionId,
  });
}

export function updateRecordInitiative(
  initiative: InitiativeObject,
  sessionId: string
): void {
  store.store.socket.emit(EmitTypes.UPDATE_RECORD_INITIATIVE, {
    payload: initiative,
    sessionId: sessionId,
    docId: initiative.id,
  });
}

export function updateRecordSpell(spell: SpellObject, sessionId: string): void {
  store.store.socket.emit(EmitTypes.UPDATE_RECORD_SPELL, {
    payload: spell,
    sessionId: sessionId,
    docId: spell.id,
  });
}

export function updateItemInitiative(data: {
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
}

export function updateItemSpell(
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
}

export function updateAllInitiative(
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
}

export function updateAllSpell(spells: SpellObject[], sessionId: string): void {
  store.store.socket.emit(EmitTypes.UPDATE_ALL_INITIATIVE, {
    payload: spells,
    sessionId: sessionId,
  });
}

export function deleteAllInitiative(sessionId: string): void {
  store.store.socket.emit(EmitTypes.DELETE_ALL_INITIATIVE, sessionId);
}

export function deleteAllSpell(sessionId: string): void {
  store.store.socket.emit(EmitTypes.DELETE_ALL_SPELL, sessionId);
}

export function deleteOneInitiative(sessionId: string, docId: string): void {
  store.store.socket.emit(EmitTypes.DELETE_ONE_INITIATIVE, {
    sessionId: sessionId,
    docId: docId,
  });
}

export function deleteOneSpell(sessionId: string, docId: string): void {
  store.store.socket.emit(EmitTypes.DELETE_ONE_SPELL, {
    sessionId: sessionId,
    docId: docId,
  });
}

export function emitNext(sessionId: string): void {
  store.store.socket.emit(EmitTypes.NEXT, sessionId);
}

export function emitPrevious(sessionId: string): void {
  store.store.socket.emit(EmitTypes.PREVIOUS, sessionId);
}

export function emitResort(sessionId: string): void {
  store.store.socket.emit(EmitTypes.RESORT, sessionId);
}

export function emitDiscord(
  sessionId: string,
  collectionType: CollectionTypes
): void {
  store.store.socket.emit(EmitTypes.DISCORD, {
    sessionId: sessionId,
    collectionType: collectionType,
  });
}

export function retryInitiative(sessionId: string): void {
  console.log("todo");
}

export function retrySpells(sessionId: string): void {
  console.log("todo");
}
