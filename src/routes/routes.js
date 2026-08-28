import { Router } from "express";
const routes = Router();

import clienteRoutes from "./clienteRoutes.js";
import authRoutes from "./authRoutes.js";
import categoriaRoutes from "./categoriaRoutes.js";
import produtoRoutes from "./produtoRoutes.js";

routes.use('/clientes', clienteRoutes);
routes.use('/autenticacao', authRoutes);
routes.use('/categorias', categoriaRoutes);
routes.use('/produtos', produtoRoutes);

export default routes;