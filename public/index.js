document.addEventListener("DOMContentLoaded", () => {
   const localStorageMock = {
      username: ""
   };

   const host = window.location.hostname;
   const port = window.location.port;

   // Connect to the server
   const ws = new WebSocket(`ws://${host}:${port}`);

   //-------------------------------  DOM elements -------------------------------
   const peopleCount = document.getElementById("peopleCount");
   const serverId = document.getElementById("serverId");
   const joinRoomForm = document.getElementById("joinRoomForm");
   const chatContainer = document.getElementById("chatContainer");
   const messageContainer = document.getElementById("messageContainer");
   const messageInput = document.getElementById("messageInput");
   const sendButton = document.getElementById("sendButton");
   const joinButton = document.getElementById("joinButton");
   const usernameInput = document.getElementById("username");

   //-------------------------------  helper functions -------------------------------
   // display chat messages
   const displayMessages = messages => {
      messages.forEach(message => {
         const messageElement = document.createElement("div");
         messageElement.style.marginBottom = "10px";
         messageElement.innerHTML = `<strong>${message.username}:</strong> ${message.message}`;
         messageContainer.appendChild(messageElement);
      });
   };

   // append a new message to the chat list
   const appendMessage = (username, message) => {
      const messageElement = document.createElement("div");
      messageElement.style.marginBottom = "10px";
      messageElement.innerHTML = `<strong>${username}:</strong> ${message}`;
      messageContainer.appendChild(messageElement);
   };

   const updatePeopleCount = count => {
      peopleCount.textContent = count;
   };

   const updateServerId = id => {
      serverId.textContent = id;
   };

   const sendPublicRoomMessage = e => {
      if (e && e.keyCode !== 13) {
         return;
      }

      const message = messageInput.value;
      ws.send(
         JSON.stringify({
            requestType: "sendPublicRoomMessage",
            requestData: { username: localStorageMock.username, message }
         })
      );
      messageInput.value = "";
   };

   joinPublicRoom = e => {
      if (e && e.keyCode !== 13) {
         return;
      }
      const username = usernameInput.value;
      localStorageMock.username = username;

      // Send the join request to the server
      ws.send(JSON.stringify({ requestType: "joinPublicRoom", requestData: { username } }));
   };

   //------------------------------- Events -------------------------------
   joinButton.addEventListener("click", joinPublicRoom);
   usernameInput.addEventListener("keydown", joinPublicRoom);
   sendButton.addEventListener("click", sendPublicRoomMessage);
   messageInput.addEventListener("keydown", sendPublicRoomMessage);

   ws.onopen = () => {
      ws.send(JSON.stringify({ requestType: "getConnectedPeopleNum" }));
      ws.send(JSON.stringify({ requestType: "getServerInfos" }));
   };

   ws.onmessage = event => {
      const { eventType, eventData } = JSON.parse(event.data);

      if (eventType === "onGetServerInfos") {
         updateServerId(eventData.id);
      }
      if (eventType === "onConnectedPeopleNum" || eventType === "onConnectedPeopleNumChanged") {
         updatePeopleCount(eventData.count);
      }
      if (eventType === "onJoinPublicRoom") {
         joinRoomForm.style.display = "none";
         chatContainer.style.display = "block";
         displayMessages(eventData.messages);
      }
      if (eventType === "onNewPublicRoomMessage") {
         appendMessage(eventData.username, eventData.message);
      }
   };

   ws.onclose = () => {
      console.log("WebSocket connection closed.");
   };
});
