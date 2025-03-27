import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With an exact case match", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "sameCase",
          email: "same.case@example.com",
          password: "hashed-password",
        }),
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/sameCase",
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "sameCase",
        email: "same.case@example.com",
        password: "hashed-password",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "diffCase",
          email: "diff.case@example.com",
          password: "hashed-password",
        }),
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/diffcase",
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "diffCase",
        email: "diff.case@example.com",
        password: "hashed-password",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With an unexistent username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/unexistentUser",
      );
      expect(response.status).toBe(404);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "username not found",
        action: "check if the username is correct",
        status_code: 404,
      });
    });
  });
});
