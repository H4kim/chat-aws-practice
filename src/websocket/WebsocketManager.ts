import WebSocket, { WebSocketServer } from "ws";
import { TypeWsRequest, TypeWsEvent, TypeRequestHandler } from "./WsTypes";
import IWebSocketManager from "../interfaces/IWebsocketManager";
import http from "http";

class WebSocketManager implements IWebSocketManager {
   private wss: WebSocketServer;
   private clients: Set<WebSocket> = new Set<WebSocket>();
   private requestHandlers: Map<string, TypeRequestHandler> = new Map();

   constructor(server: http.Server) {
      this.wss = new WebSocketServer({ server });

      this.wss.on("connection", ws => {
         this.clients.add(ws);
         this.broadcastOnConnectedNumChanged();
         ws.on("message", (message: WebSocket.Data) => {
            //TODO check if message is type of TypeWsRequest
            const { requestType, requestData } = JSON.parse(message as string) as TypeWsRequest;
            this.notifyHandlers({ requestType, requestData }, ws);
         });

         ws.on("close", () => {
            this.clients.delete(ws);
            this.broadcastOnConnectedNumChanged();
         });
      });
   }

   private notifyHandlers = (request: TypeWsRequest, ws: WebSocket) => {
      const handler = this.requestHandlers.get(request.requestType);
      if (handler) {
         handler(request, ws);
      }
   };

   private broadcastOnConnectedNumChanged = () => {
      this.broadcastEvent("onConnectedPeopleNumChanged", { count: this.getConnectedPeopleNum() });
   };

   registerRequestHandler = (requestType: string, handler: TypeRequestHandler) => {
      this.requestHandlers.set(requestType, handler);
   };

   broadcastEvent = (eventType: string, eventData: any) => {
      const message = JSON.stringify({ eventType, eventData });
      this.clients.forEach(client => {
         if (client.readyState === WebSocket.OPEN) {
            client.send(message);
         }
      });
   };

   sendEvent = (ws: WebSocket, event: TypeWsEvent) => {
      const message = JSON.stringify(event);
      ws.send(message);
      return message;
   };

   getConnectedPeopleNum = () => this.clients.size;
}

export default WebSocketManager;
