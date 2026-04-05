import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const main = () => {
  migrate(db, { migrationsFolder: path.join(__dirname, "drizzle") })
    .then(() => {
      console.info("Migrations complete!");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => {
      pool.end();
    });
};

main();
