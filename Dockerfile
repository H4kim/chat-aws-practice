FROM node:18

RUN apt-get update
RUN apt-get install nano

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install -g typescript
RUN npm install -g pm2

COPY . .
RUN npm install --omit=dev
RUN npm run build

COPY ecosystem.config.js dist

ENV PORT=3000
EXPOSE ${PORT}

# Create a directory to store the certificate bundle
# Download the certificate bundle and place it in the directory
# Export the env variable for the app 
RUN mkdir -p /etc/ssl/certs
RUN curl -o /etc/ssl/certs/us-east-1-bundle.pem https://truststore.pki.rds.amazonaws.com/us-east-1/us-east-1-bundle.pem
ENV DB_SSL_CERT_PATH=/etc/ssl/certs/us-east-1-bundle.pem

# pm2 needs to be executed from the dist directory
WORKDIR /usr/src/app/dist
CMD ["pm2-runtime", "ecosystem.config.js"]
