import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ENV_VARIABLES = [
   "DB_USER",
   "DB_PASSWORD",
   "DB_HOST",
   "DB_NAME",
   "DB_PORT",
   "DB_SSL_CERT_PATH",
   "MESSAGE_BROKER_URL",
   "MESSAGE_BROKER_URL",
   "MESSAGE_BROKER_USERNAME",
   "MESSAGE_BROKER_PASSWORD"
];

const loadSecrets = async (): Promise<void> => {
   const client = new SSMClient({ region: "us-east-1" });

   const parameterPromises = ENV_VARIABLES.map(async envString => {
      const input = {
         Name: envString,
         WithDecryption: true
      };
      const command = new GetParameterCommand(input);
      const parameterValue = (await client.send(command)).Parameter?.Value;
      process.env[envString] = parameterValue;
   });

   await Promise.all(parameterPromises);
};

export default loadSecrets;
