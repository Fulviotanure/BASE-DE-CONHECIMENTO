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
  {
    uid: 'usr-fulvio',
    email: 'fulvio@conciliadorcontabil.com.br',
    displayName: 'Fulvio (Superadministrador)',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00Z',
    lastLoginAt: '2026-09-13T12:45:00Z',
  },
  {
    uid: 'usr-mariana',
    email: 'mariana.revisora@conciliadorcontabil.com.br',
    displayName: 'Mariana Santos',
    role: 'REVIEWER',
    status: 'ACTIVE',
    createdAt: '2026-02-15T10:30:00Z',
    lastLoginAt: '2026-09-12T17:20:00Z',
  },
  {
    uid: 'usr-carlos',
    email: 'carlos.operador@conciliadorcontabil.com.br',
    displayName: 'Carlos Eduardo',
    role: 'OPERATOR',
    status: 'ACTIVE',
    createdAt: '2026-03-01T09:15:00Z',
    lastLoginAt: '2026-09-13T11:00:00Z',
  },
  {
    uid: 'usr-beatriz',
    email: 'beatriz.suporte@conciliadorcontabil.com.br',
    displayName: 'Beatriz Lima',
    role: 'OPERATOR',
    status: 'ACTIVE',
    createdAt: '2026-04-10T14:00:00Z',
    lastLoginAt: '2026-09-10T16:45:00Z',
  },
  {
    uid: 'usr-lucas',
    email: 'lucas.contabil@conciliadorcontabil.com.br',
    displayName: 'Lucas Oliveira',
    role: 'OPERATOR',
    status: 'INACTIVE',
    createdAt: '2026-05-20T11:20:00Z',
    lastLoginAt: '2026-08-15T18:00:00Z',
  },
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'Como Importar Extratos Bancários (OFX, PDF, Excel e TXT)',
    slug: 'como-importar-extratos-bancarios',
    categoryId: 'cat-3',
    categoryName: 'Importação',
    authorId: 'usr-fulvio',
    authorName: 'Fulvio',
    authorEmail: 'fulvio@conciliadorcontabil.com.br',
    currentStatus: 'APPROVED',
    tags: ['OFX', 'PDF', 'Importação', 'Extrato'],
    viewCount: 342,
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
    createdAt: '2026-05-28T14:20:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'art-2',
    title: 'Criação de Regras Contábeis Automatizadas com Histórico Padrão',
    slug: 'regras-contabeis-automatizadas',
    categoryId: 'cat-4',
    categoryName: 'Regras Contábeis',
    authorId: 'usr-mariana',
    authorName: 'Mariana Santos',
    authorEmail: 'mariana.revisora@conciliadorcontabil.com.br',
    currentStatus: 'APPROVED',
    tags: ['Regras', 'Contabilidade', 'Automação', 'Histórico'],
    viewCount: 289,
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
    title: 'Open Finance: Conexão Direta e Busca Automática de Extratos',
    slug: 'open-finance-busca-automatica',
    categoryId: 'cat-7',
    categoryName: 'Open Finance',
    authorId: 'usr-fulvio',
    authorName: 'Fulvio',
    authorEmail: 'fulvio@conciliadorcontabil.com.br',
    currentStatus: 'APPROVED',
    tags: ['Open Finance', 'Bancos', 'Automação'],
    viewCount: 512,
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
    title: 'Tratamento de Arquivos SISPAG e Desmembramento de Folha',
    slug: 'tratamento-sispag-folha',
    categoryId: 'cat-4',
    categoryName: 'Regras Contábeis',
    authorId: 'usr-carlos',
    authorName: 'Carlos Eduardo',
    authorEmail: 'carlos.operador@conciliadorcontabil.com.br',
    currentStatus: 'IN_ADJUSTMENT',
    tags: ['SISPAG', 'Folha', 'Ajuste'],
    viewCount: 45,
    contentHtml: `
      <h2>Visão do Operador sobre o SISPAG</h2>
      <p>Muitos clientes enviam lançamentos consolidados no débito do banco identificados apenas como SISPAG FORNECEDORES ou SISPAG SALARIOS.</p>
      <p>Para desmembrar, é necessário importar o relatório analítico do banco antes de rodar o confronto.</p>
    `,
    reviews: [
      {
        id: 'rev-1',
        reviewerId: 'usr-mariana',
        reviewerName: 'Mariana Santos',
        action: 'REQUEST_ADJUSTMENT',
        generalFeedback: 'O artigo está no caminho certo, porém faltam os prints explicativos da tela de desmembramento e a indicação do formato CSV aceito.',
        comments: [
          {
            id: 'c-1',
            authorName: 'Mariana Santos',
            authorRole: 'REVIEWER',
            message: 'Adicione um exemplo do cabeçalho esperado do arquivo SISPAG do Itaú.',
            isResolved: false,
            createdAt: '2026-09-12T14:30:00Z',
          },
          {
            id: 'c-2',
            authorName: 'Mariana Santos',
            authorRole: 'REVIEWER',
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
    title: 'Procedimento para Conciliação de Boletos com Liquidação Parcial',
    slug: 'conciliacao-boletos-liquidacao-parcial',
    categoryId: 'cat-5',
    categoryName: 'Confronto',
    authorId: 'usr-beatriz',
    authorName: 'Beatriz Lima',
    authorEmail: 'beatriz.suporte@conciliadorcontabil.com.br',
    currentStatus: 'PENDING',
    tags: ['Boletos', 'Confronto', 'Parcial'],
    viewCount: 12,
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
  },
  {
    id: 'tool-6',
    title: 'Central de Chamados N3 Movidesk',
    description: 'Canal de escalonamento para bugs de integração e incidentes em lote.',
    category: 'LINKS_OPERACIONAIS',
    resourceType: 'EXTERNAL_URL',
    targetUrl: 'https://conciliador-contabil2.movidesk.com/',
    orderIndex: 6,
    isActive: true,
  },
];
