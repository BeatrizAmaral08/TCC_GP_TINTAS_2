import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/index.js";
import {
    notFound,
    errorHandler
} from "./middlewares/errorMiddleware.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.resolve(
    __dirname,
    "..",
    "uploads"
);

const allowedOrigins = (
    process.env.FRONTEND_URL ||
    "http://localhost:5173"
)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

//configurar cors
app.use(
    cors({
        origin(origin, callback) {
            if (
                !origin ||
                allowedOrigins.includes(origin)
            ) {
                return callback(null, true);
            }

            return callback(
                new Error(
                    "Origem não permitida pelo CORS"
                )
            );
        },
        credentials: true
    })
);

//configurar json
app.use(
    express.json({
        limit: "2mb"
    })
);

app.use(
    express.urlencoded({
        extended: true
    })
);

//configurar uploads
app.use(
    "/uploads",
    express.static(uploadDir)
);

//rota inicial
app.get("/", (req, res) => {
    res.json({
        projeto: "GP Tintas",
        api: "online",
        versao: "2.0.0",
        documentacao: "/api/health"
    });
});

//rotas da api
app.use("/api", routes);

//tratar rotas não encontradas
app.use(notFound);

//tratar erros
app.use(errorHandler);

export default app;