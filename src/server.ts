import process from "process";
import http from "http";
import express from "express";
import path from "path";
import "dotenv/config";

import WebSocketManager from "./websocket/WebsocketManager";
import chatHandler from "./reqHandlers/chat";
import serverInfosHandler from "./reqHandlers/serverInfos";
import InstancesSyncClient from "./infrastructure/MessageBrokers/rabbitMq/clients/InstancesSyncClient";
import MessageRepository from "./repositories/MessageRepository";
import makePostgresPool from "./infrastructure/database/PostgresPool";
import loadSecrets from "./infrastructure/utils/loadSecrets";

if (process.env.AWS_EXECUTION_ENV) {
   console.log("Starting in production mode");
   loadSecrets().then(() => {
      startApp();
   });
} else {
   console.log("Starting in developement mode");
   startApp();
}

function startApp() {
   const app = express();
   const server = http.createServer(app);
   const wssManager = new WebSocketManager(server);
   const port = process.env.PORT || process.argv[2];

   app.use(express.static(path.join(process.cwd(), "public")));

   const postgresPool = makePostgresPool();

   const instancesSyncClient = new InstancesSyncClient();
   const messageRepository = new MessageRepository(postgresPool);

   new chatHandler(wssManager, instancesSyncClient, messageRepository);
   new serverInfosHandler(wssManager);

   //TODO handler termination signals.

   postgresPool.on("error", err => {
      console.error("Unexpected error on idle client", err);
      process.exit(-1);
   });

   server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
   });
}
