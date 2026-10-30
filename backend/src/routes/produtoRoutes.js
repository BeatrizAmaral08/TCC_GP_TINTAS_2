import { Router } from "express";
import produtoController from "../controllers/produtoController.js";
import { authRequired, requireRole } from "../middlewares/authMiddleware.js";
import { uploadProdutoImagens } from "../configs/produtoUpload.js";

const produtoRoutes = Router();

//rotas publicas

// Listar todos os produtos
produtoRoutes.get(
    "/",
    produtoController.listar
);

// Buscar produto pelo ID
produtoRoutes.get(
    "/:id",
    produtoController.buscar
);

//rotas administrativas

// Cadastrar produto
produtoRoutes.post(
    "/",
    authRequired,
    requireRole("repositor", "dev"),
    uploadProdutoImagens,
    produtoController.criar
);

// Atualizar produto
produtoRoutes.put(
    "/:id",
    authRequired,
    requireRole("repositor", "dev"),
    uploadProdutoImagens,
    produtoController.atualizar
);

// Excluir produto
produtoRoutes.delete(
    "/:id",
    authRequired,
    requireRole("repositor", "dev"),
    produtoController.deletar
);

export default produtoRoutes;
