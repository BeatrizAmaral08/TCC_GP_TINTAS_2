import { Router } from "express";

const routes = Router();

import clienteRoutes from "./clienteRoutes.js";
import authRoutes from "./authRoutes.js";
import categoriaRoutes from "./categoriaRoutes.js";
import produtoRoutes from "./produtoRoutes.js";
import produtoVolumetriaRoutes from "./produtoVolumetriaRoutes.js";
import carrinhoRoutes from "./carrinhoRoutes.js";
import enderecoRoutes from "./enderecoRoutes.js";
import pedidoRoutes from "./pedidoRoutes.js";
import estoqueRoutes from "./estoqueRoutes.js";

routes.use("/clientes", clienteRoutes);
routes.use("/autenticacao", authRoutes);
routes.use("/categorias", categoriaRoutes);
routes.use("/produtos", produtoRoutes);
routes.use("/volumetrias", produtoVolumetriaRoutes);
routes.use("/carrinho", carrinhoRoutes);
routes.use("/endereco", enderecoRoutes);
routes.use("/pedidos", pedidoRoutes);
routes.use("/estoque", estoqueRoutes);

export default routes;
