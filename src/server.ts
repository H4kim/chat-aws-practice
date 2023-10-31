import process from "process";
import http from "http";
import express from "express";
import path from "path";

import WebSocketManager from "./websocket/WebsocketManager";
import chatHandler from "./reqHandlers/chat";
import serverInfosHandler from "./reqHandlers/serverInfos";
import instancesSyncClient from "./MessageBrokers/rabbitMq/clients/InstancesSyncClient";

const app = express();
const server = http.createServer(app);
const wssManager = new WebSocketManager(server);
const port = process.env.PORT || process.argv[2] || 3000;

app.use(express.static(path.join(process.cwd(), "public")));

new chatHandler(wssManager, instancesSyncClient);
new serverInfosHandler(wssManager);

//TODO handler termination signals.

server.listen(port, () => {
   console.log(`Server is running on port ${port}`);
});
