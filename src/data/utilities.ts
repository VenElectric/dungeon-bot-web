import { EmitTypes } from "../Interfaces/EmitTypes";
import { CollectionTypes } from "../Interfaces/Enums";
import { InitiativeObject, StatusEffect } from "../Interfaces/initiative";
import { LoggingTypes, StoreEnums } from "../Interfaces/LoggingTypes";
import { RollObject } from "../Interfaces/Rolls";
import { CharacterStatus, SpellObject } from "../Interfaces/Spells";
import serverLogger from "../Utils/LoggingClass";
import { getSocket, getsessionId } from "./sessionStore";

const socket = getSocket();

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

export function toDiscord(collectionType: CollectionTypes): void {
  const sessionId = getsessionId();
  try {
    serverLogger(
      LoggingTypes.info,
      `emitting ${EmitTypes.DISCORD} for ${collectionType}`,
      StoreEnums.toDiscord
    );
    socket.emit(EmitTypes.DISCORD, {
      payload: [],
      sessionId: sessionId,
      collectionType: collectionType,
    });
  } catch (error) {
    if (error instanceof Error) {
      serverLogger(LoggingTypes.alert, error.message, StoreEnums.toDiscord);
    }
  }
}
