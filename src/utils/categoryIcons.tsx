import React from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * Lista curada de ícones populares para módulos da Base de Conhecimento,
 * agrupados por categorias úteis ao Conciliador Contábil.
 */
export interface IconOption {
  name: string;
  label: string;
  category: 'contabil' | 'dados' | 'regras' | 'suporte' | 'geral';
}

export const POPULAR_CATEGORY_ICONS: IconOption[] = [
  // Contábil & Financeiro
  { name: 'Scale', label: 'Balança / Confronto', category: 'contabil' },
  { name: 'Receipt', label: 'Recibo / Extrato', category: 'contabil' },
  { name: 'Landmark', label: 'Banco / Instituição', category: 'contabil' },
  { name: 'Calculator', label: 'Calculadora / Apuração', category: 'contabil' },
  { name: 'Wallet', label: 'Carteira / Saldo', category: 'contabil' },
  { name: 'CreditCard', label: 'Cartões / Adquirentes', category: 'contabil' },
  { name: 'Coins', label: 'Moedas / Tarifas', category: 'contabil' },
  { name: 'DollarSign', label: 'Financeiro / Pagamentos', category: 'contabil' },
  { name: 'FileSpreadsheet', label: 'Planilhas Excel', category: 'contabil' },
  { name: 'PieChart', label: 'Gráfico Pizza / Relatórios', category: 'contabil' },
  { name: 'BarChart3', label: 'Gráfico Barras / Métricas', category: 'contabil' },
  { name: 'TrendingUp', label: 'Tendências / Desempenho', category: 'contabil' },
  { name: 'Activity', label: 'Movimentações / Atividade Contábil', category: 'contabil' },

  // Dados & Integrações
  { name: 'Database', label: 'Banco de Dados / Cadastros', category: 'dados' },
  { name: 'FileDown', label: 'Importação de Arquivos', category: 'dados' },
  { name: 'FileUp', label: 'Exportação ERP', category: 'dados' },
  { name: 'ArrowLeftRight', label: 'Migração / De-Para', category: 'dados' },
  { name: 'Globe', label: 'Open Finance / Conexão Web', category: 'dados' },
  { name: 'Layers', label: 'Camadas / Módulos', category: 'dados' },
  { name: 'Workflow', label: 'Fluxo de Trabalho', category: 'dados' },
  { name: 'Cpu', label: 'Robôs / Automação', category: 'dados' },
  { name: 'Boxes', label: 'Pacotes / Lotes', category: 'dados' },
  { name: 'FolderArchive', label: 'Arquivos & Documentos', category: 'dados' },
  { name: 'Server', label: 'Servidor / Integração', category: 'dados' },

  // Regras & Configurações
  { name: 'Sliders', label: 'Regras Contábeis / Ajustes', category: 'regras' },
  { name: 'SlidersHorizontal', label: 'Configurações de Regra', category: 'regras' },
  { name: 'Settings', label: 'Configurações Gerais', category: 'regras' },
  { name: 'Wrench', label: 'Ferramentas / Utilitários', category: 'regras' },
  { name: 'Compass', label: 'Primeiros Passos / Guia', category: 'regras' },
  { name: 'ShieldCheck', label: 'Segurança & Validações', category: 'regras' },
  { name: 'Shield', label: 'Proteção / Governança', category: 'regras' },
  { name: 'Key', label: 'Chaves / Acesso', category: 'regras' },
  { name: 'Lock', label: 'Permissões & Trava', category: 'regras' },
  { name: 'CheckSquare', label: 'Checklist / Tarefas', category: 'regras' },

  // Suporte & Documentação
  { name: 'HelpCircle', label: 'FAQ / Perguntas Frequentes', category: 'suporte' },
  { name: 'LifeBuoy', label: 'Suporte & Chamados', category: 'suporte' },
  { name: 'BookMarked', label: 'Playbook / Procedimentos', category: 'suporte' },
  { name: 'BookOpen', label: 'Manual / Livro de Regras', category: 'suporte' },
  { name: 'FileText', label: 'Instruções & Documentos', category: 'suporte' },
  { name: 'FileCheck', label: 'Artigo Aprovado / Validação', category: 'suporte' },
  { name: 'Sparkles', label: 'Destaques / Boas Práticas', category: 'suporte' },
  { name: 'Terminal', label: 'Scripts & Comandos', category: 'suporte' },
  { name: 'Briefcase', label: 'Operacional / Negócios', category: 'suporte' },
];

