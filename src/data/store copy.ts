import { effect, reactive } from "vue";
import {
  CharacterStatus,
  InitiativeObject,
  SpellObject,
  StatusEffect,
  CharacterStatusFirestore,
  ServerSpellObject,
} from "../Interfaces/initiative";
import {
  CollectionTypes,
  InitiativeObjectEnums,
  SpellObjectEnums,
} from "../Interfaces/ContextEnums";
import { EmitTypes, SocketData } from "../Interfaces/EmitTypes";
import { io } from "socket.io-client";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { Character, CharacterPickListEvent } from "./types";
import { v4 as uuidv4 } from "uuid";
import {
  isInitiativeObjectArray,
  isSpellObjectArray,
} from "../Utils/TypeChecking";
import serverLogger from "../Utils/LoggingClass";
import { StoreEnums, LoggingTypes } from "../Interfaces/LoggingTypes";
import * as emits from "./emitFunctions";
import { RollObject } from "../Interfaces/Rolls";

const sessionData = reactive({
  initiativeList: [] as InitiativeObject[],
  isSorted: false,
  spells: [] as SpellObject[],
  sessionId: "",
  socket: io("https://dungeon-bot-server.herokuapp.com"),
  rolls: [] as RollObject[],
});

// <----------------------- UTILITIES ----------------------->

const updateId = (id: string): void => {
  serverLogger(LoggingTypes.info, `updating sessionId`, StoreEnums.updateId);
  sessionData.sessionId = id;
};

const roomSetup = (): void => {
  try {
    serverLogger(LoggingTypes.debug, `joining room`, StoreEnums.roomSetup);
    sessionData.socket.emit("create", sessionData.sessionId);
  } catch (error) {
    serverLogger(
      LoggingTypes.debug,
      `unable to connect to socket io`,
      StoreEnums.roomSetup
    );
  }
};

const toDiscord = (collectionType: CollectionTypes): void => {
  try {
    serverLogger(
      LoggingTypes.info,
      `emitting ${EmitTypes.DISCORD} for ${collectionType}`,
      StoreEnums.toDiscord
    );
    sessionData.socket.emit(EmitTypes.DISCORD, {
      payload: [],
      sessionId: sessionData.sessionId,
      collectionType: collectionType,
    });
  } catch (error) {
    if (error instanceof Error) {
      serverLogger(LoggingTypes.alert, error.message, StoreEnums.toDiscord);
    }
  }
};

const discordRoll = (toRoll: DiceRoll, comment: string): void => {
  try {
    sessionData.socket.emit(EmitTypes.DISCORD_ROLL, {
      payload: toRoll,
      comment: comment,
      sessionId: sessionData.sessionId,
    });
  } catch (error) {
    if (error instanceof Error) {
      serverLogger(LoggingTypes.alert, error.message, StoreEnums.toDiscord);
    }
  }
};

// <----------------------- ROLLS ----------------------->

const getInitialRolls = (): void => {
  serverLogger(
    LoggingTypes.info,
    `first fetch initiative`,
    StoreEnums.getInitial
  );
  sessionData.socket.emit(
    EmitTypes.GET_INITIAL_ROLLS,
    sessionData.sessionId,
    (query: RollObject[]) => {
      sessionData.rolls = query;
      console.log(query);
      serverLogger(
        LoggingTypes.info,
        `initiative store updated`,
        StoreEnums.getInitial
      );
    }
  );
};

const addRoll = (data: RollObject): void => {
  sessionData.rolls.push(data);
};

const emitAddRoll = (data: RollObject): void => {
  sessionData.socket.emit(EmitTypes.CREATE_NEW_ROLL, {
    rollData: data,
    sessionId: sessionData.sessionId,
  });
  serverLogger(LoggingTypes.debug, `Adding roll ${data.id}`, "emitAddRoll");
};

const updateRoll = (data: RollObject, index: number): void => {
  sessionData.rolls[index] = data;
};

const emitUpdateRoll = (data: RollObject): void => {
  sessionData.socket.emit(EmitTypes.UPDATE_ROLL_RECORD, {
    rollObject: data,
    sessionId: sessionData.sessionId,
  });
};

const deleteRoll = (id: string, index: number): void => {
  sessionData.rolls.splice(index, 1);
};

const emitDeleteRoll = (id: string): void => {
  sessionData.socket.emit(EmitTypes.DELETE_ONE_ROLL, {
    docId: id,
    sessionId: sessionData.sessionId,
  });
};

