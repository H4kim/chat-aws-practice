import WebSocket from "ws";
import { TypeRequestHandler, TypeWsEvent } from "../websocket/WsTypes";

interface IWebSocketManager {
   registerRequestHandler(requestType: string, handler: TypeRequestHandler): void;
   broadcastEvent(eventType: string, eventData: any): void;
   sendEvent(ws: WebSocket, event: TypeWsEvent): string;
   getConnectedPeopleNum(): number;
}

export default IWebSocketManager;
