import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import { createRouter } from "next-connect";
import database from "infra/database";
import { InternalServerError, MethodNotAllowedError } from "infra/errors";

const router = createRouter();
router.get(getHandler);
router.post(postHandler);

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
});

function onErrorHandler(error, request, response) {
  const publicErrorObject = new InternalServerError({ cause: error });
  console.error(
    "An unexpected error occurred in migrations handler:",
    publicErrorObject
  );
  response.status(500).json(publicErrorObject);
}

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

async function getHandler(request, response) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const migrationOptions = {
      dbClient,
      dir: resolve("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
      dryRun: true,
    };
    const pendingMigrations = await migrationRunner(migrationOptions);
    response.status(200).json(pendingMigrations);
  } catch (error) {
    throw new InternalServerError({ cause: error });
  } finally {
    await dbClient?.end();
  }
}

async function postHandler(request, response) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const migrationOptions = {
      dbClient,
      dir: resolve("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
      dryRun: false,
    };

    const migratedMigrations = await migrationRunner(migrationOptions);

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }
    response.status(200).json(migratedMigrations);
  } catch (error) {
    throw new InternalServerError({ cause: error });
  } finally {
    await dbClient?.end();
  }
}
