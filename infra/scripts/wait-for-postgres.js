const { exec } = require("node:child_process");

function checkPostgress() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".");
      return setTimeout(checkPostgress, 250); // 250ms atraso adicionado por estilo.
    }

    console.log("\n✅ Postgres está pronto. \n");
  }
}

process.stdout.write("\n\n🛑 Aguardando Postgres aceitar conexões");
checkPostgress();
