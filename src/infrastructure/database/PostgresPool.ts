import { Pool } from "pg";
import fs from "fs";

const PostgresPool = new Pool({
   user: process.env.DB_USER,
   host: process.env.DB_HOST,
   database: process.env.DB_NAME,
   password: process.env.DB_PASSWORD,
   port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
   ssl: {
      ca: fs.readFileSync(process.env.DB_SSL_CERT_PATH || "").toString()
   }
});

PostgresPool.on("error", err => {
   console.error("Unexpected error on idle client", err);
   process.exit(-1);
});

export default PostgresPool;
