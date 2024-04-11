import database from "infra/database";

test("Get to /api/v1/migrations should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations");
  expect(response.status).toBe(200);

  console.log(`process.env.NODE_ENV = ${JSON.stringify(process.env.NODE_ENV)}`);
  console.log(
    `process.env.DATABASE_URL = ${JSON.stringify(process.env.DATABASE_URL)}`
  );
  ``;

  const responseBody = await response.json();
  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBeGreaterThan(0);
});
