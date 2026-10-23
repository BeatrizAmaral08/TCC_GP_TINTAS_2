import { Router } from "express";
import produtoVolumetriaController from "../controllers/produtoVolumetriaController.js";

const produtoVolumetriaRoutes = Router();

// Manter esta rota antes das rotas com parâmetros.
produtoVolumetriaRoutes.post("/calcular", produtoVolumetriaController.calcular);
produtoVolumetriaRoutes.get("/produto/:idProduto", produtoVolumetriaController.listarPorProduto);
produtoVolumetriaRoutes.post("/produto/:idProduto", produtoVolumetriaController.criar);
produtoVolumetriaRoutes.get("/:id", produtoVolumetriaController.buscar);

export default produtoVolumetriaRoutes;
