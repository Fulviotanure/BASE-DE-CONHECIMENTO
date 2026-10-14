import React, { useState, useEffect } from 'react';
import {
  Compass,
  Database,
  FileDown,
  Sliders,
  Scale,
  FileUp,
  Globe,
  ArrowLeftRight,
  HelpCircle,
  LifeBuoy,
  BookMarked,
  Terminal,
  ChevronRight,
  Calendar,
  User,
  Tag,
  Eye,
  ArrowLeft,
  Share2,
  Check,
  Bookmark,
  FileEdit,
  Pencil,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Layers,
  Search,
  X,
  MessageSquare,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isInternalUser, isExternalUser } from '../../services/authService';
import { CategoryIcon, getCategoryThemeColors } from '../../utils/categoryIcons';
import type { Article } from '../../types';
import { INITIAL_ARTICLES } from '../../data/initialSeed';
import { useArticleImageFallback } from '../../utils/imageFallback';

interface KnowledgeBaseViewProps {
  onOpenNewArticle: () => void;
  onProposeEdit?: (art: Article) => void;
  onEditArticle?: (art: Article) => void;
  onOpenModuleManagement?: () => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({ 
  onOpenNewArticle,
  onProposeEdit,
  onEditArticle,
  onOpenModuleManagement,
}) => {
  const {
    categories,
    articles,
    selectedCategory,
    setSelectedCategory,
    selectedArticle,
    setSelectedArticle,
    incrementArticleView,
    voteArticle,
    currentUser,
    theme,
    setIsSearchOpen,
  } = useApp();

  const isDark = theme === 'dark';

  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const articleBodyRef = React.useRef<HTMLDivElement>(null);

  // Intercepta imagens quebradas para exibir fallback amigável
  useArticleImageFallback(articleBodyRef, [selectedArticle?.id, selectedArticle?.contentHtml]);

  // Mapeamento dinâmico de ícones por nome (suporta qualquer ícone Lucide)
  const getCategoryIcon = (iconName: string, size = 20) => {
    const theme = getCategoryThemeColors(iconName);
    return <CategoryIcon iconName={iconName} size={size} color={theme.color} />;
  };

  const isInternal = isInternalUser(currentUser);
  const isExternal = isExternalUser(currentUser);
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isAdmin = isSuperAdmin || currentUser?.role === 'ADMIN';
  const isReaderMode = isExternal || currentUser?.role === 'READER';

  // Se o usuário alternar para o modo leitor/externo e um artigo confidencial, interno ou playbook estiver aberto, retorna à listagem pública
  useEffect(() => {
    if (selectedArticle && isExternal) {
      const parentCat = categories.find((c) => c.id === selectedArticle.categoryId);
      const isInternalMod = parentCat
        ? parentCat.accessLevel === 'INTERNAL' ||
          parentCat.title.toLowerCase().includes('playbook') ||
          parentCat.id === 'cat-11' ||
          parentCat.id === 'cat-12'
        : false;
      const isPb =
        selectedArticle.categoryName?.toLowerCase().includes('playbook') ||
        selectedArticle.categoryId === 'cat-11' ||
        selectedArticle.categoryId === 'cat-12';
      const isRestricted =
        isInternalMod ||
        isPb ||
        selectedArticle.accessLevel === 'INTERNAL' ||
        selectedArticle.currentStatus !== 'APPROVED';
      if (isRestricted) {
        setSelectedArticle(null);
      }
    }
  }, [selectedArticle, isExternal, setSelectedArticle, categories]);

  // Módulos internos são estritamente para colaboradores internos (nunca visíveis para leitores externos)
  const isInternalCategory = (cat: { id: string; title: string; accessLevel?: 'INTERNAL' | 'ALL' }) =>
    cat.accessLevel === 'INTERNAL' ||
    cat.title.toLowerCase().includes('playbook') ||
    cat.id === 'cat-11' ||
    cat.id === 'cat-12';

  const displayedCategories = categories.filter((c) => !isExternal || !isInternalCategory(c));

  // Artigos visíveis com fallback imediato
  const sourceArticles = articles && articles.length > 0 ? articles : INITIAL_ARTICLES;

  const visibleArticles = sourceArticles.filter((a) => {
    if (isExternal) {
      const parentCat = categories.find((c) => c.id === a.categoryId);
      if (parentCat && isInternalCategory(parentCat)) return false;

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

  // Artigos filtrados por categoria e termo de pesquisa
  const filteredArticles = visibleArticles.filter((art) => {
    if (selectedCategory && art.categoryId !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchTitle = art.title.toLowerCase().includes(q);
    const matchCategory = art.categoryName?.toLowerCase().includes(q) || false;
    const matchTags = art.tags?.some((t) => t.toLowerCase().includes(q)) || false;
    const matchContent = art.contentHtml?.toLowerCase().includes(q) || false;
    const matchCode = art.code?.toLowerCase().includes(q) || false;
    return matchTitle || matchCategory || matchTags || matchContent || matchCode;
  });

  const handleSelectArticle = (art: Article) => {
    setSelectedArticle(art);
    setSelectedCategory(art.categoryId);
    incrementArticleView(art.id);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        padding: '24px 32px 60px 24px',
        boxSizing: 'border-box',
        position: 'relative',
        backgroundImage: isDark ? 'url(/internal-dark-bg.jpg)' : 'url(/internal-light-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
      className="animate-fade-in"
    >
      {/* Overlay adaptativo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'linear-gradient(135deg, rgba(10, 18, 35, 0.88) 0%, rgba(5, 15, 30, 0.82) 100%)'
            : 'linear-gradient(135deg, rgba(220, 252, 231, 0.78) 0%, rgba(187, 247, 208, 0.72) 50%, rgba(209, 250, 229, 0.78) 100%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
      {selectedArticle ? (
        /* ==================================================================
           TELA DE LEITURA DO ARTIGO (EXPANDIDA EM QUASE TODA A TELA)
           ================================================================== */
        <div style={{ width: '100%' }}>
          {/* Breadcrumb de Navegação */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.84rem',
              color: 'var(--text-subtle)',
              marginBottom: '20px',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedArticle(null)}
              style={{
                color: 'var(--color-primary)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={15} />
              <span>Voltar aos Módulos</span>
            </button>
            <span>/</span>
            <span
              onClick={() => {
                setSelectedCategory(selectedArticle.categoryId);
                setSelectedArticle(null);
              }}
              style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              {selectedArticle.categoryName}
            </span>
            <span>/</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{selectedArticle.title}</span>
          </div>

          {/* Cabeçalho do Artigo (Card Largo de Alta Amplitude) */}
          <div className="card" style={{ marginBottom: '22px', padding: '26px 32px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(92, 183, 128, 0.15)',
                    color: 'var(--color-primary)',
                    border: '1px solid rgba(92, 183, 128, 0.35)',
                    fontFamily: 'monospace',
                    letterSpacing: '0.04em',
                  }}
                >
                  {selectedArticle.code || 'CC-DOC'}
                </span>
                <span style={{ fontSize: '0.80rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
                  Código Único
                </span>
                {selectedArticle.currentStatus === 'NEEDS_REVISION' ? (
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '2px 9px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    🚨 Revisão Obrigatória (5 Deslikes)
                  </span>
                ) : selectedArticle.currentStatus === 'APPROVED' ? (
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '2px 9px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    Oficial & Aprovado
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '2px 9px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(245, 158, 11, 0.12)',
                      color: '#f59e0b',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    Em Revisão
                  </span>
                )}
              </div>

              {/* Ações: Editar (Admin) / Propor Edição (Operador) & Compartilhar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* Botão Editar direto — apenas para Admin e Super Admin */}
                {isAdmin && onEditArticle && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => onEditArticle(selectedArticle)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 700,
                      padding: '7px 14px',
                      fontSize: '0.84rem',
                    }}
                    title="Editar este artigo diretamente"
                  >
                    <Pencil size={14} />
                    <span>Editar Artigo</span>
                  </button>
                )}
                {onProposeEdit && !isExternal && !isAdmin && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onProposeEdit(selectedArticle)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderColor: 'rgba(92, 183, 128, 0.4)',
                      color: 'var(--color-primary)',
                      fontWeight: 700,
                      padding: '6px 12px',
                    }}
                    title="Propor alteração ou melhoria neste manual"
                  >
                    <FileEdit size={14} />
                    <span>Propor Edição</span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopyLink}
                  style={{ padding: '6px 12px' }}
                  title="Copiar link permanente"
                >
                  {copiedLink ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
                  <span>{copiedLink ? 'Copiado!' : 'Compartilhar'}</span>
                </button>
              </div>
            </div>

            {/* Título Principal */}
            <h1
              style={{
                fontSize: '2rem',
                lineHeight: 1.28,
                color: 'var(--text-main)',
                margin: '0 0 16px 0',
                fontWeight: 800,
              }}
            >
              {selectedArticle.title}
            </h1>

            {/* Metadados */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                fontSize: '0.84rem',
                color: 'var(--text-subtle)',
                flexWrap: 'wrap',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} />
                <span>Por <strong>{selectedArticle.authorName}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} />
                <span>Atualizado em {new Date(selectedArticle.updatedAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={14} />
                <span>{selectedArticle.viewCount || 0} visualizações</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ThumbsUp size={14} color="#10b981" />
                <span>{selectedArticle.likesCount || 0}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ThumbsDown size={14} color="#ef4444" />
                <span>{selectedArticle.dislikesCount || 0}</span>
              </div>
            </div>

            {/* Tags */}
            {selectedArticle.tags && selectedArticle.tags.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '14px' }}>
                <Tag size={13} color="var(--text-subtle)" />
                {selectedArticle.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '0.74rem',
                      padding: '2px 8px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Corpo do Artigo Alargado (Quase Toda a Largura da Tela) */}
          <div
            ref={articleBodyRef}
            className="card article-rendered-body"
            style={{
              lineHeight: 1.85,
              fontSize: '1.02rem',
              color: 'var(--text-main)',
              padding: '36px 44px',
              width: '100%',
              boxShadow: 'var(--shadow-sm)',
            }}
            dangerouslySetInnerHTML={{ __html: selectedArticle.contentHtml }}
          />

          {/* Rodapé de Feedback: Joinha & Deslike com Contagem em Tempo Real */}
          <div
            style={{
              marginTop: '28px',
              padding: '22px 30px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bookmark size={20} color="var(--color-primary)" />
              <span style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Este artigo te ajudou na sua rotina de conciliação?
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => voteArticle(selectedArticle.id, 'like')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, padding: '7px 15px' }}
              >
                <ThumbsUp size={15} color="#10b981" />
                <span>Sim, ajudou ({selectedArticle.likesCount || 0})</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => voteArticle(selectedArticle.id, 'dislike')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, padding: '7px 15px' }}
              >
                <ThumbsDown size={15} color="#ef4444" />
                <span>Não ({selectedArticle.dislikesCount || 0})</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ==================================================================
           CATÁLOGO GERAL DE MÓDULOS E MANUAIS (VISÃO ALARGADA)
           ================================================================== */
        <div style={{ width: '100%' }}>
          {/* Hero Welcome Banner com Busca Embaixo do Título */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(92, 183, 128, 0.15) 0%, rgba(108, 99, 255, 0.12) 100%)',
              border: '1px solid rgba(92, 183, 128, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px 36px',
              marginBottom: '28px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-md)',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Central de Documentação Oficial
                </span>
                <h1 style={{ fontSize: '2.1rem', margin: '6px 0 10px 0', color: 'var(--text-main)', fontWeight: 800 }}>
                  Base de Conhecimento Conciliador Contábil
                </h1>
                <p style={{ color: 'var(--text-muted)', maxWidth: '820px', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                  Consulte manuais operacionais, procedimentos, regras e orientações oficiais do Conciliador Contábil.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {isAdmin && onOpenModuleManagement && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onOpenModuleManagement}
                    style={{
                      padding: '12px 18px',
                      fontSize: '0.90rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                    }}
                    title="Painel de criação, ícones e exclusão de módulos"
                  >
                    <Layers size={16} color="var(--color-primary)" />
                    <span>Gerenciar Módulos</span>
                  </button>
                )}

                {!isExternal && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={onOpenNewArticle}
                    style={{ padding: '12px 22px', fontSize: '0.92rem', fontWeight: 700 }}
                  >
                    <Plus size={16} />
                    <span>Criar Novo Artigo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Barra de Pesquisa Embaixo do Título */}
            <div
              style={{
                width: '100%',
                maxWidth: '820px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '9px 16px',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.08)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            >
              <Search size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar manuais, procedimentos, soluções, erros ou palavras-chave..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.98rem',
                  fontWeight: 500,
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  title="Limpar pesquisa"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                title="Abrir pesquisa global Spotlight (Ctrl + K)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 11px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-subtle)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <span>Spotlight</span>
                <kbd style={{ fontSize: '0.70rem', background: 'var(--bg-card)', padding: '2px 5px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>Ctrl K</kbd>
              </button>
            </div>
          </div>

          {/* Grade de Módulos (Oculta quando há filtro de módulo selecionado ou busca digitada) */}
          {!selectedCategory && !searchQuery.trim() && (
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', color: 'var(--text-main)', fontWeight: 700 }}>
                Módulos Operacionais do Sistema
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '18px',
                }}
              >
                {displayedCategories.map((cat) => {
                  const count = visibleArticles.filter((a) => a.categoryId === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      className="card"
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '22px',
                        transition: 'transform 0.15s ease, border-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                          <div
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--bg-surface)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            {getCategoryIcon(cat.icon, 22)}
                          </div>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              padding: '3px 9px',
                              borderRadius: 'var(--radius-full)',
                              background: 'var(--bg-surface)',
                              color: 'var(--text-subtle)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            {count} artigos
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '8px', fontWeight: 700 }}>
                          {cat.title}
                        </h3>
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          {cat.description}
                        </p>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: 'var(--color-primary)',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          marginTop: '16px',
                        }}
                      >
                        <span>Explorar manuais</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Listagem de Artigos Disponíveis (Exibida apenas ao selecionar um módulo ou ao pesquisar) */}
          {(selectedCategory || searchQuery.trim()) && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.3rem', color: 'var(--text-main)', fontWeight: 700, margin: 0 }}>
                    {searchQuery.trim()
                      ? `Resultados para "${searchQuery.trim()}"`
                      : `Manuais de ${categories.find((c) => c.id === selectedCategory)?.title || 'Módulo'}`}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchQuery('');
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      fontSize: '0.80rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--color-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    <ArrowLeft size={13} />
                    <span>Ver todos os módulos</span>
                  </button>
                </div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
                  {filteredArticles.length} {filteredArticles.length === 1 ? 'manual encontrado' : 'manuais encontrados'}
                </span>
              </div>

            {filteredArticles.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '48px 24px',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Search size={36} color="var(--text-subtle)" style={{ marginBottom: '12px' }} />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '6px' }}>Nenhum manual encontrado</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>
                  Não encontramos artigos correspondentes aos critérios de busca ou módulo selecionado.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                  style={{ fontSize: '0.85rem' }}
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredArticles.map((art) => (
                  <div
                    key={art.id}
                    className="card"
                    onClick={() => handleSelectArticle(art)}
                    style={{
                      padding: '18px 24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      transition: 'transform 0.15s ease, border-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            background: 'rgba(92, 183, 128, 0.15)',
                            color: 'var(--color-primary)',
                            border: '1px solid rgba(92, 183, 128, 0.3)',
                            fontFamily: 'monospace',
                          }}
                        >
                          {art.code || 'CC-DOC'}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
                          {art.categoryName}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', margin: '0 0 6px 0', fontWeight: 700 }}>
                        {art.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                        <span>Por {art.authorName}</span>
                        <span>•</span>
                        <span>{new Date(art.updatedAt).toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Eye size={12} /> {art.viewCount || 0} acessos
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ThumbsUp size={12} color="#10b981" /> {art.likesCount || 0}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.84rem' }}>
                      <span>Ler Manual</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Seção de Suporte Movidesk: Ainda tem dúvida sobre algo? (Exibido apenas no modo leitor) */}
        {isReaderMode && (
          <div
            style={{
              marginTop: '56px',
              marginBottom: '32px',
            }}
          >
          {/* Card Principal: Ainda tem dúvida sobre algo? */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '36px 36px 32px 36px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ marginBottom: '28px' }}>
              <h2
                style={{
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                Ainda tem dúvida sobre algo?
              </h2>
              <p
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--text-muted)',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Acione nosso suporte, nosso time de especialistas está pronto para atendê-lo.
              </p>
            </div>

            {/* Grid com os dois cards de canais de atendimento em verde */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {/* Card 1: Chat com o suporte */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(92, 183, 128, 0.16)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(92, 183, 128, 0.12)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <MessageSquare size={20} />
                  </div>
                  <h3
                    style={{
                      fontSize: '1.08rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      margin: '0 0 6px 0',
                    }}
                  >
                    Chat com o suporte
                  </h3>
                  <p
                    style={{
                      fontSize: '0.86rem',
                      color: 'var(--text-muted)',
                      margin: '0 0 20px 0',
                      lineHeight: 1.5,
                    }}
                  >
                    Seg. a sex., das 8h30 às 17h30. Resposta em poucos minutos.
                  </p>
                </div>

                <a
                  href="https://conciliador-contabil2.movidesk.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--color-primary)',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'gap 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.gap = '9px')}
                  onMouseLeave={(e) => (e.currentTarget.style.gap = '6px')}
                >
                  <span>Abrir o chat</span>
                  <ArrowRight size={14} />
                </a>
              </div>

              {/* Card 2: E-mail */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(92, 183, 128, 0.16)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(92, 183, 128, 0.12)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <Mail size={20} />
                  </div>
                  <h3
                    style={{
                      fontSize: '1.08rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      margin: '0 0 6px 0',
                    }}
                  >
                    E-mail
                  </h3>
                  <p
                    style={{
                      fontSize: '0.86rem',
                      color: 'var(--text-muted)',
                      margin: '0 0 20px 0',
                      lineHeight: 1.5,
                    }}
                  >
                    Caso preferir, você também pode nos acionar pelo e-mail.
                  </p>
                </div>

                <a
                  href="mailto:suporte@conciliadorcontabil.com.br"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--color-primary)',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'gap 0.15s ease',
                    wordBreak: 'break-all',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.gap = '9px')}
                  onMouseLeave={(e) => (e.currentTarget.style.gap = '6px')}
                >
                  <span>suporte@conciliadorcontabil.com.br</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    )}
      </div>
    </div>
  );
};
