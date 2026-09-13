import type { Category, Article, ToolItem, UserProfile } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    title: 'Primeiros Passos',
    slug: 'primeiros-passos',
    description: 'Conceitos fundamentais, requisitos operacionais e primeiro acesso à plataforma.',
    icon: 'Compass',
    orderIndex: 1,
    articleCount: 4,
  },
  {
    id: 'cat-2',
    title: 'Cadastros',
    slug: 'cadastros',
    description: 'Empresas, planos de contas contábeis, bancos e mapeamento cadastral.',
    icon: 'Database',
    orderIndex: 2,
    articleCount: 3,
  },
  {
    id: 'cat-3',
    title: 'Importação',
    slug: 'importacao',
    description: 'Importação de extratos OFX, PDF, planilhas Excel, arquivos TXT e relatórios.',
    icon: 'FileDown',
    orderIndex: 3,
    articleCount: 8,
  },
  {
    id: 'cat-4',
    title: 'Regras Contábeis',
    slug: 'regras-contabeis',
    description: 'Configuração de inteligência de conciliação automática e históricos inteligentes.',
    icon: 'Sliders',
    orderIndex: 4,
    articleCount: 6,
  },
  {
    id: 'cat-5',
    title: 'Confronto',
    slug: 'confronto',
    description: 'Conciliação de saldos, baixa automática de partidas e eliminação de transitórias.',
    icon: 'Scale',
    orderIndex: 5,
    articleCount: 5,
  },
  {
    id: 'cat-6',
    title: 'Exportação',
    slug: 'exportacao',
    description: 'Geração de lotes contábeis para Domínio, Alterdata, Fortes, Questor e outros.',
    icon: 'FileUp',
    orderIndex: 6,
    articleCount: 7,
  },
  {
    id: 'cat-7',
    title: 'Open Finance',
    slug: 'open-finance',
    description: 'Captura direta e automatizada de extratos bancários sem intervenção manual.',
    icon: 'Globe',
    orderIndex: 7,
    articleCount: 3,
  },
  {
    id: 'cat-8',
    title: 'Migração de Regras',
    slug: 'migracao-de-regras',
    description: 'Exportação e clonagem de pacotes de regras entre empresas do mesmo grupo.',
    icon: 'ArrowLeftRight',
    orderIndex: 8,
    articleCount: 2,
  },
  {
    id: 'cat-9',
    title: 'Informações Importantes & FAQ',
    slug: 'faq',
    description: 'Perguntas frequentes, alertas sobre formatos de extratos e dicas de produtividade.',
    icon: 'HelpCircle',
    orderIndex: 9,
    articleCount: 11,
  },
  {
    id: 'cat-10',
    title: 'Abertura de Chamados',
    slug: 'abertura-de-chamados',
    description: 'Fluxo oficial para acionamento do suporte técnico N3 e engenharia.',
    icon: 'LifeBuoy',
    orderIndex: 10,
    articleCount: 2,
  },
];

