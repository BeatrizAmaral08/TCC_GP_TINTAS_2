import { Router } from "express";
import authController from "../controllers/authController.js";
import { authRequired } from "../middlewares/authMiddleware.js";

const authRoutes = Router();

authRoutes.post("/", authController.registrar);
authRoutes.post("/login", authController.login);

// Usuário logado
authRoutes.get("/me", authRequired, authController.me);

export default authRoutes;