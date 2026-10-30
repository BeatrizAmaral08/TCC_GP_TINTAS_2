import { useState } from "react";
import { Plus, Save, Tag, Trash2 } from "lucide-react";
import { getApiError } from "../services/api";
import { salvarDesconto, removerDesconto } from "../services/volumetriaService";

// Valida a porcentagem informada
function validarPorcentagem(valor) {
  const desconto = Number(valor);

  if (
    String(valor).trim() === "" ||
    !Number.isFinite(desconto) ||
    desconto <= 0 ||
    desconto > 100 ||
    Math.abs(
      desconto * 100 - Math.round(desconto * 100)
    ) > 0.000001
  ) {
    throw new Error(
      "Informe um desconto maior que 0% e de até 100%."
    );
  }

  return desconto;
}

// Formata o nome da volumetria
function formatarVolume(volume) {
  return `${volume.volume} ${volume.unidade}`;
}

export default function Descontos({
  idProduto = null,
  volumetrias = [],
  onAtualizar,
}) {
  // Controla a abertura do formulário
  const [aberto, setAberto] = useState(false);

  // Campos do desconto
  const [porcentagem, setPorcentagem] = useState("");
  const [selecionadas, setSelecionadas] = useState([]);

  // Descontos preparados antes do cadastro do produto
  const [descontosLocais, setDescontosLocais] = useState({});

  // Estados das mensagens e carregamento
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Identifica uma volumetria pelo ID ou chave temporária
  function obterChave(volume) {
    return String(
      volume.id ??
      volume.idProdutoVolumetria ??
      volume.chave
    );
  }

  // Seleciona ou desmarca uma volumetria
  function selecionarVolume(chave) {
    setSelecionadas((atual) =>
      atual.includes(chave)
        ? atual.filter((item) => item !== chave)
        : [...atual, chave]
    );
  }

  // Limpa os campos após salvar
  function limparFormulario() {
    setPorcentagem("");
    setSelecionadas([]);
    setAberto(false);
  }

  // Salva o desconto nas volumetrias selecionadas
  async function handleSalvar() {
    setError("");
    setMessage("");

    try {
      const desconto = validarPorcentagem(
        porcentagem
      );

      if (selecionadas.length === 0) {
        throw new Error(
          "Selecione pelo menos uma volumetria."
        );
      }

      setLoading(true);

      // Produto novo: prepara os descontos localmente
      if (!idProduto) {
        const novos = { ...descontosLocais };

        selecionadas.forEach((chave) => {
          novos[chave] = desconto;
        });

        setDescontosLocais(novos);

        // Informa ao cadastro quais descontos foram escolhidos
        onAtualizar?.(novos);

        setMessage(
          "Desconto preparado. Ele será gravado ao cadastrar o produto."
        );

        limparFormulario();
        return;
      }

      // Produto existente: salva os descontos pela API
      for (const chave of selecionadas) {
        const volume = volumetrias.find(
          (item) => obterChave(item) === chave
        );

        if (!volume) {
          throw new Error(
            "Volumetria não encontrada."
          );
        }

        const idVolume = Number(
          volume.id ?? volume.idProdutoVolumetria
        );

        if (
          !Number.isSafeInteger(idVolume) ||
          idVolume <= 0
        ) {
          throw new Error(
            "A volumetria ainda não possui um ID válido."
          );
        }

        await salvarDesconto(
          idProduto,
          idVolume,
          desconto
        );
      }

      setMessage("Desconto salvo com sucesso!");
      limparFormulario();

      await onAtualizar?.();

    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          requestError.message ||
          "Não foi possível salvar o desconto."
        )
      );

    } finally {
      setLoading(false);
    }
  }

  // Remove o desconto de uma volumetria
  async function handleRemover(volume) {
    setError("");
    setMessage("");

    const chave = obterChave(volume);

    try {
      setLoading(true);

      // Remove uma promoção ainda não enviada ao banco
      if (!idProduto) {
        const novos = { ...descontosLocais };
        delete novos[chave];

        setDescontosLocais(novos);
        onAtualizar?.(novos);

      } else {
        // Remove uma promoção já cadastrada no MySQL
        const idVolume = Number(
          volume.id ?? volume.idProdutoVolumetria
        );

        await removerDesconto(
          idProduto,
          idVolume
        );

        await onAtualizar?.();
      }

      setMessage("Desconto removido com sucesso!");

    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Não foi possível remover o desconto."
        )
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">

      {/* Título da seção de promoções */}
      <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
        <div>
          <h5 className="mb-1">
            <Tag size={19} className="me-2" />
            Promoções do produto
          </h5>

          <small className="text-secondary">
            Adicione descontos para uma ou mais volumetrias.
          </small>
        </div>

        <span className="badge text-bg-secondary">
          Opcional
        </span>
      </div>

      {/* Botão para abrir o formulário */}
      <button
        type="button"
        className="btn btn-outline-primary"
        disabled={loading}
        onClick={() => setAberto((atual) => !atual)}
      >
        <Plus size={17} className="me-2" />
        {aberto ? "Fechar desconto" : "Adicionar desconto"}
      </button>

      {/* Formulário para configurar um desconto */}
      {aberto && (
        <div className="border rounded p-3 mt-3">

          {/* Porcentagem do desconto */}
          <div className="mb-3">
            <label className="form-label">
              Porcentagem de desconto (%)
            </label>

            <input
              type="number"
              min="0.01"
              max="100"
              step="0.01"
              className="form-control"
              placeholder="Ex.: 15"
              value={porcentagem}
              disabled={loading}
              onChange={(event) =>
                setPorcentagem(event.target.value)
              }
            />
          </div>

          {/* Seleção de uma ou mais volumetrias */}
          <div className="mb-3">
            <label className="form-label">
              Escolher volumetria
            </label>

            <p className="text-secondary small">
              Selecione todas as volumetrias que
              receberão o desconto informado.
            </p>

            {volumetrias.length === 0 ? (
              <div className="alert alert-warning">
                Adicione pelo menos uma volumetria
                antes de configurar descontos.
              </div>
            ) : (
              <div className="row g-2">
                {volumetrias.map((volume) => {
                  const chave = obterChave(volume);

                  return (
                    <div
                      className="col-md-6"
                      key={chave}
                    >
                      <label className="border rounded p-3 d-flex align-items-center gap-2 w-100">
                        <input
                          type="checkbox"
                          className="form-check-input mt-0"
                          checked={selecionadas.includes(chave)}
                          disabled={loading}
                          onChange={() =>
                            selecionarVolume(chave)
                          }
                        />

                        {formatarVolume(volume)}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botão azul para salvar o desconto */}
          <button
            type="button"
            className="btn btn-primary-gp"
            disabled={
              loading ||
              volumetrias.length === 0
            }
            onClick={handleSalvar}
          >
            <Save size={18} className="me-2" />
            {loading ? "Salvando..." : "Salvar desconto"}
          </button>
        </div>
      )}

      {/* Lista de descontos cadastrados */}
      <div className="mt-4">
        <h6>Descontos configurados</h6>

        {volumetrias.map((volume) => {
          const chave = obterChave(volume);

          const desconto = Number(
            idProduto
              ? volume.desconto || 0
              : descontosLocais[chave] || 0
          );

          if (desconto <= 0) {
            return null;
          }

          return (
            <div
              key={chave}
              className="border rounded p-3 mb-2 d-flex justify-content-between align-items-center gap-2"
            >
              <div>
                <strong>
                  {formatarVolume(volume)}
                </strong>

                <span className="badge bg-success ms-2">
                  {desconto}% OFF
                </span>
              </div>

              {/* Botão para remover o desconto */}
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                disabled={loading}
                onClick={() => handleRemover(volume)}
              >
                <Trash2 size={17} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Mensagens de retorno */}
      {message && (
        <div className="alert alert-success mt-3">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger mt-3">
          {error}
        </div>
      )}
    </div>
  );
}
