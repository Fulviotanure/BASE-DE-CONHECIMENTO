# 📘 Proposta Arquitetural & Planejamento Técnico
## Base de Conhecimento & Suporte Interno — Conciliador Contábil

> **Status:** Documento Oficial de Planejamento (Baseline v1.0)  
> **Referência Institucional:** [https://conciliadorcontabil.com.br/](https://conciliadorcontabil.com.br/)  
> **Acervo de Dados Inicial para Migração:** [https://conciliador-contabil2.movidesk.com/kb](https://conciliador-contabil2.movidesk.com/kb)  
> **Responsável Inicial / Superadministrador:** `fulvio`  
> **Regra de Execução:** Nenhuma linha de código de produção será implementada sem validação prévia deste plano.

---

## 1. Visão Geral do Produto

O **Painel Web de Base de Conhecimento e Suporte Interno** é uma plataforma corporativa exclusiva para a equipe do **Conciliador Contábil**. Ele centraliza:
1. O repositório oficial de conhecimento operacional (manuais, tutoriais de importação, regras contábeis, confronto, exportação, Open Finance, FAQ e integração com ERPs contábeis).
2. Um fluxo editorial rigoroso de curadoria colaborativa (*Operador cria -> Revisor avalia/ajusta -> Aprovado publica*).
3. Um painel analítico com indicadores de produtividade e taxa de conversão editorial por colaborador.
4. A **Central de Ferramentas**, consolidando executáveis, instaladores contábeis, utilitários de conciliação e links operacionais críticos.

---

## 2. Stack Tecnológica (Fundamentada em Firebase)

A infraestrutura adota **Firebase** como BaaS (Backend-as-a-Service) aliado a um frontend moderno em **Next.js 15 (React 19)** ou **Vite + React SPA**, garantindo velocidade de entrega, tempo real, alta segurança e facilidade de manutenção.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CAMADA DE APRESENTAÇÃO                          │
│   React 19 / Next.js 15 • Tailwind CSS • Radix UI / Shadcn             │
│   Editor Rich-Text (TipTap com upload e sanitização DOMPurify)         │
│   Lucide Icons • Recharts (Métricas e Analytics) • Sonner (Toasts)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Firebase Web SDK & Admin SDK
┌───────────────────────────────────▼────────────────────────────────────┐
│                   SERVIÇOS DE NUVEM (FIREBASE BAAS)                    │
│                                                                        │
│   🔐 FIREBASE AUTHENTICATION                                           │
│      • Restrição de domínio: @conciliadorcontabil.com.br               │
│      • Bootstrap automático do superusuário 'fulvio'                   │
│      • Custom Claims para RBAC (Admin, Revisor, Operador)              │
│                                                                        │
│   📂 CLOUD FIRESTORE (NoSQL Database em Tempo Real)                    │
│      • Coleções: users, categories, articles, reviews, tools, audit    │
│      • Security Rules granulares por perfil                            │
│                                                                        │
│   📦 FIREBASE STORAGE                                                  │
│      • Armazenamento de imagens coladas em artigos                     │
│      • Central de Ferramentas (instaladores .exe, .zip, conversores)   │
│                                                                        │
│   ⚡ CLOUD FUNCTIONS FOR FIREBASE (ou Route Handlers Next.js)          │
│      • Atribuição segura de papéis administrativos                     │
│      • Disparo de notificações e consolidação de métricas              │
└────────────────────────────────────────────────────────────────────────┘
```

### Componentes da Stack:
- **Frontend:** Next.js 15 / React 19 (TypeScript) para alta performance de leitura, navegação SPA rápida e excelente suporte a componentes reativos.
- **Estilização & Design System:** Tailwind CSS com variáveis baseadas na paleta institucional do Conciliador Contábil.
- **Autenticação:** Firebase Auth (Google Workspace / E-mail e Senha) com verificação de domínio obrigatória.
- **Banco de Dados:** Cloud Firestore com sincronização em tempo real e índices compostos para ordenação da fila de revisão e buscas.
- **Armazenamento de Arquivos:** Firebase Cloud Storage com regras de acesso restrito a usuários corporativos autenticados.
- **Editor de Texto:** TipTap Headless Editor com extensões para tabelas, blocos de código, callouts contábeis e upload direto de imagens/prints.

---

## 3. Identidade Visual & Design System

A interface seguirá rigorosamente a estética do **Conciliador Contábil**, transmitindo seriedade técnica, modernidade e produtividade contábil.

### 3.1. Paleta de Cores Institucional
| Token | Cor Hex | Uso Principal |
| :--- | :--- | :--- |
| **Primary (Verde Conciliador)** | `#5CB780` | Ações principais, botões de submissão/aprovação, status `Aprovado`, destaques ativos. |
| **Primary Hover** | `#4EA16F` | Estado de foco e hover em elementos primários. |
| **Secondary (Roxo/Índigo)** | `#6C63FF` | Badges de módulos, tags contábeis, títulos de destaque e links secundários. |
| **Dark Neutral (Preto/Grafite)** | `#1A1D20` | Header corporativo, cards em dark-mode, tipografia principal. |
| **Surface Dark** | `#2D2D2D` | Menus suspensos, barras de ferramentas e cartões escuros. |
| **Light Background** | `#F8FAFC` | Fundo geral da aplicação em modo claro (alta legibilidade). |
| **Card & Surface Light** | `#FFFFFF` | Superfície dos artigos, formulários e painéis brancos. |
| **Border & Divider** | `#E2E8F0` | Linhas de separação e contorno de caixas de texto. |
| **Status: Pendente** | `#F59E0B` | Amarelo-âmbar para itens aguardando revisão. |
| **Status: Em Ajuste** | `#3B82F6` | Azul informativo para artigos devolvidos ao operador. |
| **Status: Reprovado / Alerta** | `#EF4444` / `#FF969A` | Vermelho para recusas, reprovações e avisos de erro. |

### 3.2. Tipografia e Assets
- **Tipografia:** `Inter` (UI operacional e tabelas) + `Work Sans` (Títulos e headers), fontes oficiais do site institucional.
- **Logo Oficial:** Imagem oficial em alta definição vetorizada/transparente (`https://conciliadorcontabil.com.br/wp-content/uploads/2020/02/conciliador-logo.png`).

---

## 4. Controle de Acesso, Autenticação e RBAC

### 4.1. Regras de Login e Whitelist Corporativa
1. **Restrição por Domínio:**
   - O login só é permitido para e-mails do domínio institucional `@conciliadorcontabil.com.br`.
   - Tentativas com e-mails genéricos (`@gmail.com`, `@hotmail.com`, etc.) são bloqueadas na camada de autenticação e no Firestore Rules.
2. **Definição do Superusuário Inicial:**
   - O e-mail do gestor **`fulvio`** (ex.: `fulvio@conciliadorcontabil.com.br`) é configurado como o **primeiro Administrador supremo** de forma determinística no provisionamento inicial.
3. **Padrão de Novos Cadastros:**
   - Todo novo usuário autenticado entra automaticamente com o papel **`OPERATOR`** (Usuário Comum) e status `ACTIVE` ou `PENDING_APPROVAL`.
   - Nenhum usuário pode se auto-promover.

### 4.2. Matriz de Permissões (RBAC)

| Funcionalidade / Recurso | Operador (Usuário Comum) | Editor / Revisor | Administrador (`fulvio`) |
| :--- | :---: | :---: | :---: |
| Consultar Artigos Aprovados | ✅ | ✅ | ✅ |
| Acessar Central de Ferramentas / Downloads | ✅ | ✅ | ✅ |
| Redigir Novo Artigo / Sugestão de Solução | ✅ (Vai para Pendente) | ✅ | ✅ |
| Editar seus próprios artigos "Em Ajuste" | ✅ | ✅ | ✅ |
| Visualizar Fila Geral de Revisão | ❌ | ✅ | ✅ |
| Avaliar Artigos (Aprovar / Solicitar Ajuste / Reprovar) | ❌ | ✅ | ✅ |
| Inserir Notas Técnicas na Sidebar de Revisão | ❌ | ✅ | ✅ |
| Editar conteúdo diretamente durante revisão | ❌ | ✅ | ✅ |
| Visualizar Dashboard Geral e Métricas de Conversão | ❌ | ✅ | ✅ |
| Gerenciar Usuários (Alterar Cargos / Permissões) | ❌ | ❌ | ✅ |
| Cadastrar / Excluir Ferramentas e Executáveis | ❌ | ❌ | ✅ |
| Criar / Reordenar Categorias da Base | ❌ | ❌ | ✅ |
| Acessar Logs de Auditoria do Sistema | ❌ | ❌ | ✅ |

---

## 5. Modelagem de Dados no Cloud Firestore

```
firestore/
├── users/ {uid}
│   ├── uid: string
│   ├── email: string
│   ├── displayName: string
│   ├── photoURL: string
│   ├── role: "OPERATOR" | "REVIEWER" | "ADMIN"
│   ├── status: "ACTIVE" | "INACTIVE"
│   ├── createdAt: timestamp
│   └── lastLoginAt: timestamp
│
├── categories/ {categoryId}
│   ├── id: string
│   ├── title: string               // Ex: "Importação", "Regras Contábeis", "Confronto"
│   ├── slug: string
│   ├── description: string
│   ├── iconName: string
│   ├── orderIndex: number
│   ├── parentId: string | null     // Suporte a subcategorias
│   └── isActive: boolean
│
├── articles/ {articleId}
│   ├── id: string
│   ├── title: string
│   ├── slug: string
│   ├── categoryId: string
│   ├── categoryName: string
│   ├── authorId: string
│   ├── authorName: string
│   ├── authorEmail: string
│   ├── currentStatus: "DRAFT" | "PENDING" | "IN_ADJUSTMENT" | "APPROVED" | "REJECTED"
│   ├── tags: string[]
│   ├── viewCount: number
│   ├── currentVersionNumber: number
│   ├── publishedAt: timestamp | null
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   │
│   ├── versions/ {versionId}
│   │   ├── versionNumber: number
│   │   ├── titleSnapshot: string
│   │   ├── contentJson: map        // AST do TipTap
│   │   ├── contentHtml: string     // HTML sanitizado com DOMPurify
│   │   ├── changeSummary: string
│   │   ├── createdBy: string
│   │   └── createdAt: timestamp
│   │
│   └── reviews/ {reviewId}
│       ├── reviewerId: string
│       ├── reviewerName: string
│       ├── versionNumber: number
│       ├── action: "APPROVE" | "REQUEST_ADJUSTMENT" | "REJECT"
│       ├── generalFeedback: string
│       ├── createdAt: timestamp
│       └── comments/ {commentId}
│           ├── authorId: string
│           ├── authorName: string
│           ├── message: string
│           ├── isResolved: boolean
│           └── createdAt: timestamp
│
├── tools_links/ {toolId}
│   ├── id: string
│   ├── title: string               // Ex: "Robô de Busca Extratos", "Conversor OFX"
│   ├── description: string
│   ├── category: "SOFTWARES" | "CONVERSORES" | "LINKS_OPERACIONAIS" | "LAYOUTS_ERP"
│   ├── resourceType: "DOWNLOAD_FILE" | "EXTERNAL_URL"
│   ├── downloadUrl: string
│   ├── storagePath: string | null
│   ├── fileSize: string
│   ├── versionTag: string          // Ex: "v2.1.0"
│   ├── orderIndex: number
│   ├── isActive: boolean
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp
│
└── audit_logs/ {logId}
    ├── userId: string
    ├── userEmail: string
    ├── action: string              // Ex: "USER_ROLE_UPDATED", "ARTICLE_APPROVED"
    ├── targetId: string
    ├── details: map
    └── timestamp: timestamp
```

---

## 6. Fluxo Editorial de Conteúdo e Sidebar de Contexto

```
[OPERADOR]
  └─ Redige novo artigo no editor rich-text
  └─ Clica em "Submeter para Revisão"
        │
        ▼
   Status: PENDENTE (Entra na fila do Revisor)
        │
        ├──────────────────────────────────────────────┐
        ▼                                              ▼
  [REVISOR APROVA]                               [REVISOR SOLICITA AJUSTE]
  • Status muda para APROVADO                    • Status muda para EM AJUSTE
  • Visível publicamente na base                 • Revisor insere notas na Sidebar
  • Contabiliza conversão positiva               • Retorna para o operador
                                                       │
                                                       ▼
                                                 [OPERADOR EDITA]
                                                 • Tela dividida (Editor + Sidebar)
                                                 • Ajusta conforme orientações
                                                 • Reenvia ──► Status: PENDENTE
```

### Detalhe da Barra Lateral de Contexto (Sidebar):
Quando um artigo está com o status `EM AJUSTE`, a tela de edição do operador carrega uma gaveta lateral sincronizada que exibe:
1. O parecer geral do editor.
2. A lista de apontamentos específicos (ex: *"Acrescentar print da tela de confronto"*, *"Corrigir o código de histórico contábil"*).
3. Checkboxes de resolução para que o operador marque o que já atendeu antes de reenviar.

---

## 7. Módulos Iniciais da Base (Espelhamento do Acervo Movidesk)

As categorias padrão configuradas na carga inicial correspondem diretamente à taxonomia de sucesso do Conciliador Contábil no Movidesk:

1. 🚀 **Primeiros Passos:** Visão geral da plataforma, requisitos e conceitos iniciais.
2. 📝 **Cadastros:** Contas contábeis, empresas, planos de contas e parâmetros.
3. 📥 **Importação:** Extratos bancários (OFX, PDF, Excel, TXT, CSV), cartões e layouts.
4. ⚖️ **Regras Contábeis:** Criação de regras de conciliação por palavra-chave e histórico padrão.
5. 🔍 **Confronto:** Conciliação financeira versus extratos e eliminação de contas transitórias.
6. 📤 **Exportação:** Geração de lançamentos para ERPs (Domínio, Alterdata, Fortes, Questor, Prosoft, etc.).
7. 🌐 **Open Finance:** Busca automática de extratos diretamente nos bancos.
8. 🔄 **Migração de Regras:** Importação e exportação de pacotes de regras entre clientes.
9. 💡 **Informações Importantes & FAQ:** Dúvidas comuns, boas práticas e mensagens de alerta.
10. 🎫 **Abertura de Chamados:** Procedimentos para acionar suporte técnico N3.

---

## 8. Arquitetura dos Agentes Especializados (Pair-Programming)

Conforme diretriz, as fases de implementação prática serão orquestradas com o uso das **skills/agentes especializados** já instalados no projeto:

- 🎨 **`frontend-design` & `frontend-developer`:** Construção da interface responsiva, com a paleta oficial (#5CB780 e #6C63FF), tema escuro e claro, micro-animações e componentes da barra lateral.
- 🛡️ **`backend-security-coder` & `security-auditor`:** Formulação das regras de segurança do Firestore (`firestore.rules`), Storage (`storage.rules`) e validação de domínio de e-mail corporativo.
- 🧪 **`tdd-orchestrator`:** Testes das regras de transição de status editorial e cálculo de taxas de conversão de usuários.
- 📝 **`git-commit-formatter`:** Padronização de todo histórico de commits no padrão Conventional Commits.
- 🔍 **`code-reviewer`:** Auditoria contínua de código e boas práticas antes de qualquer merge.