export const INITIAL_USERS: UserProfile[] = [
  // Super Administrador Fixo
  {
    uid: 'usr-fulvio',
    email: 'fulvio@conciliadorcontabil.com.br',
    displayName: 'Fulvio Tanure (Superadmin)',
    role: 'SUPER_ADMIN',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00Z',
    lastLoginAt: '2026-09-13T12:45:00Z',
  },
  // Administradores
  {
    uid: 'usr-rodrigo-moro',
    email: 'rodrigo@conciliadorcontabil.com.br',
    displayName: 'Rodrigo J. Moro',
    role: 'ADMIN',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-01-15T09:00:00Z',
    lastLoginAt: '2026-09-13T14:10:00Z',
  },
  {
    uid: 'usr-rodrigo-fontenelle',
    email: 'fontenelle@conciliadorcontabil.com.br',
    displayName: 'Rodrigo Fontenelle',
    role: 'ADMIN',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-01-15T09:00:00Z',
    lastLoginAt: '2026-09-13T13:30:00Z',
  },
  {
    uid: 'usr-rodrigo-lopes',
    email: 'lopes@conciliadorcontabil.com.br',
    displayName: 'Rodrigo Lopes',
    role: 'ADMIN',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-01-15T09:00:00Z',
    lastLoginAt: '2026-09-13T11:20:00Z',
  },
  {
    uid: 'usr-igor',
    email: 'igor@conciliadorcontabil.com.br',
    displayName: 'Igor',
    role: 'ADMIN',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-01-18T10:00:00Z',
    lastLoginAt: '2026-09-13T14:00:00Z',
  },
  // Colaboradores Internos (Operadores)
  {
    uid: 'usr-agatha',
    email: 'agatha@conciliadorcontabil.com.br',
    displayName: 'Agatha Macedo',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-02-01T08:00:00Z',
    lastLoginAt: '2026-09-13T10:00:00Z',
  },
  {
    uid: 'usr-aline',
    email: 'alinenunes@conciliadorcontabil.com.br',
    displayName: 'Aline Nunes',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-02-01T08:30:00Z',
    lastLoginAt: '2026-09-13T11:20:00Z',
  },
  {
    uid: 'usr-anaclaudia',
    email: 'anaclaudia@conciliadorcontabil.com.br',
    displayName: 'Ana Claudia',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-02-02T09:00:00Z',
    lastLoginAt: '2026-09-13T09:40:00Z',
  },
  {
    uid: 'usr-ana-julia',
    email: 'ana@conciliadorcontabil.com.br',
    displayName: 'Ana Júlia',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-02-03T09:15:00Z',
    lastLoginAt: '2026-09-13T13:00:00Z',
  },
  {
    uid: 'usr-andre',
    email: 'andre@conciliadorcontabil.com.br',
    displayName: 'André Marcos',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-02-04T10:00:00Z',
    lastLoginAt: '2026-09-12T17:00:00Z',
  },
  {
    uid: 'usr-andressa',
    email: 'andressa@conciliadorcontabil.com.br',
    displayName: 'Andressa Mendes',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-02-05T10:30:00Z',
    lastLoginAt: '2026-09-13T14:15:00Z',
  },
  {
    uid: 'usr-artur',
    email: 'artur@conciliadorcontabil.com.br',
    displayName: 'Artur Henrique',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-02-06T11:00:00Z',
    lastLoginAt: '2026-09-13T12:30:00Z',
  },
  {
    uid: 'usr-bruno',
    email: 'bruno@conciliadorcontabil.com.br',
    displayName: 'Bruno Damião',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-02-07T11:30:00Z',
    lastLoginAt: '2026-09-13T08:50:00Z',
  },
  {
    uid: 'usr-carina',
    email: 'carina@conciliadorcontabil.com.br',
    displayName: 'Carina Amarall',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-02-08T13:00:00Z',
    lastLoginAt: '2026-09-12T18:00:00Z',
  },
  {
    uid: 'usr-douglas',
    email: 'douglas@conciliadorcontabil.com.br',
    displayName: 'Douglas Montovani',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-02-09T14:00:00Z',
    lastLoginAt: '2026-09-13T10:45:00Z',
  },
  {
    uid: 'usr-elisandra',
    email: 'financeiro@conciliadorcontabil.com.br',
    displayName: 'Elisandra | Financeiro',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-02-10T08:30:00Z',
    lastLoginAt: '2026-09-13T14:30:00Z',
  },
  {
    uid: 'usr-fabricio',
    email: 'fabricio@conciliadorcontabil.com.br',
    displayName: 'Fabricio Tamada',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-02-11T09:00:00Z',
    lastLoginAt: '2026-09-13T11:15:00Z',
  },
  {
    uid: 'usr-humberto',
    email: 'humberto@conciliadorcontabil.com.br',
    displayName: 'Humberto Dante',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-02-12T10:00:00Z',
    lastLoginAt: '2026-09-13T13:40:00Z',
  },
  {
    uid: 'usr-iago',
    email: 'iago@conciliadorcontabil.com.br',
    displayName: 'Iago Henrique',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-02-13T10:30:00Z',
    lastLoginAt: '2026-09-13T12:10:00Z',
  },
  {
    uid: 'usr-natasha',
    email: 'natasha@conciliadorcontabil.com.br',
    displayName: 'Natasha Lorrane',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-02-01T08:30:00Z',
    lastLoginAt: '2026-09-13T10:15:00Z',
  },
  {
    uid: 'usr-pedro',
    email: 'pedro@conciliadorcontabil.com.br',
    displayName: 'Pedro Henrique',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-02-05T09:00:00Z',
    lastLoginAt: '2026-09-12T16:40:00Z',
  },
  {
    uid: 'usr-rafael',
    email: 'rafael@conciliadorcontabil.com.br',
    displayName: 'Rafael Dutra',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-02-10T11:20:00Z',
    lastLoginAt: '2026-09-13T09:00:00Z',
  },
  {
    uid: 'usr-rayser',
    email: 'rayser@conciliadorcontabil.com.br',
    displayName: 'Rayser Kevin',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-02-12T14:15:00Z',
    lastLoginAt: '2026-09-11T17:30:00Z',
  },
  {
    uid: 'usr-rh',
    email: 'rh@conciliadorcontabil.com.br',
    displayName: 'RH Conciliador Contábil',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-02-15T08:00:00Z',
    lastLoginAt: '2026-09-10T15:10:00Z',
  },
  {
    uid: 'usr-thayna',
    email: 'thayna@conciliadorcontabil.com.br',
    displayName: 'Thayna Sousa',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-02-20T10:00:00Z',
    lastLoginAt: '2026-09-13T12:00:00Z',
  },
  {
    uid: 'usr-tiago',
    email: 'eler@conciliadorcontabil.com.br',
    displayName: 'Tiago Eler',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-03-01T09:45:00Z',
    lastLoginAt: '2026-09-13T13:45:00Z',
  },
  {
    uid: 'usr-victor',
    email: 'victor@conciliadorcontabil.com.br',
    displayName: 'Victor Altomar',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-03-05T13:10:00Z',
    lastLoginAt: '2026-09-12T18:20:00Z',
  },
  {
    uid: 'usr-victoria',
    email: 'victoria@conciliadorcontabil.com.br',
    displayName: 'Victória Lima',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-03-10T14:30:00Z',
    lastLoginAt: '2026-09-13T11:00:00Z',
  },
  {
    uid: 'usr-vitor-hugo',
    email: 'vitor.silva@conciliadorcontabil.com.br',
    displayName: 'Vitor Hugo',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-03-12T08:20:00Z',
    lastLoginAt: '2026-09-13T10:50:00Z',
  },
  {
    uid: 'usr-vitor-silva',
    email: 'vitor@conciliadorcontabil.com.br',
    displayName: 'Vitor Silva',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-03-15T09:30:00Z',
    lastLoginAt: '2026-09-13T14:05:00Z',
  },
  {
    uid: 'usr-yago',
    email: 'pacceli@conciliadorcontabil.com.br',
    displayName: 'Yago Pacceli',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-03-20T10:15:00Z',
    lastLoginAt: '2026-09-12T15:40:00Z',
  },
  {
    uid: 'usr-ytalo',
    email: 'ytalo@conciliadorcontabil.com.br',
    displayName: 'Ytalo Silveira',
    role: 'OPERATOR',
    userType: 'INTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-03-22T11:00:00Z',
    lastLoginAt: '2026-09-13T13:25:00Z',
  },
  // Cliente Externo
  {
    uid: 'usr-externo-demo',
    email: 'cliente@escritorioexemplo.com.br',
    displayName: 'Cliente Externo Demo',
    role: 'READER',
    userType: 'EXTERNAL',
    status: 'ACTIVE',
    createdAt: '2026-04-01T09:00:00Z',
    lastLoginAt: '2026-09-13T09:30:00Z',
  },
];

