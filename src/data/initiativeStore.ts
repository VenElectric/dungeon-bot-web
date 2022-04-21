import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { ref } from "vue";
import { InitiativeObjectEnums } from "../Interfaces/ContextEnums";
import { EmitTypes } from "../Interfaces/EmitTypes";
import { InitiativeObject, SpellObject } from "../Interfaces/initiative";
import { LoggingTypes, StoreEnums } from "../Interfaces/LoggingTypes";
import serverLogger from "../Utils/LoggingClass";
import { getSocket, getsessionId } from "./sessionStore";
import { v4 as uuidv4 } from "uuid";

const initiativeList = ref([] as InitiativeObject[]);
const isSorted = ref(false);

const socket = getSocket();

const INITIATIVE_FUNCS = {
  GETTERS: {
    getInitiative(): InitiativeObject[] {
      return initiativeList.value;
    },
    getSorted(): boolean {
      return isSorted.value;
    },
  },
  SETTERS: {
    updateAllInitiative(data: InitiativeObject[]): void {
      initiativeList.value = data;
      serverLogger(
        LoggingTypes.info,
        `update complete initiative`,
        StoreEnums.updateAll
      );
      return;
    },
    alltoFalse(): void {
      serverLogger(
        LoggingTypes.debug,
        `setting isCurrent for all records to false`,
        StoreEnums.alltoFalse
      );
      try {
        initiativeList.value.forEach((item: InitiativeObject, index) => {
          initiativeList.value[index].isCurrent = false;
        });
      } catch (error) {
        if (error instanceof Error) {
          serverLogger(
            LoggingTypes.alert,
            error.message,
            StoreEnums.alltoFalse
          );
        }
      }
    },
    updateSorted(isSortedNew: boolean): void {
      serverLogger(
        LoggingTypes.debug,
        `updating isSorted to: ${isSortedNew}`,
        StoreEnums.updateSorted
      );
      isSorted.value = isSortedNew;
    },
    getInitial(): void {
      serverLogger(
        LoggingTypes.info,
        `first fetch initiative`,
        StoreEnums.getInitial
      );

      const sessionId = getsessionId();

      socket.emit(EmitTypes.GET_INITIAL, sessionId, (query: any) => {
        initiativeList.value = query.initiativeList;
        isSorted.value = query.isSorted;
        serverLogger(
          LoggingTypes.info,
          `initiative store updated`,
          StoreEnums.getInitial
        );
      });
    },
    addCharacter(data: InitiativeObject): void {
      serverLogger(
        LoggingTypes.debug,
        `changing all isCurrent to false`,
        StoreEnums.addCharacter
      );
      alltoFalse();
      isSorted.value = false;

      serverLogger(
        LoggingTypes.debug,
        `adding initiative to the store`,
        StoreEnums.addCharacter,
        data.id
      );

      initiativeList.value.push(data);
      // update once spell store is created
      // possibly need to keep this as a separate function??
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
        socket.emit(EmitTypes.UPDATE_ALL_SPELL, {
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
      const sessionId = getsessionId();
      socket.emit(EmitTypes.CREATE_NEW_INITIATIVE, {
        payload: data,
        sessionId: sessionId,
      });
    },
    startDrag(evt: DragEvent, index: number): void {
      if (evt.dataTransfer !== null) {
        evt.dataTransfer.dropEffect = "move";
        evt.dataTransfer.effectAllowed = "move";
        evt.dataTransfer.setData("itemIndex", String(index));
      }
    },
    onDrop(evt: any): void {
      if (!isSorted.value) return;
      const toMove = { ...initiativeList.value[evt.dragIndex] };
      if (toMove) {
        initiativeList.value.splice(evt.dragIndex, 1);
        initiativeList.value.splice(evt.dropIndex, 0, toMove);
        initiativeList.value.forEach((item: InitiativeObject, index) => {
          initiativeList.value[index].roundOrder = index + 1;
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

          const sessionId = getsessionId();
          socket.emit(EmitTypes.UPDATE_ALL_INITIATIVE, {
            payload: initiativeList.value,
            sessionId: sessionId,
            resetOnDeck: true,
            isSorted: isSorted.value,
          });
        }, 500);
      }
    },
    moveUp(index: number): void {
      if (index === 0) return;
      if (!isSorted.value) return;
      const toMove = { ...initiativeList.value[index] };
      initiativeList.value.splice(index, 1);
      initiativeList.value.splice(index - 1, 0, toMove);
      initiativeList.value.forEach((item: InitiativeObject, index) => {
        initiativeList.value[index].roundOrder = index + 1;
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
        // this needs to be a separate function
        const sessionId = getsessionId();
        socket.emit(EmitTypes.UPDATE_ALL_INITIATIVE, {
          payload: initiativeList.value,
          sessionId: sessionId,
          resetOnDeck: true,
          isSorted: isSorted.value,
        });
      }, 500);
    },
    moveDown(index: number): void {
      console.log(index);
      console.log(isSorted.value);
      if (index === initiativeList.value.length - 1) {
        console.log("=== move down");
        return;
      }
      if (!isSorted.value) return;
      const toMove = { ...initiativeList.value[index] };
      initiativeList.value.splice(index, 1);
      initiativeList.value.splice(index + 1, 0, toMove);
      initiativeList.value.forEach((item: InitiativeObject, index) => {
        initiativeList.value[index].roundOrder = index + 1;
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
        //this needs to be a separate function. same as moveUp
        socket.emit(EmitTypes.UPDATE_ALL_INITIATIVE, {
          payload: initiativeList.value,
          sessionId: sessionData.sessionId,
          resetOnDeck: true,
          isSorted: isSorted.value,
        });
      }, 500);
    },
  },
  EMITS: {
    reSort(): void {
      serverLogger(
        LoggingTypes.info,
        `emitting ${EmitTypes.RESORT} for initiative`,
        StoreEnums.reSort
      );
      const sessionId = getsessionId();
      socket.emit(EmitTypes.RESORT, sessionId, (data: InitiativeObject[]) => {
        initiativeList.value = data;
        console.info(initiativeList.value);
        serverLogger(
          LoggingTypes.info,
          `resort complete, updated store data for initiative and isSorted`,
          StoreEnums.reSort
        );
      });
    },
  },
};

// <----------------------- INITIATIVE ----------------------->

// getter initiative
// const getInitiative = (): InitiativeObject[] => {
//   return initiativeList.value;
// };

// getter isSorted
// const getSorted = (): boolean => {
//   return isSorted.value;
// };

// utility rolls (reroll for initiative)
// what function calls this and which category would this go under?
const reRoll = (): number => {
  const newRoll = new DiceRoll(`d20`);
  return Number(newRoll.total);
};

// setter initiative
// const updateAllInitiative = (data: InitiativeObject[]): void => {
//   initiativeList.value = data;
//   serverLogger(
//     LoggingTypes.info,
//     `update complete initiative`,
//     StoreEnums.updateAll
//   );
//   return;
// };

// setter isCurrent -> false
// const alltoFalse = (): void => {
//   serverLogger(
//     LoggingTypes.debug,
//     `setting isCurrent for all records to false`,
//     StoreEnums.alltoFalse
//   );
//   try {
//     initiativeList.value.forEach((item: InitiativeObject, index) => {
//       initiativeList.value[index].isCurrent = false;
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       serverLogger(LoggingTypes.alert, error.message, StoreEnums.alltoFalse);
//     }
//   }
// };

// setter update isSorted
// const updateSorted = (isSortedNew: boolean): void => {
//   serverLogger(
//     LoggingTypes.debug,
//     `updating isSorted to: ${isSortedNew}`,
//     StoreEnums.updateSorted
//   );
//   isSorted.value = isSortedNew;
// };

// setter/emit initiative
// const getInitial = (): void => {
//   serverLogger(
//     LoggingTypes.info,
//     `first fetch initiative`,
//     StoreEnums.getInitial
//   );

//   socket.emit(EmitTypes.GET_INITIAL, sessionData.sessionId, (query: any) => {
//     initiativeList.value = query.initiativeList;
//     isSorted.value = query.isSorted;
//     serverLogger(
//       LoggingTypes.info,
//       `initiative store updated`,
//       StoreEnums.getInitial
//     );
//   });
// };

// setter update one character record
// remove alltofalse to where it's needed
// Update character record vs update character item. Are both necessary?
// need to look at where these are called and see which one would be best.
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
  const initIndex = initiativeList.value
    .map((record: InitiativeObject) => record.id)
    .indexOf(initiative.id);
  initiativeList.value[initIndex] = initiative;
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
      socket.emit(EmitTypes.UPDATE_ITEM_INITIATIVE, {
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
        initiativeList.value[index].characterName = toUpdate;
        break;
      case InitiativeObjectEnums.initiative:
        initiativeList.value[index].initiative = toUpdate;
        break;
      case InitiativeObjectEnums.initiativeModifier:
        initiativeList.value[index].initiativeModifier = toUpdate;
        break;
      case InitiativeObjectEnums.isCurrent:
        initiativeList.value[index].isCurrent = toUpdate;
        break;
      case InitiativeObjectEnums.roundOrder:
        initiativeList.value[index].roundOrder = toUpdate;
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
// const addCharacter = (data: InitiativeObject): void => {
//   serverLogger(
//     LoggingTypes.debug,
//     `changing all isCurrent to false`,
//     StoreEnums.addCharacter
//   );
//   alltoFalse();
//   isSorted.value = false;

//   serverLogger(
//     LoggingTypes.debug,
//     `adding initiative to the store`,
//     StoreEnums.addCharacter,
//     data.id
//   );

//   initiativeList.value.push(data);
//   if (sessionData.spells.length > 0) {
//     serverLogger(
//       LoggingTypes.debug,
//       `adding new character to spells characterIds lists`,
//       StoreEnums.addCharacter,
//       data.id
//     );
//     sessionData.spells.forEach((spell: SpellObject) => {
//       spell.characterIds.source.push({
//         characterName: data.characterName,
//         characterId: data.id,
//       });
//     });

//     serverLogger(
//       LoggingTypes.debug,
//       `emitting Spell List`,
//       StoreEnums.addCharacter
//     );
//     socket.emit(EmitTypes.UPDATE_ALL_SPELL, {
//       payload: sessionData.spells,
//       sessionId: sessionData.sessionId,
//     });
//   }
//   serverLogger(
//     LoggingTypes.debug,
//     `emitting new character`,
//     StoreEnums.addCharacter,
//     data.id
//   );
//   socket.emit(EmitTypes.CREATE_NEW_INITIATIVE, {
//     payload: data,
//     sessionId: sessionData.sessionId,
//   });
// };

// setter initiative delete character
const removeCharacter = (index: number, id: string, emit: boolean): void => {
  isSorted.value = false;
  initiativeList.value.splice(index, 1);
  serverLogger(
    LoggingTypes.info,
    `character removed, sort reset`,
    StoreEnums.removeCharacter,
    id
  );
  if (sessionData.spells.length > 0) {
    removeCharacterFromSpells(id);
  }
};

// removing emit from remove character. this will be a separate function

function emitDeleteCharacter(): void {
  setTimeout(() => {
    serverLogger(
      LoggingTypes.debug,
      `emitting ${EmitTypes.DELETE_ONE_INITIATIVE}`,
      StoreEnums.removeCharacter,
      id
    );
    socket.emit(EmitTypes.DELETE_ONE_INITIATIVE, {
      sessionId: sessionData.sessionId,
      docId: id,
    });
    serverLogger(
      LoggingTypes.debug,
      `emitting ${EmitTypes.UPDATE_ALL_SPELL} for spells`,
      StoreEnums.removeCharacter,
      id
    );
    // this may need to be a separate function in spells
    socket.emit(EmitTypes.UPDATE_ALL_SPELL, {
      payload: sessionData.spells,
      sessionId: sessionData.sessionId,
    });
  }, 200);
}

// legacy
// const startDrag = (evt: DragEvent, index: number): void => {
//   if (evt.dataTransfer !== null) {
//     evt.dataTransfer.dropEffect = "move";
//     evt.dataTransfer.effectAllowed = "move";
//     evt.dataTransfer.setData("itemIndex", String(index));
//   }
// };

// legacy

const dragOver = (evt: DragEvent): void => {
  evt.preventDefault();
};

// legacy

const dragEnter = (evt: DragEvent): void => {
  console.log(evt, "dragEnter");
};

// setter initiative update round order
// const onDrop = (evt: any): void => {
//   if (!isSorted.value) return;
//   const toMove = { ...initiativeList.value[evt.dragIndex] };
//   if (toMove) {
//     initiativeList.value.splice(evt.dragIndex, 1);
//     initiativeList.value.splice(evt.dropIndex, 0, toMove);
//     initiativeList.value.forEach((item: InitiativeObject, index) => {
//       initiativeList.value[index].roundOrder = index + 1;
//     });
//     serverLogger(
//       LoggingTypes.debug,
//       `drop complete, initiativeList order updating`,
//       StoreEnums.onDrop
//     );
//     setTimeout(() => {
//       serverLogger(
//         LoggingTypes.debug,
//         `emitting ${EmitTypes.UPDATE_ALL_INITIATIVE} after drop completion`,
//         StoreEnums.onDrop
//       );
//       socket.emit(EmitTypes.UPDATE_ALL_INITIATIVE, {
//         payload: initiativeList.value,
//         sessionId: sessionData.sessionId,
//         resetOnDeck: true,
//         isSorted: isSorted.value,
//       });
//     }, 500);
//   }
// };

// setter initiative change round order for mobile
// const moveUp = (index: number): void => {
//   if (index === 0) return;
//   if (!isSorted.value) return;
//   const toMove = { ...initiativeList.value[index] };
//   initiativeList.value.splice(index, 1);
//   initiativeList.value.splice(index - 1, 0, toMove);
//   initiativeList.value.forEach((item: InitiativeObject, index) => {
//     initiativeList.value[index].roundOrder = index + 1;
//   });
//   serverLogger(
//     LoggingTypes.debug,
//     `drop complete, initiativeList order updating`,
//     StoreEnums.onDrop
//   );
//   setTimeout(() => {
//     serverLogger(
//       LoggingTypes.debug,
//       `emitting ${EmitTypes.UPDATE_ALL_INITIATIVE} after drop completion`,
//       StoreEnums.onDrop
//     );
//     socket.emit(EmitTypes.UPDATE_ALL_INITIATIVE, {
//       payload: initiativeList.value,
//       sessionId: sessionData.sessionId,
//       resetOnDeck: true,
//       isSorted: isSorted.value,
//     });
//   }, 500);
// };

// setter initiative change round order for mobile
// const moveDown = (index: number): void => {
//   console.log(index);
//   console.log(isSorted.value);
//   if (index === initiativeList.value.length - 1) {
//     console.log("=== move down");
//     return;
//   }
//   if (!isSorted.value) return;
//   const toMove = { ...initiativeList.value[index] };
//   initiativeList.value.splice(index, 1);
//   initiativeList.value.splice(index + 1, 0, toMove);
//   initiativeList.value.forEach((item: InitiativeObject, index) => {
//     initiativeList.value[index].roundOrder = index + 1;
//   });
//   serverLogger(
//     LoggingTypes.debug,
//     `drop complete, initiativeList order updating`,
//     StoreEnums.onDrop
//   );
//   setTimeout(() => {
//     serverLogger(
//       LoggingTypes.debug,
//       `emitting ${EmitTypes.UPDATE_ALL_INITIATIVE} after drop completion`,
//       StoreEnums.onDrop
//     );
//     socket.emit(EmitTypes.UPDATE_ALL_INITIATIVE, {
//       payload: initiativeList.value,
//       sessionId: sessionData.sessionId,
//       resetOnDeck: true,
//       isSorted: isSorted.value,
//     });
//   }, 500);
// };

// emit round start
const roundStart = (): void => {
  serverLogger(
    LoggingTypes.info,
    `emitting ${EmitTypes.ROUND_START} for initiative`,
    StoreEnums.roundStart
  );
  // why returning data here.
  // check to see if necessary
  socket.emit(
    EmitTypes.ROUND_START,
    sessionData.sessionId,
    (data: InitiativeObject[]) => {
      console.info(data);
      initiativeList.value = data;
      isSorted.value = true;
      serverLogger(
        LoggingTypes.info,
        `roundstart complete, updated store data for initiative and isSorted: ${isSorted.value}`,
        StoreEnums.roundStart
      );
    }
  );
};

// setter/emit resort initiative to all in room
// const reSort = (): void => {
//   serverLogger(
//     LoggingTypes.info,
//     `emitting ${EmitTypes.RESORT} for initiative`,
//     StoreEnums.reSort
//   );
//   socket.emit(
//     EmitTypes.RESORT,
//     sessionData.sessionId,
//     (data: InitiativeObject[]) => {
//       initiativeList.value = data;
//       console.info(initiativeList.value);
//       serverLogger(
//         LoggingTypes.info,
//         `resort complete, updated store data for initiative and isSorted`,
//         StoreEnums.reSort
//       );
//     }
//   );
// };

// setter/emit set current character at index
const setCurrent = (index: number): void => {
  serverLogger(
    LoggingTypes.info,
    `resetting isSorted for all initiative`,
    StoreEnums.setCurrent,
    initiativeList.value[index].id
  );
  alltoFalse();
  initiativeList.value[index].isCurrent = true;
  serverLogger(
    LoggingTypes.info,
    `reset complete. update to initiative record complete. emitting ${EmitTypes.UPDATE_ALL_INITIATIVE}`,
    StoreEnums.setCurrent,
    initiativeList.value[index].id
  );
  socket.emit(EmitTypes.UPDATE_ALL_INITIATIVE, {
    payload: initiativeList.value,
    sessionId: sessionData.sessionId,
    resetOnDeck: true,
    isSorted: isSorted.value,
  });
};

// setter/emit next initiative
const nextTurn = (): void => {
  serverLogger(
    LoggingTypes.info,
    `emitting ${EmitTypes.NEXT}`,
    StoreEnums.nextTurn
  );
  socket.emit(EmitTypes.NEXT, sessionData.sessionId);
};

// setter/emit previous initiative
const previousTurn = (): void => {
  serverLogger(
    LoggingTypes.info,
    `emitting ${EmitTypes.PREVIOUS}`,
    StoreEnums.nextTurn
  );
  socket.emit(EmitTypes.PREVIOUS, sessionData.sessionId);
};

// setter reset spells and initiative
const resetAll = (emit: boolean): void => {
  isSorted.value = false;
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
  isSorted.value = false;
  initiativeList.value = [];
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
    socket.emit(EmitTypes.DELETE_ALL_INITIATIVE, sessionData.sessionId);
    socket.emit(EmitTypes.UPDATE_ALL_SPELL, {
      payload: sessionData.spells,
      sessionId: sessionData.sessionId,
    });
  }
};
