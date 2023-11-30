import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const getPostgresVersion = database.query("SHOW server_version;");
  const getMaxConnections = database.query("SHOW max_connections");
  const getCurrentConnections = database.query(
    "SELECT COUNT(*) FROM pg_stat_activity"
  );

  const result = await Promise.all([
    getPostgresVersion,
    getMaxConnections,
    getCurrentConnections,
  ]);

  console.log(result[0].rows[0]);

  const postgresVersion = result[0].rows[0].server_version;
  const maxConnections = Number(result[1].rows[0].max_connections);
  const openConnections = Number(result[2].rows[0].count);

  response.status(200).json({
    updated_at: updatedAt,
    postgres_version: postgresVersion,
    max_connections: maxConnections,
    open_connections: openConnections,
  });
}

export default status;
