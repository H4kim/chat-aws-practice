FROM node:18

RUN apt-get update && apt-get install -y nano

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install TypeScript and PM2 globally
RUN npm install -g typescript pm2

# Install dependencies (excluding dev dependencies)
RUN npm install --omit=dev

# Copy the application code
COPY . .

# Build
RUN npm run build
COPY ecosystem.config.js dist

# Create a directory to store the certificate bundle
RUN mkdir -p /etc/ssl/certs

# Download the certificate bundle for RDS
RUN curl -o /etc/ssl/certs/us-east-1-bundle.pem https://truststore.pki.rds.amazonaws.com/us-east-1/us-east-1-bundle.pem

# Define an environment variable for the certificate path
ENV DB_SSL_CERT_PATH=/etc/ssl/certs/us-east-1-bundle.pem

# The application expose port 3000
EXPOSE 3000

# pm2 needs to be executed from the dist directory
WORKDIR /usr/src/app/dist
CMD ["pm2-runtime", "ecosystem.config.js"]
