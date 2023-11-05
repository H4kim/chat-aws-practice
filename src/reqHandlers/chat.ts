import WebSocket from "ws";
import { TypeWsRequest } from "../websocket/WsTypes";
import IWebSocketManager from "../interfaces/IWebsocketManager";
import IInstancesSyncClient from "../interfaces/IInstancesSyncClient";
import { IMessageRepository } from "../interfaces/IMessageRepository";

class chatHandler {
   private wssManager: IWebSocketManager;
   private instancesSyncClient: IInstancesSyncClient;
   private repository: IMessageRepository;
   constructor(
      wssManager: IWebSocketManager,
      instancesSyncClient: IInstancesSyncClient,
      repository: IMessageRepository
   ) {
      this.wssManager = wssManager;
      this.instancesSyncClient = instancesSyncClient;
      this.wssManager.registerRequestHandler("joinPublicRoom", this.handleJoinPublicRoom);
      this.wssManager.registerRequestHandler("sendPublicRoomMessage", this.handleSendPublicRoomMessage);
      this.instancesSyncClient.registerRoomMessageSubscriber(this.handleBrokerMessage);
      this.repository = repository;
   }

   private handleSendPublicRoomMessage = async (data: TypeWsRequest, _client: WebSocket) => {
      const { requestData } = data;
      const { username, message } = requestData;
      this.wssManager.broadcastEvent("onNewPublicRoomMessage", { username, message });

      this.instancesSyncClient.sendRoomMessage({ type: "simple_message", username, message });
      await this.repository.sendMessage(username, message);
   };

   private handleJoinPublicRoom = async (data: TypeWsRequest, client: WebSocket) => {
      const { requestData } = data;

      const messages = await this.repository.getMessages();
      this.wssManager.sendEvent(client, {
         eventType: "onJoinPublicRoom",
         eventData: {
            messages
         }
      });

      this.wssManager.broadcastEvent("onUserJoinedPublicRoom", { username: requestData.username });
      this.instancesSyncClient.sendUserJoinedPublicRoom({ type: "user_joined_room", username: requestData.username });
   };

   //Message Broker
   private handleBrokerMessage = (stringifiedMessage: string): void => {
      const { username, message, type } = JSON.parse(stringifiedMessage);
      if (type === "user_joined_room") {
         return this.wssManager.broadcastEvent("onUserJoinedPublicRoom", { username });
      }
      if (type === "simple_message") {
         return this.wssManager.broadcastEvent("onNewPublicRoomMessage", { username, message });
      }
   };
}

export default chatHandler;
