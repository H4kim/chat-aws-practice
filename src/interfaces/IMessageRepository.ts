interface Message {
   id: number;
   message_text: string;
   username: string;
   date_of_saving: Date;
}

interface IMessageRepository {
   sendMessage(username: string, message: string): Promise<void>;
   getMessages(): Promise<Message[]>;
}

export { IMessageRepository, Message };
