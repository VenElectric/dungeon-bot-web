import { io } from "socket.io-client";
import { ref } from "vue";
import { LoggingTypes, StoreEnums } from "../Interfaces/LoggingTypes";
import serverLogger from "../Utils/LoggingClass";

const socketString = "http://localhost:8000";
const productionString = "https://dungeon-bot-server.herokuapp.com";

const socket = ref(io(socketString));
const sessionId = ref("");

export function getSocket(): any {
  return socket.value;
}

export function getsessionId(): string {
  return sessionId.value;
}

export function updateId(id: string): void {
  serverLogger(LoggingTypes.info, `updating sessionId`, StoreEnums.updateId);
  sessionId.value = id;
}
