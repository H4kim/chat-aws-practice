module.exports = {
   apps: [
      {
         name: "chat-app",
         script: "server.js",
         watch: true,
         env: {
            NODE_ENV: "production",
            PORT: 3000
         }
      }
   ]
};
