import "dotenv/config";
import app from "./src/app.js";
import { testarConexao } from "./src/configs/Database.js";

const PORT = Number(
    process.env.SERVER_PORT || 8000
);

try {
    //testar conexão com banco
    await testarConexao();

    app.listen(PORT, () => {
        console.log(
            `GP Tintas API rodando em http://localhost:${PORT}`
        );

        console.log(
            `Health check: http://localhost:${PORT}/api/health`
        );
    });

} catch (error) {
    console.error(
        "Não foi possível iniciar a API porque o MySQL não respondeu."
    );

    console.error(error.message);

    process.exit(1);
}