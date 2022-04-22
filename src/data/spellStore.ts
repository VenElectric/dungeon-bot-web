import { ref } from "vue";
import { SpellObjectEnums } from "../Interfaces/ContextEnums";
import { EmitTypes } from "../Interfaces/EmitTypes";
import { InitiativeObject } from "../Interfaces/initiative";
import { LoggingTypes, StoreEnums } from "../Interfaces/LoggingTypes";
import { CharacterStatusFirestore, SpellObject } from "../Interfaces/Spells";
import serverLogger from "../Utils/LoggingClass";
import { getSocket, getsessionId } from "./sessionStore";
import { v4 as uuidv4 } from "uuid";
import { findIndexById } from "./utilities";

const spellStore = ref([] as SpellObject[]);

const socket = getSocket();

const SPELL_FUNCS = {
  GETTERS: {
    getspells(): SpellObject[] {
      return spellStore.value;
    },
  },
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
    addSpell(data: any): SpellObject {
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

      serverLogger(
        LoggingTypes.debug,
        `spell added to store, emitting ${EmitTypes.CREATE_NEW_SPELL}`,
        StoreEnums.addSpell,
        id
      );
      return newData;
    },
    initializeCharacterIDS(
      spellData: SpellObject,
      initiativeList: InitiativeObject[]
    ): SpellObject {
      if (initiativeList.length > 0) {
        initiativeList.forEach((item: InitiativeObject) => {
          spellData.characterIds.source.push({
            characterName: item.characterName,
            characterId: item.id,
          });
        });
      } else {
        spellData.characterIds.source = [];
        spellData.characterIds.target = [];
      }
      return spellData;
    },
    updateSpell(data: SpellObject): void {
      serverLogger(
        LoggingTypes.debug,
        `updating spell`,
        StoreEnums.updateSpell,
        data.id
      );
      const spellId = findIndexById(spellStore.value, data.id);
      if (spellId > -1) {
        spellStore.value[spellId] = data;
      }
    },
    updateSpellItem(
      ObjectType: SpellObjectEnums,
      toUpdate: any,
      index: number
    ): SpellObject {
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
      return spellStore.value[index];
    },
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
    emitDeleteSpell(id: string): void {
      const sessionId = getsessionId();
      serverLogger(
        LoggingTypes.debug,
        `emitting ${EmitTypes.DELETE_ONE_SPELL} for spell`,
        StoreEnums.removeSpell,
        id
      );
      socket.emit(EmitTypes.DELETE_ONE_SPELL, {
        sessionId: sessionId,
        docId: id,
      });
    },
    emitNewSpell(spell: SpellObject): void {
      socket.emit(EmitTypes.CREATE_NEW_SPELL, {
        payload: spell,
        sessionId: getsessionId(),
      });
    },
    emitUpdateSpell(spell: SpellObject): void {
      socket.emit(EmitTypes.UPDATE_RECORD_SPELL, {
        payload: spell,
        sessionId: getsessionId(),
        docId: spell.id,
      });
    },
  },
};

// <----------------------- SPELL ----------------------->

// setter delete all spells

// setter update all spells

// emit/setter retrieve spells

// setter delete one spell

// setter add new spell and emit

// setter update one spell and emit

// setter update spell variable

// getter spells

