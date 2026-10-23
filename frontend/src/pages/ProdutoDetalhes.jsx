import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  CircleHelp,
  Minus,
  Plus,
  Ruler,
  ShoppingCart,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  calcularVolumetria,
  getVolumetrias,
} from "../services/volumetriaService";
import { getApiError } from "../services/api";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    maximumFractionDigits: 2,
  });
}

const initialAbertura = { quantidade: 1, altura: "", largura: "" };

function CampoMedida({ label, value, onChange, step = "0.1", min = "0" }) {
  return (
    <label className="vol-field">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
      />
    </label>
  );
}

function Contador({ value, onChange, label = "Quantidade" }) {
  return (
    <div className="vol-counter" aria-label={label}>
      <button
        type="button"
        aria-label={`Diminuir ${label.toLowerCase()}`}
        onClick={() => onChange(Math.max(0, Number(value) - 1))}
        disabled={Number(value) <= 0}
      >
        <Minus size={14} />
      </button>
      <span>{value}</span>
      <button
        type="button"
        aria-label={`Aumentar ${label.toLowerCase()}`}
        onClick={() => onChange(Math.min(100, Number(value) + 1))}
        disabled={Number(value) >= 100}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export default function ProdutoDetalhes({ products, user, onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [volumetrias, setVolumetrias] = useState([]);
  const [selectedVolumetria, setSelectedVolumetria] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [modo, setModo] = useState("medidas");
  const [areaInformada, setAreaInformada] = useState("");
  const [altura, setAltura] = useState("2.7");
  const [largura, setLargura] = useState("4");
  const [quantidadeParedes, setQuantidadeParedes] = useState(1);
  const [portas, setPortas] = useState({ ...initialAbertura, altura: "2.1", largura: "0.8" });
  const [janelas, setJanelas] = useState({ ...initialAbertura, altura: "1.5", largura: "1" });
  const [demãos, setDemaos] = useState(2);
  const [resultado, setResultado] = useState(null);
  const [calculando, setCalculando] = useState(false);

  const product = products.find(
    (item) => String(item.id ?? item.idProduto) === String(id)
  );

  useEffect(() => {
    async function loadVolumetrias() {
      setLoading(true);
      setError("");
      setResultado(null);
      try {
        const data = await getVolumetrias(id);
        setVolumetrias(data);
        setSelectedVolumetria(data.length > 0 ? data[0] : null);
      } catch (requestError) {
        setError(getApiError(requestError, "Não foi possível carregar as volumetrias."));
      } finally {
        setLoading(false);
      }
    }
    loadVolumetrias();
  }, [id]);

  const areaPrevia = useMemo(() => {
    if (modo === "area") return Math.max(0, Number(areaInformada) || 0);
    const areaParede = (Number(altura) || 0) * (Number(largura) || 0) * quantidadeParedes;
    const areaPortas = (Number(portas.quantidade) || 0) * (Number(portas.altura) || 0) * (Number(portas.largura) || 0);
    const areaJanelas = (Number(janelas.quantidade) || 0) * (Number(janelas.altura) || 0) * (Number(janelas.largura) || 0);
    return Math.max(0, areaParede - areaPortas - areaJanelas);
  }, [modo, areaInformada, altura, largura, quantidadeParedes, portas, janelas]);

  function updateAbertura(setter, field, value) {
    setter((current) => ({ ...current, [field]: value }));
  }

  async function handleCalculate(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setResultado(null);

    const payload = {
      idProduto: Number(id),
      demãos: Number(demãos),
    };

    if (modo === "area") {
      payload.areaM2 = Number(areaInformada);
    } else {
      payload.altura = Number(altura);
      payload.largura = Number(largura);
      payload.quantidadeParedes = Number(quantidadeParedes);
      payload.portas = [portas];
      payload.janelas = [janelas];
    }

    setCalculando(true);
    try {
      const data = await calcularVolumetria(payload);
      setResultado(data);
      const recomendada = data.embalagens.find((item) => item.atendeEstoque && item.unidadesNecessarias);
      if (recomendada) {
        setSelectedVolumetria(recomendada);
        setQuantidade(recomendada.unidadesNecessarias);
      }
      if (data.aviso) setError(data.aviso);
    } catch (requestError) {
      setError(getApiError(requestError, "Não foi possível calcular a quantidade de tinta."));
    } finally {
      setCalculando(false);
    }
  }

  async function handleAdd() {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!selectedVolumetria) {
      setError("Selecione uma embalagem disponível.");
      return;
    }
    if (Number(quantidade) < 1) {
      setError("A quantidade deve ser de pelo menos uma embalagem.");
      return;
    }
    if (Number(quantidade) > Number(selectedVolumetria.estoque)) {
      setError("A quantidade escolhida ultrapassa o estoque disponível.");
      return;
    }

    setMessage("");
    setError("");
    const result = await onAddToCart(selectedVolumetria.id, Number(quantidade));
    if (result.success) {
      setMessage("Produto adicionado ao carrinho com sucesso.");
    } else {
      setError(result.message);
    }
  }

  function escolherEmbalagem(item) {
    setSelectedVolumetria(item);
    setQuantidade(item.unidadesNecessarias || 1);
  }

  if (!product) {
    return (
      <section className="container page-section">
        <div className="empty-state">Produto não encontrado.</div>
        <Link to="/" className="btn btn-primary-gp">Voltar para produtos</Link>
      </section>
    );
  }

  return (
    <section className="container page-section">
      <button type="button" className="btn btn-link px-0 mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Voltar
      </button>

      <div className="row g-4 align-items-start">
        <div className="col-lg-5">
          <div className="product-image-wrapper rounded overflow-hidden">
            <img
              src={product.imagem}
              alt={product.nome}
              className="product-image"
              onError={(event) => { event.currentTarget.style.display = "none"; }}
            />
          </div>
          <span className="product-category d-inline-block mt-3">{product.categoria || "Tintas"}</span>
          <h1 className="mt-2">{product.nome}</h1>
          <p className="text-muted">{product.descricao || "Conheça os detalhes deste produto GP Tintas."}</p>
          {product.marca && <p><strong>Marca:</strong> {product.marca}</p>}
        </div>

        <div className="col-lg-7">
          <div className="vol-calculator">
            <header className="vol-header">
              <div className="vol-title"><Calculator size={19} /> CALCULAR A QUANTIDADE</div>
              <button type="button" className="vol-close" aria-label="Limpar cálculo" onClick={() => { setResultado(null); setError(""); setMessage(""); }}>
                <X size={22} />
              </button>
            </header>

            <p className="vol-subtitle">Já sabe a metragem que será pintada?</p>
            <div className="vol-mode-switch" role="group" aria-label="Como informar a metragem">
              <button type="button" className={modo === "area" ? "active" : ""} onClick={() => { setModo("area"); setResultado(null); }}>
                <Ruler size={18} /> Já sei a metragem
              </button>
              <button type="button" className={modo === "medidas" ? "active" : ""} onClick={() => { setModo("medidas"); setResultado(null); }}>
                <CircleHelp size={19} /> Ainda não sei a metragem
              </button>
            </div>

            <form onSubmit={handleCalculate}>
              {modo === "area" ? (
                <div className="vol-panel">
                  <h3>METRAGEM A PINTAR</h3>
                  <CampoMedida label="ÁREA TOTAL (M²)" value={areaInformada} onChange={setAreaInformada} step="0.1" min="0.1" />
                </div>
              ) : (
                <>
                  <div className="vol-panel">
                    <h3>PAREDES</h3>
                    <div className="vol-fields vol-wall-fields">
                      <CampoMedida label="ALTURA (M)" value={altura} onChange={setAltura} min="0.1" />
                      <CampoMedida label="LARGURA (M)" value={largura} onChange={setLargura} min="0.1" />
                      <label className="vol-field">
                        <span>QUANTIDADE DE PAREDES</span>
                        <input type="number" min="1" max="100" step="1" value={quantidadeParedes} onChange={(event) => setQuantidadeParedes(Math.max(1, Number(event.target.value) || 1))} required />
                      </label>
                    </div>
                  </div>

                  <div className="vol-panel">
                    <h3>POSSUI PORTAS?</h3>
                    <div className="vol-fields vol-opening-fields">
                      <div className="vol-field">
                        <span>QTD.</span>
                        <Contador value={portas.quantidade} onChange={(value) => updateAbertura(setPortas, "quantidade", value)} />
                      </div>
                      <CampoMedida label="ALTURA (M)" value={portas.altura} onChange={(value) => updateAbertura(setPortas, "altura", value)} min="0" />
                      <CampoMedida label="LARGURA (M)" value={portas.largura} onChange={(value) => updateAbertura(setPortas, "largura", value)} min="0" />
                      <div className="vol-area-mini"><span>ÁREA DAS PORTAS</span><strong>{formatNumber(Number(portas.quantidade) * Number(portas.altura) * Number(portas.largura))} m²</strong></div>
                    </div>
                  </div>

                  <div className="vol-panel">
                    <h3>POSSUI JANELAS?</h3>
                    <div className="vol-fields vol-opening-fields">
                      <div className="vol-field">
                        <span>QTD.</span>
                        <Contador value={janelas.quantidade} onChange={(value) => updateAbertura(setJanelas, "quantidade", value)} />
                      </div>
                      <CampoMedida label="ALTURA (M)" value={janelas.altura} onChange={(value) => updateAbertura(setJanelas, "altura", value)} min="0" />
                      <CampoMedida label="LARGURA (M)" value={janelas.largura} onChange={(value) => updateAbertura(setJanelas, "largura", value)} min="0" />
                      <div className="vol-area-mini"><span>ÁREA DAS JANELAS</span><strong>{formatNumber(Number(janelas.quantidade) * Number(janelas.altura) * Number(janelas.largura))} m²</strong></div>
                    </div>
                  </div>
                </>
              )}

              <div className="vol-total-area">
                <div><Ruler size={19} /><strong>ÁREA TOTAL DO AMBIENTE (m²)</strong></div>
                <strong>{formatNumber(areaPrevia)} m²</strong>
              </div>

              <div className="vol-coats">
                <label htmlFor="vol-demãos">QUANTIDADE DE DEMÃOS</label>
                <select id="vol-demãos" value={demãos} onChange={(event) => setDemaos(Number(event.target.value))}>
                  {[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>{value} {value === 1 ? "demão" : "demãos"}</option>)}
                </select>
              </div>

              <button type="submit" className="vol-calculate-button" disabled={calculando || loading || volumetrias.length === 0}>
                {calculando ? "CALCULANDO..." : "CALCULAR RESULTADO"}
              </button>
            </form>

            {loading && <p className="vol-feedback">Carregando embalagens disponíveis...</p>}
            {volumetrias.length === 0 && !loading && <p className="vol-feedback">Este produto ainda não possui embalagens cadastradas.</p>}
            {error && <div className="alert alert-warning mt-3 mb-0">{error}</div>}
            {message && <div className="alert alert-success mt-3 mb-0">{message}</div>}

            {resultado && (
              <div className="vol-results">
                <div className="vol-results-heading">
                  <CheckCircle2 size={22} />
                  <div>
                    <h3>RESULTADO DO CÁLCULO</h3>
                    <p>Estimativa para {resultado.demãos} {resultado.demãos === 1 ? "demão" : "demãos"}.</p>
                  </div>
                </div>
                <div className="vol-result-summary">
                  <div><span>Área a pintar</span><strong>{formatNumber(resultado.areaLiquida)} m²</strong></div>
                  <div><span>Área descontada</span><strong>{formatNumber(resultado.areaPortas + resultado.areaJanelas)} m²</strong></div>
                </div>
                <p className="vol-package-label">Escolha a embalagem para ver a quantidade necessária:</p>
                <div className="vol-package-list">
                  {resultado.embalagens.map((item) => {
                    const selected = selectedVolumetria?.id === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        className={`vol-package-option ${selected ? "selected" : ""}`}
                        onClick={() => escolherEmbalagem(item)}
                        disabled={!item.rendimento || !item.atendeEstoque}
                      >
                        <span className="vol-package-radio">{selected ? "●" : "○"}</span>
                        <span className="vol-package-description">
                          <strong>{item.volume} {item.unidade}</strong>
                          <small>{item.rendimento ? `Rendimento: ${formatNumber(item.rendimento)} m² por demão` : "Rendimento não cadastrado"}</small>
                          <small>{item.unidadesNecessarias ? `${item.unidadesNecessarias} embalagem(ns) necessária(s)` : "Não foi possível calcular"}</small>
                          {item.litrosEstimados !== null && <small>Total: {formatNumber(item.litrosEstimados)} L</small>}
                        </span>
                        <span className="vol-package-price">
                          <strong>{formatMoney(item.totalEstimado)}</strong>
                          <small>{item.atendeEstoque ? `Estoque: ${item.estoque}` : "Estoque insuficiente"}</small>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {selectedVolumetria && resultado.embalagens.some((item) => item.id === selectedVolumetria.id) && (
                  <div className="vol-selected-summary">
                    <span>Quantidade recomendada</span>
                    <strong>{selectedVolumetria.unidadesNecessarias || "—"} embalagem(ns)</strong>
                    <span>Quantidade total</span>
                    <strong>{selectedVolumetria.litrosEstimados !== null && selectedVolumetria.litrosEstimados !== undefined ? `${formatNumber(selectedVolumetria.litrosEstimados)} L` : `${formatNumber(Number(selectedVolumetria.volume) * Number(selectedVolumetria.unidadesNecessarias || 0))} ${selectedVolumetria.unidade}`}</strong>
                    <span>Estimativa de compra</span>
                    <strong>{formatMoney(selectedVolumetria.totalEstimado)}</strong>
                  </div>
                )}
              </div>
            )}

            {!resultado && (
              <>
                <hr className="vol-divider" />
                <h3 className="vol-product-packages-title">EMBALAGENS DISPONÍVEIS</h3>
                {volumetrias.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`vol-basic-package ${selectedVolumetria?.id === item.id ? "selected" : ""}`}
                    onClick={() => { setSelectedVolumetria(item); setQuantidade(1); }}
                  >
                    <span><strong>{item.volume} {item.unidade}</strong><small>Estoque: {item.estoque}</small></span>
                    <strong>{formatMoney(item.preco)}</strong>
                  </button>
                ))}
                {selectedVolumetria && (
                  <div className="vol-buy-row">
                    <label htmlFor="quantity">Quantidade</label>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      max={selectedVolumetria.estoque}
                      className="form-control"
                      value={quantidade}
                      onChange={(event) => setQuantidade(Math.max(1, Number(event.target.value) || 1))}
                    />
                    <button type="button" className="btn btn-primary-gp" onClick={handleAdd} disabled={Number(selectedVolumetria.estoque) <= 0}>
                      <ShoppingCart size={18} /> {user ? "Adicionar ao carrinho" : "Entrar para comprar"}
                    </button>
                  </div>
                )}
              </>
            )}

            {resultado && selectedVolumetria && (
              <button type="button" className="vol-calculate-button vol-add-cart" onClick={handleAdd} disabled={!selectedVolumetria.rendimento || !selectedVolumetria.atendeEstoque}>
                <ShoppingCart size={18} /> {user ? "ADICIONAR AO CARRINHO" : "ENTRAR PARA COMPRAR"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
