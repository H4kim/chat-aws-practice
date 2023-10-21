FROM node:18

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install -g typescript
COPY . .
RUN npm install
RUN npm run build

ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/server.js"]