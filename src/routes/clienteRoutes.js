import { Router } from "express";
import clienteController from "../controllers/clienteController.js";

const clienteRoutes = Router();

clienteRoutes.post('/', clienteController.criar);
clienteRoutes.post('/', clienteController.listar);
clienteRoutes.put('/:id', clienteController.atualizar);
clienteRoutes.delete('/:id', clienteController.desativar);
clienteRoutes.get('/', clienteController.buscar);
clienteRoutes.delete('/:id', clienteController.alterarPerfil);
clienteRoutes.delete('/:id', clienteController.alterarStatus);

export default clienteRoutes;