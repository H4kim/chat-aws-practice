type TypeWsRequest = {
   requestType: string;
   requestData?: any;
};
type TypeWsEvent = {
   eventType: string;
   eventData?: any;
};

export { TypeWsRequest, TypeWsEvent };
