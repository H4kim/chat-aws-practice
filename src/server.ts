import process from "process";
import http from "http";
import express from "express";
import path from "path";

import WebSocketManager from "./websocket/WebsocketManager";
import chatHandler from "./wsHandlers/chat";
import serverInfosHandler from "./wsHandlers/serverInfos";

const app = express();
const server = http.createServer(app);
const wssManager = new WebSocketManager(server);
const port = process.env.PORT || 3000;

app.use(express.static(path.join(process.cwd(), "public")));
new chatHandler(wssManager);
new serverInfosHandler(wssManager);

server.listen(port, () => {
   console.log(`Server is running on port ${port}`);
});
