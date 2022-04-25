import { ref, Ref } from "vue";
import { InitiativeObjectEnums } from "../Interfaces/ContextEnums";
import { EmitTypes } from "../Interfaces/EmitTypes";
import { InitiativeObject, SpellObject } from "../Interfaces/initiative";
import { LoggingTypes, StoreEnums } from "../Interfaces/LoggingTypes";
import serverLogger from "../Utils/LoggingClass";
import { getSocket, getsessionId } from "./sessionStore";
import { v4 as uuidv4 } from "uuid";
import { findIndexById } from "./utilities";

const initiativeList = ref([] as InitiativeObject[]);
const isSorted = ref(false);

const socket = getSocket();

const INITIATIVE_FUNCS = {
  GETTERS: {
    getInitiative(): Ref<InitiativeObject[]> {
      return initiativeList;
    },
    getSorted(): Ref<boolean> {
      return isSorted;
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
    updateCharacterRecord(initiative: InitiativeObject): void {
      // is reset// all to false needs to be a separate thing
      serverLogger(
        LoggingTypes.debug,
        `updating initiative Ojbect`,
        StoreEnums.updateCharacterRecord,
        initiative.id
      );
      const initIndex = findIndexById(initiativeList.value, initiative.id);
      initiativeList.value[initIndex] = initiative;
      serverLogger(
        LoggingTypes.debug,
        `update complete`,
        StoreEnums.updateCharacterRecord,
        initiative.id
      );
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
      this.alltoFalse();
      isSorted.value = false;

      serverLogger(
        LoggingTypes.debug,
        `adding initiative to the store`,
        StoreEnums.addCharacter,
        data.id
      );

      initiativeList.value.push(data);
      // update once spell store is created
      // this should be it's own function
      // if (sessionData.spells.length > 0) {
      //   serverLogger(
      //     LoggingTypes.debug,
      //     `adding new character to spells characterIds lists`,
      //     StoreEnums.addCharacter,
      //     data.id
      //   );
      //   sessionData.spells.forEach((spell: SpellObject) => {
      //     spell.characterIds.source.push({
      //       characterName: data.characterName,
      //       characterId: data.id,
      //     });
      //   });

      //   serverLogger(
      //     LoggingTypes.debug,
      //     `emitting Spell List`,
      //     StoreEnums.addCharacter
      //   );
      //   socket.emit(EmitTypes.UPDATE_ALL_SPELL, {
      //     payload: sessionData.spells,
      //     sessionId: sessionData.sessionId,
      //   });
      // } separate functions
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
      // setTimeout(() => {
      //   serverLogger(
      //     LoggingTypes.debug,
      //     `emitting ${EmitTypes.UPDATE_ALL_INITIATIVE} after drop completion`,
      //     StoreEnums.onDrop
      //   );
      //   // this needs to be a separate function
      //   const sessionId = getsessionId();
      //   socket.emit(EmitTypes.UPDATE_ALL_INITIATIVE, {
      //     payload: initiativeList.value,
      //     sessionId: sessionId,
      //     resetOnDeck: true,
      //     isSorted: isSorted.value,
      //   });
      // }, 500); separate function
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
      // setTimeout(() => {
      //   serverLogger(
      //     LoggingTypes.debug,
      //     `emitting ${EmitTypes.UPDATE_ALL_INITIATIVE} after drop completion`,
      //     StoreEnums.onDrop
      //   );
      //   //this needs to be a separate function. same as moveUp
      //   socket.emit(EmitTypes.UPDATE_ALL_INITIATIVE, {
      //     payload: initiativeList.value,
      //     sessionId: sessionData.sessionId,
      //     resetOnDeck: true,
      //     isSorted: isSorted.value,
      //   });
      // }, 500); separate function
    },
    removeCharacter(index: number, id: string, emit: boolean): void {
      isSorted.value = false;
      initiativeList.value.splice(index, 1);
      serverLogger(
        LoggingTypes.info,
        `character removed, sort reset`,
        StoreEnums.removeCharacter,
        id
      );
      // this should be outside of this function
      // if (sessionData.spells.length > 0) {
      //   removeCharacterFromSpells(id);
      // }
    },
    setCurrent(index: number): void {
      serverLogger(
        LoggingTypes.info,
        `resetting isSorted for all initiative`,
        StoreEnums.setCurrent,
        initiativeList.value[index].id
      );
      // alltofalse separate call
      // alltoFalse();
      initiativeList.value[index].isCurrent = true;
      serverLogger(
        LoggingTypes.info,
        `reset complete. update to initiative record complete. emitting ${EmitTypes.UPDATE_ALL_INITIATIVE}`,
        StoreEnums.setCurrent,
        initiativeList.value[index].id
      );
      // emit also need to be separate.
    },
    resetInitiative(): void {
      isSorted.value = false;
      initiativeList.value = [];
      // sessionData.spells.forEach((spell: SpellObject, index) => {
      //   sessionData.spells[index].characterIds.source = [];
      //   sessionData.spells[index].characterIds.target = [];
      // }); this should be a separate function
      serverLogger(LoggingTypes.info, `spells reset`, StoreEnums.resetAll);
      // if (emit) {
      //   serverLogger(
      //     LoggingTypes.info,
      //     `emitting ${EmitTypes.DELETE_ALL_INITIATIVE}`,
      //     StoreEnums.resetAll
      //   );
      //   socket.emit(EmitTypes.DELETE_ALL_INITIATIVE, sessionData.sessionId);
      //   socket.emit(EmitTypes.UPDATE_ALL_SPELL, {
      //     payload: sessionData.spells,
      //     sessionId: sessionData.sessionId,
      //   });
      // } separate functions
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
  roundStart(): void {
    serverLogger(
      LoggingTypes.info,
      `emitting ${EmitTypes.ROUND_START} for initiative`,
      StoreEnums.roundStart
    );
    const sessionId = getsessionId();
    socket.emit(
      EmitTypes.ROUND_START,
      sessionId,
      (data: InitiativeObject[]) => {
        initiativeList.value = data;
        isSorted.value = true;
        serverLogger(
          LoggingTypes.info,
          `roundstart complete, updated store data for initiative and isSorted: ${isSorted.value}`,
          StoreEnums.roundStart
        );
      }
    );
  },
  nextTurn(): void {
    serverLogger(
      LoggingTypes.info,
      `emitting ${EmitTypes.NEXT}`,
      StoreEnums.nextTurn
    );
    const sessionId = getsessionId();
    socket.emit(EmitTypes.NEXT, sessionId);
  },
  previousTurn(): void {
    serverLogger(
      LoggingTypes.info,
      `emitting ${EmitTypes.PREVIOUS}`,
      StoreEnums.nextTurn
    );
    const sessionId = getsessionId();
    socket.emit(EmitTypes.PREVIOUS, sessionId);
  },
};

export default {
  initiativeList,
  INITIATIVE_FUNCS,
  isSorted,
};