const getRolls = (): RollObject[] => {
  return sessionData.rolls;
};

const rollDice = (diceRoll: string): DiceRoll => {
  const newRoll = new DiceRoll(diceRoll);
  return newRoll;
};

// <----------------------- SPELL ----------------------->

const resetSpells = (emit: boolean): void => {
  sessionData.spells = [];
  serverLogger(LoggingTypes.info, `spells reset`, StoreEnums.resetAll);
  if (emit) {
    serverLogger(
      LoggingTypes.info,
      `emitting ${EmitTypes.DELETE_ALL_SPELL}`,
      StoreEnums.resetAll
    );
    sessionData.socket.emit(EmitTypes.DELETE_ALL_SPELL, sessionData.sessionId);
  }
};

const updateAllSpells = (data: SpellObject[]): void => {
  sessionData.spells = data;
  serverLogger(
    LoggingTypes.info,
    `update complete initiative`,
    StoreEnums.updateAll
  );
};

const getInitialSpells = (): void => {
  serverLogger(
    LoggingTypes.info,
    `first fetch spells`,
    StoreEnums.getInitialSpells
  );
  sessionData.socket.emit(
    EmitTypes.GET_SPELLS,
    sessionData.sessionId,
    (spells: SpellObject[]) => {
      serverLogger(
        LoggingTypes.debug,
        `Length: ${spells.length} First ID: ${
          spells[0] ? spells[0].id : "null"
        }`,
        StoreEnums.getInitialSpells
      );
      try {
        sessionData.spells = spells;
      } catch (error) {
        if (error instanceof Error) {
          serverLogger(
            LoggingTypes.alert,
            error.message,
            StoreEnums.getInitialSpells
          );
        }
      }

      serverLogger(
        LoggingTypes.info,
        `spell store updated`,
        StoreEnums.getInitialSpells
      );
    }
  );
};

const removeSpell = (index: number, id: string, emit: boolean): void => {
  serverLogger(
    LoggingTypes.debug,
    `removing status effects from all characters this spell`,
    StoreEnums.removeSpell,
    id
  );
  removeStatusEffects(index);
  setTimeout(() => {
    serverLogger(
      LoggingTypes.debug,
      `removing spell`,
      StoreEnums.removeSpell,
      id
    );
    sessionData.spells.splice(index, 1);
    if (emit) {
      serverLogger(
        LoggingTypes.debug,
        `emitting ${EmitTypes.UPDATE_ALL_INITIATIVE} for initiative`,
        StoreEnums.removeSpell
      );
      serverLogger(
        LoggingTypes.debug,
        `isSorted is: ${sessionData.isSorted}`,
        StoreEnums.removeSpell
      );
      sessionData.socket.emit(EmitTypes.UPDATE_ALL_INITIATIVE, {
        payload: sessionData.initiativeList,
        sessionId: sessionData.sessionId,
        resetOnDeck: false,
        isSorted: sessionData.isSorted,
      });
      serverLogger(
        LoggingTypes.debug,
        `emitting ${EmitTypes.DELETE_ONE_SPELL} for spell`,
        StoreEnums.removeSpell,
        id
      );
      sessionData.socket.emit(EmitTypes.DELETE_ONE_SPELL, {
        sessionId: sessionData.sessionId,
        docId: id,
      });
    }
  }, 200);
};

const addSpell = (data: any): void => {
  const id = uuidv4();
  serverLogger(
    LoggingTypes.debug,
    `creating spell object`,
    StoreEnums.addSpell,
    id
  );
  const newData = {
    durationTime: data.durationTime,
    durationType: data.durationType,
    effectName: data.effectName,
    effectDescription: data.effectDescription,
    id: id,
    characterIds: { target: [], source: [] } as CharacterStatusFirestore,
  };
  serverLogger(
    LoggingTypes.debug,
    `adding characters to spell characterIds`,
    StoreEnums.addSpell,
    id
  );
  if (sessionData.initiativeList.length > 0) {
    sessionData.initiativeList.forEach((item: InitiativeObject) => {
      newData.characterIds.source.push({
        characterName: item.characterName,
        characterId: item.id,
      });
    });
  } else {
    newData.characterIds.source = [];
    newData.characterIds.target = [];
  }
  sessionData.spells.push(newData);

  serverLogger(
    LoggingTypes.debug,
    `spell added to store, emitting ${EmitTypes.CREATE_NEW_SPELL}`,
    StoreEnums.addSpell,
    id
  );

  sessionData.socket.emit(EmitTypes.CREATE_NEW_SPELL, {
    payload: newData,
    sessionId: sessionData.sessionId,
  });
};

