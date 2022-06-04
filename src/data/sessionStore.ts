import { io } from "socket.io-client";
import { ref } from "vue";
import { LoggingTypes, StoreEnums } from "../Interfaces/LoggingTypes";
import serverLogger from "../Utils/LoggingClass";

const socketString = "http://localhost:5000";
const productionString = "https://dungeon-bot-server.herokuapp.com";

const socket = ref(io(socketString));
const sessionId = ref("");

export function getSocket(): any {
  return socket.value;
}

export function getsessionId(): string {
  return sessionId.value;
}

export function roomSetup(): void {
  try {
    serverLogger(LoggingTypes.debug, `joining room`, StoreEnums.roomSetup);
    socket.value.emit("create", sessionId.value);
  } catch (error) {
    serverLogger(
      LoggingTypes.debug,
      `unable to connect to socket io`,
      StoreEnums.roomSetup
    );
  }
}

export function updateId(id: string): void {
  serverLogger(LoggingTypes.info, `updating sessionId`, StoreEnums.updateId);
  sessionId.value = id;
}
