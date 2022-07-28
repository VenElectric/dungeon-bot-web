import { InitiativeObject, SessionData } from "./initiative";
import { SpellObject } from "./Spells";
import { CollectionTypes } from "./Enums";

export enum EmitTypes {
  GET_INITIAL = "GET_INITIAL",
  GET_SPELLS = "GET_SPELLS",
  GET_INITIAL_ROLLS = "GET_INITIAL_ROLLS",
  CREATE_NEW_ROLL = "CREATE_NEW_ROLL",
  UPDATE_ROLL_RECORD = "UPDATE_ROLL_RECORD",
  DELETE_ONE_ROLL = "DELETE_ONE_ROLL",
  NEXT = "NEXT",
  PREVIOUS = "PREVIOUS",
  ROUND_START = "ROUND_START",
  UPDATE_ALL_INITIATIVE = "UPDATE_ALL_INITIATIVE",
  DELETE_ONE_INITIATIVE = "DELETE_ONE_INITIATIVE",
  DELETE_ALL_INITIATIVE = "DELETE_ALL_INITIATIVE",
  CREATE_NEW_INITIATIVE = "CREATE_NEW_INITIATIVE",
  UPDATE_ITEM_INITIATIVE = "UPDATE_ITEM_INITIATIVE",
  UPDATE_RECORD_INITIATIVE = "UPDATE_RECORD_INITIATIVE",
  UPDATE_ALL_SPELL = "UPDATE_ALL_SPELL",
  DELETE_ONE_SPELL = "DELETE_ONE_SPELL",
  DELETE_ALL_SPELL = "DELETE_ALL_SPELL",
  CREATE_NEW_SPELL = "CREATE_NEW_SPELL",
  UPDATE_ITEM_SPELL = "UPDATE_ITEM_SPELL",
  UPDATE_RECORD_SPELL = "UPDATE_RECORD_SPELL",
  UPDATE_SESSION = "UPDATE_SESSION",
  RE_ROLL = "RE_ROLL",
  RESORT = "RESORT",
  DISCORD = "DISCORD",
  DISCORD_ROLL = "DISCORD_ROLL",
  DISCORD_SPELLS = "DISCORD_SPELLS",
  DISCORD_INITIATIVE = "DISCORD_INITIATIVE"
} 

export interface SocketData {
  payload:
    | InitiativeObject
    | InitiativeObject[]
    | SpellObject
    | SpellObject[]
    | SessionData;
  sessionId: string;
  collectionType: CollectionTypes;
  docId?: string;
}
