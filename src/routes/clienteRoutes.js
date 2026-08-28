import express from "express";
import clienteController from "../controllers/clienteController.js";

const clienteRoutes = express.Router();

clienteRoutes.post("/", clienteController.criar);
clienteRoutes.get("/", clienteController.listar);
clienteRoutes.get("/:id", clienteController.buscar);
clienteRoutes.put("/:id", clienteController.atualizar);
clienteRoutes.delete("/:id", clienteController.desativar);

export default clienteRoutes;