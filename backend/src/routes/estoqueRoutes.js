import { Router } from "express";
import estoqueController from "../controllers/estoqueController.js";
import { authRequired } from "../middlewares/authMiddleware.js";


const estoqueRoutes = Router();

estoqueRoutes.patch("/:id", authRequired, estoqueController.alterar);

export default estoqueRoutes;