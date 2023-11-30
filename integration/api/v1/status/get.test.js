test("Get to /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  const { updated_at, max_connections, open_connections } = responseBody;
  expect(responseBody).toMatchObject({
    updated_at: updated_at,
    max_connections: expect.any(Number),
    open_connections: expect.any(Number),
  });
  expect(max_connections).toBeGreaterThan(open_connections);
});
