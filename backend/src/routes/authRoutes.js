import { Router } from "express";
import authController from "../controllers/authController.js";
import { authRequired } from "../middlewares/authMiddleware.js";

const authRoutes = Router();

// Cadastro público de clientes
authRoutes.post("/", authController.registrar);

// Login de clientes e administradores
authRoutes.post("/login", authController.login);

// Consultar usuário autenticado
authRoutes.get("/me", authRequired, authController.me);

export default authRoutes;
