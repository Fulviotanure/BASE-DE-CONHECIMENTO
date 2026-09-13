import React from 'react';
import {
  BookOpen,
  FileEdit,
  CheckSquare,
  Wrench,
  BarChart3,
  Users,
  PlusCircle,
  ExternalLink,
  Globe,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenNewArticle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onOpenNewArticle }) => {
  const { currentUser, articles, setIsAuthModalOpen } = useApp();

  const isExternal = currentUser?.role === 'READER' || currentUser?.userType === 'EXTERNAL';
  const isInternal = !isExternal && (currentUser?.userType === 'INTERNAL' || Boolean(currentUser?.email?.includes('conciliadorcontabil.com.br')));
  const canReview = isInternal && (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' || currentUser?.role === 'REVIEWER');
  const isAdmin = isInternal && (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN');

  const pendingCount = articles.filter((a) => a.currentStatus === 'PENDING').length;
  const myAdjustmentsCount = articles.filter(
    (a) => currentUser && a.authorEmail === currentUser.email && a.currentStatus === 'IN_ADJUSTMENT'
  ).length;

  // Itens de navegação para Colaboradores Internos
  const internalNavItems = [
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

  // Itens de navegação para Usuários Externos ou Visitantes
  const externalNavItems = [
    {
      id: 'external-portal',
      label: 'Portal do Cliente',
      icon: Globe,
      badge: 'Público',
      badgeColor: '#38bdf8',
    },
    {
      id: 'tools',
      label: 'Modelos & Downloads',
      icon: Wrench,
      badge: 'Templates',
      badgeColor: 'var(--color-secondary)',
    },
  ];

  const currentNavItems = isInternal ? internalNavItems : externalNavItems;

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
        {/* New Article Action Button (Apenas para colaboradores internos logados) */}
        {isInternal ? (
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
        ) : (
          <div style={{ marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(92, 183, 128, 0.1)',
                border: '1px solid rgba(92, 183, 128, 0.3)',
                color: 'var(--color-primary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <Lock size={14} />
              <span>Acesso Interno</span>
            </button>
          </div>
        )}

        {/* Section Label */}
        <div style={{ padding: '0 8px 8px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {isInternal ? 'Navegação Corporativa' : 'Portal Externo'}
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {currentNavItems.map((item) => {
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
                  border: 'none',
                  cursor: 'pointer',
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

      {/* Bottom Hub: Institutional Link */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
        {/* Institutional Link */}
        <a
          href="https://conciliadorcontabil.com.br/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            fontSize: '0.74rem',
            color: 'var(--text-subtle)',
            borderRadius: 'var(--radius-sm)',
            textDecoration: 'none',
            border: '1px solid transparent',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-primary)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-subtle)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <span>conciliadorcontabil.com.br</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </aside>
  );
};
