import WebSocket from "ws";
import WebSocketManager from "../websocket/WebsocketManager";
import { TypeWsRequest } from "../websocket/WsTypes";

class serverInfosHandler {
   private wssManager: WebSocketManager;
   constructor(wssManager: WebSocketManager) {
      this.wssManager = wssManager;
      this.wssManager.registerRequestHandler("getServerInfos", this.handleGetServerInfos);
   }

   private handleGetServerInfos = (_data: TypeWsRequest, client: WebSocket) => {
      this.wssManager.sendEvent(client, {
         eventType: "onGetServerInfos",
         eventData: { id: process.env.SERVER_INSTANCE_ID || "unknown" }
      });
   };
}

export default serverInfosHandler;
