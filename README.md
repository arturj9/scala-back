# 🧗 Scala Backend API

> API RESTful robusta para monitoramento de hábitos, consistência e análise de desempenho pessoal.

O **Scala** é o backend de uma aplicação de rastreamento de hábitos. Ele permite que usuários gerenciem rotinas, registrem progresso (por contagem ou tempo), visualizem históricos detalhados e acompanhem métricas de consistência através de dashboards e heatmaps.

---

## 🛠️ Tech Stack

O projeto foi construído utilizando as melhores práticas de desenvolvimento moderno, seguindo a arquitetura **MSC (Model-Service-Controller)** e princípios **SOLID**.

* **Framework:** [NestJS](https://nestjs.com/) (Node.js)
* **Linguagem:** TypeScript
* **Containerização:** Docker & Docker Compose
* **Banco de Dados:** PostgreSQL (via Supabase)
* **ORM:** [Prisma](https://www.prisma.io/)
* **Validação:** Zod (`nestjs-zod`)
* **Documentação:** Swagger (OpenAPI 3.0)
* **Testes:** Jest & `jest-mock-extended` (Unitários > 80% Cobertura)
* **Autenticação:** JWT (JSON Web Token)

---

## ✨ Funcionalidades Principais

### 🔐 Autenticação & Usuários
* Cadastro e Login seguro com hash de senha (Bcrypt).
* Autenticação via Token JWT (Bearer).
* Perfil do usuário.

### 🥑 Gerenciamento de Hábitos
* **CRUD Completo:** Criar, listar, editar e excluir hábitos.
* **Metas Flexíveis:**
    * *Contagem:* "Beber 3L de água" (Check-ins).
    * *Duração:* "Ler por 30 min" (Timer).
* **Configuração Semanal:** Escolha de dias específicos da semana.
* **Lembretes:** Registro de múltiplos horários para notificação.

### 🚀 Rastreamento (Tracking)
* **Check-in Rápido:** Para hábitos de repetição.
* **Log de Tempo:** Registro de início e fim para hábitos de duração.
* **Histórico Detalhado:** Timeline completa de atividades filtrada por data.
* **Correção:** Possibilidade de desfazer check-ins ou registros errados.

### 📊 Relatórios & Analytics
* **Dashboard:** Resumo agregado (Total de check-ins, minutos focados) com filtro de período.
* **Heatmap:** Calendário de consistência (estilo GitHub) para visualização de frequência.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
* **Docker & Docker Compose** (Recomendado para rodar a API)
* **Node.js** v18+ (Para rodar scripts de banco localmente)
* **NPM**

### 1. Configuração de Ambiente (.env)
Crie um arquivo `.env` na raiz do projeto. Você precisará da URL de conexão do seu banco (ex: Supabase).

```env
# Aplicação
PORT=3000
NODE_ENV=development

# Segurança (Gere uma chave forte)
JWT_SECRET="sua_chave_super_secreta_aqui"

# Banco de Dados (Supabase - Transaction Pooler)
# Pegue em: Project Settings -> Database -> Connection String -> Prisma
DATABASE_URL="postgresql://postgres:[SENHA]@[aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true](https://aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true)"

# (Opcional) Direct Connection para Migrations
DIRECT_URL="postgresql://postgres:[SENHA]@[aws-0-us-east-1.pooler.supabase.com:5432/postgres](https://aws-0-us-east-1.pooler.supabase.com:5432/postgres)"