export const INITIAL_ARTICLES: Article[] = [
  // Artigo 1 (Aprovado em Primeiros Passos criado por Fulvio Tanure)
  {
    id: 'art-cc-101',
    code: 'CC-101',
    title: 'Guia Oficial de Primeiros Passos: Operação, Implantação e Boas Práticas',
    slug: 'guia-oficial-primeiros-passos-operacao-implantacao',
    categoryId: 'cat-1',
    categoryName: 'Primeiros Passos',
    authorId: 'usr-fulvio',
    authorName: 'Fulvio Tanure',
    authorEmail: 'fulvio@conciliadorcontabil.com.br',
    currentStatus: 'APPROVED',
    accessLevel: 'ALL',
    tags: ['Primeiros Passos', 'Implantação', 'Manual Oficial', 'Boas Práticas', 'Extratos'],
    viewCount: 168,
    likesCount: 42,
    dislikesCount: 0,
    contentHtml: `
      <h2>1. Introdução à Plataforma Conciliador Contábil</h2>
      <p>Bem-vindo ao <strong>Conciliador Contábil</strong>! Esta solução foi desenvolvida para acelerar a rotina de fechamento contábil e financeiro dos escritórios e departamentos contábeis, eliminando 100% da digitação manual de extratos bancários e cartões.</p>
      
      <div class="callout callout-info">
        <strong>💡 Conceito Chave:</strong> O sistema trabalha com <strong>Confronto Inteligente</strong>: compara o que ocorreu na conta bancária (débitos e créditos) com os lançamentos do razão contábil ou financeiro, propondo a conciliação automática.
      </div>

      <h2>2. Etapas de Implantação Rápida</h2>
      <ol style="margin-left: 20px; line-height: 1.8;">
        <li><strong>Configuração de Empresas e Contas:</strong> Cadastre o plano de contas contábil e vincule o banco com a sua conta contábil correspondente (Ativo Circulante).</li>
        <li><strong>Importação do Extrato Oficial:</strong> Solicite ao cliente o arquivo bancário em formato <strong>.OFX</strong> ou <strong>PDF com texto</strong>.</li>
        <li><strong>Aplicação de Regras Contábeis:</strong> Crie regras para identificar lançamentos recorrentes (tarifas, impostos, fornecedores frequentes).</li>
        <li><strong>Confronto e Baixa:</strong> Execute a conciliação e visualize as pendências eliminadas em tempo real.</li>
        <li><strong>Exportação do Lote Contábil:</strong> Exporte para o seu software contábil (Domínio, Fortes, Questor, Alterdata, etc.).</li>
      </ol>

      <div class="callout callout-success">
        <strong>✅ Boas Práticas Recomendadas:</strong> Sempre priorize extratos em formato <strong>OFX</strong> para garantir a leitura do código FITID único de cada transação bancária.
      </div>
    `,
    publishedAt: '2026-09-13T09:30:00Z',
    createdAt: '2026-09-13T09:00:00Z',
    updatedAt: '2026-09-13T09:30:00Z',
  },
  // Artigo 2 (Em Revisão / PENDING em Primeiros Passos criado por Fulvio Tanure)
  {
    id: 'art-cc-102',
    code: 'CC-102',
    title: 'Procedimento Operacional: Diagnóstico de Diferenças e Conciliação de Contas Transitórias',
    slug: 'diagnostico-diferencas-contas-transitorias',
    categoryId: 'cat-1',
    categoryName: 'Primeiros Passos',
    authorId: 'usr-fulvio',
    authorName: 'Fulvio Tanure',
    authorEmail: 'fulvio@conciliadorcontabil.com.br',
    currentStatus: 'PENDING',
    accessLevel: 'INTERNAL',
    proposalNote: 'Elaboração de novo procedimento padrão para operadores reduzirem o tempo de localização de divergências de extratos bancários com partidas dobradas.',
    tags: ['Primeiros Passos', 'Transitórias', 'Diferenças', 'Procedimento', 'Revisão'],
    viewCount: 24,
    likesCount: 5,
    dislikesCount: 0,
    contentHtml: `
      <h2>1. Objetivo deste Procedimento</h2>
      <p>Estabelecer o protocolo de auditoria interna quando o operador identifica saldos residuais em contas transitórias de conciliação bancária após a execução dos confrontos automáticos.</p>

      <h2>2. Procedimento de Investigação Passo a Passo</h2>
      <ol style="margin-left: 20px; line-height: 1.8;">
        <li><strong>Verificação de Datas de Compensação:</strong> Checar se o cheque ou TED emitido no final do mês compensou no extrato do mês subsequente (D+1 ou D+2).</li>
        <li><strong>Lançamentos em Duplicidade:</strong> Utilizar o filtro por valor exato no painel de confronto para identificar duplicidades originadas por reenvio de arquivos.</li>
        <li><strong>Estornos e Tarifas Agrupadas:</strong> Separar transações bancárias onde tarifas foram cobradas líquidas ou estornadas no mesmo lote.</li>
      </ol>

      <div class="callout callout-warning">
        <strong>⚠️ Nota do Autor:</strong> Este procedimento aguarda revisão editorial pela equipe de governança para publicação oficial na base interna.
      </div>
    `,
    createdAt: '2026-09-13T14:40:00Z',
    updatedAt: '2026-09-13T14:40:00Z',
  },
  {
    id: 'art-1',
    code: 'CC-103',
    title: 'Como Importar Extratos Bancários (OFX, PDF, Excel e TXT)',
    slug: 'como-importar-extratos-bancarios',
    categoryId: 'cat-3',
    categoryName: 'Importação',
    authorId: 'usr-fulvio',
    authorName: 'Fulvio Tanure',
    authorEmail: 'fulvio@conciliadorcontabil.com.br',
    currentStatus: 'APPROVED',
    tags: ['OFX', 'PDF', 'Importação', 'Extrato'],
    viewCount: 342,
    likesCount: 28,
    dislikesCount: 1,
    contentHtml: `
      <h2>1. Visão Geral da Importação</h2>
      <p>O <strong>Conciliador Contábil</strong> aceita arquivos diretamente no formato disponibilizado pelo banco do cliente, eliminando a necessidade de redigitar linhas ou formatar planilhas manualmente.</p>
      
      <div class="callout callout-info">
        <strong>💡 Dica de Produtividade:</strong> O formato <strong>.OFX</strong> é o mais recomendado por conter os identificadores únicos de transação (FITID), garantindo 100% de precisão no confronto.
      </div>

      <h2>2. Passo a Passo para Importação</h2>
      <ol style="margin-left: 20px; line-height: 1.8;">
        <li>Acesse o menu lateral <strong>Movimentações &gt; Importar Extratos</strong>.</li>
        <li>Selecione a empresa contábil e a conta bancária de destino.</li>
        <li>Arraste o arquivo (ou selecione múltiplos arquivos simultaneamente).</li>
        <li>O sistema fará a leitura automática e exibirá o resumo das transações antes de confirmar.</li>
      </ol>

      <div class="callout callout-success">
        <strong>✅ Validação Automática:</strong> Arquivos duplicados são detectados pelo hash do extrato e bloqueados para evitar lançamentos repetidos.
      </div>
    `,
    publishedAt: '2026-06-01T10:00:00Z',
    accessLevel: 'ALL',
    createdAt: '2026-05-28T14:20:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'art-2',
    code: 'CC-104',
    title: 'Criação de Regras Contábeis Automatizadas com Histórico Padrão',
    slug: 'regras-contabeis-automatizadas',
    categoryId: 'cat-4',
    categoryName: 'Regras Contábeis',
    authorId: 'usr-natasha',
    authorName: 'Natasha Lorrane',
    authorEmail: 'natasha@conciliadorcontabil.com.br',
    currentStatus: 'APPROVED',
    accessLevel: 'ALL',
    tags: ['Regras', 'Contabilidade', 'Automação', 'Histórico'],
    viewCount: 289,
    likesCount: 19,
    dislikesCount: 0,
    contentHtml: `
      <h2>Eliminando Contas Transitórias</h2>
      <p>As regras contábeis identificam padrões descritivos no extrato (como <em>SISPAG</em>, <em>TED</em>, <em>PIX RECEBIDO</em>) e já direcionam a partida e contrapartida correspondentes.</p>
      
      <div class="callout callout-warning">
        <strong>⚠️ Atenção:</strong> Certifique-se de vincular o código de histórico padrão correto conforme a tabela do seu sistema contábil de destino (ex: Domínio ou Questor).
      </div>
    `,
    publishedAt: '2026-06-15T11:30:00Z',
    createdAt: '2026-06-10T15:00:00Z',
    updatedAt: '2026-06-15T11:30:00Z',
  },
  {
    id: 'art-3',
    code: 'CC-105',
    title: 'Open Finance: Conexão Direta e Busca Automática de Extratos',
    slug: 'open-finance-busca-automatica',
    categoryId: 'cat-7',
    categoryName: 'Open Finance',
    authorId: 'usr-fulvio',
    authorName: 'Fulvio Tanure',
    authorEmail: 'fulvio@conciliadorcontabil.com.br',
    currentStatus: 'APPROVED',
    accessLevel: 'ALL',
    tags: ['Open Finance', 'Bancos', 'Automação'],
    viewCount: 512,
    likesCount: 56,
    dislikesCount: 2,
    contentHtml: `
      <h2>Adeus à cobrança manual de extratos</h2>
      <p>Com o módulo <strong>Open Finance</strong> ativado, seu cliente concede autorização segura uma única vez e o Conciliador Contábil baixa os extratos automaticamente todos os dias às 06h da manhã.</p>
    `,
    publishedAt: '2026-07-02T09:00:00Z',
    createdAt: '2026-06-30T10:00:00Z',
    updatedAt: '2026-07-02T09:00:00Z',
  },
  {
    id: 'art-4',
    code: 'CC-106',
    title: 'Tratamento de Arquivos SISPAG e Desmembramento de Folha',
    slug: 'tratamento-sispag-folha',
    categoryId: 'cat-4',
    categoryName: 'Regras Contábeis',
    authorId: 'usr-pedro',
    authorName: 'Pedro Henrique',
    authorEmail: 'pedro@conciliadorcontabil.com.br',
    currentStatus: 'IN_ADJUSTMENT',
    accessLevel: 'INTERNAL',
    tags: ['SISPAG', 'Folha', 'Ajuste'],
    viewCount: 45,
    likesCount: 3,
    dislikesCount: 1,
    contentHtml: `
      <h2>Visão do Operador sobre o SISPAG</h2>
      <p>Muitos clientes enviam lançamentos consolidados no débito do banco identificados apenas como SISPAG FORNECEDORES ou SISPAG SALARIOS.</p>
      <p>Para desmembrar, é necessário importar o relatório analítico do banco antes de rodar o confronto.</p>
    `,
    reviews: [
      {
        id: 'rev-1',
        reviewerId: 'usr-rodrigo-moro',
        reviewerName: 'Rodrigo J. Moro',
        action: 'REQUEST_ADJUSTMENT',
        generalFeedback: 'O artigo está no caminho certo, porém faltam os prints explicativos da tela de desmembramento e a indicação do formato CSV aceito.',
        comments: [
          {
            id: 'c-1',
            authorName: 'Rodrigo J. Moro',
            authorRole: 'ADMIN',
            message: 'Adicione um exemplo do cabeçalho esperado do arquivo SISPAG do Itaú.',
            isResolved: false,
            createdAt: '2026-09-12T14:30:00Z',
          },
          {
            id: 'c-2',
            authorName: 'Rodrigo J. Moro',
            authorRole: 'ADMIN',
            message: 'Substitua a palavra "obrigatório" por "recomendado" no segundo parágrafo.',
            isResolved: true,
            createdAt: '2026-09-12T14:32:00Z',
          },
        ],
        createdAt: '2026-09-12T14:35:00Z',
      },
    ],
    createdAt: '2026-09-11T16:00:00Z',
    updatedAt: '2026-09-12T14:35:00Z',
  },
  {
    id: 'art-5',
    code: 'CC-107',
    title: 'Procedimento para Conciliação de Boletos com Liquidação Parcial',
    slug: 'conciliacao-boletos-liquidacao-parcial',
    categoryId: 'cat-5',
    categoryName: 'Confronto',
    authorId: 'usr-thayna',
    authorName: 'Thayna Sousa',
    authorEmail: 'thayna@conciliadorcontabil.com.br',
    currentStatus: 'PENDING',
    accessLevel: 'INTERNAL',
    tags: ['Boletos', 'Confronto', 'Parcial'],
    viewCount: 12,
    likesCount: 2,
    dislikesCount: 0,
    contentHtml: `
      <h2>Solução proposta para baixas parciais de recebíveis</h2>
      <p>Quando o cliente recebe um pagamento de boleto que sofreu desconto de tarifas ou retenções de juros, o saldo no extrato diverge do contas a receber original.</p>
      <p>Este tutorial explica como aplicar o desdobramento da linha com a conta de despesa bancária correspondente.</p>
    `,
    createdAt: '2026-09-13T10:15:00Z',
    updatedAt: '2026-09-13T10:15:00Z',
  },
];

