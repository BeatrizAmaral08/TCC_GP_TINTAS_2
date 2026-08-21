import { Router } from "express";
import categoriaController from "../controllers/categoriaController.js";

const categoriaRoutes = Router();

categoriaRoutes.post('/', categoriaController.criar);
categoriaRoutes.post('/', categoriaController.listar);
categoriaRoutes.put('/:id', categoriaController.atualizar);
categoriaRoutes.delete('/:id', categoriaController.deletar);
categoriaRoutes.get('/', categoriaController.buscar);


export default categoriaRoutes;