import { Ref } from "vue";
import {
  CharacterStatus,
  InitiativeObject,
  SpellObject,
  CharacterStatusFirestore,
} from "../Interfaces/initiative";
import { Socket } from "socket.io-client";
import {
  PickListMoveAllToSourceEvent,
  PickListMoveToSourceEvent,
  PickListSelectionChangeEvent,
} from "primevue/picklist";
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
