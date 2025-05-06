import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With non existent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/nonExistentUser",
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(404);
    });

    test("With duplicated 'username'", async () => {
      const userCase = await orchestrator.createUser();

      await orchestrator.createUser({
        username: "testDuplicatedUsername",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${userCase.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "testDuplicatedUsername",
          }),
        },
      );

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Username already in use",
        action: "try again with a different username",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      const userCase = await orchestrator.createUser();

      await orchestrator.createUser({
        email: "duplicatedEmail@example.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${userCase.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "duplicatedEmail@example.com",
          }),
        },
      );
      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Email already in use",
        action: "try again with a different email",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const userCase = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${userCase.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUser2",
        email: userCase.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      const userCase = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${userCase.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueEmail@example.com",
          }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: userCase.username,
        email: "uniqueEmail@example.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const userCase = await orchestrator.createUser({
        password: "hashed-password",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${userCase.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "new-password",
          }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: userCase.username,
        email: userCase.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(userCase.username);
      const correctPasswordMatch = await password.compare(
        "new-password",
        userInDatabase.password,
      );
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await password.compare(
        "hashed-password",
        userInDatabase.password,
      );
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
