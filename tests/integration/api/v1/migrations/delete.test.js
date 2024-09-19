import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("DELETE /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("try an invalid method", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "DELETE",
      });

      expect(response1.status).toBe(405);

      const response2 = await fetch("http://localhost:3000/api/v1/status");
      const response2Body = await response2.json();
      expect(response2Body.dependencies.database.open_connections).toBe(1);
    });
  });
});
