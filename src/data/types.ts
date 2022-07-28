import { Ref } from "vue";
import { InitiativeObject, StatusEffect } from "../Interfaces/initiative";
import {
  CharacterStatus,
  CharacterStatusFirestore,
  SpellObject,
} from "../Interfaces/Spells";
import { Socket } from "socket.io-client";
import { PickListMoveAllToSourceEvent } from "primevue/picklist";
import {
  CollectionTypes,
  InitiativeObjectEnums,
  SpellObjectEnums,
} from "../Interfaces/ContextEnums";
import { RollObject } from "../Interfaces/Rolls";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";

export interface IData {
  initiativeList: InitiativeObject[];
  isSorted: boolean;
  spells: SpellObject[];
  sessionId: string;
  socket: Socket;
  rolls: RollObject[];
}

export interface Character {
  characterName: string;
  initiativeModifier: number;
  initiative: number;
}

export interface CharacterPickListEvent extends PickListMoveAllToSourceEvent {
  items: CharacterStatus[];
}

export interface RollStoreInterface {
  rollData: Ref<RollObject[]>;
  ROLL_FUNCS: {
    GETTERS: {
      getRollbyIndex(index: number): RollObject;
      getRollIndexbyId(id: string): number;
      getRolls: () => RollObject[];
      rollDice: (diceRoll: string) => DiceRoll;
      tryRoll: (roll: string) => unknown;
    };
    SETTERS: {
      pushNewRoll(roll: RollObject): void;
      getInitialRolls: () => void;
      addRoll: (rollName: string, rollValue: string) => void;
      updateRoll: (data: RollObject, index: number) => void;
      deleteRoll: (id: string, index: number) => void;
    };
    EMITS: {
      emitDeleteRoll: (id: string) => void;
      emitAddRoll: (data: RollObject) => void;
      emitUpdateRoll: (data: RollObject) => void;
      discordRoll: (toRoll: DiceRoll, comment: string) => void;
    };
  };
}

export interface SpellStoreInterface {
  GETTERS: {
    getSpells: () => Ref<SpellObject[]>;
    getCharacterIds: (
      index: number
    ) => [
      CharacterStatusFirestore["source"],
      CharacterStatusFirestore["target"]
    ];
    getSpellbyIndex: (index: number) => SpellObject;
    getSpellIndexbyId(id: string): number;
  };
  SETTERS: {
    addSpell: (data: SpellObject) => void;
    pushNewSpell(data: SpellObject): void;
    updateAllSpells: (data: SpellObject[]) => void;
    updateSpell: (data: SpellObject) => void;
    initializeSpellStoreCharacterIds(record: InitiativeObject): void;
    initializeCharacterIDS(
      spellData: SpellObject,
      initiativeList: InitiativeObject[]
    ): SpellObject;
    updateSpellItem: (
      ObjectType: SpellObjectEnums,
      toUpdate: any,
      index: number
    ) => SpellObject;
    changeAllCharacterToTarget: (index: number) => void;
    changeAllCharacterToSource: (index: number) => void;
    changeOneCharacterToTarget: (
      e: CharacterPickListEvent,
      index: number
    ) => void;
    changeOneCharacterToSource: (
      e: CharacterPickListEvent,
      index: number
    ) => void;
    deleteSpell: (id: string) => void;
    resetSpells: () => void;
    removeCharacterFromSpells(characterId: string): void;
    removeAllCharactersFromSpells(): void;
  };
  EMITS: {
    emitResetSpells(): void;
    getInitialSpells: () => void;
    emitDeleteSpell: (id: string) => void;
    emitNewSpell: (spell: SpellObject) => void;
    emitUpdateSpell: (spell: SpellObject) => void;
    emitUpdateAllSpells: () => void;
    discord: () => void;
  };
}

