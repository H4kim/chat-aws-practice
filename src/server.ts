import express from "express";
import http from "http";
import WebSocketManager from "./websocket/WebsocketManager";
import chatHandler from "./wsHandlers/chat";
import path from "path";

const app = express();
const server = http.createServer(app);
const wssManager = new WebSocketManager(server);
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../public")));

new chatHandler(wssManager);

server.listen(port, () => {
   console.log(`Server is running on port ${port}`);
});