const nonIconNames = new Set([
  'Icon',
  'LucideIcon',
  'createLucideIcon',
  'icons',
  'default',
]);

/**
 * Lista completa de todos os nomes de ícones únicos exportados pelo lucide-react (+4.100 ícones).
 * Permite busca em tempo real e listagem nativa sem necessidade de links externos.
 */
export const ALL_LUCIDE_ICON_NAMES: string[] = Object.keys(LucideIcons)
  .filter(
    (k) =>
      /^[A-Z]/.test(k) &&
      !k.endsWith('Icon') &&
      !nonIconNames.has(k) &&
      (typeof (LucideIcons as any)[k] === 'object' || typeof (LucideIcons as any)[k] === 'function')
  )
  .sort();


/**
 * Renderiza qualquer ícone do Lucide Icons pelo nome (PascalCase).
 * Se o ícone não for encontrado, utiliza um fallback amigável (Compass ou Folder).
 */
export const CategoryIcon: React.FC<{
  iconName?: string;
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ iconName, size = 18, color = 'var(--color-primary)', className, style }) => {
  if (!iconName) {
    const Fallback = (LucideIcons as any)['Compass'] || (LucideIcons as any)['Folder'];
    return Fallback ? <Fallback size={size} color={color} className={className} style={style} /> : null;
  }

  // Normaliza o nome para PascalCase caso o usuário tenha colado com minúsculas ou hífens
  const cleanName = iconName
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const IconComponent =
    (LucideIcons as any)[cleanName] ||
    (LucideIcons as any)[`${cleanName}Icon`] ||
    (LucideIcons as any)[iconName] ||
    (LucideIcons as any)['Compass'];

  if (!IconComponent) {
    return <span style={{ fontSize: size * 0.8, display: 'inline-flex', alignItems: 'center' }}>📁</span>;
  }

  return <IconComponent size={size} color={color} className={className} style={style} />;
};

/**
 * Retorna as cores de tema personalizadas para o módulo com base no nome do ícone
 */
export function getCategoryThemeColors(iconName?: string) {
  switch (iconName) {
    case 'Compass':
      return { color: '#5cb780', bg: 'rgba(92, 183, 128, 0.12)', border: 'rgba(92, 183, 128, 0.28)' };
    case 'Database':
      return { color: '#818cf8', bg: 'rgba(129, 140, 248, 0.12)', border: 'rgba(129, 140, 248, 0.28)' };
    case 'FileDown':
      return { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.28)' };
    case 'Sliders':
    case 'SlidersHorizontal':
      return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)', border: 'rgba(251, 191, 36, 0.28)' };
    case 'Scale':
      return { color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.28)' };
    case 'FileUp':
      return { color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.12)', border: 'rgba(167, 139, 250, 0.28)' };
    case 'Globe':
      return { color: '#22d3ee', bg: 'rgba(34, 211, 238, 0.12)', border: 'rgba(34, 211, 238, 0.28)' };
    case 'ArrowLeftRight':
      return { color: '#f472b6', bg: 'rgba(244, 114, 182, 0.12)', border: 'rgba(244, 114, 182, 0.28)' };
    case 'HelpCircle':
      return { color: '#fb923c', bg: 'rgba(251, 146, 60, 0.12)', border: 'rgba(251, 146, 60, 0.28)' };
    case 'LifeBuoy':
      return { color: '#f87171', bg: 'rgba(248, 113, 113, 0.12)', border: 'rgba(248, 113, 113, 0.28)' };
    case 'BookMarked':
      return { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.28)' };
    case 'Terminal':
      return { color: '#4ade80', bg: 'rgba(74, 222, 128, 0.12)', border: 'rgba(74, 222, 128, 0.28)' };
    case 'Receipt':
    case 'Wallet':
    case 'Landmark':
      return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.28)' };
    case 'Calculator':
    case 'CreditCard':
      return { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.28)' };
    case 'PieChart':
    case 'BarChart3':
      return { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.28)' };
    default:
      return { color: '#5cb780', bg: 'rgba(92, 183, 128, 0.12)', border: 'rgba(92, 183, 128, 0.28)' };
  }
}
