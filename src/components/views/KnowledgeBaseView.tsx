import React, { useState } from 'react';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Article } from '../../types';

interface KnowledgeBaseViewProps {
  onOpenNewArticle: () => void;
  onProposeEdit?: (art: Article) => void;
  onEditArticle?: (art: Article) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({ 
  onOpenNewArticle,
  onProposeEdit,
  onEditArticle,
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
  } = useApp();

  const isDark = theme === 'dark';

  const [copiedLink, setCopiedLink] = useState(false);

  // Mapeamento de ícones por nome
  const getCategoryIcon = (iconName: string, size = 20) => {
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
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.email?.toLowerCase() === 'fulvio@conciliadorcontabil.com.br';
  const isAdmin = isSuperAdmin || currentUser?.role === 'ADMIN';

  // Artigos visíveis
  const visibleArticles = articles.filter((a) => {
    if (isExternal) {
      return a.currentStatus === 'APPROVED' && (a.accessLevel === 'ALL' || a.accessLevel === 'EXTERNAL');
    }
    if (isAdmin) return true;
    return (
      a.currentStatus === 'APPROVED' ||
      a.authorId === currentUser?.uid ||
      a.authorEmail?.toLowerCase() === currentUser?.email?.toLowerCase()
    );
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
                {selectedArticle.currentStatus === 'APPROVED' ? (
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
          {/* Hero Welcome Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(92, 183, 128, 0.15) 0%, rgba(108, 99, 255, 0.12) 100%)',
              border: '1px solid rgba(92, 183, 128, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px 36px',
              marginBottom: '28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-md)',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Central de Documentação Oficial
              </span>
              <h1 style={{ fontSize: '2.1rem', margin: '6px 0 10px 0', color: 'var(--text-main)', fontWeight: 800 }}>
                Base de Conhecimento Conciliador Contábil
              </h1>
              <p style={{ color: 'var(--text-muted)', maxWidth: '820px', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Consulte manuais operacionais, procedimentos, informações orientações . insira seu conheciemnto e compartilhe com colaboradores e clientes .
              </p>
            </div>
            {!isExternal && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onOpenNewArticle}
                style={{ padding: '12px 22px', fontSize: '0.92rem', fontWeight: 700 }}
              >
                <Plus size={16} />
                <span>Sugerir Nova Solução</span>
              </button>
            )}
          </div>

          {/* Filtros em Pílulas (Pills) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.84rem',
                fontWeight: 700,
                background: selectedCategory === null ? 'var(--color-primary)' : 'var(--bg-card)',
                color: selectedCategory === null ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${selectedCategory === null ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Todos os Módulos ({visibleArticles.length})
            </button>
            {categories.map((cat) => {
              const isSel = selectedCategory === cat.id;
              const count = visibleArticles.filter((a) => a.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    background: isSel ? 'var(--color-primary)' : 'var(--bg-card)',
                    color: isSel ? '#fff' : 'var(--text-muted)',
                    border: `1px solid ${isSel ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat.title} ({count})
                </button>
              );
            })}
          </div>

          {/* Grade de Módulos (Inclui Playbook N1 e Playbook N2) */}
          {!selectedCategory && (
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
                {categories.map((cat) => {
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

          {/* Listagem de Artigos Disponíveis */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.3rem', color: 'var(--text-main)', fontWeight: 700 }}>
                {selectedCategory
                  ? `Manuais de ${categories.find((c) => c.id === selectedCategory)?.title || 'Módulo'}`
                  : 'Todos os Artigos e Procedimentos Oficiais'}
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
                {visibleArticles.filter((a) => !selectedCategory || a.categoryId === selectedCategory).length} manuais encontrados
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {visibleArticles
                .filter((a) => !selectedCategory || a.categoryId === selectedCategory)
                .map((art) => (
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
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
