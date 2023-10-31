import WebSocket from "ws";
import { TypeWsRequest } from "../websocket/WsTypes";
import IWebSocketManager from "../interfaces/IWebsocketManager";

class serverInfosHandler {
   private wssManager: IWebSocketManager;
   constructor(wssManager: IWebSocketManager) {
      this.wssManager = wssManager;
      this.wssManager.registerRequestHandler("getServerInfos", this.handleGetServerInfos);
      this.wssManager.registerRequestHandler("getConnectedPeopleNum", this.handleConnectedPeopleNum);
   }

   private handleGetServerInfos = (_data: TypeWsRequest, client: WebSocket) => {
      this.wssManager.sendEvent(client, {
         eventType: "onGetServerInfos",
         eventData: { id: process.env.SERVER_INSTANCE_ID || process.argv[2] || "unknown" }
      });
   };

   private handleConnectedPeopleNum = (_data: TypeWsRequest, client: WebSocket) => {
      this.wssManager.sendEvent(client, {
         eventType: "onConnectedPeopleNum",
         eventData: { count: this.wssManager.getConnectedPeopleNum() }
      });
   };
}

export default serverInfosHandler;
