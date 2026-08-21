import { Router } from "express";
import authController from "../controllers/authController";

const authRoutes = Router();

authRoutes.post('/', authController.registrar);
authRoutes.post('/:id', authController.login);
authRoutes.post('/:id', authController.me);

export default authRoutes;