import "dotenv/config";
import app from "./src/app.js";
import { testarConexao } from "./src/configs/Database.js";

const PORT = Number(process.env.SERVER_PORT || 8000);

try {
  await testarConexao();

  app.listen(PORT, () => {
    console.log(`GP Tintas API: http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("Erro ao conectar com o MySQL:", error.message);
  process.exit(1);
}
