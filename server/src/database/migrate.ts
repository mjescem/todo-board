import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index.js";

const main = () => {
  migrate(db, { migrationsFolder: "./src/database/drizzle" })
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