export interface InitiativeStoreInterface {
  GETTERS: {
    getInitiative(): Ref<InitiativeObject[]>;
    getSorted(): Ref<boolean>;
    getCurrent(index: number): boolean;
    getRecord(index: number): InitiativeObject;
    getInitIndexbyId(id: string): number;
    getInitbyIndex: (index: number) => InitiativeObject;
    getInitiativeById(id: string): InitiativeObject;
  };
  SETTERS: {
    addSpellEffect(data: StatusEffect, id: string): void;
    addSpellEffectToAll(data: StatusEffect): void;
    removeSpellEffect(spellId: string, characterId: string): void;
    removeSpellEffectFromAll(spellId: string): void;
    updateAllInitiative(data: InitiativeObject[]): void;
    updateCharacterRecord(initiative: InitiativeObject): void;
    alltoFalse(): void;
    updateSorted(isSortedNew: boolean): void;
    addCharacter(data: InitiativeObject): void;
    startDrag(evt: DragEvent, index: number): void;
    onDrop(evt: any): void;
    moveUp(index: number): void;
    moveDown(index: number): void;
    deleteInitiative(id: string): void;
    setCurrent(index: number): void;
    resetInitiative(): void;
  };
  EMITS: {
    createNewInitiative(initiative: InitiativeObject): void;
    getInitial(): void;
    reSort(): void;
    roundStart(): void;
    nextTurn(): void;
    previousTurn(): void;
    emitResetInitiative(): void;
    updateRecordInitiative(initiative: InitiativeObject): void;
    deleteOneInitiative(docId: string): void;
    updateAllInitiative(): void;
    discord(): void;
  };
}

export interface IStore {
  store: IData;
  getInitial: () => void;
  updateId: (id: string) => void;
  updateCharacterItem: (
    ObjectType: InitiativeObjectEnums,
    toUpdate: any,
    index: number,
    emit: boolean,
    docId?: string
  ) => void;
  updateCharacterRecord: (
    initiative: InitiativeObject,
    isReset: boolean
  ) => void;
  addCharacter: (data: InitiativeObject) => void;
  removeCharacter: (index: number, id: string, emit: boolean) => void;
  getInitialSpells: () => void;
  addSpell: (data: any) => void;
  startDrag: (evt: DragEvent, index: number) => void;
  dragOver: (evt: DragEvent) => void;
  dragEnter: (evt: DragEvent) => void;
  onDrop: (evt: any) => void;
  updateSpell: (
    effectName: string,
    effectDescription: string,
    durationTime: number,
    durationType: string,
    index: number,
    emit: boolean,
    characterIds?: CharacterStatusFirestore
  ) => void;
  updateSpellItem: (
    ObjectType: SpellObjectEnums,
    toUpdate: any,
    index: number
  ) => void;
  changeAllCharacterToTarget: (index: number) => void;
  changeAllCharacterToSource: (index: number) => void;
  changeOneCharacterToTarget: (
    e: CharacterPickListEvent,
    index: number
  ) => void;
  changeOneCharacterToSource: (
    e: CharacterPickListEvent,
    index: number
  ) => void;
  roundStart: () => void;
  getInitiative: () => InitiativeObject[];
  getSpells: () => SpellObject[];
  getSorted: () => boolean;
  reSort: () => void;
  setCurrent: (index: number) => void;
  nextTurn: () => void;
  previousTurn: () => void;
  toDiscord: (collectionType: CollectionTypes) => void;
  roomSetup: () => void;
  updateAll: (
    collectionType: CollectionTypes,
    data: InitiativeObject[] | SpellObject[]
  ) => void;
  removeSpell: (index: number, id: string, emit: boolean) => void;
  spellsDoubleArray: (payload: CharacterStatusFirestore) => CharacterStatus[][];
  resetAll: (emit: boolean) => void;
  reRoll: () => number;
  alltoFalse: () => void;
  updateSorted: (isSorted: boolean) => void;
  resetSpells: (emit: boolean) => void;
  resetInitiative: (emit: boolean) => void;
  moveUp: (index: number) => void;
  moveDown: (index: number) => void;
  getInitialRolls: () => void;
  addRoll: (data: RollObject) => void;
  updateRoll: (data: RollObject, index: number) => void;
  deleteRoll: (id: string, index: number) => void;
  getRolls: () => RollObject[];
  rollDice: (diceRoll: string) => DiceRoll;
  emitDeleteRoll: (id: string) => void;
  emitAddRoll: (data: RollObject) => void;
  emitUpdateRoll: (data: RollObject) => void;
  discordRoll: (toRoll: DiceRoll, comment: string) => void;
}
