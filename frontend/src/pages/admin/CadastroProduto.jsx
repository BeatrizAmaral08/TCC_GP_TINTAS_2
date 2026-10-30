import { PackagePlus, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getApiError } from "../../services/api";
import { createProduct } from "../../services/productService";
import { createVolumetria } from "../../services/volumetriaService";

// Dados iniciais do formulário de cadastro
const initialForm = {
  idCategoria: "",
  nome: "",
  descricao: "",
  marca: "",
  preco: "",
  estoque: 0,
  estoqueMinimo: 5,
  unidade: "UN",

  // Imagens do produto
  imagemPrincipal: null,
  imagemLata: null,
  imagemCor: null,
  imagemSala: null,
  imagemQuarto: null,
  imagemCozinha: null,
  imagemQuintal: null,
};

// Cria uma nova volumetria com campos vazios
function novaVolumetria() {
  return {
    chave: crypto.randomUUID(),
    volume: "",
    unidade: "L",
    preco: "",
    estoque: 0,
    ativo: true,
  };
}

export default function CadastroProduto({
  categories = [],
  onProductCreated,
}) {
  // Estados do formulário
  const [form, setForm] = useState(initialForm);
  const [volumetrias, setVolumetrias] = useState([
    novaVolumetria(),
  ]);

  // Estados das mensagens e do carregamento
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Guarda um produto já criado se houver falha nas volumetrias
  const [produtoPendente, setProdutoPendente] = useState(null);
  const [volumesSalvos, setVolumesSalvos] = useState([]);

  // Referência para limpar os campos de arquivo
  const formularioRef = useRef(null);

  // Seleciona a primeira categoria disponível
  useEffect(() => {
    if (!form.idCategoria && categories[0]) {
      setForm((atual) => ({
        ...atual,
        idCategoria: String(categories[0].id),
      }));
    }
  }, [categories, form.idCategoria]);

  // Descobre a categoria selecionada
  const categoriaSelecionada = categories.find(
    (categoria) =>
      String(categoria.id) === String(form.idCategoria)
  );

  // Verifica se a categoria é de tintas
  const ehTinta = Boolean(
    categoriaSelecionada?.nome
      ?.toLowerCase()
      .includes("tinta")
  );

  // Atualiza os campos do formulário
  function updateField(campo, valor) {
    setForm((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  // Atualiza os dados de uma volumetria específica
  function updateVolumetria(chave, campo, valor) {
    setVolumetrias((atual) =>
      atual.map((item) =>
        item.chave === chave
          ? { ...item, [campo]: valor }
          : item
      )
    );
  }

  // Adiciona outra volumetria ao formulário
  function adicionarVolumetria() {
    setVolumetrias((atual) => [
      ...atual,
      novaVolumetria(),
    ]);
  }

  // Remove uma volumetria do formulário
  function removerVolumetria(chave) {
    setVolumetrias((atual) =>
      atual.filter((item) => item.chave !== chave)
    );
  }

  // Valida os volumes, preços e estoques
  function validarVolumetrias() {
    if (volumetrias.length === 0) {
      throw new Error(
        "Cadastre pelo menos uma volumetria."
      );
    }

    const combinacoes = new Set();

    return volumetrias.map((item) => {
      const volume = Number(item.volume);
      const preco = Number(item.preco);
      const estoque = Number(item.estoque);

      // Verifica se o volume é válido
      if (
        String(item.volume).trim() === "" ||
        !Number.isFinite(volume) ||
        volume <= 0
      ) {
        throw new Error(
          "Informe um volume válido."
        );
      }

      // Verifica se o preço foi preenchido corretamente
      if (
        String(item.preco).trim() === "" ||
        !Number.isFinite(preco) ||
        preco < 0
      ) {
        throw new Error(
          "Informe um preço válido para cada volume."
        );
      }

      // Verifica se o estoque é um número inteiro
      if (
        String(item.estoque).trim() === "" ||
        !Number.isSafeInteger(estoque) ||
        estoque < 0
      ) {
        throw new Error(
          "O estoque deve ser um número inteiro não negativo."
        );
      }

      const unidade = item.unidade;
      const combinacao = `${volume}-${unidade}`;

      // Impede o cadastro de volumes repetidos
      if (combinacoes.has(combinacao)) {
        throw new Error(
          "Existem volumetrias repetidas."
        );
      }

      combinacoes.add(combinacao);

      return {
        chave: item.chave,
        volume,
        unidade,
        preco,
        estoque,
        ativo: item.ativo,
      };
    });
  }

  // Cadastra o produto e suas volumetrias
  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setMessage("");
    setError("");
    setLoading(true);

    // Aproveita um produto já criado para evitar duplicações
    let produtoCriado = produtoPendente;

    try {
      // Valida as volumetrias antes de cadastrar a tinta
      const volumes = ehTinta
        ? validarVolumetrias()
        : [];

      // Primeiro cadastra os dados principais do produto
      if (!produtoCriado) {
        // Usa o menor preço como referência para a tinta
        const menorPreco = ehTinta
          ? Math.min(...volumes.map((v) => v.preco))
          : Number(form.preco);

        // Calcula o estoque inicial somando as volumetrias
        const estoqueTotal = ehTinta
          ? volumes.reduce(
              (soma, v) => soma + v.estoque,
              0
            )
          : Number(form.estoque);

        // Valida o preço antes de enviar ao backend
        if (
          !Number.isFinite(menorPreco) ||
          menorPreco < 0
        ) {
          throw new Error("Preço inválido.");
        }

        // Valida o estoque antes de enviar ao backend
        if (
          !Number.isSafeInteger(estoqueTotal) ||
          estoqueTotal < 0
        ) {
          throw new Error("Estoque inválido.");
        }

        // Envia os dados e as imagens para a API
        const produto = await createProduct({
          ...form,
          idCategoria: Number(form.idCategoria),
          preco: menorPreco,
          estoque: estoqueTotal,
          estoqueMinimo: Number(form.estoqueMinimo),
        });

        // Recupera o ID do produto criado
        const idProduto = Number(produto?.id);

        if (
          !Number.isSafeInteger(idProduto) ||
          idProduto <= 0
        ) {
          throw new Error(
            "Produto criado, mas o servidor não retornou um ID válido. Verifique o cadastro antes de tentar novamente."
          );
        }

        // Guarda o ID para continuar se alguma volumetria falhar
        produtoCriado = {
          id: idProduto,
          ehTinta,
        };

        setProdutoPendente(produtoCriado);
      }

      // Cadastra cada volumetria vinculada ao produto
      if (produtoCriado.ehTinta) {
        for (const volume of volumes) {
          // Não cadastra novamente uma volumetria já salva
          if (volumesSalvos.includes(volume.chave)) {
            continue;
          }

          await createVolumetria(
            produtoCriado.id,
            {
              volume: volume.volume,
              unidade: volume.unidade,
              preco: volume.preco,
              estoque: volume.estoque,
              ativo: volume.ativo,
            }
          );

          // Registra que a volumetria foi salva
          setVolumesSalvos((atual) => [
            ...atual,
            volume.chave,
          ]);
        }
      }

      // Exibe a mensagem de sucesso
      setMessage(
        "Produto e volumetrias cadastrados com sucesso!"
      );

      // Limpa o formulário após o cadastro completo
      setForm({
        ...initialForm,
        idCategoria: categories[0]
          ? String(categories[0].id)
          : "",
      });

      setVolumetrias([novaVolumetria()]);
      setProdutoPendente(null);
      setVolumesSalvos([]);

      // Limpa os campos de imagem
      formularioRef.current?.reset();

      // Atualiza o catálogo de produtos
      if (typeof onProductCreated === "function") {
        try {
          await onProductCreated();
        } catch (refreshError) {
          console.error(
            "Erro ao atualizar catálogo:",
            refreshError
          );
        }
      }

    } catch (requestError) {
      // Exibe o erro recebido do backend
      const mensagem = getApiError(
        requestError,
        "Não foi possível cadastrar o produto."
      );

      // Informa quando o produto já existe no banco
      if (produtoCriado) {
        setError(
          `${mensagem} O produto #${produtoCriado.id} pode já estar cadastrado. Corrija o problema e tente salvar novamente sem recadastrar o produto.`
        );
      } else {
        setError(mensagem);
      }

    } finally {
      // Libera o formulário após finalizar a requisição
      setLoading(false);
    }
  }

  // Campo reutilizável para selecionar imagens
  function campoImagem(nome, titulo, obrigatorio = false) {
    return (
      <div className="col-md-6" key={nome}>
        <label className="form-label">
          {titulo}
        </label>

        <input
          type="file"
          accept="image/*"
          className="form-control"
          required={obrigatorio}
          disabled={loading || !!produtoPendente}
          onChange={(event) =>
            updateField(
              nome,
              event.target.files?.[0] || null
            )
          }
        />
      </div>
    );
  }

  return (
    <section className="container admin-section">
      {/* Título da página */}
      <div className="admin-heading">
        <div>
          <span className="section-label">
            Área administrativa
          </span>

          <h1>Cadastrar produto</h1>

          <p>
            Cadastre produtos, imagens e os
            volumes disponíveis para venda.
          </p>
        </div>
      </div>

      <div className="admin-card">
        {/* Mensagens de sucesso e erro */}
        {message && (
          <div className="feedback feedback-success">
            {message}
          </div>
        )}

        {error && (
          <div className="feedback feedback-error">
            {error}
          </div>
        )}

        {/* Alerta para continuar um cadastro incompleto */}
        {produtoPendente && (
          <div className="alert alert-warning">
            Produto #{produtoPendente.id} já criado.
            Os dados principais estão bloqueados
            para evitar cadastro duplicado.
            Continue salvando as volumetrias.
          </div>
        )}

        {/* Formulário principal */}
        <form ref={formularioRef} onSubmit={handleSubmit}>
          <fieldset
            disabled={loading || !!produtoPendente}
            className="border-0 p-0 m-0 w-100"
          >
            <div className="row g-3">

              {/* Nome do produto */}
              <div className="col-md-6">
                <label className="form-label">
                  Nome
                </label>

                <input
                  className="form-control"
                  value={form.nome}
                  required
                  onChange={(event) =>
                    updateField("nome", event.target.value)
                  }
                />
              </div>

              {/* Categoria do produto */}
              <div className="col-md-3">
                <label className="form-label">
                  Categoria
                </label>

                <select
                  className="form-select"
                  value={form.idCategoria}
                  required
                  onChange={(event) =>
                    updateField(
                      "idCategoria",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Selecione
                  </option>

                  {categories.map((categoria) => (
                    <option
                      key={categoria.id}
                      value={categoria.id}
                    >
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Marca do produto */}
              <div className="col-md-3">
                <label className="form-label">
                  Marca
                </label>

                <input
                  className="form-control"
                  value={form.marca}
                  onChange={(event) =>
                    updateField("marca", event.target.value)
                  }
                />
              </div>

              {/* Descrição do produto */}
              <div className="col-12">
                <label className="form-label">
                  Descrição
                </label>

                <textarea
                  className="form-control"
                  rows="3"
                  value={form.descricao}
                  onChange={(event) =>
                    updateField(
                      "descricao",
                      event.target.value
                    )
                  }
                />
              </div>

              {/* Preço e estoque para produtos sem volumetria */}
              {!ehTinta && (
                <>
                  <div className="col-md-3">
                    <label className="form-label">
                      Preço
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-control"
                      value={form.preco}
                      required
                      onChange={(event) =>
                        updateField(
                          "preco",
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">
                      Estoque
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="form-control"
                      value={form.estoque}
                      required
                      onChange={(event) =>
                        updateField(
                          "estoque",
                          event.target.value
                        )
                      }
                    />
                  </div>
                </>
              )}

              {/* Estoque mínimo */}
              <div className="col-md-3">
                <label className="form-label">
                  Estoque mínimo
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  className="form-control"
                  value={form.estoqueMinimo}
                  onChange={(event) =>
                    updateField(
                      "estoqueMinimo",
                      event.target.value
                    )
                  }
                />
              </div>

              {/* Unidade geral do produto */}
              <div className="col-md-3">
                <label className="form-label">
                  Unidade do produto
                </label>

                <input
                  className="form-control"
                  value={form.unidade}
                  onChange={(event) =>
                    updateField(
                      "unidade",
                      event.target.value
                    )
                  }
                />
              </div>

              {/* Upload das imagens */}
              <div className="col-12">
                <hr />
                <h5>Fotos do produto</h5>

                <div className="row g-3">
                  {ehTinta ? (
                    <>
                      {campoImagem(
                        "imagemLata",
                        "1. Foto da lata",
                        true
                      )}
                      {campoImagem(
                        "imagemCor",
                        "2. Foto da cor"
                      )}
                      {campoImagem(
                        "imagemSala",
                        "3. Foto da sala"
                      )}
                      {campoImagem(
                        "imagemQuarto",
                        "4. Foto do quarto"
                      )}
                      {campoImagem(
                        "imagemCozinha",
                        "5. Foto da cozinha"
                      )}
                      {campoImagem(
                        "imagemQuintal",
                        "6. Foto do quintal"
                      )}
                    </>
                  ) : (
                    campoImagem(
                      "imagemPrincipal",
                      "Foto principal do produto",
                      true
                    )
                  )}
                </div>
              </div>
            </div>
          </fieldset>

          {/* Cadastro das volumetrias das tintas */}
          {ehTinta && (
            <div className="mt-4">
              <hr />

              <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                <h5 className="mb-0">
                  Volumetrias da tinta
                </h5>

                {/* Botão para adicionar outro volume */}
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  disabled={loading || !!produtoPendente}
                  onClick={adicionarVolumetria}
                >
                  <Plus size={17} className="me-1" />
                  Adicionar volume
                </button>
              </div>

              {/* Lista de volumetrias cadastradas no formulário */}
              {volumetrias.map((item, index) => {
                const salvo = volumesSalvos.includes(
                  item.chave
                );

                return (
                  <div
                    key={item.chave}
                    className="border rounded p-3 mb-3"
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <strong>
                        Volume {index + 1}
                        {salvo ? " — Salvo" : ""}
                      </strong>

                      {/* Remove um volume antes de salvar */}
                      {volumetrias.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          disabled={
                            loading ||
                            !!produtoPendente
                          }
                          onClick={() =>
                            removerVolumetria(item.chave)
                          }
                          aria-label="Remover volume"
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>

                    <fieldset
                      disabled={loading || salvo}
                      className="border-0 p-0 m-0 w-100"
                    >
                      <div className="row g-3">

                        {/* Quantidade do volume */}
                        <div className="col-md-3">
                          <label className="form-label">
                            Volume
                          </label>

                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            className="form-control"
                            placeholder="3.6"
                            value={item.volume}
                            required
                            onChange={(event) =>
                              updateVolumetria(
                                item.chave,
                                "volume",
                                event.target.value
                              )
                            }
                          />
                        </div>

                        {/* Unidade de medida */}
                        <div className="col-md-3">
                          <label className="form-label">
                            Unidade
                          </label>

                          <select
                            className="form-select"
                            value={item.unidade}
                            onChange={(event) =>
                              updateVolumetria(
                                item.chave,
                                "unidade",
                                event.target.value
                              )
                            }
                          >
                            <option value="L">
                              Litros (L)
                            </option>

                            <option value="ML">
                              Mililitros (ML)
                            </option>
                          </select>
                        </div>

                        {/* Preço da volumetria */}
                        <div className="col-md-3">
                          <label className="form-label">
                            Preço (R$)
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="form-control"
                            value={item.preco}
                            required
                            onChange={(event) =>
                              updateVolumetria(
                                item.chave,
                                "preco",
                                event.target.value
                              )
                            }
                          />
                        </div>

                        {/* Estoque específico da volumetria */}
                        <div className="col-md-3">
                          <label className="form-label">
                            Estoque
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="1"
                            className="form-control"
                            value={item.estoque}
                            required
                            onChange={(event) =>
                              updateVolumetria(
                                item.chave,
                                "estoque",
                                event.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </fieldset>
                  </div>
                );
              })}
            </div>
          )}

          {/* Botão para salvar o cadastro */}
          <button
            type="submit"
            className="btn btn-primary-gp mt-4"
            disabled={loading}
          >
            <PackagePlus size={18} className="me-2" />

            {loading
              ? "Cadastrando..."
              : produtoPendente
                ? "Concluir volumetrias"
                : "Cadastrar produto"}
          </button>
        </form>
      </div>
    </section>
  );
}
