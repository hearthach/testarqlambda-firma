/* para BD mysql */
import { createPool } from "mysql2/promise";

function connect() {
  const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  });

  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      console.log("Connected to MySQL");

      resolve(connection);
    });
  });
}

export default async function handler() {
  try {
    const connection = await connect();
    return connection;
  } catch (err) {
    console.error(err);
    throw new Error("Failed connecting to MySQL");
  }
}
