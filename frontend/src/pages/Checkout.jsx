import {
  ArrowLeft,
  ArrowRight,
  Plus,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import api from "../services/api";

function formatMoney(value) {
  return Number(
    value || 0
  ).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}

export default function Checkout({
  cart,
}) {
  const navigate = useNavigate();
  const [enderecos, setEnderecos] = useState([]);
  const [idEndereco, setIdEndereco] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [error, setError] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState({
    CEP: "",
    rua: "",
    numero: "",
    complemento: "",
  });

  useEffect(() => {
    async function loadAddresses() {
      try {
        const response = await api.get(
          "/endereco"
        );

        setEnderecos(response.data);

        if (response.data.length > 0) {
          setIdEndereco(
            String(response.data[0].idEndereco)
          );
        }
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Não foi possível carregar os endereços."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAddresses();
  }, []);

  async function handleCreateAddress(event) {
    event.preventDefault();
    setSavingAddress(true);
    setError("");

    try {
      const response = await api.post(
        "/endereco",
        {
          CEP: address.CEP,
          rua: address.rua,
          numero: Number(address.numero),
          complemento: address.complemento,
        }
      );

      const newAddress = response.data;

      setEnderecos((current) => [
        newAddress,
        ...current,
      ]);

      setIdEndereco(
        String(newAddress.idEndereco)
      );

      setShowAddressForm(false);

      setAddress({
        CEP: "",
        rua: "",
        numero: "",
        complemento: "",
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Não foi possível cadastrar o endereço."
      );
    } finally {
      setSavingAddress(false);
    }
  }

  function handleContinue() {
    if (!idEndereco) {
      setError("Selecione um endereço de entrega.");
      return;
    }

    if (!formaPagamento) {
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

  if (cart.loading || loading) {
    return (
      <section className="container page-section">
        <p>Carregando checkout...</p>
      </section>
    );
  }

  return (
    <section className="container page-section">
      <button
        type="button"
        className="btn btn-link px-0 mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      <h1>
        Checkout
      </h1>

      {error && (
        <div className="alert alert-danger mt-3">
          {error}
        </div>
      )}

      <div className="row g-4 mt-1">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">
                  Endereço de entrega
                </h4>

                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => {
                    setShowAddressForm(!showAddressForm);
                  }}
                >
                  <Plus size={17} />
                  Novo endereço
                </button>
              </div>

              {enderecos.length === 0 && !showAddressForm && (
                <div className="alert alert-warning">
                  Você ainda não possui um endereço cadastrado.
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
                    onChange={(event) => {
                      setIdEndereco(event.target.value);
                    }}
                    className="me-2"
                  />
                  {item.rua}, {item.numero} - CEP {item.CEP}
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
                  <h5>
                    Novo endereço
                  </h5>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">
                        CEP
                      </label>
                      <input
                        className="form-control"
                        value={address.CEP}
                        required
                        onChange={(event) => {
                          setAddress({
                            ...address,
                            CEP: event.target.value,
                          });
                        }}
                      />
                    </div>

                    <div className="col-md-8">
                      <label className="form-label">
                        Rua
                      </label>
                      <input
                        className="form-control"
                        value={address.rua}
                        required
                        onChange={(event) => {
                          setAddress({
                            ...address,
                            rua: event.target.value,
                          });
                        }}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">
                        Número
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={address.numero}
                        required
                        onChange={(event) => {
                          setAddress({
                            ...address,
                            numero: event.target.value,
                          });
                        }}
                      />
                    </div>

                    <div className="col-md-8">
                      <label className="form-label">
                        Complemento
                      </label>
                      <input
                        className="form-control"
                        value={address.complemento}
                        onChange={(event) => {
                          setAddress({
                            ...address,
                            complemento: event.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary-gp mt-3"
                    disabled={savingAddress}
                  >
                    {savingAddress
                      ? "Salvando..."
                      : "Salvar endereço"}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h4>
                Forma de pagamento
              </h4>

              <div className="row g-2 mt-2">
                {[
                  "Pix",
                  "Dinheiro",
                  "Cartão",
                ].map((payment) => (
                  <div
                    className="col-md-4"
                    key={payment}
                  >
                    <button
                      type="button"
                      className={`btn w-100 ${formaPagamento === payment ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => {
                        setFormaPagamento(payment);
                      }}
                    >
                      {payment}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h4>
                Resumo
              </h4>

              {cart.itens.map((item) => (
                <div
                  className="d-flex justify-content-between gap-3 py-2 border-bottom"
                  key={item.idCarrinhoItem}
                >
                  <span>
                    {item.produto} ({item.volume} {item.unidade}) x {item.quantidade}
                  </span>
                  <strong>
                    {formatMoney(item.subtotal)}
                  </strong>
                </div>
              ))}

              <div className="d-flex justify-content-between mt-3">
                <strong>
                  Total
                </strong>
                <strong>
                  {formatMoney(cart.total)}
                </strong>
              </div>

              <button
                type="button"
                className="btn btn-primary-gp w-100 mt-3"
                onClick={handleContinue}
              >
                Revisar pagamento
                <ArrowRight size={18} />
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
