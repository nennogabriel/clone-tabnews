import retry from "async-retry";
import database from "infra/database";
import migrator from "models/migrator";

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

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
};

export default orchestrator;
