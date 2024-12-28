import database from "infra/database.js";
import { InternalServerError } from "infra/errors";

async function status(request, response) {
  try {
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
  } catch (error) {
    const publicErrorObject = new InternalServerError({ cause: error });

    console.log("An unexpected error occurred.");
    console.error(publicErrorObject);

    response.status(500).json(publicErrorObject);
  }
}

export default status;
