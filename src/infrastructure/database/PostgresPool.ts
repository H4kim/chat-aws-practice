import { Pool } from "pg";
import fs from "fs";

const makePostgrePool = () => {
   return new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
      ssl: {
         ca: fs.readFileSync(process.env.DB_SSL_CERT_PATH || "").toString()
      }
   });
};

export default makePostgrePool;
