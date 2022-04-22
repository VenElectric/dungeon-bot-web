
// <----------------------- MIXED ----------------------->
// setter update either spells or initiative
// is this called in the initiative section or spell section?


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
