import WebSocket, { WebSocketServer } from "ws";
import { TypeWsRequest, TypeWsEvent } from "./WsTypes";

type TypeRequestHandler = (data: TypeWsRequest, ws: WebSocket) => void;

class WebSocketManager {
   private wss: WebSocketServer;
   private clients: Set<WebSocket> = new Set<WebSocket>();
   private requestHandlers: Map<string, TypeRequestHandler> = new Map();

   constructor(server: any) {
      this.wss = new WebSocketServer({ server });

      this.wss.on("connection", ws => {
         this.clients.add(ws);
         this.broadcastOnConnectedNumChanged();
         ws.on("message", (message: WebSocket.Data) => {
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
      console.log("broadcastEvent", message);
      this.clients.forEach(client => {
         if (client.readyState === WebSocket.OPEN) {
            client.send(message);
         }
      });
   };

   sendEvent = (ws: WebSocket, event: TypeWsEvent) => {
      const message = JSON.stringify(event);
      console.log("sendEvent", message);
      ws.send(message);
      return message;
   };

   getConnectedPeopleNum = () => this.clients.size;
}

export default WebSocketManager;
