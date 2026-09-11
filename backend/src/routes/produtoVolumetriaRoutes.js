import { Router } from "express";
import produtoVolumetriaController from "../controllers/produtoVolumetriaController.js";

const produtoVolumetriaRoutes = Router();

// listar volumetrias de um produto
produtoVolumetriaRoutes.get("/produto/:idProduto", produtoVolumetriaController.listarPorProduto);

// buscar uma volumetria pelo ID
produtoVolumetriaRoutes.get("/:id",produtoVolumetriaController.buscar);

// criar volumetria para um produto
produtoVolumetriaRoutes.post("/produto/:idProduto", produtoVolumetriaController.criar);

export default produtoVolumetriaRoutes;
