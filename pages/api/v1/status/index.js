import { createRouter } from "next-connect";
import database from "infra/database.js";
import { InternalServerError, MethodNotAllowedError } from "infra/errors";

const router = createRouter();
router.get(getHandler);
export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
});

function onErrorHandler(error, request, response) {
  const publicErrorObject = new InternalServerError({ cause: error });

  console.log("An unexpected error occurred get by next-connect.");
  console.error(publicErrorObject);

  response.status(500).json(publicErrorObject);
}

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

async function getHandler(request, response) {
  const updatedAt = new Date().toISOString();

  const getPostgresVersion = await database.query("SHOW server_version;");
  const getMaxConnections = await database.query("SHOW max_connections");
  const databaseName = process.env.POSTGRES_DB;
  const getCurrentConnections = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity where datname = $1;",
    values: [databaseName],
  });

  const postgresVersion = getPostgresVersion.rows[0].server_version;
  const maxConnections = parseInt(getMaxConnections.rows[0].max_connections);
  const databaseOpenConnectionsValue = getCurrentConnections.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: postgresVersion,
        max_connections: maxConnections,
        open_connections: databaseOpenConnectionsValue,
      },
    },
  });
}
