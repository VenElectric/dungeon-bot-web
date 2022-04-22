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
import { CharacterPickListEvent } from "./types";
import initiativeStore from "./initiativeStore";

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
    removeSpell(index: number, id: string): void {
      serverLogger(
        LoggingTypes.debug,
        `removing status effects from all characters this spell`,
        StoreEnums.removeSpell,
        id
      );
      this.removeStatusEffects(index);
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
            id: item.id,
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
    addStatusEffects(index: number) {
      serverLogger(
        LoggingTypes.debug,
        `adding spell effect to all characters`,
        StoreEnums.addStatusEffects,
        spellStore.value[index].id
      );
      const initiativeTemp =
        initiativeStore.INITIATIVE_FUNCS.GETTERS.getInitiative();
      initiativeTemp.forEach((init: InitiativeObject) => {
        init.statusEffects.push({
          spellName: spellStore.value[index].effectName,
          id: spellStore.value[index].id,
          effectDescription: spellStore.value[index].effectDescription,
        });
      });
      initiativeStore.INITIATIVE_FUNCS.SETTERS.updateAllInitiative(
        initiativeTemp
      );
    },
    removeStatusEffects(spellIndex: number) {
      serverLogger(
        LoggingTypes.debug,
        `removing spell effect from all characters`,
        StoreEnums.removeStatusEffects,
        spellStore.value[spellIndex].id
      );
      const initiativeTemp =
        initiativeStore.INITIATIVE_FUNCS.GETTERS.getInitiative();

      for (const record of initiativeTemp) {
        const statusIndex = findIndexById(
          record.statusEffects,
          spellStore.value[spellIndex].id
        );
        if (statusIndex > -1) {
          record.statusEffects.splice(statusIndex, 1);
          initiativeStore.INITIATIVE_FUNCS.SETTERS.updateCharacterRecord(
            record
          );
        }
      }
    },
    addStatusEffect(
      spellName: string,
      spellId: string,
      effectDescription: string,
      characterIndex: number
    ): void {
      const intiativeTemp =
        initiativeStore.INITIATIVE_FUNCS.GETTERS.getInitiative();
      serverLogger(
        LoggingTypes.debug,
        `adding spell effect to one character`,
        StoreEnums.addStatusEffect
      );
      intiativeTemp[characterIndex].statusEffects.push({
        spellName: spellName,
        id: spellId,
        effectDescription: effectDescription,
      });
      initiativeStore.INITIATIVE_FUNCS.SETTERS.updateCharacterRecord(
        intiativeTemp[characterIndex]
      );
    },
    removeStatusEffect(spellId: string, characterIndex: number): void {
      const initiativeTemp =
        initiativeStore.INITIATIVE_FUNCS.GETTERS.getInitiative();
      serverLogger(
        LoggingTypes.debug,
        `removing spell effect from one character`,
        StoreEnums.removeStatusEffect,
        initiativeTemp[characterIndex].id
      );
      const spellIndex = findIndexById(
        initiativeTemp[characterIndex].statusEffects,
        spellId
      );
      initiativeTemp[characterIndex].statusEffects.splice(spellIndex, 1);
      initiativeStore.INITIATIVE_FUNCS.SETTERS.updateCharacterRecord(
        initiativeTemp[characterIndex]
      );
    },
    changeAllCharacterToTarget(index: number): void {
      serverLogger(
        LoggingTypes.debug,
        `changing all characters to ${moveTo}`,
        StoreEnums.changeAllCharacterStatus,
        spellStore.value[index].id
      );
      try {
        spellStore.value[index].characterIds.target = [
          ...spellStore.value[index].characterIds.target,
          ...spellStore.value[index].characterIds.source,
        ];
        spellStore.value[index].characterIds.source = [];
        this.addStatusEffects(index);
        serverLogger(
          LoggingTypes.debug,
          `update complete, moved to target`,
          StoreEnums.changeAllCharacterStatus,
          spellStore.value[index].id
        );
      } catch (error) {
        if (error instanceof Error) {
          serverLogger(
            LoggingTypes.alert,
            error.message,
            StoreEnums.changeAllCharacterStatus,
            spellStore.value[index].id
          );
        }
      }
    },
    changeAllCharacterToSource(index: number): void {
      try {
        spellStore.value[index].characterIds.source = [
          ...spellStore.value[index].characterIds.source,
          ...spellStore.value[index].characterIds.target,
        ];
        spellStore.value[index].characterIds.target = [];
        this.removeStatusEffects(index);
        serverLogger(
          LoggingTypes.debug,
          `update complete, moved to source`,
          StoreEnums.changeAllCharacterStatus,
          spellStore.value[index].id
        );
        // update spell
        // update initiative both emits
      } catch (error) {
        if (error instanceof Error) {
          serverLogger(
            LoggingTypes.alert,
            error.message,
            StoreEnums.changeAllCharacterStatus,
            spellStore.value[index].id
          );
        }
      }
    },
    changeOneCharacterToSource(e: CharacterPickListEvent, index: number): void {
      try {
        const characterId = e.items[0].characterId;
        const initiativeTemp =
          initiativeStore.INITIATIVE_FUNCS.GETTERS.getInitiative();
        const characterIndex = findIndexById(initiativeTemp, characterId);
        serverLogger(
          LoggingTypes.info,
          `changing one character status. moveTo: ${moveTo}`,
          StoreEnums.changeOneCharacterStatus,
          characterId
        );
        const spellIndex = findIndexById(
          spellStore.value[index].characterIds.target,
          e.items[0].characterId
        );

        spellStore.value[index].characterIds.source.push(
          spellStore.value[index].characterIds.target[spellIndex]
        );
        spellStore.value[index].characterIds.target.splice(spellIndex, 1);
        this.removeStatusEffect(spellStore.value[index].id, characterIndex);
      } catch (error) {
        if (error instanceof Error) {
          serverLogger(
            LoggingTypes.alert,
            error.message,
            StoreEnums.changeOneCharacterStatus,
            spellStore.value[index].id
          );
        }
      }
    },
    changeOneCharacterToTarget(e: CharacterPickListEvent, index: number): void {
      try {
        const characterId = e.items[0].characterId;
        const initiativeTemp =
          initiativeStore.INITIATIVE_FUNCS.GETTERS.getInitiative();
        const characterIndex = findIndexById(initiativeTemp, characterId);
        serverLogger(
          LoggingTypes.info,
          `changing one character status. moveTo: ${moveTo}`,
          StoreEnums.changeOneCharacterStatus,
          characterId
        );
        const spellIndex = findIndexById(
          spellStore.value[index].characterIds.source,
          e.items[0].characterId
        );

        spellStore.value[index].characterIds.target.push(
          spellStore.value[index].characterIds.source[spellIndex]
        );
        spellStore.value[index].characterIds.source.splice(spellIndex, 1);

        this.addStatusEffect(
          spellStore.value[index].effectName,
          spellStore.value[index].id,
          spellStore.value[index].effectDescription,
          characterIndex
        );
        serverLogger(
          LoggingTypes.info,
          `status effect moved to target complete`,
          StoreEnums.changeOneCharacterStatus,
          characterId
        );
      } catch (error) {
        if (error instanceof Error) {
          serverLogger(
            LoggingTypes.alert,
            error.message,
            StoreEnums.changeOneCharacterStatus,
            spellStore.value[index].id
          );
        }
      }
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

export default {
  spellStore,
  SPELL_FUNCS,
};
