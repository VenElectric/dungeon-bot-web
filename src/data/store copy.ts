import { reactive, ref } from "vue";
import {
  CharacterStatus,
  InitiativeObject,
  SpellObject,
  StatusEffect,
  CharacterStatusFirestore,
} from "../Interfaces/initiative";
import {
  CollectionTypes,
  InitiativeObjectEnums,
  SpellObjectEnums,
} from "../Interfaces/ContextEnums";
import { EmitTypes } from "../Interfaces/EmitTypes";
import { io } from "socket.io-client";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { CharacterPickListEvent } from "./types";
import { v4 as uuidv4 } from "uuid";
import {
  isInitiativeObjectArray,
  isSpellObjectArray,
} from "../Utils/TypeChecking";
import serverLogger from "../Utils/LoggingClass";
import { StoreEnums, LoggingTypes } from "../Interfaces/LoggingTypes";
import { SERVER_EMITS } from "./emitFunctions";
import { RollObject } from "../Interfaces/Rolls";

const sessionData = reactive({
  initiativeList: [] as InitiativeObject[],
  isSorted: false,
  spells: [] as SpellObject[],
  sessionId: "",
  socket: io("https://dungeon-bot-server.herokuapp.com"),
  rolls: [] as RollObject[],
});

const initiativeData = reactive({
  initiativeList: [] as InitiativeObject[],
  isSorted: false,
});

const spellData = reactive({
  spells: [] as SpellObject[],
});

const rollData = reactive({
  rolls: [] as RollObject[],
});

const sessionId = ref("");
const socket = ref(io("https://dungeon-bot-server.herokuapp.com"));

const INITIATIVE_FUNCS = {};

const SPELL_FUNCS = {};

const ROLL_FUNCS = {
  getInitialRolls(): void {
    serverLogger(
      LoggingTypes.info,
      `first fetch initiative`,
      StoreEnums.getInitial
    );
    sessionData.socket.emit(
      EmitTypes.GET_INITIAL_ROLLS,
      sessionData.sessionId,
      (query: RollObject[]) => {
        rollData.rolls = query;
        serverLogger(
          LoggingTypes.info,
          `initiative store updated`,
          StoreEnums.getInitial
        );
      }
    );
  },
  addRoll(data: RollObject): void {
    rollData.rolls.push(data);
  },
  updateRoll(data: RollObject, index: number): void {
    rollData.rolls[index] = data;
  },
  deleteRoll(index: number): void {
    rollData.rolls.splice(index, 1);
  },
  getRolls(): RollObject[] {
    return rollData.rolls;
  },
  rollDice(diceRoll: string): DiceRoll {
    const newRoll = new DiceRoll(diceRoll);
    return newRoll;
  },
};

// <----------------------- UTILITIES ----------------------->

// setter set sessionId
const updateId = (id: string): void => {
  serverLogger(LoggingTypes.info, `updating sessionId`, StoreEnums.updateId);
  sessionData.sessionId = id;
};

// emit initial room setup
// replaced in server emits
// const roomSetup = (): void => {
//   try {
//     serverLogger(LoggingTypes.debug, `joining room`, StoreEnums.roomSetup);
//     sessionData.socket.emit("create", sessionData.sessionId);
//   } catch (error) {
//     serverLogger(
//       LoggingTypes.debug,
//       `unable to connect to socket io`,
//       StoreEnums.roomSetup
//     );
//   }
// };

//emit spell or initiative
// replaced in server emits
// const toDiscord = (collectionType: CollectionTypes): void => {
//   try {
//     serverLogger(
//       LoggingTypes.info,
//       `emitting ${EmitTypes.DISCORD} for ${collectionType}`,
//       StoreEnums.toDiscord
//     );
//     sessionData.socket.emit(EmitTypes.DISCORD, {
//       payload: [],
//       sessionId: sessionData.sessionId,
//       collectionType: collectionType,
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       serverLogger(LoggingTypes.alert, error.message, StoreEnums.toDiscord);
//     }
//   }
// };

//emit roll
// replaced in server emits
// const discordRoll = (toRoll: DiceRoll, comment: string): void => {
//   try {
//     sessionData.socket.emit(EmitTypes.DISCORD_ROLL, {
//       payload: toRoll,
//       comment: comment,
//       sessionId: sessionData.sessionId,
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       serverLogger(LoggingTypes.alert, error.message, StoreEnums.toDiscord);
//     }
//   }
// };

