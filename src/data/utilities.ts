import { InitiativeObject, StatusEffect } from "../Interfaces/initiative";
import { RollObject } from "../Interfaces/Rolls";
import { CharacterStatus, SpellObject } from "../Interfaces/Spells";

type MultiTypesArray =
  | SpellObject[]
  | InitiativeObject[]
  | RollObject[]
  | CharacterStatus[]
  | StatusEffect[];

type MultiTypes =
  | SpellObject
  | InitiativeObject
  | RollObject
  | CharacterStatus
  | StatusEffect;

export function findIndexById(dataArray: MultiTypesArray, id: string): number {
  return dataArray.map((dataObject: MultiTypes) => dataObject.id).indexOf(id);
}
