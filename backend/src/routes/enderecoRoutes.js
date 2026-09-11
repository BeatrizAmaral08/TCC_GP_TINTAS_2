import { Router } from "express";
import enderecoController from "../controllers/enderecoController.js";
import { authRequired } from "../middlewares/authMiddleware.js";

const enderecoRoutes = Router();

//todas as rotas de endereço exigem cliente autenticado
enderecoRoutes.use(authRequired);

// listar endereços do cliente
enderecoRoutes.get("/", enderecoController.listar);

// buscar um endereço específico
enderecoRoutes.get("/:id", enderecoController.buscar);

// cadastrar endereço
enderecoRoutes.post("/", enderecoController.criar);

// atualizar endereço
enderecoRoutes.put("/:id", enderecoController.atualizar);

// remover endereço
enderecoRoutes.delete("/:id", enderecoController.remover);

export default enderecoRoutes;
