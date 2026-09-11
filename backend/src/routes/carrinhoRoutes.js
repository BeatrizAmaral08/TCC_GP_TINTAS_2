import { Router } from "express";
import carrinhoController from "../controllers/carrinhoController.js";
import { authRequired } from "../middlewares/authMiddleware.js";

const carrinhoRoutes = Router();

//visualizar o carrinho
carrinhoRoutes.get("/", authRequired, carrinhoController.listar);

//adicionar item ao carrinho
carrinhoRoutes.post("/itens", authRequired, carrinhoController.adicionar);

//alterar a quantidade de um item
carrinhoRoutes.put("/itens/:id", authRequired, carrinhoController.atualizarQuantidade);

//remover itens do carrinho
carrinhoRoutes.delete("/itens/:id", authRequired, carrinhoController.remover);

export default carrinhoRoutes;
