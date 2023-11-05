import IInstancesSyncClient from "../../../../interfaces/IInstancesSyncClient";
import RabbitMQClient from "../RabbitMQClient";
import os from "os";

const hostname = os.hostname();

//dev vs prod
const pid = process.argv[2] || process.pid;

const ROOM_MESSAGE_QUEUE_ID = `${hostname}-${pid}`;
class InstancesSyncClient implements IInstancesSyncClient {
   private client: RabbitMQClient;
   private messageSubscribers: Map<string, ((message: any) => void)[]> = new Map();

   constructor() {
      this.client = new RabbitMQClient("amqp://localhost");
      this.client.on("error", this.handleClientError);
      this.client.on("connected", this.handleClientConnected);
      this.client.connect();
   }

   private handleClientConnected = () => {
      console.log("connection established to InstancesSync message broker");
      //CREATE EXCHANGES
      // room message exchange
      this.client.createExchange("room_message_exchange", "fanout");
      this.client.createQueue(`room_messages_queue_${ROOM_MESSAGE_QUEUE_ID}`);
      this.client.bindQueueToExchange(`room_messages_queue_${ROOM_MESSAGE_QUEUE_ID}`, "room_message_exchange", "");
      this.client.consumeMessages(`room_messages_queue_${ROOM_MESSAGE_QUEUE_ID}`, message => {
         this.notifyRoomMessageSubscribers(message);
      });
   };

   private handleClientError = (error: any) => {
      console.error(`failed to connect to InstancesSync message broker: ${error}`);
   };

   sendRoomMessage(message: any): void {
      this.client.sendMessage("room_message_exchange", message, "", {
         senderQueue: `room_messages_queue_${ROOM_MESSAGE_QUEUE_ID}`
      });
   }

   sendUserJoinedPublicRoom(message: any): void {
      this.client.sendMessage("room_message_exchange", message, "", {
         senderQueue: `room_messages_queue_${ROOM_MESSAGE_QUEUE_ID}`
      });
   }

   registerRoomMessageSubscriber(cb: (message: any) => void): void {
      let subscribers = [];
      const roomMessageSubscribers = this.messageSubscribers.get(`room_messages_queue_${ROOM_MESSAGE_QUEUE_ID}`);
      if (roomMessageSubscribers) {
         subscribers = [...roomMessageSubscribers, cb];
         subscribers.push(cb);
      }

      this.messageSubscribers.set(`room_messages_queue_${ROOM_MESSAGE_QUEUE_ID}`, [cb]);
   }

   private notifyRoomMessageSubscribers(message: string): void {
      this.messageSubscribers.get(`room_messages_queue_${ROOM_MESSAGE_QUEUE_ID}`)?.forEach(subscriber => {
         subscriber(message);
      });
   }

   close(): void {
      this.client.close();
   }
}

export default new InstancesSyncClient();
