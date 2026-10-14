# 📊 Relatório de Métricas e Volume de Código

**Projeto:** Base de Conhecimento - Conciliador Contábil  
**Data da Análise:** 14 de Outubro de 2026  
**Escopo:** Métricas de arquivos por linguagem, linhas brutas, linhas em branco e linhas de código efetivo (SLOC).

---

## 1. 📌 Resumo Executivo da Aplicação

Considerando o código-fonte da aplicação, scripts de suporte, estilos e configurações essenciais do projeto (excluindo dependências `node_modules` e bundles gerados em `dist`):

| Indicador | Total |
| :--- | :---: |
| 📁 **Total de Arquivos do Projeto** | **63 arquivos** |
| 📝 **Total de Linhas Brutas** | **31.705 linhas** |
| 💻 **Linhas Efetivas de Código (SLOC)** | **29.879 linhas** |
| ⚪ **Linhas em Branco / Espaçamento** | **1.826 linhas** |

---

## 2. 🗂️ Métricas Detalhadas por Linguagem

Distribuição dos arquivos de código, templates e configurações do projeto por linguagem de programação e formato:

| Linguagem / Formato | Extensões | Arquivos | Linhas Totais | Linhas em Branco | Código Efetivo (SLOC) | % Código |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **TypeScript (React / JSX)** | `.tsx` | **25** | 21.583 | 1.262 | **20.321** | 68,0% |
| **JSON (Dados e Configurações)** | `.json` | **10** | 4.134 | 11 | **4.123** | 13,8% |
| **TypeScript (Puro)** | `.ts` | **9** | 3.329 | 221 | **3.108** | 10,4% |
| **CSS (Design System & Estilos)** | `.css` | **1** | 1.197 | 152 | **1.045** | 3,5% |
| **JavaScript (CommonJS / Scripts)** | `.cjs` | **5** | 717 | 84 | **633** | 2,1% |
| **Markdown (Documentação do Projeto)** | `.md` | **3** | 451 | 63 | **388** | 1,3% |
| **Firebase Rules (Segurança)** | `.rules` | **2** | 113 | 18 | **95** | 0,3% |
| **SVG (Vetores e Ícones)** | `.svg` | **1** | 62 | 1 | **61** | 0,2% |
| **Configurações Git / Firebase** | `.gitignore`, etc. | **2** | 42 | 7 | **35** | 0,1% |
| **PowerShell / Scripts CLI** | `.ps1`, `.bat` | **2** | 41 | 4 | **37** | 0,1% |
| **HTML (Template Base)** | `.html` | **1** | 19 | 1 | **18** | 0,1% |
| **Variáveis de Ambiente (.env)** | `.env`, `.env.example` | **2** | 17 | 2 | **15** | < 0,1% |
| **TOTAL** | — | **63** | **31.705** | **1.826** | **29.879** | **100%** |

---

## 3. 🏗️ Distribuição do Código por Módulo (`src/`)

O núcleo da aplicação reside em `src/`, concentrando **26.101 linhas brutas** e **24.468 linhas de código efetivo**:

| Módulo / Camada | Finalidade Principal | Arquivos | Linhas Totais | Código Efetivo (SLOC) |
| :--- | :--- | :---: | :---: | :---: |
| `src/components/` | Telas (Views), Modais, Header, Footer e Gamificação | **21** | 18.933 | 17.944 |
| `src/context/` | Estado Global, Autenticação, Votos e Fila Editorial | **1** | 2.266 | 2.033 |
| `src/services/` | Firebase, Firestore, Gamificação, Auth e Sync | **5** | 1.728 | 1.540 |
| `src/root` | Ponto de entrada (`App.tsx`, `main.tsx`, `index.css`) | **3** | 1.411 | 1.234 |
| `src/data/` | Sementes e catálogo inicial de artigos (`initialSeed.ts`) | **1** | 1.355 | 1.350 |
| `src/utils/` | Tratamento de imagens, fallbacks e formatação | **2** | 213 | 192 |
| `src/types/` | Tipagens TypeScript de artigos, usuários, patentes e reviews | **1** | 195 | 175 |
| **Subtotal `src/`** | **Frontend Core** | **34** | **26.101** | **24.468** |

---

## 4. ⚙️ Automação e Migração (`scripts/`)

| Script | Linguagem | Linhas Totais | Função |
| :--- | :---: | :---: | :--- |
| `migrateMovideskImages.cjs` | JavaScript | 215 | Download e substituição de links externos por imagens locais |
| `crawlMovidesk.cjs` | JavaScript | 189 | Coleta automatizada de artigos e categorização |
| `formatMovideskArticles.cjs` | JavaScript | 148 | Sanitização de HTML e conversão estruturada |
| `seedMovideskToFirestore.cjs` | JavaScript | 98 | Ingestão e carga massiva de dados no Cloud Firestore |
| `cleanStorage.cjs` | JavaScript | 67 | Limpeza de metadados e arquivos temporários |
| Arquivos de Dados JSON | JSON | 1.149 | Backups locais e artigos formatados |
| **Subtotal `scripts/`** | — | **1.866** | **Suporte e Ferramental de Dados** |

---

## 5. 🌐 Visão Global do Repositório (Incluindo Skills & Customizações)

Caso seja considerada toda a árvore do repositório (incluindo as bases de conhecimento em markdown e templates de skills contidos em `.agent/` e `.agents/`):

| Categoria | Arquivos | Linhas Totais | Código Efetivo |
| :--- | :---: | :---: | :---: |
| **Aplicação Web (Código do Projeto)** | **63** | **31.705** | **29.879** |
| **Documentação Técnica / Skills (`.agent`, `.agents`)** | **434** | **106.090** | **85.166** |
| **TOTAL GERAL DO REPOSITÓRIO** | **497** | **137.795** | **115.045** |
