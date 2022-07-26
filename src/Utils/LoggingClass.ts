import { LoggingTypes } from "../Interfaces/LoggingTypes";
import { getSocket } from "../data/sessionStore";
const socket = getSocket();

export default function serverLogger(
  level: LoggingTypes,
  message: string,
  fnName: string,
  itemId?: string
): void {
  socket.emit(level, { message: message, function: fnName, itemId: itemId });
}
