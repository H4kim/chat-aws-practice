import { Pool } from "pg";
import { IMessageRepository, Message } from "../interfaces/IMessageRepository";

class MessageRepository implements IMessageRepository {
   private pool: Pool;

   constructor(pool: Pool) {
      this.pool = pool;
   }

   getMessages = async (): Promise<Message[]> => {
      try {
         const client = await this.pool.connect();
         const query = "SELECT * FROM messages";
         const { rows } = await client.query(query);
         client.release();
         return rows;
      } catch (error) {
         throw new Error(`Error retrieving messages: ${error}`);
      }
   };

   sendMessage = async (username: string, message: string) => {
      try {
         const client = await this.pool.connect();
         const query = "INSERT INTO messages (username, message) VALUES ($1, $2)";
         await client.query(query, [username, message]);
         client.release();
      } catch (error) {
         throw new Error(`Error sending message: ${error}`);
      }
   };
}

export default MessageRepository;
