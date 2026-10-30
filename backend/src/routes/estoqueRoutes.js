import { Router } from "express";
import estoqueController from "../controllers/estoqueController.js";
import { authRequired, requireRole } from "../middlewares/authMiddleware.js";

const estoqueRoutes = Router();

// Exige autenticação e perfil administrativo
estoqueRoutes.use(authRequired);
estoqueRoutes.use(requireRole("repositor", "dev"));

// Lista as movimentações de estoque
estoqueRoutes.get("/movimentacoes", estoqueController.listarMovimentacoes);

// Realiza entrada, saída ou ajuste de estoque
estoqueRoutes.patch("/:id", estoqueController.alterar);

export default estoqueRoutes;