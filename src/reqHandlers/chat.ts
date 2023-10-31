import WebSocket from "ws";
import { TypeWsRequest } from "../websocket/WsTypes";
import IWebSocketManager from "../interfaces/IWebsocketManager";
import IInstancesSyncClient from "../interfaces/IInstancesSyncClient";

class chatHandler {
   private wssManager: IWebSocketManager;
   private instancesSyncClient: IInstancesSyncClient;
   constructor(wssManager: IWebSocketManager, instancesSyncClient: IInstancesSyncClient) {
      this.wssManager = wssManager;
      this.instancesSyncClient = instancesSyncClient;
      this.wssManager.registerRequestHandler("joinPublicRoom", this.handleJoinPublicRoom);
      this.wssManager.registerRequestHandler("sendPublicRoomMessage", this.handleSendPublicRoomMessage);
      this.instancesSyncClient.registerRoomMessageSubscriber(this.handleMessageBrokerRoomMessage);
   }

   private handleSendPublicRoomMessage = (data: TypeWsRequest, _client: WebSocket) => {
      const { requestData } = data;
      const { username, message } = requestData;
      // TODO send message to connected users
      this.wssManager.broadcastEvent("onNewPublicRoomMessage", { username, message });

      // dispatch event to all instances
      this.instancesSyncClient.sendRoomMessage({ username, message });
   };

   private handleJoinPublicRoom = (data: TypeWsRequest, client: WebSocket) => {
      const { requestData } = data;
      // send history messages to the user (from a DB)
      this.wssManager.sendEvent(client, {
         eventType: "onJoinPublicRoom",
         eventData: {
            messages: []
         }
      });
      // TODO dispatch event to all instances
      // TODO send message to all connected users
   };

   //Message Broker
   private handleMessageBrokerRoomMessage = (stringifiedMessage: string): void => {
      const { username, message } = JSON.parse(stringifiedMessage);
      this.wssManager.broadcastEvent("onNewPublicRoomMessage", { username, message });
   };
}

export default chatHandler;
