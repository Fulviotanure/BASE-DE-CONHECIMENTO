import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
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

  // Cores temáticas por módulo com leve transparência (no padrão dos cards da tela inicial)
  const getCategoryTheme = (iconName: string) => {
    switch (iconName) {
      case 'Compass': return { color: '#5cb780', bg: 'rgba(92, 183, 128, 0.12)', border: 'rgba(92, 183, 128, 0.28)' };
      case 'Database': return { color: '#818cf8', bg: 'rgba(129, 140, 248, 0.12)', border: 'rgba(129, 140, 248, 0.28)' };
      case 'FileDown': return { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.28)' };
      case 'Sliders': return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)', border: 'rgba(251, 191, 36, 0.28)' };
      case 'Scale': return { color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.28)' };
      case 'FileUp': return { color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.12)', border: 'rgba(167, 139, 250, 0.28)' };
      case 'Globe': return { color: '#22d3ee', bg: 'rgba(34, 211, 238, 0.12)', border: 'rgba(34, 211, 238, 0.28)' };
      case 'ArrowLeftRight': return { color: '#f472b6', bg: 'rgba(244, 114, 182, 0.12)', border: 'rgba(244, 114, 182, 0.28)' };
      case 'HelpCircle': return { color: '#fb923c', bg: 'rgba(251, 146, 60, 0.12)', border: 'rgba(251, 146, 60, 0.28)' };
      case 'LifeBuoy': return { color: '#f87171', bg: 'rgba(248, 113, 113, 0.12)', border: 'rgba(248, 113, 113, 0.28)' };
      case 'BookMarked': return { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.28)' };
      case 'Terminal': return { color: '#4ade80', bg: 'rgba(74, 222, 128, 0.12)', border: 'rgba(74, 222, 128, 0.28)' };
      default: return { color: '#5cb780', bg: 'rgba(92, 183, 128, 0.12)', border: 'rgba(92, 183, 128, 0.28)' };
    }
  };

  // Ícones por módulo
  const getCategoryIcon = (iconName: string, size = 16) => {
    switch (iconName) {
      case 'Compass': return <Compass size={size} color="#5cb780" />;
      case 'Database': return <Database size={size} color="#6c63ff" />;
      case 'FileDown': return <FileDown size={size} color="#3b82f6" />;
      case 'Sliders': return <Sliders size={size} color="#f59e0b" />;
      case 'Scale': return <Scale size={size} color="#10b981" />;
      case 'FileUp': return <FileUp size={size} color="#8b5cf6" />;
      case 'Globe': return <Globe size={size} color="#06b6d4" />;
      case 'ArrowLeftRight': return <ArrowLeftRight size={size} color="#ec4899" />;
      case 'HelpCircle': return <HelpCircle size={size} color="#f97316" />;
      case 'LifeBuoy': return <LifeBuoy size={size} color="#ef4444" />;
      case 'BookMarked': return <BookMarked size={size} color="#38bdf8" />;
      case 'Terminal': return <Terminal size={size} color="#10b981" />;
      default: return <Compass size={size} color="#5cb780" />;
    }
  };

  const isExternal = currentUser?.role === 'READER' || currentUser?.userType === 'EXTERNAL';
  const isInternal = !isExternal && (currentUser?.userType === 'INTERNAL' || Boolean(currentUser?.email?.includes('conciliadorcontabil.com.br')));
  const canReview = isInternal && (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' || currentUser?.role === 'REVIEWER');
  const isAdmin = isInternal && (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN');

  // Playbooks são estritamente para colaboradores internos (nunca visíveis para clientes)
  const isPlaybookCategory = (cat: { id: string; title: string }) =>
    cat.title.toLowerCase().includes('playbook') ||
    cat.id === 'cat-11' ||
    cat.id === 'cat-12';

  const displayedCategories = categories.filter((c) => !isExternal || !isPlaybookCategory(c));

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

  // Itens de navegação para Usuários Externos ou Clientes (Apenas Base de Conhecimento)
  const externalNavItems = [
    {
      id: 'kb',
      label: 'Base de Conhecimento',
      icon: BookOpen,
      badge: null as string | null,
      badgeColor: undefined as string | undefined,
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

        {/* Botão Novo Artigo (Apenas Colaboradores Internos) */}
        {isInternal && (
          <button
            type="button"
            onClick={onOpenNewArticle}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: isCollapsed ? '9px 0' : '10px 14px',
              marginBottom: '18px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isCollapsed ? '0' : '8px',
            }}
            title={isCollapsed ? 'Redigir Novo Artigo' : undefined}
          >
            <PlusCircle size={18} />
            {!isCollapsed && <span>Redigir Novo Artigo</span>}
          </button>
        )}

        {/* Links Principais de Navegação */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveView(item.id);
                  if (item.id === 'kb') {
                    setSelectedArticle(null);
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
                {!isCollapsed && item.badge && (
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

        {/* ==================================================================
            ÁRVORE DE CONTEÚDO (MÓDULOS E ARTIGOS)
            Aparece abaixo do último item de Gestão de Usuários
            quando na Base de Conhecimento
            ================================================================== */}
        {(activeView === 'kb' || activeView === 'external-portal') && (
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
