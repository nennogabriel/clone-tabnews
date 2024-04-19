import database from "infra/database";

beforeAll(cleanDatabase);

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

test("DELETE to /api/v1/migrations should return 404", async () => {
  const response1 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "DELETE",
  });

  expect(response1.status).toBe(404);

  const response2 = await fetch("http://localhost:3000/api/v1/status");
  const response2Body = await response2.json();
  expect(response2Body.dependencies.database.open_connections).toBe(1);
});
