import React from 'react';
import {
  BookOpen,
  FileEdit,
  CheckSquare,
  Wrench,
  BarChart3,
  Users,
  Flame,
  PlusCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenNewArticle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onOpenNewArticle }) => {
  const { currentUser, articles, users, setIsConfigModalOpen } = useApp();

  const pendingCount = articles.filter((a) => a.currentStatus === 'PENDING').length;
  const myAdjustmentsCount = articles.filter(
    (a) => a.authorEmail === currentUser.email && a.currentStatus === 'IN_ADJUSTMENT'
  ).length;

  const canReview = currentUser.role === 'ADMIN' || currentUser.role === 'REVIEWER';
  const isAdmin = currentUser.role === 'ADMIN';

  const navItems = [
    {
      id: 'kb',
      label: 'Base de Conhecimento',
      icon: BookOpen,
      badge: null,
    },
    {
      id: 'my-articles',
      label: 'Meus Artigos',
      icon: FileEdit,
      badge: myAdjustmentsCount > 0 ? `${myAdjustmentsCount} p/ ajuste` : null,
      badgeColor: 'var(--status-adjust)',
    },
    ...(canReview
      ? [
          {
            id: 'queue',
            label: 'Fila Editorial',
            icon: CheckSquare,
            badge: pendingCount > 0 ? `${pendingCount}` : null,
            badgeColor: 'var(--status-pending)',
          },
        ]
      : []),
    {
      id: 'tools',
      label: 'Central de Ferramentas',
      icon: Wrench,
      badge: 'Softwares',
      badgeColor: 'var(--color-secondary)',
    },
    ...(canReview
      ? [
          {
            id: 'dashboard',
            label: 'Dashboard & Métricas',
            icon: BarChart3,
            badge: null,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            id: 'users',
            label: 'Gestão de Usuários (RBAC)',
            icon: Users,
            badge: 'Admin',
            badgeColor: 'var(--color-primary)',
          },
        ]
      : []),
  ];

  return (
    <aside
      style={{
        width: '260px',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 12px',
        userSelect: 'none',
      }}
    >
      <div>
        {/* New Article Action Button */}
        <button
          type="button"
          onClick={onOpenNewArticle}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '10px 14px',
            marginBottom: '20px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <PlusCircle size={17} />
          <span>Redigir Novo Artigo</span>
        </button>

        {/* Section Label */}
        <div style={{ padding: '0 8px 8px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Navegação Principal
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-primary)' : 'var(--text-main)',
                  background: isActive ? 'var(--color-primary-subtle)' : 'transparent',
                  transition: 'all 0.18s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-card-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} color={isActive ? 'var(--color-primary)' : 'var(--text-muted)'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-full)',
                      background: item.badgeColor || 'var(--color-primary)',
                      color: '#ffffff',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Hub: Firebase Setup & Platform Info */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Firebase Config Trigger */}
        <button
          type="button"
          onClick={() => setIsConfigModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
        >
          <Flame size={16} color="#f59e0b" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'var(--text-main)', fontSize: '0.78rem' }}>Configurar Firebase</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>Chaves e Projeto</span>
          </div>
        </button>

        {/* Institutional Link */}
        <a
          href="https://conciliadorcontabil.com.br/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 12px',
            fontSize: '0.74rem',
            color: 'var(--text-subtle)',
            borderRadius: 'var(--radius-sm)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
        >
          <span>conciliadorcontabil.com.br</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </aside>
  );
};
