import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ImagePlus } from "lucide-react";
import { pipeline } from "@huggingface/transformers";

const colors = [
  { name: "Branco", hex: "#F2F0ED" },
  { name: "Bege", hex: "#C9B69A" },
  { name: "Azul Claro", hex: "#8EAFCA" },
  { name: "Verde Oliva", hex: "#777D56" },
  { name: "Terracota", hex: "#C45B30" },
  { name: "Cinza Grafite", hex: "#4B4B4B" },
];

let wallSegmenter;

function getMaskAlpha(mask, index) {
  const channels = mask.channels || 1;
  const offset = index * channels;

  let value = mask.data[offset] ?? 0;

  if (channels >= 4 && mask.data[offset + 3] === 0) {
    return 0;
  }

  if (value <= 1) {
    value *= 255;
  }

  if (value < 90) {
    return 0;
  }

  if (value > 190) {
    return 255;
  }

  return Math.round(((value - 90) / 100) * 255);
}

export default function Home() {
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [photo, setPhoto] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef(null);
  const photoRef = useRef("");
  const resultRef = useRef("");

  function clearUrl(ref) {
    if (ref.current) {
      URL.revokeObjectURL(ref.current);
      ref.current = "";
    }
  }

  function handlePhoto(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Escolha uma imagem JPG, PNG ou WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 10 MB.");
      event.target.value = "";
      return;
    }

    clearUrl(photoRef);
    clearUrl(resultRef);

    const url = URL.createObjectURL(file);

    photoRef.current = url;

    setPhoto(url);
    setResult("");
    setError("");
    event.target.value = "";
  }

  async function simulateColor() {
    if (!photoRef.current) {
      setError("Escolha uma foto do ambiente primeiro.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (!wallSegmenter) {
        wallSegmenter = await pipeline(
          "image-segmentation",
          "Xenova/segformer-b0-finetuned-ade-512-512"
        );
      }

      const imageUrl = photoRef.current;
      const image = new Image();

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = imageUrl;
      });

      const detections = await wallSegmenter(imageUrl);

      const wall = detections.find(
        (item) => item.label.toLowerCase() === "wall"
      );

      if (!wall?.mask?.data || !wall.mask.width || !wall.mask.height) {
        setError(
          "Não consegui identificar a parede nesta foto. Tente uma imagem com a parede mais visível."
        );
        return;
      }

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas indisponível.");
      }

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);

      const mask = wall.mask;
      const maskCanvas = document.createElement("canvas");

      maskCanvas.width = mask.width;
      maskCanvas.height = mask.height;

      const maskContext = maskCanvas.getContext("2d", {
        willReadFrequently: true,
      });

      if (!maskContext) {
        throw new Error("Não foi possível processar a máscara.");
      }

      const maskPixels = new ImageData(mask.width, mask.height);

      for (let i = 0; i < mask.width * mask.height; i++) {
        const offset = i * 4;
        const alpha = getMaskAlpha(mask, i);

        maskPixels.data[offset] = 255;
        maskPixels.data[offset + 1] = 255;
        maskPixels.data[offset + 2] = 255;
        maskPixels.data[offset + 3] = alpha;
      }

      maskContext.putImageData(maskPixels, 0, 0);

      const smoothMask = document.createElement("canvas");

      smoothMask.width = canvas.width;
      smoothMask.height = canvas.height;

      const smoothContext = smoothMask.getContext("2d");

      if (!smoothContext) {
        throw new Error("Não foi possível suavizar o recorte.");
      }

      smoothContext.imageSmoothingEnabled = true;
      smoothContext.imageSmoothingQuality = "high";
      smoothContext.filter = "blur(1.2px)";

      smoothContext.drawImage(
        maskCanvas,
        0,
        0,
        smoothMask.width,
        smoothMask.height
      );

      smoothContext.filter = "none";

      const colorLayer = document.createElement("canvas");

      colorLayer.width = canvas.width;
      colorLayer.height = canvas.height;

      const colorContext = colorLayer.getContext("2d");

      if (!colorContext) {
        throw new Error("Não foi possível criar a camada de cor.");
      }

      colorContext.fillStyle = selectedColor.hex;
      colorContext.fillRect(0, 0, colorLayer.width, colorLayer.height);

      colorContext.globalCompositeOperation = "destination-in";
      colorContext.drawImage(smoothMask, 0, 0);

      context.save();

      context.globalCompositeOperation =
        selectedColor.name === "Branco" ? "screen" : "color";

      context.globalAlpha = selectedColor.name === "Branco" ? 0.85 : 0.9;

      context.drawImage(colorLayer, 0, 0);

      context.restore();

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });

      if (!blob) {
        throw new Error("Não foi possível gerar a imagem.");
      }

      clearUrl(resultRef);

      const resultUrl = URL.createObjectURL(blob);

      resultRef.current = resultUrl;
      setResult(resultUrl);
    } catch (err) {
      console.error("Erro ao simular a cor:", err);

      setError(
        "Não foi possível processar a foto. Confira sua conexão e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleColorChange(color) {
    setSelectedColor(color);
    setError("");
    setResult("");
    clearUrl(resultRef);
  }

  return (
    <>
      <section className="hero-section home-hero">
        <div className="container hero-content">
          <span className="hero-tag">GP Tintas</span>
          <h1>Mais cor, mais vida para seus ambientes.</h1>
          <p>
            Encontre tintas para o seu projeto e escolha entre cores
            selecionadas pela GP Tintas.
          </p>

          <Link className="btn btn-primary-gp home-cta" to="/produtos">
            Ver produtos <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="container page-section" id="quem-somos">
        <div className="home-about">
          <span className="section-label">Quem somos</span>
          <h2>Cor e qualidade para transformar seus espaços</h2>
          <p>
            A GP Tintas ajuda você a encontrar os produtos e as cores certas
            para renovar seus ambientes. Nosso objetivo é tornar a escolha
            mais simples, com opções para diferentes projetos e necessidades.
          </p>

          <Link to="/produtos" className="btn btn-outline-gp">
            Conheça nossos produtos
          </Link>
        </div>
      </section>

      <section className="container page-section" id="simular-cor">
        <div className="section-heading">
          <span className="section-label">Simular cor</span>
          <h2>Veja uma nova cor na sua parede</h2>
          <p>
            Envie uma foto e o sistema tentará identificar a parede
            automaticamente, sem precisar marcar os cantos.
          </p>
        </div>

        <div className="color-simulator">
          <div className="color-options">
            {colors.map((color) => (
              <button
                key={color.name}
                type="button"
                className={`color-option ${
                  selectedColor.name === color.name ? "selected" : ""
                }`}
                onClick={() => handleColorChange(color)}
              >
                <span
                  className="color-dot"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
              </button>
            ))}
          </div>

          <label className="photo-upload">
            <ImagePlus size={22} />
            <span>
              {photo ? "Trocar foto do ambiente" : "Escolher foto do ambiente"}
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhoto}
            />
          </label>

          {photo && (
            <div className="simulator-preview">
              <h3>Foto original</h3>

              <img
                src={photo}
                alt="Foto original do ambiente"
                style={{
                  width: "100%",
                  maxWidth: 850,
                  borderRadius: 12,
                }}
              />

              <button
                type="button"
                className="btn btn-primary-gp"
                onClick={simulateColor}
                disabled={loading}
              >
                {loading
                  ? "Identificando parede..."
                  : "Identificar e aplicar cor"}
              </button>

              {loading && (
                <p>
                  A primeira utilização pode demorar enquanto o modelo é
                  carregado.
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="feedback feedback-error" role="alert">
              {error}
            </div>
          )}

          {result && (
            <div className="simulator-preview">
              <h3>Resultado da simulação</h3>

              <img
                src={result}
                alt={`Parede simulada na cor ${selectedColor.name}`}
                style={{
                  width: "100%",
                  maxWidth: 850,
                  borderRadius: 12,
                }}
              />

              <p>
                Cor aplicada: <strong>{selectedColor.name}</strong>
              </p>

              <a
                className="btn btn-outline-gp"
                href={result}
                download={`simulacao-${selectedColor.name
                  .toLowerCase()
                  .replaceAll(" ", "-")}.png`}
              >
                Salvar imagem
              </a>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: "none" }} />

          <p>
            A identificação automática pode incluir outras paredes ou deixar
            algumas partes de fora. Confira o resultado antes de salvar.
          </p>
        </div>
      </section>
    </>
  );
}