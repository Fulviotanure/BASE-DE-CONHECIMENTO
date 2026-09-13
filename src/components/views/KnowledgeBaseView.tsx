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
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Article } from '../../types';

interface KnowledgeBaseViewProps {
  onOpenNewArticle: () => void;
  onProposeEdit?: (art: Article) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({ 
  onOpenNewArticle,
  onProposeEdit 
}) => {
  const {
    categories,
    articles,
    selectedCategory,
    setSelectedCategory,
    selectedArticle,
    setSelectedArticle,
    voteArticle,
    currentUser,
  } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);

  // Mapeamento de ícones por nome
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass': return <Compass size={24} color="#5cb780" />;
      case 'Database': return <Database size={24} color="#6c63ff" />;
      case 'FileDown': return <FileDown size={24} color="#3b82f6" />;
      case 'Sliders': return <Sliders size={24} color="#f59e0b" />;
      case 'Scale': return <Scale size={24} color="#10b981" />;
      case 'FileUp': return <FileUp size={24} color="#8b5cf6" />;
      case 'Globe': return <Globe size={24} color="#06b6d4" />;
      case 'ArrowLeftRight': return <ArrowLeftRight size={24} color="#ec4899" />;
      case 'HelpCircle': return <HelpCircle size={24} color="#f97316" />;
      case 'LifeBuoy': return <LifeBuoy size={24} color="#ef4444" />;
      default: return <Compass size={24} color="#5cb780" />;
    }
  };

  const isExternal = currentUser?.role === 'READER' || currentUser?.userType === 'EXTERNAL';
  // Artigos aprovados (se for externo/leitor, pode apenas ver o que estiver marcado como externo)
  const approvedArticles = articles.filter(
    (a) => a.currentStatus === 'APPROVED' && (!isExternal || (a.accessLevel === 'ALL' || a.accessLevel === 'EXTERNAL'))
  );

  const filteredArticles = selectedCategory
    ? approvedArticles.filter((a) => a.categoryId === selectedCategory)
    : approvedArticles;

  const currentCategoryData = categories.find((c) => c.id === selectedCategory);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Se um artigo específico estiver aberto, renderiza a tela de leitura detalhada
  if (selectedArticle) {
    return (
      <div style={{ padding: '32px', maxWidth: '980px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-subtle)', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setSelectedArticle(null)}
            style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <ArrowLeft size={14} />
            <span>Voltar para artigos</span>
          </button>
          <span>/</span>
          <span>{selectedArticle.categoryName}</span>
          <span>/</span>
          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{selectedArticle.title}</span>
        </div>

        {/* Article Header Card */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                padding: '3px 8px',
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
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
              Código Único de Referência Rápida
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.75rem', lineHeight: 1.25, color: 'var(--text-main)', margin: 0, flex: 1 }}>
              {selectedArticle.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {onProposeEdit && !isExternal && (
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
                  }}
                  title="Propor alteração ou correção neste artigo técnico"
                >
                  <FileEdit size={14} />
                  <span>Propor Edição</span>
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCopyLink}
                title="Copiar link permanente"
              >
                {copiedLink ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
                <span>{copiedLink ? 'Copiado!' : 'Compartilhar'}</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} color="var(--color-primary)" />
              <strong>Criado por:</strong> {selectedArticle.authorName || 'Fulvio Tanure'} {selectedArticle.authorEmail ? `(${selectedArticle.authorEmail})` : ''}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} />
              <strong>Criado em:</strong> {new Date(selectedArticle.createdAt).toLocaleDateString('pt-BR')} às {new Date(selectedArticle.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={14} />
              {selectedArticle.viewCount} visualizações
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontWeight: 700 }}>
              <ThumbsUp size={13} />
              {selectedArticle.likesCount || 0}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', fontWeight: 700 }}>
              <ThumbsDown size={13} />
              {selectedArticle.dislikesCount || 0}
            </span>
            <span 
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: selectedArticle.accessLevel === 'ALL' || selectedArticle.accessLevel === 'EXTERNAL' ? 'rgba(56, 189, 248, 0.15)' : 'var(--color-primary-subtle)',
                color: selectedArticle.accessLevel === 'ALL' || selectedArticle.accessLevel === 'EXTERNAL' ? '#38bdf8' : 'var(--color-primary)',
              }}
            >
              {selectedArticle.accessLevel === 'ALL' || selectedArticle.accessLevel === 'EXTERNAL' ? '🌐 Externo (Público)' : '🔒 Interno'}
            </span>
            <span className="badge badge-approved">Aprovado & Oficial</span>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '16px', flexWrap: 'wrap' }}>
            {selectedArticle.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Article Body Content */}
        <div
          className="card"
          style={{
            lineHeight: 1.75,
            fontSize: '0.98rem',
            color: 'var(--text-main)',
            padding: '32px',
          }}
          dangerouslySetInnerHTML={{ __html: selectedArticle.contentHtml }}
        />

        {/* Helpful Feedback Footer: Joinha & Deslike com Contagem */}
        <div
          style={{
            marginTop: '28px',
            padding: '20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bookmark size={18} color="var(--color-primary)" />
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Este artigo te ajudou na sua rotina de conciliação?</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => voteArticle(selectedArticle.id, 'like')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <ThumbsUp size={14} color="#10b981" />
              <span>Sim, ajudou ({selectedArticle.likesCount || 0})</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => voteArticle(selectedArticle.id, 'dislike')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <ThumbsDown size={14} color="#ef4444" />
              <span>Não ({selectedArticle.dislikesCount || 0})</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Hero Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(92, 183, 128, 0.15) 0%, rgba(108, 99, 255, 0.12) 100%)',
          border: '1px solid rgba(92, 183, 128, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Central de Documentação Oficial
          </span>
          <h1 style={{ fontSize: '2rem', margin: '6px 0 10px 0', color: 'var(--text-main)' }}>
            Base de Conhecimento Conciliador Contábil
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '640px', fontSize: '0.92rem' }}>
            Consulte manuais operacionais, procedimentos de importação de extratos (OFX, PDF, Excel),
            regras de conciliação, integração com ERPs contábeis e boas práticas de suporte interno.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenNewArticle}
          style={{ padding: '12px 20px', fontSize: '0.9rem' }}
        >
          Sugerir Nova Solução
        </button>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: 600,
            background: selectedCategory === null ? 'var(--color-primary)' : 'var(--bg-card)',
            color: selectedCategory === null ? '#fff' : 'var(--text-muted)',
            border: `1px solid ${selectedCategory === null ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Todos os Módulos ({approvedArticles.length})
        </button>
        {categories.map((cat) => {
          const isSel = selectedCategory === cat.id;
          const count = approvedArticles.filter((a) => a.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 600,
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

      {/* Categorized Modules Grid (when showing all categories) */}
      {!selectedCategory && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--text-main)' }}>
            Módulos Operacionais do Sistema
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '16px',
            }}
          >
            {categories.map((cat) => {
              const count = approvedArticles.filter((a) => a.categoryId === cat.id).length;
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
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {getCategoryIcon(cat.icon)}
                      </div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-subtle)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {count} artigos
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '6px' }}>{cat.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{cat.description}</p>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                      marginTop: '16px',
                    }}
                  >
                    <span>Explorar artigos</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Articles Listing */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>
            {selectedCategory ? `Artigos em ${currentCategoryData?.title}` : 'Artigos Mais Recentes e Oficiais'}
          </h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>
            {filteredArticles.length} artigos disponíveis
          </span>
        </div>

        {filteredArticles.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '40px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <HelpCircle size={36} color="var(--text-subtle)" style={{ margin: '0 auto 12px auto' }} />
            <p style={{ fontSize: '0.95rem' }}>Nenhum artigo aprovado encontrado neste módulo ainda.</p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenNewArticle}
              style={{ marginTop: '12px' }}
            >
              Criar o primeiro artigo deste módulo
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredArticles.map((art) => (
              <div
                key={art.id}
                className="card"
                onClick={() => setSelectedArticle(art)}
                style={{
                  cursor: 'pointer',
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(92, 183, 128, 0.15)',
                        color: 'var(--color-primary)',
                        border: '1px solid rgba(92, 183, 128, 0.3)',
                        fontFamily: 'monospace',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {art.code || 'CC-DOC'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--color-secondary-subtle)',
                        color: 'var(--color-secondary)',
                      }}
                    >
                      {art.categoryName}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: art.accessLevel === 'ALL' || art.accessLevel === 'EXTERNAL' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(92, 183, 128, 0.12)',
                        color: art.accessLevel === 'ALL' || art.accessLevel === 'EXTERNAL' ? '#38bdf8' : 'var(--color-primary)',
                      }}
                    >
                      {art.accessLevel === 'ALL' || art.accessLevel === 'EXTERNAL' ? '🌐 Público' : '🔒 Interno'}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                      Criado por: <strong>{art.authorName || 'Fulvio Tanure'}</strong> • {new Date(art.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '6px' }}>
                    {art.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {art.tags.slice(0, 3).map((tag) => (
                      <span key={tag} style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                      <ThumbsUp size={12} />
                      {art.likesCount || 0}
                    </span>
                    <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                      <ThumbsDown size={12} />
                      {art.dislikesCount || 0}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                    <Eye size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                    {art.viewCount}
                  </div>
                  <ChevronRight size={18} color="var(--color-primary)" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
