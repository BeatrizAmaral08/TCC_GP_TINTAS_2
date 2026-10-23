# Calculadora de volumetria — GP Tintas

## Como funciona

A calculadora fica na página de detalhes de cada produto (`/produto/:id`) e possui dois modos:
- **Já sei a metragem:** o cliente informa a área líquida em m².
- **Ainda não sei a metragem:** informa altura, largura e quantidade de paredes, além de portas e janelas para descontar as aberturas.

O backend calcula a área líquida, aplica o número de demãos e estima a quantidade de embalagens de cada volumetria cadastrada para o produto.

## Configuração do banco

Execute uma vez o arquivo:

`backend/scripts/migrations/20261009_add_rendimento_volumetria.sql`

A coluna `rendimento` é a cobertura em **m² por embalagem, por demão**. Por exemplo, se uma lata de 3,6 L cobre 40 m² em uma demão, cadastre `rendimento: 40` para essa embalagem. Use o rendimento informado pelo fabricante para o produto exato; não reutilize um valor genérico para todas as tintas.

A migração deixa as volumetrias existentes com `rendimento = NULL`. Elas precisam ser atualizadas antes de a calculadora recomendar uma quantidade.

## Cadastrar/atualizar o rendimento

No Insomnia, atualize a volumetria pela tabela `produto_volumetria` no banco, ou use SQL. Exemplo:

```sql
UPDATE produto_volumetria
SET rendimento = 40
WHERE idProdutoVolumetria = 12;
```

Troque `12` pelo ID real da embalagem e `40` pelo rendimento real em m² por demão daquela embalagem.

Para criar uma nova volumetria pela API (`POST /api/volumetrias/produto/:idProduto`), inclua o campo `rendimento` no JSON:

```json
{
  "volume": 3.6,
  "unidade": "L",
  "preco": 129.90,
  "estoque": 12,
  "rendimento": 40,
  "ativo": true
}
```

## Endpoint de cálculo

`POST /api/volumetrias/calcular`

Exemplo de corpo para calcular por medidas:

```json
{
  "idProduto": 3,
  "altura": 2.7,
  "largura": 4,
  "quantidadeParedes": 1,
  "portas": [{ "quantidade": 1, "altura": 2.1, "largura": 0.8 }],
  "janelas": [{ "quantidade": 1, "altura": 1.5, "largura": 1 }],
  "demãos": 2
}
```

Exemplo para quem já sabe a área líquida:

```json
{
  "idProduto": 3,
  "areaM2": 26.8,
  "demãos": 2
}
```

A quantidade por embalagem é arredondada para cima, e o resultado indica se o estoque cadastrado atende à quantidade. A calculadora é uma estimativa; preparação da superfície, textura, ferramenta, cor e perdas podem alterar o rendimento real.
