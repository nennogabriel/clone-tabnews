import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

test("Get to /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = await response.json();

  expect(responseBody).toMatchObject({
    updated_at: expect.any(String),
    dependencies: {
      database: {
        version: "16.0",
        max_connections: expect.any(Number),
        open_connections: 1,
      },
    },
  });

  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString(); // throws if invalid date

  expect(responseBody.updated_at).toEqual(parsedUpdatedAt);
});
