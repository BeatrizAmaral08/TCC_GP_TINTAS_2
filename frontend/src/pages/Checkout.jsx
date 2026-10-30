import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getApiError } from "../services/api";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const EMPTY_ADDRESS = {
  CEP: "",
  rua: "",
  numero: "",
  complemento: "",
};

const FORMAS_PAGAMENTO = [
  "Pix",
  "Dinheiro",
  "Cartão",
];

export default function Checkout({ cart }) {
  const navigate = useNavigate();

  const [enderecos, setEnderecos] = useState([]);
  const [idEndereco, setIdEndereco] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [error, setError] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState(EMPTY_ADDRESS);

  const itens = Array.isArray(cart?.itens)
    ? cart.itens
    : [];

  const total = Number(cart?.total ?? 0);
  const carrinhoVazio = itens.length === 0;

 //carregar endereços

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/endereco");

      if (!Array.isArray(response.data)) {
        throw new Error(
          "Resposta inválida ao carregar endereços."
        );
      }

      const lista = response.data;

      setEnderecos(lista);

      setIdEndereco((atual) => {
        const encontrado = lista.some(
          (item) =>
            String(item.idEndereco) === String(atual)
        );

        if (encontrado) {
          return atual;
        }

        return lista.length > 0
          ? String(lista[0].idEndereco)
          : "";
      });

    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Não foi possível carregar os endereços."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  //atualizar campos do enrereço

  function handleAddressChange(event) {
    const { name, value } = event.target;

    setAddress((atual) => ({
      ...atual,
      [name]: value,
    }));
  }

  //cadastrar endereço

  async function handleCreateAddress(event) {
    event.preventDefault();

    if (savingAddress) {
      return;
    }

    setError("");

    const CEP = address.CEP.replace(/\D/g, "");
    const numero = Number(address.numero);

    if (CEP.length !== 8) {
      setError("Informe um CEP válido com 8 dígitos.");
      return;
    }

    if (!address.rua.trim()) {
      setError("Informe o nome da rua.");
      return;
    }

    if (
      !Number.isSafeInteger(numero) ||
      numero <= 0
    ) {
      setError("Informe um número válido.");
      return;
    }

    setSavingAddress(true);

    try {
      const response = await api.post("/endereco", {
        CEP,
        rua: address.rua.trim(),
        numero,
        complemento: address.complemento.trim(),
      });

      const novoEndereco = response.data;

      if (!novoEndereco?.idEndereco) {
        throw new Error(
          "Não foi possível confirmar o endereço cadastrado."
        );
      }

      setEnderecos((atual) => [
        novoEndereco,
        ...atual,
      ]);

      setIdEndereco(String(novoEndereco.idEndereco));
      setShowAddressForm(false);
      setAddress({ ...EMPTY_ADDRESS });

    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Não foi possível cadastrar o endereço."
        )
      );

    } finally {
      setSavingAddress(false);
    }
  }

  //continuar com pagamento

  function handleContinue() {
    setError("");

    if (cart?.loading || loading || savingAddress) {
      return;
    }

    if (cart?.error) {
      setError(
        "Não foi possível confirmar o carrinho. Atualize os dados antes de continuar."
      );
      return;
    }

    if (carrinhoVazio) {
      setError("Adicione produtos ao carrinho.");
      return;
    }

    const enderecoSelecionado = enderecos.some(
      (item) =>
        String(item.idEndereco) === String(idEndereco)
    );

    if (!enderecoSelecionado) {
      setError("Selecione um endereço de entrega.");
      return;
    }

    if (!FORMAS_PAGAMENTO.includes(formaPagamento)) {
      setError("Selecione uma forma de pagamento.");
      return;
    }

    navigate("/pagamento", {
      state: {
        idEndereco: Number(idEndereco),
        formaPagamento,
      },
    });
  }

 //carregamento

  if (cart?.loading || loading) {
    return (
      <section className="container page-section">
        <p>Carregando checkout...</p>
      </section>
    );
  }

  //interface
  return (
    <section className="container page-section">

      <button
        type="button"
        className="btn btn-link px-0 mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} className="me-2" />
        Voltar
      </button>

      <h1>Checkout</h1>

      <p className="text-secondary">
        Confira seus produtos e escolha como deseja
        receber e pagar seu pedido.
      </p>

      {error && (
        <div className="alert alert-danger mt-3">
          {error}

          {enderecos.length === 0 && (
            <button
              type="button"
              className="btn btn-sm btn-outline-danger ms-3"
              onClick={loadAddresses}
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {cart?.error && (
        <div className="alert alert-warning">
          {cart.error}
        </div>
      )}

      <div className="row g-4 mt-1">

        {/* ENDEREÇO E PAGAMENTO */}

        <div className="col-lg-8">

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                <h4 className="mb-0">
                  Endereço de entrega
                </h4>

                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() =>
                    setShowAddressForm((atual) => !atual)
                  }
                >
                  <Plus size={17} className="me-1" />
                  Novo endereço
                </button>
              </div>

              {enderecos.length === 0 &&
                !showAddressForm && (
                  <div className="alert alert-warning">
                    Você ainda não possui um endereço
                    cadastrado.
                  </div>
                )}

              {enderecos.map((item) => (
                <label
                  className="border rounded p-3 d-block mb-2"
                  key={item.idEndereco}
                >
                  <input
                    type="radio"
                    name="endereco"
                    value={item.idEndereco}
                    checked={
                      String(idEndereco) ===
                      String(item.idEndereco)
                    }
                    onChange={(event) =>
                      setIdEndereco(event.target.value)
                    }
                    className="me-2"
                  />

                  {item.rua}, {item.numero}
                  {" - CEP "}
                  {item.CEP}

                  {item.complemento && (
                    <> - {item.complemento}</>
                  )}
                </label>
              ))}

              {showAddressForm && (
                <form
                  onSubmit={handleCreateAddress}
                  className="border rounded p-3 mt-3"
                >
                  <h5 className="mb-3">
                    Novo endereço
                  </h5>

                  <div className="row g-3">

                    <div className="col-md-4">
                      <label
                        className="form-label"
                        htmlFor="checkout-cep"
                      >
                        CEP
                      </label>

                      <input
                        id="checkout-cep"
                        name="CEP"
                        className="form-control"
                        placeholder="00000-000"
                        maxLength={9}
                        value={address.CEP}
                        required
                        onChange={handleAddressChange}
                      />
                    </div>

                    <div className="col-md-8">
                      <label
                        className="form-label"
                        htmlFor="checkout-rua"
                      >
                        Rua
                      </label>

                      <input
                        id="checkout-rua"
                        name="rua"
                        className="form-control"
                        value={address.rua}
                        required
                        onChange={handleAddressChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label
                        className="form-label"
                        htmlFor="checkout-numero"
                      >
                        Número
                      </label>

                      <input
                        id="checkout-numero"
                        name="numero"
                        type="number"
                        min="1"
                        step="1"
                        className="form-control"
                        value={address.numero}
                        required
                        onChange={handleAddressChange}
                      />
                    </div>

                    <div className="col-md-8">
                      <label
                        className="form-label"
                        htmlFor="checkout-complemento"
                      >
                        Complemento
                      </label>

                      <input
                        id="checkout-complemento"
                        name="complemento"
                        className="form-control"
                        placeholder="Apartamento, bloco, referência..."
                        value={address.complemento}
                        onChange={handleAddressChange}
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-3">
                    <button
                      type="submit"
                      className="btn btn-primary-gp"
                      disabled={savingAddress}
                    >
                      {savingAddress
                        ? "Salvando..."
                        : "Salvar endereço"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={savingAddress}
                      onClick={() =>
                        setShowAddressForm(false)
                      }
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* FORMA DE PAGAMENTO */}

          <div className="card border-0 shadow-sm">
            <div className="card-body">

              <h4>Forma de pagamento</h4>

              <div className="row g-2 mt-2">
                {FORMAS_PAGAMENTO.map((payment) => (
                  <div
                    className="col-md-4"
                    key={payment}
                  >
                    <button
                      type="button"
                      className={`btn w-100 ${
                        formaPagamento === payment
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      aria-pressed={
                        formaPagamento === payment
                      }
                      onClick={() =>
                        setFormaPagamento(payment)
                      }
                    >
                      {payment}
                    </button>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* RESUMO DO CARRINHO */}

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">

              <h4>Resumo do pedido</h4>

              {carrinhoVazio ? (
                <div className="alert alert-warning mt-3">
                  Seu carrinho está vazio.
                </div>
              ) : (
                itens.map((item) => (
                  <div
                    className="d-flex justify-content-between gap-3 py-2 border-bottom"
                    key={item.idCarrinhoItem}
                  >
                    <span>
                      {item.produto}
                      {" ("}
                      {item.volume} {item.unidade}
                      {") x "}
                      {item.quantidade}
                    </span>

                    <strong>
                      {formatMoney(item.subtotal)}
                    </strong>
                  </div>
                ))
              )}

              <div className="d-flex justify-content-between mt-3">
                <strong>Total</strong>

                <strong>
                  {formatMoney(total)}
                </strong>
              </div>

              <button
                type="button"
                className="btn btn-primary-gp w-100 mt-3"
                onClick={handleContinue}
                disabled={
                  carrinhoVazio ||
                  !!cart?.error ||
                  savingAddress ||
                  !idEndereco ||
                  !formaPagamento
                }
              >
                Revisar pagamento
                <ArrowRight
                  size={18}
                  className="ms-2"
                />
              </button>

              <Link
                to="/carrinho"
                className="btn btn-link w-100 mt-2"
              >
                Voltar ao carrinho
              </Link>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
