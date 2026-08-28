# Sprint 01 — GPTintas

## Backlog entregue

Nesta Sprint entregamos somente os três requisitos definidos:

1. Cadastro de usuários.
2. Autenticação de usuários.
3. Cadastro de produtos.

## Cadastro de usuários

### O que entregamos

Criamos uma tela de cadastro com dados pessoais, senha e endereço.

### Como utilizar

1. Acesse **Criar conta**.
2. Preencha os dados solicitados.
3. Clique em **Criar conta**.
4. Depois da confirmação, acesse a tela de login.

## Autenticação de usuários

### O que entregamos

Criamos o acesso por e-mail e senha e mantivemos o controle de sessão já integrado ao backend.

### Como utilizar

1. Acesse **Entrar**.
2. Informe e-mail e senha.
3. Clique em **Entrar**.
4. Ao entrar com perfil de comprador, continue na página de produtos.
5. Ao entrar com perfil administrativo, acesse o cadastro de produtos.

## Cadastro de produtos

### O que entregamos

Criamos uma página administrativa exclusiva para cadastro de produtos.

### Como utilizar

1. Entre com um perfil autorizado (`repositor` ou `dev`).
2. Acesse **Cadastrar produto**.
3. Preencha nome, categoria, preço, estoque e demais dados.
4. Clique em **Cadastrar produto**.
5. Volte para **Produtos** e confira o novo item no catálogo.

## Organização aplicada

Usamos a mesma organização praticada no `catalogo-pessoas`:

- components;
- contexts;
- hooks;
- pages;
- routes;
- services.

Usamos `ThemeContext`, hook de carregamento, busca, filtro, cards, modal e skeleton loading dentro das três funcionalidades entregues.