export const INITIAL_TOOLS: ToolItem[] = [
  {
    id: 'tool-1',
    title: 'Robô de Captura Bancária (Open Finance)',
    description: 'Utilitário executável para sincronização diária e monitoramento de certificados de bancos parceiros.',
    category: 'SOFTWARES',
    resourceType: 'DOWNLOAD_FILE',
    targetUrl: 'https://downloads.conciliadorcontabil.com.br/robo-open-finance-setup.exe',
    fileSize: '48.2 MB',
    versionTag: 'v3.4.1',
    orderIndex: 1,
    isActive: true,
    accessLevel: 'INTERNAL',
  },
  {
    id: 'tool-2',
    title: 'Conversor Inteligente de Extratos OFX/PDF',
    description: 'Software de homologação para conversão de extratos bancários de cooperativas e bancos digitais em formato OFX universal.',
    category: 'CONVERSORES',
    resourceType: 'DOWNLOAD_FILE',
    targetUrl: 'https://downloads.conciliadorcontabil.com.br/conversor-extratos.exe',
    fileSize: '32.1 MB',
    versionTag: 'v2.8.0',
    orderIndex: 2,
    isActive: true,
    accessLevel: 'ALL',
  },
  {
    id: 'tool-3',
    title: 'Pacote de Layouts Contábeis ERP 2026',
    description: 'Modelos oficiais de integração para Domínio Sistemas, Questor, Alterdata, Fortes e Prosoft.',
    category: 'LAYOUTS_ERP',
    resourceType: 'DOWNLOAD_FILE',
    targetUrl: 'https://downloads.conciliadorcontabil.com.br/layouts-contabeis-2026.zip',
    fileSize: '4.8 MB',
    versionTag: 'v2026.1',
    orderIndex: 3,
    isActive: true,
    accessLevel: 'ALL',
  },
  {
    id: 'tool-4',
    title: 'Planilha Padrão de Pré-Conciliação',
    description: 'Template em Excel para clientes que enviam relatórios gerenciais sem formato contábil definido.',
    category: 'LAYOUTS_ERP',
    resourceType: 'DOWNLOAD_FILE',
    targetUrl: 'https://downloads.conciliadorcontabil.com.br/template-pre-conciliacao.xlsx',
    fileSize: '1.2 MB',
    versionTag: 'v1.4',
    orderIndex: 4,
    isActive: true,
    accessLevel: 'ALL',
  },
  {
    id: 'tool-5',
    title: 'Portal de Homologação Open Finance BACEN',
    description: 'Acesso ao ambiente regulatório de status de APIs bancárias do Banco Central.',
    category: 'LINKS_OPERACIONAIS',
    resourceType: 'EXTERNAL_URL',
    targetUrl: 'https://openfinancebrasil.org.br/',
    orderIndex: 5,
    isActive: true,
    accessLevel: 'INTERNAL',
  },
  {
    id: 'tool-6',
    title: 'Central de Chamados N3 Movidesk',
    description: 'Canal de escalonamento para suporte técnico, bugs de integração e atendimento ao cliente.',
    category: 'LINKS_OPERACIONAIS',
    resourceType: 'EXTERNAL_URL',
    targetUrl: 'https://conciliador-contabil2.movidesk.com/',
    orderIndex: 6,
    isActive: true,
    accessLevel: 'ALL',
  },
];
