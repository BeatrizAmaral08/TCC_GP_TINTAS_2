import cors from "cors";
import express from "express";
import path from "path";
import routes from "./routes/routes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

app.use(express.json());

// Permite acessar as fotos dos produtos
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/", (req, res) => {
  res.json({ projeto: "GP Tintas" });
});

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

export default app;