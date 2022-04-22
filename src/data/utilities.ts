import { SpellObject, InitiativeObject } from "../Interfaces/initiative";
import { RollObject } from "../Interfaces/Rolls";

export function findIndexById(
  dataArray: SpellObject[] | InitiativeObject[] | RollObject[],
  id: string
): number {
  return dataArray
    .map(
      (dataObject: SpellObject | InitiativeObject | RollObject) => dataObject.id
    )
    .indexOf(id);
}
