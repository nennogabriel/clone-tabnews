import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const reqMaxConnections = database.query({
    text: "SHOW max_connections; ",
  });
  const reqCurrentConnections = database.query({
    text: "SELECT COUNT(*) FROM pg_stat_activity; ",
  });

  const result = await Promise.all([reqMaxConnections, reqCurrentConnections]);

  const maxConnections = Number(result[0].rows[0].max_connections);
  const openConnections = Number(result[1].rows[0].count);

  response.status(200).json({
    updated_at: updatedAt,
    max_connections: maxConnections,
    open_connections: openConnections,
  });
}

export default status;
