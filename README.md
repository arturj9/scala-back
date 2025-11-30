# 🧗 Scala Backend API

> API RESTful robusta para monitoramento de hábitos, consistência e análise de desempenho pessoal.

O **Scala** é o backend de uma aplicação de rastreamento de hábitos. Ele permite que usuários gerenciem rotinas, registrem progresso (por contagem ou tempo), visualizem históricos detalhados e acompanhem métricas de consistência através de dashboards e heatmaps.

---

## 🛠️ Tech Stack

O projeto foi construído utilizando as melhores práticas de desenvolvimento moderno, seguindo a arquitetura **MSC (Model-Service-Controller)** e princípios **SOLID**.

* **Framework:** [NestJS](https://nestjs.com/) (Node.js)
* **Linguagem:** TypeScript
* **Banco de Dados:** PostgreSQL (via Supabase)
* **ORM:** [Prisma](https://www.prisma.io/)
* **Validação:** Zod (`nestjs-zod`)
* **Documentação:** Swagger (OpenAPI 3.0)
* **Testes:** Jest & `jest-mock-extended` (Unitários)
* **Autenticação:** JWT (JSON Web Token)

---

## ✨ Funcionalidades Principais

### 🔐 Autenticação & Usuários
* Cadastro e Login seguro com hash de senha (Bcrypt).
* Autenticação via Token JWT.
* Perfil do usuário.

### 🥑 Gerenciamento de Hábitos
* **CRUD Completo:** Criar, listar, editar e excluir hábitos.
* **Metas Flexíveis:**
    * *Contagem:* "Beber 3L de água" (Check-ins).
    * *Duração:* "Ler por 30 min" (Timer).
* **Configuração Semanal:** Escolha de dias específicos da semana.
* **Lembretes:** Registro de horários múltiplos para notificação.

### 🚀 Rastreamento (Tracking)
* **Check-in Rápido:** Para hábitos de repetição.
* **Log de Tempo:** Registro de início e fim para hábitos de duração.
* **Histórico:** Timeline completa de atividades.
* **Correção:** Possibilidade de desfazer check-ins ou registros errados.

### 📊 Relatórios & Analytics
* **Dashboard:** Resumo da semana atual (Total de check-ins, minutos focados).
* **Heatmap:** Calendário de consistência (estilo GitHub) com filtros de data.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
* **Node.js** (Versão 18 ou superior)
* **NPM** (Gerenciador de pacotes)
* Uma instância **PostgreSQL** (Recomendado: [Supabase](https://supabase.com/))

### 1. Configuração de Ambiente (.env)
Crie um arquivo `.env` na raiz do projeto e preencha as variáveis:

```env
# Aplicação
PORT=3000

# Segurança
JWT_SECRET="sua_chave_super_secreta_aqui"

# Banco de Dados (Supabase - Transaction Pooler)
# Pegue esta URL em: Project Settings -> Database -> Connection String -> Prisma
DATABASE_URL="postgresql://postgres:[SUA_SENHA]@[aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true](https://aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true)"

# (Opcional) Direct Connection para Migrations
DIRECT_URL="postgresql://postgres:[SUA_SENHA]@[aws-0-us-east-1.pooler.supabase.com:5432/postgres](https://aws-0-us-east-1.pooler.supabase.com:5432/postgres)"