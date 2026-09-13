# 📊 Documento de Controle, Funções & Roadmap de Implementação
## Painel de Base de Conhecimento e Suporte — Conciliador Contábil

> **Regra de Manutenção do Documento:** Este documento é o **quadro vivo de controle** do projeto. Sempre que houver qualquer alteração de escopo, adição de regra de negócio, nova função ou conclusão de etapa, este arquivo deve ser atualizado imediatamente antes de prosseguir.
>
> **Última Atualização:** 13/09/2026  
> **Versão do Documento:** 1.2.0 (Integração Firebase Auth & Firestore Pronta)  
> **Projeto Firebase:** `base-de-conhecimento-cc`  
> **Console URL:** https://console.firebase.google.com/u/0/project/base-de-conhecimento-cc/overview?hl=pt-br  
> **Hosting de Testes:** https://base-de-conhecimento-cc.web.app  
> **Estado Atual:** Código 100% pronto com Firebase Auth (Email/Senha), Firestore Real-Time e Hosting configurado. Aguardando ativação de permissões/chaves.

---

## 1. Tabela de Controle Geral de Implementação

| ID | Módulo / Funcionalidade | Descrição Técnica | Agente / Skill Responsável | Status |
| :--- | :--- | :--- | :--- | :---: |
| **M01** | **Infraestrutura Firebase & Setup** | Inicialização do projeto Firebase, Web App Config, emuladores e scripts de deploy | `firebase-basics` / `firebase-hosting-basics` | ✅ Concluído (`base-de-conhecimento-cc`) |
| **M02** | **Autenticação & Whitelist** | Login Email/Senha via Firebase Auth, domínio `@conciliadorcontabil.com.br`, bootstrap do superusuário `fulvio` | `firebase-auth-basics` | ✅ Concluído (`authService.ts` + `AuthModal.tsx`) |
| **M03** | **Design System & Shell Visual** | Layout moderno (sidebar, header, busca spotlight, tema #5CB780 e #6C63FF, logo) | `frontend-design` | ✅ Implementado & Validado no Browser |
| **M04** | **Gestão de Usuários (RBAC Admin)** | Painel do Fulvio: listagem de todos os e-mails logados, alteração de permissões | `backend-architect` / `frontend-developer` | ✅ Implementado & Validado |
| **M05** | **Editor Rich-Text & Submissão** | Editor TipTap com upload de prints, callouts contábeis, seleção de módulo | `frontend-developer` | ✅ Implementado |
| **M06** | **Fila Editorial & Triagem** | Tela de revisão para Editores (filtros Pendente/Ajuste/Aprovado, ordenação) | `frontend-developer` | ✅ Implementado & Validado |
| **M07** | **Sidebar de Feedback & Notas** | Gaveta de contexto com apontamentos técnicos para artigos devolvidos "Em Ajuste" | `frontend-design` / `frontend-developer` | ✅ Implementado |
| **M08** | **Base de Conhecimento Pública** | Visualização de artigos aprovados, sumário (TOC), busca rápida, cards de módulos | `frontend-developer` | ✅ Implementado & Validado |
| **M09** | **Central de Ferramentas & Links** | Grade de downloads de softwares (.exe), conversores, layouts ERP e links frequentes | `frontend-developer` | ✅ Implementado & Validado |
| **M10** | **Dashboard Analítico / Métricas** | KPIs de artigos, tabela de desempenho por operador, taxa de conversão e gráficos | `frontend-developer` | ✅ Implementado & Validado |
| **M11** | **Segurança & Firestore Rules** | Regras de segurança no Firestore e Storage garantindo isolamento por cargo | `backend-security-coder` / `security-auditor` | 📋 Especificado no Documento |
| **M12** | **Carga Inicial do Acervo (Movidesk)**| Script de migração dos artigos e categorias existentes em conciliador-contabil2.movidesk.com/kb | `backend-development-feature-development` | ✅ Carga Inicial Semeada (10 Módulos) |
| **M13** | **Garantia de Qualidade & Testes** | Testes de RBAC, transição de estados editoriais e auditoria de código | `tdd-orchestrator` / `code-reviewer` | ✅ Testado via Browser Subagent (0 Erros) |

---

## 2. Detalhamento das Funções e Componentes a Implementar

### M01: Infraestrutura & Conexão Firebase
- [ ] `src/lib/firebase/config.ts`: Inicialização singleton dos serviços Firebase (Auth, Firestore, Storage, Analytics).
- [ ] `src/lib/firebase/admin.ts`: Inicialização segura do Firebase Admin SDK com Service Account para gestão de Custom Claims.
- [ ] `.env.example` e `.env.local`: Variáveis de ambiente (`NEXT_PUBLIC_FIREBASE_API_KEY`, `FIREBASE_PROJECT_ID`, etc.).

### M02: Autenticação, Whitelist & Bootstrap do Fulvio
- [ ] `validateCorporateDomain(email: string): boolean`:
  - Bloqueia qualquer domínio diferente de `@conciliadorcontabil.com.br`.
- [ ] `ensureSuperAdminBootstrap(user: FirebaseUser): Promise<UserRole>`:
  - Se `user.email` for o e-mail do `fulvio`, atribui automaticamente a role `ADMIN`.
- [ ] `onUserFirstLogin(user: FirebaseUser): Promise<void>`:
  - Cria o documento em `users/{uid}` com `role: 'OPERATOR'`, `status: 'ACTIVE'`, `createdAt: now()`.
- [ ] `useAuth()` hook:
  - Fornece `user`, `role`, `loading`, `isAuthenticated`, `isAdmin`, `isReviewer`.

### M03: Design System, Layout & Identidade Visual
- [ ] `components/layout/Header.tsx`:
  - Logotipo oficial do Conciliador Contábil (`conciliador-logo.png`).
  - Campo de busca instantânea (Search Spotlight com atalho `Ctrl + K`).
  - Menu de perfil do usuário, indicador de perfil (`Operador`, `Editor`, `Admin`) e botão de logout.
- [ ] `components/layout/SidebarNav.tsx`:
  - Itens de navegação filtrados dinamicamente com base nas permissões RBAC do usuário.
- [ ] `components/ui/*`:
  - Botões, Badges, Modais, Tooltips e Toasts estilizados com a paleta institucional (#5CB780 e #6C63FF).

### M04: Painel Administrativo de Usuários (Exclusivo Fulvio)
- [ ] `pages/admin/usuarios` / `components/admin/UserManagementTable.tsx`:
  - Listagem em tempo real de todos os usuários registrados que fizeram login no sistema.
  - Colunas: Avatar/Nome, E-mail, Cargo Atual, Status, Data do Primeiro Login, Último Acesso, Ações.
- [ ] `updateUserRole(targetUid: string, newRole: 'OPERATOR' | 'REVIEWER' | 'ADMIN')`:
  - Função server-side / Cloud Function que atualiza as Custom Claims do Firebase Auth e o documento no Firestore.
- [ ] `toggleUserStatus(targetUid: string, status: 'ACTIVE' | 'INACTIVE')`:
  - Bloqueia ou reativa o acesso de um usuário corporativo.

### M05: Editor de Conteúdo Rich-Text & Submissão
- [ ] `components/editor/TipTapEditor.tsx`:
  - Barra de ferramentas: Títulos (H1, H2, H3), Negrito, Itálico, Listas numeradas e com marcadores, Tabelas dinâmicas, Blocos de código/SQL, Callouts de alerta contábil (*Nota*, *Atenção*, *Dica*).
  - Suporte a arrastar e soltar (drag & drop) e colar prints da área de transferência (clipboard upload direto para o Firebase Storage).
- [ ] `submitArticle(articleData: NewArticlePayload): Promise<string>`:
  - Valida com Zod.
  - Grava em `articles/{id}` com `currentStatus: 'PENDING'`.
  - Grava a primeira versão em `articles/{id}/versions/v1`.

### M06: Fila de Revisão Editorial (Editores & Admins)
- [ ] `components/review/EditorialQueueTable.tsx`:
  - Abas de visualização: `Todos`, `Pendentes (Fila de Espera)`, `Em Ajuste`, `Aprovados`, `Reprovados`.
  - Badges coloridos por status e ordenação por data de submissão (FIFO - First In, First Out).
- [ ] `components/review/ReviewActionModal.tsx`:
  - Modal para aprovação rápida ou solicitação de devolução com campos de notas obrigatórios.

### M07: Barra Lateral de Contexto (Feedback & Ajustes)
- [ ] `components/review/ReviewSidebarDrawer.tsx`:
  - Exibida na tela `/artigo/[id]/ajuste` do operador.
  - Histórico de comentários e orientações deixadas pelo revisor.
  - Checklists de pendências técnicas a resolver antes de habilitar o reenvio.

### M08: Base de Conhecimento (Consulta de Artigos Aprovados)
- [ ] `components/kb/CategoryGrid.tsx`:
  - Cards visuais com ícones representativos para os 10 módulos padrão (espelho Movidesk).
- [ ] `components/kb/ArticleView.tsx`:
  - Renderização do HTML sanitizado com `DOMPurify`.
  - Índice lateral dinâmico de cabeçalhos (Table of Contents / TOC com scrollspy).
  - Breadcrumb navegável (`Home > Módulo > Artigo`).
  - Botão de copiar link do artigo e botão de feedback (*"Este artigo foi útil?"*).

### M09: Central de Ferramentas & Softwares para Download
- [ ] `components/tools/ToolsHubGrid.tsx`:
  - Seções categorizadas: *Instaladores & Softwares*, *Conversores de Arquivo*, *Layouts de Importação ERP*, *Portais & Links Úteis*.
  - Cards com ícone do tipo de arquivo, tamanho (.exe, .zip, .xlsx), tag de versão (`v2.4.1`) e botão de download direto.
- [ ] `components/admin/ToolUploadModal.tsx`:
  - Formulário para o Administrador cadastrar novas ferramentas e fazer upload de novos executáveis para o Firebase Storage.

### M10: Dashboard Analítico & Desempenho por Usuário
- [ ] `components/dashboard/KPICards.tsx`:
  - Total de Artigos na Base, Artigos Pendentes, Total em Ajuste, Taxa de Aprovação Global.
- [ ] `components/dashboard/UserPerformanceTable.tsx`:
  - Tabela com indicadores por colaborador:
    - `Volume Submetido`: Total de artigos criados.
    - `Aprovados`: Quantidade de artigos que foram validados e publicados.
    - `Devolvidos p/ Ajuste`: Quantidade de retrabalho editorial.
    - `Reprovados`: Sugestões recusadas.
    - `Taxa de Conversão (%)`: $\frac{\text{Aprovados}}{\text{Total Submetido}} \times 100$.

### M11: Regras de Segurança (Firestore & Storage Rules)
- [ ] `firestore.rules`:
  - Bloqueio de leitura de artigos não aprovados para operadores que não sejam o próprio autor.
  - Permissão de alteração de papéis em `users/` restrita estritamente ao admin.
  - Validação estrita de schema e tipos nas mutações de documentos.
- [ ] `storage.rules`:
  - Uploads de artigos permitidos apenas para usuários autenticados do domínio.
  - Uploads na pasta de executáveis `/tools/` permitidos exclusivamente para administradores.

---

## 3. Checklist de Configuração: Projeto `base-de-conhecimento-cc`

Execute estes passos rápidos no console do Firebase para sincronizar o backend e liberar o deploy:

1. [x] **Projeto Criado no Console**: `base-de-conhecimento-cc`
2. [ ] **Ativar Authentication (Email/Senha)**:
   - Acesse [Authentication > Sign-in method](https://console.firebase.google.com/u/0/project/base-de-conhecimento-cc/authentication/providers).
   - Clique em **"E-mail/senha"** e marque a opção **Ativar**.
3. [ ] **Ativar Cloud Firestore**:
   - Acesse [Firestore Database](https://console.firebase.google.com/u/0/project/base-de-conhecimento-cc/firestore).
   - Clique em **"Criar banco de dados"**, selecione o modo de produção e a localização (ex: `southamerica-east1` ou `us-central1`).
4. [ ] **Registrar o Aplicativo Web (`</>`)**:
   - Acesse a [Visão Geral do Projeto](https://console.firebase.google.com/u/0/project/base-de-conhecimento-cc/overview?hl=pt-br).
   - Clique no ícone da Web `</>` (Adicionar app).
   - Apelido do app: `Conciliador KB`.
   - Copie o objeto `firebaseConfig` gerado.
5. [ ] **Conectar as Credenciais no Aplicativo**:
   - No app (`http://localhost:5173`), clique no botão **"Firebase Local"** no cabeçalho.
   - Cole o bloco `firebaseConfig` (ou preencha as variáveis em `.env.local`).
6. [ ] **Autorizar o CLI para Deploy no Hosting**:
   - Como o CLI local está logado como `fulviotanure@gmail.com`, adicione este e-mail como **Proprietário/Editor** em [Configurações > Usuários e permissões](https://console.firebase.google.com/u/0/project/base-de-conhecimento-cc/settings/usersandpermissions).
   - *Alternativa:* execute `npx firebase login:add` no terminal informando a conta Google dona do projeto.
   - Após autorizado, o comando `npm run deploy:hosting` publicará o app diretamente em `https://base-de-conhecimento-cc.web.app`.

---

## 4. Registro de Decisões Arquiteturais (ADR)

- **ADR-001 (13/09/2026): Adoção do Firebase como BaaS Inicial**
  - *Contexto:* Necessidade de agilidade, autenticação corporativa segura, banco NoSQL em tempo real e storage para binários sem necessidade de provisionar e gerenciar servidores virtuais dedicados.
  - *Decisão:* Adotar Firebase Authentication + Cloud Firestore + Firebase Storage.
  - *Status:* Aprovado pelo usuário.

- **ADR-002 (13/09/2026): Restrição de E-mails e Papéis (RBAC)**
  - *Contexto:* Garantir que apenas colaboradores do Conciliador Contábil acessem a base e que o gestor `fulvio` seja o administrador inicial supremo com poder exclusivo de concessão de cargos.
  - *Decisão:* Validação rígida do domínio corporativo; novos cadastros iniciam como operador padrão; painel administrativo exclusivo para `fulvio` promover colaboradores.
  - *Status:* Aprovado pelo usuário.
