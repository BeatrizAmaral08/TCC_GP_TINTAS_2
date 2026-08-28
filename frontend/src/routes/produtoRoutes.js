import { Router } from "express";
import produtoController from "../controllers/produtoController.js";
import { authRequired } from "../middlewares/authMiddleware.js";

const produtoRoutes = Router();

produtoRoutes.post("/", produtoController.criar);
produtoRoutes.get("/", produtoController.listar);
produtoRoutes.put("/:id/estoque",authRequired, produtoController.estoque);
produtoRoutes.get("/:id", produtoController.buscar);
produtoRoutes.put("/:id", produtoController.atualizar);
produtoRoutes.delete("/:id", produtoController.deletar);

export default produtoRoutes;