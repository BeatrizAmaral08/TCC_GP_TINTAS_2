import { Router } from "express";
import produtoVolumetriaController from "../controllers/produtoVolumetriaController.js";
import { authRequired, optionalAuth, requireRole } from "../middlewares/authMiddleware.js";

const produtoVolumetriaRoutes = Router();

// Lista as volumetrias de um produto
// Administradores podem consultar também as inativas
produtoVolumetriaRoutes.get(
  "/produto/:idProduto",
  optionalAuth,
  produtoVolumetriaController.listarPorProduto
);

// Busca uma volumetria pelo ID
produtoVolumetriaRoutes.get(
  "/:id",
  produtoVolumetriaController.buscar
);


//rotas administrativas:


// Todas as operações abaixo exigem perfil administrativo
produtoVolumetriaRoutes.use(
  authRequired,
  requireRole("repositor", "dev")
);

// Cadastra uma volumetria para o produto
produtoVolumetriaRoutes.post(
  "/produto/:idProduto",
  produtoVolumetriaController.criar
);

// Adiciona ou altera o desconto de uma volumetria
produtoVolumetriaRoutes.put(
  "/produto/:idProduto/:id/desconto",
  produtoVolumetriaController.salvarDesconto
);

// Remove o desconto e restaura o preço original
produtoVolumetriaRoutes.delete(
  "/produto/:idProduto/:id/desconto",
  produtoVolumetriaController.removerDesconto
);

export default produtoVolumetriaRoutes;
