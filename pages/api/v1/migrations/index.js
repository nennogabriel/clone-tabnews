import migrationRunner from "node-pg-migrate";

export default async function migrations(request, response) {
  const migrations = await migrationRunner({
    databaseUrl: process.env.DATABASE_URL,
    dryRun: true,
    // dir: 'migrations',
    // direction: 'up',
    // log: console.log,
  });
  response.status(200).json([]);
}
