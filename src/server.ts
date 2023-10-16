import express from "express";
import http from "http";
import WebSocketManager from "./websocket/WebsocketManager";
import chatHandler from "./wsHandlers/chat";

const app = express();
const server = http.createServer(app);
const wssManager = new WebSocketManager(server);
const port = 3000;

app.use(express.static("public"));

new chatHandler(wssManager);

server.listen(port, () => {
   console.log(`Server is running on port ${port}`);
});