// <----------------------- ROLLS ----------------------->
// emit/setter retrieve rolls from server
// stays here so that it can update the rolls object
// added to ROLL_FUNCS
// const getInitialRolls = (): void => {
//   serverLogger(
//     LoggingTypes.info,
//     `first fetch initiative`,
//     StoreEnums.getInitial
//   );
//   sessionData.socket.emit(
//     EmitTypes.GET_INITIAL_ROLLS,
//     sessionData.sessionId,
//     (query: RollObject[]) => {
//       sessionData.rolls = query;
//       console.log(query);
//       serverLogger(
//         LoggingTypes.info,
//         `initiative store updated`,
//         StoreEnums.getInitial
//       );
//     }
//   );
// };

// setter add new roll
// const addRoll = (data: RollObject): void => {
//   sessionData.rolls.push(data);
// };

// emit new roll to server then to other members of room
// added to emit funcs, need to ensure that we can get sessionid when calling this function
// const emitAddRoll = (data: RollObject): void => {
//   sessionData.socket.emit(EmitTypes.CREATE_NEW_ROLL, {
//     rollData: data,
//     sessionId: sessionData.sessionId,
//   });
//   serverLogger(LoggingTypes.debug, `Adding roll ${data.id}`, "emitAddRoll");
// };

// setter edit roll data
const updateRoll = (data: RollObject, index: number): void => {
  sessionData.rolls[index] = data;
};

// emit roll data update to server then to other members of room
// added to emit funcs, need to ensure that we can get sessionid when calling this function
// const emitUpdateRoll = (data: RollObject): void => {
//   sessionData.socket.emit(EmitTypes.UPDATE_ROLL_RECORD, {
//     rollObject: data,
//     sessionId: sessionData.sessionId,
//   });
// };

// setter roll
const deleteRoll = (id: string, index: number): void => {
  sessionData.rolls.splice(index, 1);
};

// emit deleted roll to server then to other members of room
// added to emit funcs, need to ensure that we can get sessionid when calling this function
// const emitDeleteRoll = (id: string): void => {
//   sessionData.socket.emit(EmitTypes.DELETE_ONE_ROLL, {
//     docId: id,
//     sessionId: sessionData.sessionId,
//   });
// };

// getter rolls
const getRolls = (): RollObject[] => {
  return sessionData.rolls;
};

// utility rolls
const rollDice = (diceRoll: string): DiceRoll => {
  const newRoll = new DiceRoll(diceRoll);
  return newRoll;
};

// ROLLS COMPLETE
// TODO: LOOK TO SEE WHERE ROLL FUNCS ARE CALLED



// <----------------------- MIXED ----------------------->
// setter update either spells or initiative
// is this called in the initiative section or spell section?
const updateAll = (
  collectionType: CollectionTypes,
  data: InitiativeObject[] | SpellObject[]
): void => {
  serverLogger(
    LoggingTypes.info,
    `updating all ${collectionType}`,
    StoreEnums.updateAll
  );
  if (collectionType === CollectionTypes.INITIATIVE) {
    if (isInitiativeObjectArray(data)) {
      console.info("initiative");
      sessionData.initiativeList = data;
      serverLogger(
        LoggingTypes.info,
        `update complete ${collectionType}`,
        StoreEnums.updateAll
      );
      return;
    }
  }
  if (collectionType === CollectionTypes.SPELLS) {
    if (isSpellObjectArray(data)) {
      console.info("spells???");
      serverLogger(
        LoggingTypes.info,
        `update complete ${collectionType}`,
        StoreEnums.updateAll
      );
      sessionData.spells = data;
    }
  }
};

// setter removes character ids from target or source in spells
// is this called in the initiative section or spell section?
const removeCharacterFromSpells = (characterId: string): void => {
  for (const [spellIndex, spell] of sessionData.spells.entries()) {
    const indexZero = spell.characterIds.source
      .map((item: CharacterStatus) => item.characterId)
      .indexOf(characterId);
    const indexOne = spell.characterIds.target
      .map((item: CharacterStatus) => item.characterId)
      .indexOf(characterId);
    const finalIndex = indexZero != -1 ? indexZero : indexOne;
    if (indexZero != -1 && indexOne == -1) {
      serverLogger(
        LoggingTypes.debug,
        `removing character from spell.characterIds at indexZero`,
        StoreEnums.removeCharacter,
        spell.id
      );
      sessionData.spells[spellIndex].characterIds.source.splice(finalIndex, 1);
    } else if (indexZero == -1 && indexOne != -1) {
      serverLogger(
        LoggingTypes.debug,
        `removing character from spell.characterIds at indexOne`,
        StoreEnums.removeCharacter,
        spell.id
      );
      sessionData.spells[spellIndex].characterIds.target.splice(finalIndex, 1);
    }
  }
};

