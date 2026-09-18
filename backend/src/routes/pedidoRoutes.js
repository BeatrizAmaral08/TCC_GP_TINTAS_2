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

// acompanha o status dos pedidos do cliente
pedidoRoutes.get("/status", pedidoController.acompanharStatus);

// busca um pedido específico
pedidoRoutes.get("/:id", pedidoController.buscar);

export default pedidoRoutes;
