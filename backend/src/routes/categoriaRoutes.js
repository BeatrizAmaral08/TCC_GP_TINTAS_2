import { Router } from "express";
import categoriaController from "../controllers/categoriaController.js";

const categoriaRoutes = Router();

categoriaRoutes.post("/", categoriaController.criar);
categoriaRoutes.get("/", categoriaController.listar);
categoriaRoutes.get("/:id", categoriaController.buscar);
categoriaRoutes.put("/:id", categoriaController.atualizar);
categoriaRoutes.delete("/:id", categoriaController.deletar);

export default categoriaRoutes;