import cors from "cors";
import express from "express";
import routes from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ projeto: "GP Tintas", sprint: "01" });
});

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

export default app;
