import EventEmitter from "events";
import * as amqp from "amqplib";

class RabbitMQClient extends EventEmitter {
   private connection: amqp.Connection | null = null;
   private channel: amqp.Channel | null = null;
   private ampqURL: string;

   constructor(ampqURL: string) {
      super();
      this.ampqURL = ampqURL;
   }

   async connect(): Promise<void> {
      try {
         this.connection = await amqp.connect(this.ampqURL);
         this.channel = await this.connection.createChannel();
         this.emit("connected");
      } catch (error) {
         this.emit("errorConnection", error);
         throw new Error(`Failed to connect to RabbitMQ: ${error}`);
      }
   }

   async createExchange(exchangeName: string, exchangeType: string): Promise<void> {
      if (!this.channel) {
         throw new Error("Channel is not open.");
      }

      await this.channel.assertExchange(exchangeName, exchangeType);
   }

   async createQueue(queueName: string): Promise<void> {
      if (!this.channel) {
         throw new Error("Channel is not open.");
      }

      await this.channel.assertQueue(queueName);
   }

   async bindQueueToExchange(
      queueName: string,
      exchangeName: string,
      routingKey: string = "",
      headers: any = {}
   ): Promise<void> {
      if (!this.channel) {
         throw new Error("Channel is not open.");
      }

      await this.channel.bindQueue(queueName, exchangeName, routingKey, headers);
   }

   async sendMessage(exchangeName: string, message: any, routingKey: string = "", headers: object = {}): Promise<void> {
      if (!this.channel) {
         throw new Error("Channel is not open.");
      }

      this.channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(message)), { headers });
   }

   async consumeMessages(queueName: string, onMessageCallback: (message: string) => void): Promise<void> {
      if (!this.channel) {
         throw new Error("Channel is not open.");
      }

      await this.channel.consume(queueName, message => {
         if (message) {
            const messageContent = message.content.toString();
            onMessageCallback(messageContent);
            this.channel!.ack(message);
         }
      });
   }

   async close(): Promise<void> {
      if (this.connection) {
         await this.connection.close();
      }
   }
}

export default RabbitMQClient;
