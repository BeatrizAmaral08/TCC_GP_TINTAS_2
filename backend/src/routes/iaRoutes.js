import { Router } from "express";
import multer from "multer";
import { simularCor } from "../controllers/iaController.js";

const routes = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

    if (!tiposPermitidos.includes(file.mimetype)) {
      return callback(new Error("Envie uma imagem JPG, PNG ou WEBP."));
    }

    callback(null, true);
  }
});

routes.post("/simular-cor", upload.single("foto"), simularCor);

export default routes;
