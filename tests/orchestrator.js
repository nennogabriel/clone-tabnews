import retry from "async-retry";

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

const orchestrator = {
  waitForAllServices,
};

export default orchestrator;
