import { Router } from "express";
import pedidoController from "../controllers/pedidoController.js";
import { authRequired } from "../middlewares/authMiddleware.js";

const pedidoRoutes = Router();

// todas as rotas de pedido exigem autenticação
pedidoRoutes.use(authRequired);

// checkout
pedidoRoutes.post("/checkout", pedidoController.checkout);

// lista os pedidos do cliente logado
pedidoRoutes.get("/", pedidoController.listar);

// busca um pedido específico
pedidoRoutes.get("/:id", pedidoController.buscar);

export default pedidoRoutes;