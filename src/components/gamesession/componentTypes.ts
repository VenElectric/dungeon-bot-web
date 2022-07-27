import { InitiativeObject } from "../../Interfaces/initiative";
import { SpellObject } from "../../Interfaces/Spells";
import {
  SpellStoreInterface,
  InitiativeStoreInterface,
} from "../../data/types";

export enum ComponentIs {
  AddSpell = "AddSpell",
  InitiativeData = "InitiativeData",
  SpellTargets = "SpellTargets",
  EffectContainer = "EffectContainer",
}

export interface InitiativeAttrs {
  saveFunction: (record: InitiativeObject) => void;
  index: number;
  record?: InitiativeObject;
}

export interface SpellAttrs {
  saveFunction: (record: SpellObject) => void;
  index: number;
  record?: SpellObject;
}

export interface ComponentAttrs {
  saveFunction:
    | SpellStoreInterface["SETTERS"]["addSpell"]
    | SpellStoreInterface["SETTERS"]["updateSpell"]
    | InitiativeStoreInterface["SETTERS"]["addCharacter"]
    | InitiativeStoreInterface["SETTERS"]["updateCharacterRecord"];
  index: number;
  record?: SpellObject | InitiativeObject;
}
