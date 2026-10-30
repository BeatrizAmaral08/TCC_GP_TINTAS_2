import express from "express";
import clienteController from "../controllers/clienteController.js";
import { authRequired, requireRole } from "../middlewares/authMiddleware.js";

const clienteRoutes = express.Router();

// Cadastro de clientes
// Mantido público para preservar o funcionamento atual
clienteRoutes.post("/", clienteController.criar);

// Exige autenticação e perfil administrativo
clienteRoutes.use(authRequired);
clienteRoutes.use(requireRole("repositor", "dev"));

// Lista todos os clientes
clienteRoutes.get("/", clienteController.listar);

// Busca um cliente pelo ID
clienteRoutes.get("/:id", clienteController.buscar);

// Atualiza os dados de um cliente
clienteRoutes.put("/:id", clienteController.atualizar);

// Exclui um cliente
clienteRoutes.delete("/:id", clienteController.desativar);

export default clienteRoutes;
