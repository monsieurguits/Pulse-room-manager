import fs from 'node:fs';
import { createClient } from '@libsql/client';

for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if (match && process.env[match[1]] === undefined) {
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const info = await client.execute('PRAGMA table_info("Settings")');
const columns = new Set(info.rows.map((row) => String(row.name)));
const migrations = [
  ['maintenanceActive', 'ALTER TABLE "Settings" ADD COLUMN "maintenanceActive" BOOLEAN NOT NULL DEFAULT false'],
  ['maintenanceStartAt', 'ALTER TABLE "Settings" ADD COLUMN "maintenanceStartAt" DATETIME'],
  ['maintenanceEndAt', 'ALTER TABLE "Settings" ADD COLUMN "maintenanceEndAt" DATETIME'],
  ['maintenanceSiteUsable', 'ALTER TABLE "Settings" ADD COLUMN "maintenanceSiteUsable" BOOLEAN NOT NULL DEFAULT true'],
];

for (const [name, sql] of migrations) {
  if (columns.has(name)) {
    console.log(`exists ${name}`);
  } else {
    await client.execute(sql);
    console.log(`added ${name}`);
  }
}
