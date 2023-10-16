import WebSocket from "ws";
import WebSocketManager from "../websocket/WebsocketManager";
import { TypeWsRequest } from "../websocket/WsTypes";

class chatHandler {
   private wssManager: WebSocketManager;
   constructor(wssManager: WebSocketManager) {
      this.wssManager = wssManager;
      this.wssManager.registerRequestHandler("joinRoom", this.handleJoinRoom);
      this.wssManager.registerRequestHandler("getConnectedPeopleNum", this.handleConnectedPeopleNum);
   }

   private handleJoinRoom = (data: TypeWsRequest, _client: WebSocket) => {
      const { requestData } = data;
      this.wssManager.broadcastEvent("onRoomJoin", {
         message: `User ${requestData.username} joined room ${requestData.room}`
      });
   };

   private handleConnectedPeopleNum = (_data: TypeWsRequest, client: WebSocket) => {
      this.wssManager.sendEvent(client, {
         eventType: "onConnectedPeopleNum",
         eventData: { count: this.wssManager.getConnectedPeopleNum() }
      });
   };
}

export default chatHandler;
