test("Get to /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  const { updated_at, max_connections, open_connections, postgres_version } =
    responseBody;
  expect(responseBody).toMatchObject({
    updated_at: expect.any(String),
    postgres_version: expect.any(String),
    max_connections: expect.any(Number),
    open_connections: expect.any(Number),
  });

  const parsedUpdatedAt = new Date(updated_at).toISOString(); // throws if invalid date

  expect(updated_at).toEqual(parsedUpdatedAt);

  expect(max_connections).toBeGreaterThan(open_connections);
  expect(Number(postgres_version)).toBeGreaterThanOrEqual(16);
});
