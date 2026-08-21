import { Router } from "express";
import produtoController from "../controllers/produtosController.js";

const produtoRoutes = Router();

produtoRoutes.post('/', produtoController.criar);
produtoRoutes.post('/', produtoController.listar);
produtoRoutes.put('/:id', produtoController.atualizar);
produtoRoutes.delete('/:id', produtoController.deletar);
produtoRoutes.get('/', produtoController.buscar);
produtoRoutes.get('/', produtoController.estoque);

export default produtoRoutes;