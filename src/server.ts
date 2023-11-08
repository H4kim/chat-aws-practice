import process from "process";
import http from "http";
import express from "express";
import path from "path";
import "dotenv/config";

import WebSocketManager from "./websocket/WebsocketManager";
import chatHandler from "./reqHandlers/chat";
import serverInfosHandler from "./reqHandlers/serverInfos";
import instancesSyncClient from "./infrastructure/MessageBrokers/rabbitMq/clients/InstancesSyncClient";
import MessageRepository from "./repositories/MessageRepository";
import postgresPool from "./infrastructure/database/PostgresPool";
import loadSecrets from "./infrastructure/utils/loadSecrets";

if (process.env.AWS_EXECUTION_ENV) {
   loadSecrets().then(() => {
      startApp();
   });
} else {
   startApp();
}

function startApp() {
   const app = express();
   const server = http.createServer(app);
   const wssManager = new WebSocketManager(server);
   const port = process.env.PORT || process.argv[2];

   app.use(express.static(path.join(process.cwd(), "public")));

   const messageRepository = new MessageRepository(postgresPool);
   new chatHandler(wssManager, instancesSyncClient, messageRepository);
   new serverInfosHandler(wssManager);

   //TODO handler termination signals.

   server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
   });
}
