import { io } from "socket.io-client";
import { ref } from "vue";
import { LoggingTypes, StoreEnums } from "../Interfaces/LoggingTypes";
import { API_URL } from "../assets/static";
import serverLogger from "../Utils/LoggingClass";

// @ts-ignore
const socket = ref(io(API_URL[process.env.NODE_ENV]));
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