const updateSpell = (
  effectName: string,
  effectDescription: string,
  durationTime: number,
  durationType: string,
  index: number,
  emit: boolean,
  characterIds?: CharacterStatusFirestore
): void => {
  serverLogger(
    LoggingTypes.debug,
    `updating spell`,
    StoreEnums.updateSpell,
    sessionData.spells[index].id
  );
  sessionData.spells[index].effectName = effectName;
  sessionData.spells[index].effectDescription = effectDescription;
  sessionData.spells[index].durationTime = durationTime;
  sessionData.spells[index].durationType = durationType;
  if (characterIds) {
    sessionData.spells[index].characterIds = characterIds;
  }
  console.log(characterIds);
  if (emit) {
    serverLogger(
      LoggingTypes.debug,
      `emitting ${EmitTypes.UPDATE_RECORD_SPELL}`,
      StoreEnums.updateSpell,
      sessionData.spells[index].id
    );
    const options = {
      payload: sessionData.spells[index],
      sessionId: sessionData.sessionId,
    };
    sessionData.socket.emit(EmitTypes.UPDATE_RECORD_SPELL, options);
  }
};

const updateSpellItem = (
  ObjectType: SpellObjectEnums,
  toUpdate: any,
  index: number
): void => {
  serverLogger(
    LoggingTypes.debug,
    `updating spell item ${ObjectType}`,
    StoreEnums.updateSpellItem,
    sessionData.spells[index].id
  );
  switch (ObjectType) {
    case SpellObjectEnums.effectName:
      sessionData.spells[index].effectName = toUpdate;
      break;
    case SpellObjectEnums.effectDescription:
      sessionData.spells[index].effectDescription = toUpdate;
      break;
    case SpellObjectEnums.durationType:
      sessionData.spells[index].durationType = toUpdate;
      break;
    case SpellObjectEnums.durationTime:
      sessionData.spells[index].durationTime = toUpdate;
      break;
    case SpellObjectEnums.characterIds:
      sessionData.spells[index].characterIds = toUpdate;
      break;
  }
};

const getSpells = (): SpellObject[] => {
  return sessionData.spells;
};

// <----------------------- MIXED ----------------------->

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

const getInitiative = (): InitiativeObject[] => {
  return sessionData.initiativeList;
};

const getSorted = (): boolean => {
  return sessionData.isSorted;
};

const reRoll = (): number => {
  const newRoll = new DiceRoll(`d20`);
  return Number(newRoll.total);
};

const updateAllInitiative = (data: InitiativeObject[]): void => {
  sessionData.initiativeList = data;
  serverLogger(
    LoggingTypes.info,
    `update complete initiative`,
    StoreEnums.updateAll
  );
  return;
};

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

const updateSorted = (isSorted: boolean): void => {
  serverLogger(
    LoggingTypes.debug,
    `updating isSorted to: ${isSorted}`,
    StoreEnums.updateSorted
  );
  sessionData.isSorted = isSorted;
};

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

const startDrag = (evt: DragEvent, index: number): void => {
  if (evt.dataTransfer !== null) {
    evt.dataTransfer.dropEffect = "move";
    evt.dataTransfer.effectAllowed = "move";
    evt.dataTransfer.setData("itemIndex", String(index));
  }
};

const dragOver = (evt: DragEvent): void => {
  evt.preventDefault();
};

const dragEnter = (evt: DragEvent): void => {
  console.log(evt, "dragEnter");
};

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

const moveUp = (index: number): void => {
  console.log(index);
  console.log(sessionData.isSorted);
  if (index === 0) {
    console.log("===");
    return;
  }
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

const nextTurn = (): void => {
  serverLogger(
    LoggingTypes.info,
    `emitting ${EmitTypes.NEXT}`,
    StoreEnums.nextTurn
  );
  sessionData.socket.emit(EmitTypes.NEXT, sessionData.sessionId);
};

const previousTurn = (): void => {
  serverLogger(
    LoggingTypes.info,
    `emitting ${EmitTypes.PREVIOUS}`,
    StoreEnums.nextTurn
  );
  sessionData.socket.emit(EmitTypes.PREVIOUS, sessionData.sessionId);
};

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
  roomSetup,
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
