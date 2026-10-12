import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileEdit,
  CheckSquare,
  Wrench,
  BarChart3,
  Users,
  ExternalLink,
  Layers,
  Globe,
  Lock,
  Compass,
  Database,
  FileDown,
  Sliders,
  Scale,
  FileUp,
  ArrowLeftRight,
  HelpCircle,
  LifeBuoy,
  BookMarked,
  Terminal,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isInternalUser, isExternalUser } from '../../services/authService';
import { CategoryIcon, getCategoryThemeColors } from '../../utils/categoryIcons';
import type { Article } from '../../types';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenNewArticle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onOpenNewArticle }) => {
  const {
    currentUser,
    articles,
    categories,
    selectedArticle,
    setSelectedArticle,
    incrementArticleView,
    setIsAuthModalOpen,
    theme,
  } = useApp();

  const isDark = theme === 'dark';

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('conciliador_sidebar_collapsed') === 'true';
  });

  const [openCategoryIds, setOpenCategoryIds] = useState<Record<string, boolean>>({
    'cat-1': true,
  });

  // Estado para expandir e recolher grupos de navegação com subitens (ex: Dashboard & Métricas)
  const [openNavGroupIds, setOpenNavGroupIds] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('conciliador_open_nav_groups');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return { dashboard: true };
  });

  const toggleNavGroup = (groupId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOpenNavGroupIds((prev) => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      localStorage.setItem('conciliador_open_nav_groups', JSON.stringify(next));
      return next;
    });
  };

  // Auto-expandir grupo ao navegar diretamente para ele
  useEffect(() => {
    if (activeView === 'dashboard' || activeView === 'dashboard-articles' || activeView === 'dashboard-users') {
      setOpenNavGroupIds((prev) => {
        if (!prev.dashboard) {
          const next = { ...prev, dashboard: true };
          localStorage.setItem('conciliador_open_nav_groups', JSON.stringify(next));
          return next;
        }
        return prev;
      });
    }
  }, [activeView]);

  // Auto-expandir a categoria do artigo selecionado
  useEffect(() => {
    if (selectedArticle) {
      setOpenCategoryIds((prev) => ({ ...prev, [selectedArticle.categoryId]: true }));
    }
  }, [selectedArticle]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('conciliador_sidebar_collapsed', String(next));
      return next;
    });
  };

  const toggleCategory = (catId: string) => {
    setOpenCategoryIds((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleSelectArticle = (art: Article) => {
    setSelectedArticle(art);
    setActiveView('kb');
    incrementArticleView(art.id);
  };

  // Cores temáticas por módulo com leve transparência
  const getCategoryTheme = (iconName: string) => {
    return getCategoryThemeColors(iconName);
  };

  // Ícones por módulo com suporte a qualquer ícone Lucide
  const getCategoryIcon = (iconName: string, size = 16) => {
    const theme = getCategoryThemeColors(iconName);
    return <CategoryIcon iconName={iconName} size={size} color={theme.color} />;
  };

  const isInternal = isInternalUser(currentUser);
  const isExternal = isExternalUser(currentUser);
  const canReview = isInternal && (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' || currentUser?.role === 'REVIEWER');
  const isAdmin = isInternal && (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN');

  // Módulos internos são estritamente para colaboradores internos (nunca visíveis para clientes/leitores externos)
  const isInternalCategory = (cat: { id: string; title: string; accessLevel?: 'INTERNAL' | 'ALL' }) =>
    cat.accessLevel === 'INTERNAL' ||
    cat.title.toLowerCase().includes('playbook') ||
    cat.id === 'cat-11' ||
    cat.id === 'cat-12';

  const displayedCategories = categories.filter((c) => !isExternal || !isInternalCategory(c));

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
      badge: null,
    },
    ...(canReview
      ? [
          {
            id: 'dashboard',
            label: 'Dashboard & Métricas',
            icon: BarChart3,
            badge: null,
            subItems: [
              { id: 'dashboard-articles', label: 'Artigos', icon: FileText },
              { id: 'dashboard-users', label: 'Usuários', icon: Users },
            ],
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            id: 'users',
            label: 'Gestão de Usuários',
            icon: Users,
            badge: null,
          },
          {
            id: 'modules',
            label: 'Gestão de Módulos',
            icon: Layers,
            badge: null,
          },
        ]
      : []),
  ];

  // Itens de navegação para Usuários Externos ou Clientes (Apenas Base de Conhecimento)
  const externalNavItems = [
    {
      id: 'kb',
      label: 'Base de Conhecimento',
      icon: BookOpen,
      badge: null as string | null,
      badgeColor: undefined as string | undefined,
      subItems: undefined as { id: string; label: string; icon: any }[] | undefined,
    },
  ];

  const currentNavItems = isInternal ? internalNavItems : externalNavItems;

  // Artigos visíveis na árvore (exclui Playbooks se for cliente)
  const visibleArticles = articles.filter((a) => {
    if (isExternal) {
      const isPb =
        a.categoryName?.toLowerCase().includes('playbook') ||
        a.categoryId === 'cat-11' ||
        a.categoryId === 'cat-12';
      if (isPb) return false;
      return a.currentStatus === 'APPROVED' && (a.accessLevel === 'ALL' || a.accessLevel === 'EXTERNAL');
    }
    if (isAdmin) return true;
    return (
      a.currentStatus === 'APPROVED' ||
      a.authorId === currentUser?.uid ||
      a.authorEmail?.toLowerCase() === currentUser?.email?.toLowerCase()
    );
  });

  return (
    <aside
      style={{
        width: isCollapsed ? '72px' : '275px',
        minWidth: isCollapsed ? '72px' : '275px',
        background: isDark ? 'rgba(15, 23, 42, 0.78)' : 'rgba(255, 255, 255, 0.90)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: isDark ? '4px 0 24px rgba(0, 0, 0, 0.3)' : '4px 0 20px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: isCollapsed ? '16px 8px' : '16px 12px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none',
        zIndex: 20,
      }}
    >
      <div>
        {/* Topo da Barra: Botão de Minimizar / Expandir */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            marginBottom: '16px',
            paddingBottom: '10px',
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          {!isCollapsed && (
            <span
              onClick={() => {
                setSelectedArticle(null);
                setActiveView('kb');
              }}
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--text-subtle)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
              title="Retornar à página inicial da Base de Conhecimento"
            >
              {isInternal ? 'Navegação' : 'Base de Conhecimento'}
            </span>
          )}
          <button
            type="button"
            onClick={toggleCollapse}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '5px 7px',
              borderRadius: 'var(--radius-sm)',
              color: isDark ? 'var(--text-muted)' : '#64748b',
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
            }}
            title={isCollapsed ? 'Expandir barra lateral' : 'Minimizar barra lateral (apenas ícones)'}
          >
            {isCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Links Principais de Navegação */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isDashboardGroup = item.id === 'dashboard';
            const isActive = isDashboardGroup
              ? (activeView === 'dashboard' || activeView === 'dashboard-articles' || activeView === 'dashboard-users')
              : activeView === item.id;
            const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
            const isGroupOpen = !!openNavGroupIds[item.id];

            return (
              <React.Fragment key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (hasSubItems) {
                      if (isCollapsed) {
                        if (isDashboardGroup) {
                          setActiveView('dashboard-articles');
                        } else {
                          setActiveView(item.id);
                        }
                        return;
                      }

                      // Se já está na aba ativa e aberto, clicar alterna (recolhe)
                      if (isActive && isGroupOpen) {
                        toggleNavGroup(item.id);
                      } else {
                        // Se estava fechado, expande
                        if (!isGroupOpen) {
                          toggleNavGroup(item.id);
                        }
                        // Navega para a visão padrão caso não esteja já nela
                        if (isDashboardGroup) {
                          if (activeView !== 'dashboard-articles' && activeView !== 'dashboard-users') {
                            setActiveView('dashboard-articles');
                          }
                        } else {
                          setActiveView(item.id);
                        }
                      }
                    } else {
                      setActiveView(item.id);
                      if (item.id === 'kb') {
                        setSelectedArticle(null);
                      }
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    padding: isCollapsed ? '10px 0' : '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.86rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive 
                      ? (isDark ? 'var(--color-primary)' : '#166534') 
                      : (isDark ? 'var(--text-main)' : '#0f172a'),
                    background: isActive 
                      ? (isDark ? 'var(--color-primary-subtle)' : 'rgba(92, 183, 128, 0.18)') 
                      : 'transparent',
                    transition: 'all 0.18s ease',
                    textAlign: 'left',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = isDark ? 'var(--bg-card-hover)' : 'rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={18} color={isActive ? (isDark ? 'var(--color-primary)' : '#166534') : (isDark ? 'var(--text-muted)' : '#64748b')} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                      {hasSubItems && (
                        <span
                          onClick={(e) => toggleNavGroup(item.id, e)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isActive ? (isDark ? 'var(--color-primary)' : '#166534') : 'var(--text-subtle)',
                            padding: '2px 3px',
                            borderRadius: '4px',
                            transition: 'all 0.15s ease',
                          }}
                          title={isGroupOpen ? 'Recolher submenu' : 'Expandir submenu'}
                        >
                          {isGroupOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </span>
                      )}
                    </div>
                  )}
                </button>

                {/* Sub-itens de navegação na barra lateral (Expandir e Recolher) */}
                {!isCollapsed && hasSubItems && isGroupOpen && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      paddingLeft: '24px',
                      margin: '2px 0 4px 0',
                      animation: 'fadeIn 0.15s ease',
                    }}
                  >
                    {item.subItems?.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive =
                        (sub.id === 'dashboard-articles' && (activeView === 'dashboard' || activeView === 'dashboard-articles')) ||
                        (sub.id === 'dashboard-users' && activeView === 'dashboard-users');

                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setActiveView(sub.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.80rem',
                            fontWeight: isSubActive ? 700 : 500,
                            color: isSubActive ? 'var(--color-primary)' : (isDark ? 'var(--text-muted)' : '#64748b'),
                            background: isSubActive ? (isDark ? 'rgba(92, 183, 128, 0.12)' : 'rgba(92, 183, 128, 0.14)') : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease',
                            width: '100%',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSubActive) e.currentTarget.style.background = isDark ? 'var(--bg-card-hover)' : 'rgba(0, 0, 0, 0.04)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSubActive) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <SubIcon size={14} color={isSubActive ? 'var(--color-primary)' : (isDark ? 'var(--text-subtle)' : '#94a3b8')} />
                          <span>{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* ==================================================================
            ÁRVORE DE CONTEÚDO (MÓDULOS E ARTIGOS)
            Aparece abaixo do último item de Gestão de Usuários
            quando na Base de Conhecimento
            ================================================================== */}
        {activeView === 'kb' && (
          <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            {!isCollapsed ? (
              <div style={{ padding: '0 6px 8px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Módulos & Manuais
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-primary)', background: 'rgba(92, 183, 128, 0.12)', padding: '1px 6px', borderRadius: '10px' }}>
                  {visibleArticles.length}
                </span>
              </div>
            ) : (
              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '8px 0' }} />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {displayedCategories.map((cat) => {
                const catArticles = visibleArticles.filter((a) => a.categoryId === cat.id);
                const isOpen = !!openCategoryIds[cat.id];
                const theme = getCategoryTheme(cat.icon);

                if (isCollapsed) {
                  // MODO MINIMIZADO: Apenas Ícones dos Módulos e, ao abrir, apenas o CC-XXX dos artigos
                  return (
                    <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        title={`${cat.title} (${catArticles.length} manuais)`}
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isOpen ? theme.bg : (isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0,0,0,0.04)'),
                          border: isOpen ? `1px solid ${theme.color}` : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.08)'),
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = isOpen ? theme.bg : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.07)'))}
                        onMouseLeave={(e) => (e.currentTarget.style.background = isOpen ? theme.bg : (isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0,0,0,0.04)'))}
                      >
                        {getCategoryIcon(cat.icon, 18)}
                        {catArticles.length > 0 && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              fontSize: '0.58rem',
                              fontWeight: 800,
                              padding: '0 3px',
                              borderRadius: '6px',
                              background: theme.color,
                              color: '#fff',
                            }}
                          >
                            {catArticles.length}
                          </span>
                        )}
                      </button>

                      {/* Artigos no Modo Minimizado: apenas CC-XXX */}
                      {isOpen && catArticles.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center', width: '100%', marginTop: '3px', paddingBottom: '4px' }}>
                          {catArticles.map((art) => {
                            const isSelected = selectedArticle?.id === art.id;
                            return (
                              <button
                                key={art.id}
                                type="button"
                                onClick={() => handleSelectArticle(art)}
                                title={art.title}
                                style={{
                                  width: '50px',
                                  padding: '3px 2px',
                                  borderRadius: '4px',
                                  fontSize: '0.62rem',
                                  fontFamily: 'monospace',
                                  fontWeight: 800,
                                  textAlign: 'center',
                                  background: isSelected ? theme.color : (isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(0,0,0,0.06)'),
                                  color: isSelected ? '#ffffff' : theme.color,
                                  border: isSelected ? `1px solid ${theme.color}` : `1px solid ${theme.border}`,
                                  cursor: 'pointer',
                                  transition: 'all 0.12s ease',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {art.code || 'CC'}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // MODO EXPANDIDO: Ícone + Título + Chevron + Contador, com artigos diretamente abaixo
                return (
                  <div key={cat.id} style={{ marginBottom: '3px' }}>
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.80rem',
                        fontWeight: 600,
                        color: isOpen
                          ? (isDark ? '#ffffff' : '#0f172a')
                          : (isDark ? 'var(--text-muted)' : '#475569'),
                        background: isOpen ? theme.bg : (isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'),
                        border: isOpen ? `1px solid ${theme.border}` : '1px solid transparent',
                        borderLeft: isOpen ? `3px solid ${theme.color}` : '3px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = isOpen ? theme.bg : (isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0,0,0,0.05)'))}
                      onMouseLeave={(e) => (e.currentTarget.style.background = isOpen ? theme.bg : (isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'))}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
                        <span style={{ color: 'var(--text-subtle)', display: 'flex' }}>
                          {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                        </span>
                        {getCategoryIcon(cat.icon, 15)}
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cat.title}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '10px',
                          background: isOpen
                            ? (isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.12)')
                            : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)'),
                          color: isOpen ? theme.color : (isDark ? 'var(--text-subtle)' : '#64748b'),
                          border: `1px solid ${isOpen ? theme.border : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.1)')}`,
                        }}
                      >
                        {catArticles.length}
                      </span>
                    </button>

                    {/* Artigos Diretamente Abaixo do Módulo (Sem Subpastas!) */}
                    {isOpen && (
                      <div style={{ paddingLeft: '12px', borderLeft: `1px solid ${theme.border}`, marginLeft: '12px', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        {catArticles.length === 0 ? (
                          <div style={{ fontSize: '0.70rem', color: 'var(--text-subtle)', padding: '4px 6px', fontStyle: 'italic' }}>
                            Nenhum manual cadastrado
                          </div>
                        ) : (
                          catArticles.map((art) => {
                            const isSelected = selectedArticle?.id === art.id;
                            return (
                              <button
                                key={art.id}
                                type="button"
                                onClick={() => handleSelectArticle(art)}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '5px 7px',
                                  borderRadius: 'var(--radius-sm)',
                                  cursor: 'pointer',
                                  background: isSelected ? (isDark ? theme.bg : 'rgba(92, 183, 128, 0.16)') : 'transparent',
                                  borderLeft: isSelected ? `3px solid ${theme.color}` : '3px solid transparent',
                                  borderTop: 'none',
                                  borderRight: 'none',
                                  borderBottom: 'none',
                                  color: isSelected
                                    ? (isDark ? '#ffffff' : '#0f172a')
                                    : (isDark ? 'var(--text-muted)' : '#334155'),
                                  fontWeight: isSelected ? 700 : 500,
                                  fontSize: '0.74rem',
                                  transition: 'all 0.1s ease',
                                  textAlign: 'left',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
                                    e.currentTarget.style.color = isDark ? '#ffffff' : '#0f172a';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = isDark ? 'var(--text-muted)' : '#334155';
                                  }
                                }}
                                title={`${art.code || ''} - ${art.title}`}
                              >
                                {art.code && (
                                  <span
                                    style={{
                                      fontSize: '0.64rem',
                                      fontFamily: 'monospace',
                                      fontWeight: 800,
                                      padding: '1px 4px',
                                      borderRadius: '3px',
                                      background: isSelected ? theme.color : (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0,0,0,0.06)'),
                                      color: isSelected ? '#ffffff' : theme.color,
                                      border: `1px solid ${isSelected ? theme.color : theme.border}`,
                                      flexShrink: 0,
                                    }}
                                  >
                                    {art.code}
                                  </span>
                                )}
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {art.title}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Rodapé da Barra: Link Institucional */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '16px' }}>
        <a
          href="https://conciliadorcontabil.com.br/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: isCollapsed ? '6px 0' : '6px 8px',
            fontSize: '0.72rem',
            color: 'var(--text-subtle)',
            borderRadius: 'var(--radius-sm)',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
          title="conciliadorcontabil.com.br"
        >
          {!isCollapsed && <span>conciliadorcontabil.com.br</span>}
          <ExternalLink size={13} />
        </a>
      </div>
    </aside>
  );
};
