# GPTintas — Sprint 01

Nesta versão entregamos somente as funcionalidades previstas para a Sprint 01:

- cadastro de usuários;
- autenticação de usuários;
- cadastro de produtos.

Mantivemos a integração já utilizada no projeto principal com a API Node.js/Express e com o banco MySQL `gptintas`.

## Acessos

### Loja

Na página inicial apresentamos os produtos disponíveis, busca por nome, filtro por categoria e detalhes do produto.

### Cadastro

Em `/cadastro` disponibilizamos o formulário de criação de conta.

### Login

Em `/login` realizamos a autenticação.

Depois do login:

- o perfil `comprador` volta para a página de produtos;
- os perfis `repositor` e `dev` podem acessar `/admin/produtos`.

### Cadastro de produtos

Em `/admin/produtos` disponibilizamos somente o cadastro de produtos.

Protegemos essa rota para os perfis administrativos já existentes no backend: `repositor` e `dev`.

## Padrão de código

Seguimos o mesmo padrão trabalhado no projeto `catalogo-pessoas`:

- `ThemeContext` para tema claro/escuro;
- hook `useProducts` para carregamento dos dados;
- pasta `services` para acesso à API;
- `SkeletonLoading` durante o carregamento;
- cards para a listagem;
- busca e filtro;
- modal para visualizar detalhes;
- React Router para navegação;
- Bootstrap e Lucide React na interface.

Mantivemos os arquivos escritos de forma aberta, com instruções e propriedades em linhas separadas para facilitar leitura em aula.

## Estrutura

```text
src/
├── assets/
├── components/
├── contexts/
├── hooks/
├── layouts/
├── pages/
│   └── admin/
├── routes/
├── services/
├── App.jsx
├── index.css
└── main.jsx
```

## Tecnologias

### Front-end

- React
- Vite
- JavaScript
- Bootstrap
- React Router DOM
- Axios
- Lucide React
- React Loading Skeleton

### Integração

- API Node.js + Express
- MySQL

## Instalação

```bash
npm install
npm run dev
```

Crie um `.env` com:

```env
VITE_API_URL=http://localhost:8000/api
VITE_SERVER_URL=http://localhost:8000
```

Mantenha o backend principal em execução para usar cadastro, login e produtos.