// setter adds spell (status effect) to all initiative characters
// is this called in the initiative section or spell section?
function addStatusEffects(index: number) {
  serverLogger(
    LoggingTypes.debug,
    `adding spell effect to all characters`,
    StoreEnums.addStatusEffects,
    sessionData.spells[index].id
  );
  sessionData.initiativeList.forEach((init: InitiativeObject) => {
    init.statusEffects.push({
      spellName: sessionData.spells[index].effectName,
      id: sessionData.spells[index].id,
      effectDescription: sessionData.spells[index].effectDescription,
    });
  });
}

// setter removes spell (status effect) from all initiative characters
// is this called in the initiative section or spell section?
function removeStatusEffects(spellIndex: number) {
  serverLogger(
    LoggingTypes.debug,
    `removing spell effect from all characters`,
    StoreEnums.removeStatusEffects,
    sessionData.spells[spellIndex].id
  );
  for (const [initIndex, init] of sessionData.initiativeList.entries()) {
    const statusIndex = sessionData.initiativeList[initIndex].statusEffects
      .map((item: StatusEffect) => item.id)
      .indexOf(sessionData.spells[spellIndex].id);
    if (statusIndex >= 0) {
      sessionData.initiativeList[initIndex].statusEffects.splice(
        statusIndex,
        1
      );
    }
  }
}

// setter adds spell (status effect) to one initiative character
// is this called in the initiative section or spell section?
function addStatusEffect(
  spellName: string,
  spellId: string,
  effectDescription: string,
  characterIndex: number
): void {
  serverLogger(
    LoggingTypes.debug,
    `adding spell effect to one character`,
    StoreEnums.addStatusEffect,
    sessionData.initiativeList[characterIndex].id
  );
  sessionData.initiativeList[characterIndex].statusEffects.push({
    spellName: spellName,
    id: spellId,
    effectDescription: effectDescription,
  });
}
// setter removes spell (status effect) from one initiative character
// is this called in the initiative section or spell section?
function removeStatusEffect(spellId: string, characterIndex: number): void {
  serverLogger(
    LoggingTypes.debug,
    `removing spell effect from one character`,
    StoreEnums.removeStatusEffect,
    sessionData.initiativeList[characterIndex].id
  );
  const spellIndex = sessionData.initiativeList[characterIndex].statusEffects
    .map((status: StatusEffect) => status.id)
    .indexOf(spellId);
  sessionData.initiativeList[characterIndex].statusEffects.splice(
    spellIndex,
    1
  );
}

