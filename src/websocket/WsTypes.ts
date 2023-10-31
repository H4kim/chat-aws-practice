import WebSocket from "ws";

type TypeWsRequest = {
   requestType: string;
   requestData?: any;
};
type TypeWsEvent = {
   eventType: string;
   eventData?: any;
};

type TypeRequestHandler = (data: TypeWsRequest, ws: WebSocket) => void;

export { TypeWsRequest, TypeWsEvent, TypeRequestHandler };
