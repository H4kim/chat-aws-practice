FROM node:18

RUN apt-get update
RUN apt-get install nano

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install -g typescript
RUN npm install -g pm2

COPY . .
RUN npm install --production
RUN npm run build

COPY ecosystem.config.js dist

ENV PORT=3000
EXPOSE ${PORT}

#for the app to work correctly, pm2 needs to be executed from the dist directory
WORKDIR /usr/src/app/dist
CMD ["pm2-runtime", "ecosystem.config.js"]
