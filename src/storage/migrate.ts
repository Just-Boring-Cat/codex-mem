import { loadSettings } from "../config/settings.js";
import { createDatabase } from "./db.js";

function runMigrations(): void {
  const settings = loadSettings();
  const db = createDatabase({ dbPath: settings.dbPath });
  db.close();

  console.log(`Migrations applied successfully for ${settings.dbPath}`);
}

runMigrations();

