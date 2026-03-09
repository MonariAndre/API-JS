# Order API - Teste Técnico Jitterbit

Esta é uma API RESTful construída em Node.js com Express e PostgreSQL. Seu principal propósito é fazer o recebimento de pedidos em um formato JSON específico (payload de entrada), aplicar transformações e regras de validação arquiteturais (*De-Para*) e persisti-los num formato padronizado interno em um modelo relacional (utilizando transações de banco de dados para segurança).

## 🚀 Tecnologias Utilizadas

- **Node.js** (Ambiente de Execução)
- **Express.js** (Framework HTTP minimalista)
- **PostgreSQL** (Banco de Dados Relacional)
- **pg** (Cliente oficial do Postgres para Node.js, não-bloqueante)
- **Docker & Docker Compose** (Containerização rápida de ambiente relacional)
- **Swagger / OpenAPI** (Arquivo de documentação estático gerado)

## 📁 Estrutura / Arquitetura do Projeto

Foi aplicada uma adaptação limpa de *Controller-Service-Repository* (direcionada na modelagem em `database/index.js` agindo como central de conexão e delegando as queries). 
As camadas estão contidas no diretório `src`:
* **Rotas (`routes`)**: Recebimento puro do *request* HTTP e mapeamento de caminho.
* **Controladores (`controllers`)**: Validação básica de request, controle de fluxo e repasse de *Status Codes* formatados (mantem-se desconectado de regra de negócio robusta).
* **Serviços (`services`)**: Coração da aplicação. Aqui o "De-Para" é orquestrado e as queries com conectores transacionais ACID são enviadas ao Postgres.
* **Database (`database`)**: Configurações de Pool Singletons abstraíveis e seguras com `.env`.

---

## 🛠️ Como Instalar e Rodar o Ambiente Localmente

### Pré-requisitos
- Ter o **Node.js** (v18+) instalado.
- Ter o **Docker Desktop** ou Engine+Compose instalados, **OU** uma instância de PostgreSQL rodando localmente na porta 5432.

### 1. Clonando o repositório e instalando dependências:

```bash
git clone <URL_DO_REPO>
cd API-JS
npm install
```

### 2. Configurando as Variáveis de Ambiente
Crie e preencha um arquivo oculto chamado `.env` na raiz do projeto (como parâmetro seguro, usamos de base o que foi deixado no `.env.example`). O arquivo virá atrelado pras variáveis do Docker:

```shell
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgrespassword
DB_NAME=orderdb
PORT=3000
```

### 3. Rodando o Ambiente de Banco de Dados (Via Docker)
Criou-se um super facilitador atrelado ao `docker-compose.yaml` neste envio. O nosso script `init.sql` com o `CREATE TABLE` se rodará magicamente através do *entrypoint* do Docker assim que ativado.

Suba o serviço de banco rodando na raiz:
```bash
docker-compose up -d
```
> Obs: *Caso deseje rodar o banco no "bare metal" ao invés do docker, acesse a instância via `PSQL` e rode o código exposto em `init.sql`. Não esqueça de adequar seu `.env` com a senha/usuário compatível com a sua máquina, caso contrário ocorrerá ECONNREFUSED).*

### 4. Executando a API em modo de Desenvolvimento

```bash
npm run dev
```
O console deverá apresentar a indicação positiva:
`Server listening on port 3000`

---

## 🔍 Como Testar os Endpoints da API

Você pode usar o Postman, Insomnia ou a extensão "REST Client" no VSCode. Toda a definição das APIs também pode ser importada via arquivo contido `swagger.yaml`. 

Abaixo exemplos rápidos em curl:

**1. Create Order (POST `/order`)**
```bash
curl -X POST http://localhost:3000/order \
-H "Content-Type: application/json" \
-d "{ \"numeroPedido\": \"v10089015vdb-01\", \"valorTotal\": 10000, \"dataCriacao\": \"2023-07-19T12:24:11.5299601+00:00\", \"items\": [ { \"idItem\": \"2434\", \"quantidadeItem\": 1, \"valorItem\": 1000 } ] }"
```

**2. List Orders (GET `/order/list`)**
```bash
curl -X GET http://localhost:3000/order/list
```

**3. Get Order By Id (GET `/order/:id`)**
```bash
curl -X GET http://localhost:3000/order/v10089015vdb-01
```

**4. Update Order (PUT `/order/:id`)** -> Mantive a lógica em atualização em massa.
```bash
curl -X PUT http://localhost:3000/order/v10089015vdb-01 \
-H "Content-Type: application/json" \
-d "{ \"numeroPedido\": \"v10089015vdb-01\", \"valorTotal\": 25000, \"items\": [ { \"idItem\": \"9999\", \"quantidadeItem\": 5, \"valorItem\": 5000 } ] }"
```

**5. Delete Order (DELETE `/order/:id`)**
```bash
curl -X DELETE http://localhost:3000/order/v10089015vdb-01
```

## ⚖️ Decisões Técnicas Aplicadas
- **Tratamento de Strings Case-Sensitive no Postgres:** O mapeamento em "De-Para" gera saídas no JS em formato camelCase (ex: `orderId`).  Pela natureza do sistema, utilizamos `""` *double quotes* no script DDL `init.sql` de criação para preservar identificadores, senão o `pg` converteria as entidades para "lowercases".
- **Transacional (`BEGIN` / `COMMIT` / `ROLLBACK`):** Com a separação entre itens e ordens, forçamos um client na query que previne erros no repasse. Ou cadastra o objeto e suas variações integralmente, ou reverte em caso de perda de conexão a ponto da rede isolar fragmentos errados. A responsabilidade reside inteira em `orderService.js`.
- **Valores (`NUMERIC` no lugar de `FLOAT`)**: No PG se declarou NUMERIC para quantias financeiras para evitar que percam-se centavos na persistência por imprecisão binária do floating point, mantendo as quantias exatas.
