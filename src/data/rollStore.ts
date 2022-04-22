import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { ref } from "vue";
import { EmitTypes } from "../Interfaces/EmitTypes";
import { LoggingTypes, StoreEnums } from "../Interfaces/LoggingTypes";
import { RollObject } from "../Interfaces/Rolls";
import serverLogger from "../Utils/LoggingClass";
import { getSocket, getsessionId } from "./sessionStore";
import { v4 as uuidv4 } from "uuid";

const rollData = ref([] as RollObject[]);

const socket = getSocket();

const ROLL_FUNCS = {
  GETTERS: {
    getRolls(): RollObject[] {
      return rollData.value;
    },
    rollDice(diceRoll: string): DiceRoll {
      const newRoll = new DiceRoll(diceRoll);
      return newRoll;
    },
    tryRoll(roll: string): any {
      let errorMsg;
      try {
        ROLL_FUNCS.GETTERS.rollDice(roll);
      } catch (error) {
        errorMsg = error;
      }
      console.log(typeof errorMsg);
      return errorMsg;
    },
  },
  SETTERS: {
    getInitialRolls(): void {
      serverLogger(
        LoggingTypes.info,
        `first fetch initiative`,
        StoreEnums.getInitial
      );
      const sessionId = getsessionId();
      socket.emit(
        EmitTypes.GET_INITIAL_ROLLS,
        sessionId,
        (query: RollObject[]) => {
          rollData.value = query;
          serverLogger(
            LoggingTypes.info,
            `initiative store updated`,
            StoreEnums.getInitial
          );
        }
      );
    },
    addRoll(rollName: string, rollValue: string): RollObject {
      const rollId = uuidv4();
      const rollObject = {
        rollName: rollName,
        rollValue: rollValue,
        id: rollId,
      };
      rollData.value.push(rollObject);
      return rollObject;
    },
    updateRoll(rollName: string, rollValue: string, index: number): void {
      rollData.value[index].rollName = rollName;
      rollData.value[index].rollValue = rollValue;
      console.log(rollData.value[index]);
    },
    deleteRoll(index: number): void {
      rollData.value.splice(index, 1);
    },
  },
  EMITS: {
    emitDeleteRoll(id: string): void {
      const sessionId = getsessionId();
      socket.emit(EmitTypes.DELETE_ONE_ROLL, {
        docId: id,
        sessionId: sessionId,
      });
    },
    emitAddRoll(roll: RollObject): void {
      const sessionId = getsessionId();
      socket.emit(EmitTypes.CREATE_NEW_ROLL, {
        rollData: roll,
        sessionId: sessionId,
      });
    },
    emitUpdateRoll(roll: RollObject): void {
      const sessionId = getsessionId();
      socket.emit(EmitTypes.UPDATE_ROLL_RECORD, {
        rollData: roll,
        sessionId: sessionId,
      });
    },
    discordRoll(toRoll: DiceRoll, comment: string): void {
      const sessionId = getsessionId();
      try {
        socket.emit(EmitTypes.DISCORD_ROLL, {
          payload: toRoll,
          comment: comment,
          sessionId: sessionId,
        });
      } catch (error) {
        if (error instanceof Error) {
          serverLogger(LoggingTypes.alert, error.message, StoreEnums.toDiscord);
        }
      }
    },
  },
};

export default {
  rollData,
  ROLL_FUNCS,
};