// setter move all character ids from source to target in spell
// is this called in the initiative section or spell section?
const changeAllCharacterToTarget = (index: number): void => {
  serverLogger(
    LoggingTypes.debug,
    `changing all characters to ${moveTo}`,
    StoreEnums.changeAllCharacterStatus,
    sessionData.spells[index].id
  );
  try {
    sessionData.spells[index].characterIds.target = [
      ...sessionData.spells[index].characterIds.target,
      ...sessionData.spells[index].characterIds.source,
    ];
    sessionData.spells[index].characterIds.source = [];
    addStatusEffects(index);
    serverLogger(
      LoggingTypes.debug,
      `update complete, moved to target`,
      StoreEnums.changeAllCharacterStatus,
      sessionData.spells[index].id
    );
    sessionData.socket.emit(
      EmitTypes.UPDATE_ALL_SPELL,
      {
        payload: sessionData.spells,
        sessionId: sessionData.sessionId,
      },
      (data: any) => {
        console.log(data);
      }
    );
    serverLogger(
      LoggingTypes.debug,
      `emitting ${EmitTypes.UPDATE_ALL_INITIATIVE} for initiative`,
      StoreEnums.changeAllCharacterStatus,
      sessionData.spells[index].id
    );
    sessionData.socket.emit(
      EmitTypes.UPDATE_ALL_INITIATIVE,
      {
        payload: sessionData.initiativeList,
        sessionId: sessionData.sessionId,
        resetOnDeck: false,
        isSorted: sessionData.isSorted,
      },
      (data: any) => {
        console.log(data);
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      serverLogger(
        LoggingTypes.alert,
        error.message,
        StoreEnums.changeAllCharacterStatus,
        sessionData.spells[index].id
      );
    }
  }
};

// setter move all character ids from target to source in spell
// is this called in the initiative section or spell section?
const changeAllCharacterToSource = (index: number): void => {
  try {
    sessionData.spells[index].characterIds.source = [
      ...sessionData.spells[index].characterIds.source,
      ...sessionData.spells[index].characterIds.target,
    ];
    sessionData.spells[index].characterIds.target = [];
    removeStatusEffects(index);
    serverLogger(
      LoggingTypes.debug,
      `update complete, moved to source`,
      StoreEnums.changeAllCharacterStatus,
      sessionData.spells[index].id
    );
    sessionData.socket.emit(
      EmitTypes.UPDATE_ALL_SPELL,
      {
        payload: sessionData.spells,
        sessionId: sessionData.sessionId,
      },
      (data: any) => {
        console.log(data);
      }
    );
    serverLogger(
      LoggingTypes.debug,
      `emitting ${EmitTypes.UPDATE_ALL_INITIATIVE} for initiative`,
      StoreEnums.changeAllCharacterStatus,
      sessionData.spells[index].id
    );
    sessionData.socket.emit(
      EmitTypes.UPDATE_ALL_INITIATIVE,
      {
        payload: sessionData.initiativeList,
        sessionId: sessionData.sessionId,
        resetOnDeck: false,
        isSorted: sessionData.isSorted,
      },
      (data: any) => {
        console.log(data);
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      serverLogger(
        LoggingTypes.alert,
        error.message,
        StoreEnums.changeAllCharacterStatus,
        sessionData.spells[index].id
      );
    }
  }
};

// setter move one character id from target to source in spell
// is this called in the initiative section or spell section?
const changeOneCharacterToSource = (
  e: CharacterPickListEvent,
  index: number
): void => {
  try {
    const characterId = e.items[0].characterId;
    const characterIndex = sessionData.initiativeList
      .map((item: InitiativeObject) => item.id)
      .indexOf(characterId);
    serverLogger(
      LoggingTypes.info,
      `changing one character status. moveTo: ${moveTo}`,
      StoreEnums.changeOneCharacterStatus,
      characterId
    );
    const spellIndex = sessionData.spells[index].characterIds.target
      .map((item: CharacterStatus) => item.characterId)
      .indexOf(e.items[0].characterId);
    sessionData.spells[index].characterIds.source.push(
      sessionData.spells[index].characterIds.target[spellIndex]
    );
    sessionData.spells[index].characterIds.target.splice(spellIndex, 1);
    removeStatusEffect(sessionData.spells[index].id, characterIndex);
    serverLogger(
      LoggingTypes.info,
      `status effect moved to soure complete`,
      StoreEnums.changeOneCharacterStatus,
      characterId
    );
    sessionData.socket.emit(EmitTypes.UPDATE_RECORD_SPELL, {
      payload: sessionData.spells[index],
      sessionId: sessionData.sessionId,
      docId: sessionData.spells[index].id,
    });
    serverLogger(
      LoggingTypes.info,
      `emitting ${EmitTypes.UPDATE_RECORD_INITIATIVE} for initiative`,
      StoreEnums.changeOneCharacterStatus,
      characterId
    );
    sessionData.socket.emit(EmitTypes.UPDATE_RECORD_INITIATIVE, {
      payload: sessionData.initiativeList[characterIndex],
      sessionId: sessionData.sessionId,
      docId: characterId,
    });
  } catch (error) {
    if (error instanceof Error) {
      serverLogger(
        LoggingTypes.alert,
        error.message,
        StoreEnums.changeOneCharacterStatus,
        sessionData.spells[index].id
      );
    }
  }
};

// setter move one character id from source to target in spell
// is this called in the initiative section or spell section?
const changeOneCharacterToTarget = (
  e: CharacterPickListEvent,
  index: number
): void => {
  try {
    const characterId = e.items[0].characterId;
    const characterIndex = sessionData.initiativeList
      .map((item: InitiativeObject) => item.id)
      .indexOf(characterId);
    serverLogger(
      LoggingTypes.info,
      `changing one character status. moveTo: ${moveTo}`,
      StoreEnums.changeOneCharacterStatus,
      characterId
    );
    const spellIndex = sessionData.spells[index].characterIds.source
      .map((item: CharacterStatus) => item.characterId)
      .indexOf(e.items[0].characterId);
    sessionData.spells[index].characterIds.target.push(
      sessionData.spells[index].characterIds.source[spellIndex]
    );
    sessionData.spells[index].characterIds.source.splice(spellIndex, 1);
    addStatusEffect(
      sessionData.spells[index].effectName,
      sessionData.spells[index].id,
      sessionData.spells[index].effectDescription,
      characterIndex
    );
    serverLogger(
      LoggingTypes.info,
      `status effect moved to target complete`,
      StoreEnums.changeOneCharacterStatus,
      characterId
    );
    serverLogger(
      LoggingTypes.info,
      `emitting ${EmitTypes.UPDATE_RECORD_SPELL} for spell`,
      StoreEnums.changeOneCharacterStatus,
      sessionData.spells[index].id
    );
    sessionData.socket.emit(EmitTypes.UPDATE_RECORD_SPELL, {
      payload: sessionData.spells[index],
      sessionId: sessionData.sessionId,
      docId: sessionData.spells[index].id,
    });
    serverLogger(
      LoggingTypes.info,
      `emitting ${EmitTypes.UPDATE_RECORD_INITIATIVE} for initiative`,
      StoreEnums.changeOneCharacterStatus,
      characterId
    );
    sessionData.socket.emit(EmitTypes.UPDATE_RECORD_INITIATIVE, {
      payload: sessionData.initiativeList[characterIndex],
      sessionId: sessionData.sessionId,
      docId: characterId,
    });
  } catch (error) {
    if (error instanceof Error) {
      serverLogger(
        LoggingTypes.alert,
        error.message,
        StoreEnums.changeOneCharacterStatus,
        sessionData.spells[index].id
      );
    }
  }
};

// <----------------------- INITIATIVE ----------------------->

// getter initiative
const getInitiative = (): InitiativeObject[] => {
  return sessionData.initiativeList;
};

// getter isSorted
const getSorted = (): boolean => {
  return sessionData.isSorted;
};

// utility rolls (reroll for initiative)
const reRoll = (): number => {
  const newRoll = new DiceRoll(`d20`);
  return Number(newRoll.total);
};

// setter initiative
const updateAllInitiative = (data: InitiativeObject[]): void => {
  sessionData.initiativeList = data;
  serverLogger(
    LoggingTypes.info,
    `update complete initiative`,
    StoreEnums.updateAll
  );
  return;
};

// setter isCurrent -> false
const alltoFalse = (): void => {
  serverLogger(
    LoggingTypes.debug,
    `setting isCurrent for all records to false`,
    StoreEnums.alltoFalse
  );
  try {
    sessionData.initiativeList.forEach((item: InitiativeObject, index) => {
      sessionData.initiativeList[index].isCurrent = false;
    });
  } catch (error) {
    if (error instanceof Error) {
      serverLogger(LoggingTypes.alert, error.message, StoreEnums.alltoFalse);
    }
  }
};

// setter update isSorted
const updateSorted = (isSorted: boolean): void => {
  serverLogger(
    LoggingTypes.debug,
    `updating isSorted to: ${isSorted}`,
    StoreEnums.updateSorted
  );
  sessionData.isSorted = isSorted;
};

// setter/emit initiative
const getInitial = (): void => {
  serverLogger(
    LoggingTypes.info,
    `first fetch initiative`,
    StoreEnums.getInitial
  );
  sessionData.socket.emit(
    EmitTypes.GET_INITIAL,
    sessionData.sessionId,
    (query: any) => {
      sessionData.initiativeList = query.initiativeList;
      sessionData.isSorted = query.isSorted;
      serverLogger(
        LoggingTypes.info,
        `initiative store updated`,
        StoreEnums.getInitial
      );
    }
  );
};

// setter update one character record
// remove alltofalse to where it's needed
const updateCharacterRecord = (
  initiative: InitiativeObject,
  isReset: boolean
): void => {
  if (isReset) {
    serverLogger(
      LoggingTypes.debug,
      `resetting isCurrent for all records to false`,
      StoreEnums.updateCharacterRecord
    );
    alltoFalse();
  }
  serverLogger(
    LoggingTypes.debug,
    `updating initiative Ojbect`,
    StoreEnums.updateCharacterRecord,
    initiative.id
  );
  const initIndex = sessionData.initiativeList
    .map((record: InitiativeObject) => record.id)
    .indexOf(initiative.id);
  sessionData.initiativeList[initIndex] = initiative;
  serverLogger(
    LoggingTypes.debug,
    `update complete`,
    StoreEnums.updateCharacterRecord,
    initiative.id
  );
};

// setter update one character item
const updateCharacterItem = (
  ObjectType: InitiativeObjectEnums,
  toUpdate: any,
  index: number,
  emit: boolean,
  docId?: string
): void => {
  if (docId) {
    if (emit) {
      serverLogger(
        LoggingTypes.debug,
        `emitting update`,
        StoreEnums.updateCharacterItem,
        docId
      );
      sessionData.socket.emit(EmitTypes.UPDATE_ITEM_INITIATIVE, {
        ObjectType: ObjectType,
        toUpdate: toUpdate,
        sessionId: sessionData.sessionId,
        docId: docId,
      });
    }
  }
  serverLogger(
    LoggingTypes.debug,
    `updating characteritem in store`,
    StoreEnums.updateCharacterItem,
    docId
  );
  try {
    switch (ObjectType) {
      case InitiativeObjectEnums.characterName:
        sessionData.initiativeList[index].characterName = toUpdate;
        break;
      case InitiativeObjectEnums.initiative:
        sessionData.initiativeList[index].initiative = toUpdate;
        break;
      case InitiativeObjectEnums.initiativeModifier:
        sessionData.initiativeList[index].initiativeModifier = toUpdate;
        break;
      case InitiativeObjectEnums.isCurrent:
        sessionData.initiativeList[index].isCurrent = toUpdate;
        break;
      case InitiativeObjectEnums.roundOrder:
        sessionData.initiativeList[index].roundOrder = toUpdate;
        break;
    }
  } catch (error) {
    if (error instanceof Error) {
      serverLogger(
        LoggingTypes.alert,
        error.message,
        StoreEnums.updateCharacterItem
      );
    }
  }
};

// setter/emit add new character initiative
const addCharacter = (data: InitiativeObject): void => {
  serverLogger(
    LoggingTypes.debug,
    `changing all isCurrent to false`,
    StoreEnums.addCharacter
  );
  alltoFalse();
  sessionData.isSorted = false;

  serverLogger(
    LoggingTypes.debug,
    `adding initiative to the store`,
    StoreEnums.addCharacter,
    data.id
  );

  sessionData.initiativeList.push(data);
  if (sessionData.spells.length > 0) {
    serverLogger(
      LoggingTypes.debug,
      `adding new character to spells characterIds lists`,
      StoreEnums.addCharacter,
      data.id
    );
    sessionData.spells.forEach((spell: SpellObject) => {
      spell.characterIds.source.push({
        characterName: data.characterName,
        characterId: data.id,
      });
    });

    serverLogger(
      LoggingTypes.debug,
      `emitting Spell List`,
      StoreEnums.addCharacter
    );
    sessionData.socket.emit(EmitTypes.UPDATE_ALL_SPELL, {
      payload: sessionData.spells,
      sessionId: sessionData.sessionId,
    });
  }
  serverLogger(
    LoggingTypes.debug,
    `emitting new character`,
    StoreEnums.addCharacter,
    data.id
  );
  sessionData.socket.emit(EmitTypes.CREATE_NEW_INITIATIVE, {
    payload: data,
    sessionId: sessionData.sessionId,
  });
};

// setter initiative delete character
const removeCharacter = (index: number, id: string, emit: boolean): void => {
  sessionData.isSorted = false;
  sessionData.initiativeList.splice(index, 1);
  serverLogger(
    LoggingTypes.info,
    `character removed, sort reset`,
    StoreEnums.removeCharacter,
    id
  );
  if (sessionData.spells.length > 0) {
    removeCharacterFromSpells(id);
  }

  if (emit) {
    setTimeout(() => {
      serverLogger(
        LoggingTypes.debug,
        `emitting ${EmitTypes.DELETE_ONE_INITIATIVE}`,
        StoreEnums.removeCharacter,
        id
      );
      sessionData.socket.emit(EmitTypes.DELETE_ONE_INITIATIVE, {
        sessionId: sessionData.sessionId,
        docId: id,
      });
      serverLogger(
        LoggingTypes.debug,
        `emitting ${EmitTypes.UPDATE_ALL_SPELL} for spells`,
        StoreEnums.removeCharacter,
        id
      );
      sessionData.socket.emit(EmitTypes.UPDATE_ALL_SPELL, {
        payload: sessionData.spells,
        sessionId: sessionData.sessionId,
      });
    }, 200);
  }
};

// legacy
const startDrag = (evt: DragEvent, index: number): void => {
  if (evt.dataTransfer !== null) {
    evt.dataTransfer.dropEffect = "move";
    evt.dataTransfer.effectAllowed = "move";
    evt.dataTransfer.setData("itemIndex", String(index));
  }
};

// legacy

const dragOver = (evt: DragEvent): void => {
  evt.preventDefault();
};

// legacy

const dragEnter = (evt: DragEvent): void => {
  console.log(evt, "dragEnter");
};

// setter initiative update round order
const onDrop = (evt: any): void => {
  if (!sessionData.isSorted) return;
  const toMove = { ...sessionData.initiativeList[evt.dragIndex] };
  if (toMove) {
    sessionData.initiativeList.splice(evt.dragIndex, 1);
    sessionData.initiativeList.splice(evt.dropIndex, 0, toMove);
    sessionData.initiativeList.forEach((item: InitiativeObject, index) => {
      sessionData.initiativeList[index].roundOrder = index + 1;
    });
    serverLogger(
      LoggingTypes.debug,
      `drop complete, initiativeList order updating`,
      StoreEnums.onDrop
    );
    setTimeout(() => {
      serverLogger(
        LoggingTypes.debug,
        `emitting ${EmitTypes.UPDATE_ALL_INITIATIVE} after drop completion`,
        StoreEnums.onDrop
      );
      sessionData.socket.emit(EmitTypes.UPDATE_ALL_INITIATIVE, {
        payload: sessionData.initiativeList,
        sessionId: sessionData.sessionId,
        resetOnDeck: true,
        isSorted: sessionData.isSorted,
      });
    }, 500);
  }
};

// setter initiative change round order for mobile
const moveUp = (index: number): void => {
  if (index === 0) return;
  if (!sessionData.isSorted) return;
  const toMove = { ...sessionData.initiativeList[index] };
  sessionData.initiativeList.splice(index, 1);
  sessionData.initiativeList.splice(index - 1, 0, toMove);
  sessionData.initiativeList.forEach((item: InitiativeObject, index) => {
    sessionData.initiativeList[index].roundOrder = index + 1;
  });
  serverLogger(
    LoggingTypes.debug,
    `drop complete, initiativeList order updating`,
    StoreEnums.onDrop
  );
  setTimeout(() => {
    serverLogger(
      LoggingTypes.debug,
      `emitting ${EmitTypes.UPDATE_ALL_INITIATIVE} after drop completion`,
      StoreEnums.onDrop
    );
    sessionData.socket.emit(EmitTypes.UPDATE_ALL_INITIATIVE, {
      payload: sessionData.initiativeList,
      sessionId: sessionData.sessionId,
      resetOnDeck: true,
      isSorted: sessionData.isSorted,
    });
  }, 500);
};

// setter initiative change round order for mobile
const moveDown = (index: number): void => {
  console.log(index);
  console.log(sessionData.isSorted);
  if (index === sessionData.initiativeList.length - 1) {
    console.log("=== move down");
    return;
  }
  if (!sessionData.isSorted) return;
  const toMove = { ...sessionData.initiativeList[index] };
  sessionData.initiativeList.splice(index, 1);
  sessionData.initiativeList.splice(index + 1, 0, toMove);
  sessionData.initiativeList.forEach((item: InitiativeObject, index) => {
    sessionData.initiativeList[index].roundOrder = index + 1;
  });
  serverLogger(
    LoggingTypes.debug,
    `drop complete, initiativeList order updating`,
    StoreEnums.onDrop
  );
  setTimeout(() => {
    serverLogger(
      LoggingTypes.debug,
      `emitting ${EmitTypes.UPDATE_ALL_INITIATIVE} after drop completion`,
      StoreEnums.onDrop
    );
    sessionData.socket.emit(EmitTypes.UPDATE_ALL_INITIATIVE, {
      payload: sessionData.initiativeList,
      sessionId: sessionData.sessionId,
      resetOnDeck: true,
      isSorted: sessionData.isSorted,
    });
  }, 500);
};

// emit round start
const roundStart = (): void => {
  serverLogger(
    LoggingTypes.info,
    `emitting ${EmitTypes.ROUND_START} for initiative`,
    StoreEnums.roundStart
  );
  sessionData.socket.emit(
    EmitTypes.ROUND_START,
    sessionData.sessionId,
    (data: InitiativeObject[]) => {
      console.info(data);
      sessionData.initiativeList = data;
      sessionData.isSorted = true;
      serverLogger(
        LoggingTypes.info,
        `roundstart complete, updated store data for initiative and isSorted: ${sessionData.isSorted}`,
        StoreEnums.roundStart
      );
    }
  );
};

// setter/emit resort initiative to all in room
const reSort = (): void => {
  serverLogger(
    LoggingTypes.info,
    `emitting ${EmitTypes.RESORT} for initiative`,
    StoreEnums.reSort
  );
  sessionData.socket.emit(
    EmitTypes.RESORT,
    sessionData.sessionId,
    (data: InitiativeObject[]) => {
      sessionData.initiativeList = data;
      console.info(sessionData.initiativeList);
      serverLogger(
        LoggingTypes.info,
        `resort complete, updated store data for initiative and isSorted`,
        StoreEnums.reSort
      );
    }
  );
};

// setter/emit set current character at index
const setCurrent = (index: number): void => {
  serverLogger(
    LoggingTypes.info,
    `resetting isSorted for all initiative`,
    StoreEnums.setCurrent,
    sessionData.initiativeList[index].id
  );
  alltoFalse();
  sessionData.initiativeList[index].isCurrent = true;
  serverLogger(
    LoggingTypes.info,
    `reset complete. update to initiative record complete. emitting ${EmitTypes.UPDATE_ALL_INITIATIVE}`,
    StoreEnums.setCurrent,
    sessionData.initiativeList[index].id
  );
  sessionData.socket.emit(EmitTypes.UPDATE_ALL_INITIATIVE, {
    payload: sessionData.initiativeList,
    sessionId: sessionData.sessionId,
    resetOnDeck: true,
    isSorted: sessionData.isSorted,
  });
};

// setter/emit next initiative
const nextTurn = (): void => {
  serverLogger(
    LoggingTypes.info,
    `emitting ${EmitTypes.NEXT}`,
    StoreEnums.nextTurn
  );
  sessionData.socket.emit(EmitTypes.NEXT, sessionData.sessionId);
};

// setter/emit previous initiative
const previousTurn = (): void => {
  serverLogger(
    LoggingTypes.info,
    `emitting ${EmitTypes.PREVIOUS}`,
    StoreEnums.nextTurn
  );
  sessionData.socket.emit(EmitTypes.PREVIOUS, sessionData.sessionId);
};

// setter reset spells and initiative
const resetAll = (emit: boolean): void => {
  sessionData.isSorted = false;
  resetInitiative(emit);
  resetSpells(emit);
  serverLogger(
    LoggingTypes.info,
    `initiative and spells reset`,
    StoreEnums.resetAll
  );
};

// setter reset initiative
const resetInitiative = (emit: boolean): void => {
  sessionData.isSorted = false;
  sessionData.initiativeList = [];
  sessionData.spells.forEach((spell: SpellObject, index) => {
    sessionData.spells[index].characterIds.source = [];
    sessionData.spells[index].characterIds.target = [];
  });
  serverLogger(LoggingTypes.info, `spells reset`, StoreEnums.resetAll);
  if (emit) {
    serverLogger(
      LoggingTypes.info,
      `emitting ${EmitTypes.DELETE_ALL_INITIATIVE}`,
      StoreEnums.resetAll
    );
    sessionData.socket.emit(
      EmitTypes.DELETE_ALL_INITIATIVE,
      sessionData.sessionId
    );
    sessionData.socket.emit(EmitTypes.UPDATE_ALL_SPELL, {
      payload: sessionData.spells,
      sessionId: sessionData.sessionId,
    });
  }
};

export default {
  store: sessionData,
  updateId,
  getInitial,
  getInitialSpells,
  updateCharacterItem,
  updateCharacterRecord,
  addCharacter,
  removeCharacter,
  getSpells,
  addSpell,
  startDrag,
  dragOver,
  dragEnter,
  onDrop,
  updateSpell,
  updateSpellItem,
  changeAllCharacterToTarget,
  changeAllCharacterToSource,
  changeOneCharacterToTarget,
  changeOneCharacterToSource,
  roundStart,
  getInitiative,
  getSorted,
  reSort,
  setCurrent,
  nextTurn,
  previousTurn,
  toDiscord,
  updateAll,
  removeSpell,
  resetAll,
  reRoll,
  alltoFalse,
  updateSorted,
  resetInitiative,
  resetSpells,
  moveUp,
  moveDown,
  updateRoll,
  addRoll,
  deleteRoll,
  getInitialRolls,
  getRolls,
  rollDice,
  emitAddRoll,
  emitDeleteRoll,
  emitUpdateRoll,
  discordRoll,
};
