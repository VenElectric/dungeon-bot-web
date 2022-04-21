import { ref } from "vue";
import { SpellObjectEnums } from "../Interfaces/ContextEnums";
import { EmitTypes } from "../Interfaces/EmitTypes";
import { InitiativeObject } from "../Interfaces/initiative";
import { LoggingTypes, StoreEnums } from "../Interfaces/LoggingTypes";
import { CharacterStatusFirestore, SpellObject } from "../Interfaces/Spells";
import serverLogger from "../Utils/LoggingClass";
import { getSocket, getsessionId } from "./sessionStore";
import { v4 as uuidv4 } from "uuid";

const spellStore = ref([] as SpellObject[]);

const socket = getSocket();

const SPELL_FUNCS = {
  GETTERS: {},
  SETTERS: {
    resetSpells(emit: boolean): void {
      spellStore.value = [];
      serverLogger(LoggingTypes.info, `spells reset`, StoreEnums.resetAll);
      if (emit) {
        serverLogger(
          LoggingTypes.info,
          `emitting ${EmitTypes.DELETE_ALL_SPELL}`,
          StoreEnums.resetAll
        );

        const sessionId = getsessionId();

        socket.emit(EmitTypes.DELETE_ALL_SPELL, sessionId);
      }
    },
    updateAllSpells(data: SpellObject[]): void {
      spellStore.value = data;
      serverLogger(
        LoggingTypes.info,
        `update complete initiative`,
        StoreEnums.updateAll
      );
    },
    removeSpell(index: number, id: string, emit: boolean): void {
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
        spellStore.value.splice(index, 1);
      }, 200);
    },
    addSpell = (data: any): void => {
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
        spellStore.value.push(newData);
      
        serverLogger(
          LoggingTypes.debug,
          `spell added to store, emitting ${EmitTypes.CREATE_NEW_SPELL}`,
          StoreEnums.addSpell,
          id
        );
      };
  },
  EMITS: {
    getInitialSpells(): void {
      serverLogger(
        LoggingTypes.info,
        `first fetch spells`,
        StoreEnums.getInitialSpells
      );
      const sessionId = getsessionId();
      socket.emit(EmitTypes.GET_SPELLS, sessionId, (spells: SpellObject[]) => {
        serverLogger(
          LoggingTypes.debug,
          `Length: ${spells.length} First ID: ${
            spells[0] ? spells[0].id : "null"
          }`,
          StoreEnums.getInitialSpells
        );
        try {
          spellStore.value = spells;
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
      });
    },
    emitRemoveSpell(): void {
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
      socket.emit(EmitTypes.UPDATE_ALL_INITIATIVE, {
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
      socket.emit(EmitTypes.DELETE_ONE_SPELL, {
        sessionId: sessionData.sessionId,
        docId: id,
      });
    },
    emitCreateSpell(): void {
        socket.emit(EmitTypes.CREATE_NEW_SPELL, {
            payload: newData,
            sessionId: sessionData.sessionId,
          });
    }
  },
};

// <----------------------- SPELL ----------------------->

// setter delete all spells

// setter update all spells

// emit/setter retrieve spells

// setter delete one spell

// setter add new spell and emit
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
  spellStore.value.push(newData);

  serverLogger(
    LoggingTypes.debug,
    `spell added to store, emitting ${EmitTypes.CREATE_NEW_SPELL}`,
    StoreEnums.addSpell,
    id
  );

  socket.emit(EmitTypes.CREATE_NEW_SPELL, {
    payload: newData,
    sessionId: sessionData.sessionId,
  });
};

// setter update one spell and emit
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
    spellStore.value[index].id
  );
  spellStore.value[index].effectName = effectName;
  spellStore.value[index].effectDescription = effectDescription;
  spellStore.value[index].durationTime = durationTime;
  spellStore.value[index].durationType = durationType;
  if (characterIds) {
    spellStore.value[index].characterIds = characterIds;
  }
  console.log(characterIds);
  if (emit) {
    serverLogger(
      LoggingTypes.debug,
      `emitting ${EmitTypes.UPDATE_RECORD_SPELL}`,
      StoreEnums.updateSpell,
      spellStore.value[index].id
    );
    const options = {
      payload: spellStore.value[index],
      sessionId: sessionData.sessionId,
    };
    socket.emit(EmitTypes.UPDATE_RECORD_SPELL, options);
  }
};

// setter update spell variable
const updateSpellItem = (
  ObjectType: SpellObjectEnums,
  toUpdate: any,
  index: number
): void => {
  serverLogger(
    LoggingTypes.debug,
    `updating spell item ${ObjectType}`,
    StoreEnums.updateSpellItem,
    spellStore.value[index].id
  );
  switch (ObjectType) {
    case SpellObjectEnums.effectName:
      spellStore.value[index].effectName = toUpdate;
      break;
    case SpellObjectEnums.effectDescription:
      spellStore.value[index].effectDescription = toUpdate;
      break;
    case SpellObjectEnums.durationType:
      spellStore.value[index].durationType = toUpdate;
      break;
    case SpellObjectEnums.durationTime:
      spellStore.value[index].durationTime = toUpdate;
      break;
    case SpellObjectEnums.characterIds:
      spellStore.value[index].characterIds = toUpdate;
      break;
  }
};

// getter spells
const getSpells = (): SpellObject[] => {
  return spellStore.value;
};

