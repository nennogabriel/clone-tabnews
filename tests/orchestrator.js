import { faker } from "@faker-js/faker/.";
import retry from "async-retry";

import database from "infra/database";
import migrator from "models/migrator";
import user from "models/user";

async function waitForAllServices() {
  await waitForWebserver();

  async function waitForWebserver() {
    return retry(fetchStatusPage, {
      retries: 60 * 5,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      if (response.status !== 200) {
        throw new Error("Webserver is not ready yet");
      }
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userInputValues) {
  const newUser = await user.create({
    username: faker.internet
      .username()
      .normalize("NFD")
      .replace(/[^a-zA-Z0-9]/g, ""),
    email: faker.internet.email(),
    password: faker.internet.password(),
    ...userInputValues,
  });
  return newUser;
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
};

export default orchestrator;
