import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("with duplicated email", async () => {
      const userCase = await orchestrator.createUser();

      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usersPostDuplicatedEmail",
          email: userCase.email,
          password: "hashed-password",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Email already in use",
        action: "try again with a different email",
        status_code: 400,
      });
    });

    test("with duplicated username", async () => {
      const userCase = await orchestrator.createUser();

      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userCase.username,
          email: "usersPostDuplicatedUsername@example.com",
          password: "hashed-password",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Username already in use",
        action: "try again with a different username",
        status_code: 400,
      });
    });

    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "john_doe",
          email: "joe_doe@example.com",
          password: "hashed-password",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "john_doe",
        email: "joe_doe@example.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername("john_doe");
      const correctPasswordMatch = await password.compare(
        "hashed-password",
        userInDatabase.password,
      );
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await password.compare(
        "incorrect-password",
        userInDatabase.password,
      );
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
