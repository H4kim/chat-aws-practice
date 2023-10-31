interface IInstancesSyncClient {
   sendRoomMessage(message: any): void;
   registerRoomMessageSubscriber(cb: (message: any) => void): void;
   close(): void;
}

export default IInstancesSyncClient;
