import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/produtos/",

  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    const nome = `${Date.now()}-${Math.round(Math.random() * 10000)}${extensao}`;

    cb(null, nome);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Envie somente arquivos de imagem."));
    }
  },
});

export const uploadProdutoImagens = upload.fields([
  { name: "imagemLata", maxCount: 1 },
  { name: "imagemCor", maxCount: 1 },
  { name: "imagemSala", maxCount: 1 },
  { name: "imagemQuarto", maxCount: 1 },
  { name: "imagemCozinha", maxCount: 1 },
  { name: "imagemQuintal", maxCount: 1 },
  { name: "imagemPrincipal", maxCount: 1 },
]);