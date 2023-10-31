import IInstancesSyncClient from "../../../interfaces/IInstancesSyncClient";
import RabbitMQClient from "../RabbitMQClient";

const HEADERS = {
   "x-match": "any",
   "receiverId": process.argv[2]
};

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
      this.client.createExchange("room_message_exchange", "headers");
      this.client.createQueue(`room_messages_queue_${process.argv[2]}`);
      this.client.bindQueueToExchange(`room_messages_queue_${process.argv[2]}`, "room_message_exchange", "", HEADERS);
      this.client.consumeMessages(`room_messages_queue_${process.argv[2]}`, message => {
         this.notifyRoomMessageSubscribers(message);
      });
   };

   private handleClientError = (error: any) => {
      console.error(`failed to connect to InstancesSync message broker: ${error}`);
   };

   sendRoomMessage(message: any): void {
      const messageHeaders = { "receiverId": process.argv[3] };

      this.client.sendMessage("room_message_exchange", message, "", messageHeaders);
   }

   registerRoomMessageSubscriber(cb: (message: any) => void): void {
      let subscribers = [];
      const roomMessageSubscribers = this.messageSubscribers.get(`room_messages_queue_${process.argv[2]}`);
      if (roomMessageSubscribers) {
         subscribers = [...roomMessageSubscribers, cb];
         subscribers.push(cb);
      }

      this.messageSubscribers.set(`room_messages_queue_${process.argv[2]}`, [cb]);
   }

   private notifyRoomMessageSubscribers(message: string): void {
      this.messageSubscribers.get(`room_messages_queue_${process.argv[2]}`)?.forEach(subscriber => {
         subscriber(message);
      });
   }

   close(): void {
      this.client.close();
   }
}

export default new InstancesSyncClient();
