import { Router } from "express";
const routes = Router();

import clienteRoutes from "./clienteRoutes";
import authRoutes from "./authRoutes";
import categoriaRoutes from "./categoriaRoutes";
import produtoRoutes from "./produtoRoutes";

routes.use('/clientes', clienteRoutes);
routes.use('/autenticacao', authRoutes);
routes.use('/categorias', categoriaRoutes);
routes.use('/produtos', produtoRoutes);

export default routes;