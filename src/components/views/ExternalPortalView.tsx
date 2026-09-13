import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  ExternalLink, 
  LifeBuoy, 
  Globe, 
  ThumbsUp, 
  ThumbsDown,
  ArrowLeft,
  Calendar,
  Eye,
  Tag,
  ChevronDown,
  X,
  MessageCircle,
  Mail
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Article } from '../../types';

interface ExternalPortalViewProps {
  onBackToPresentation?: () => void;
  onSelectArticle?: (art: Article) => void;
}

export const ExternalPortalView: React.FC<ExternalPortalViewProps> = ({ 
  onSelectArticle 
}) => {
  const { articles, incrementArticleView, voteArticle } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);
  const [isLinksMenuOpen, setIsLinksMenuOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Filtra apenas artigos aprovados para clientes/externos
  const availableArticles = articles.filter(
    (a) => a.currentStatus === 'APPROVED' && (a.accessLevel === 'ALL' || a.accessLevel === 'EXTERNAL')
  );

  // Categorias únicas existentes nos artigos disponíveis
  const categories = Array.from(new Set(availableArticles.map((a) => a.categoryName).filter(Boolean)));

  const filteredArticles = availableArticles.filter((a) => {
    const matchesCategory = selectedCategory === 'ALL' || a.categoryName === selectedCategory;
    if (!matchesCategory) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (a.code && a.code.toLowerCase().includes(q)) ||
      a.title.toLowerCase().includes(q) ||
      a.categoryName.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleOpenArticle = (art: Article) => {
    setReadingArticle(art);
    incrementArticleView(art.id);
    if (onSelectArticle) onSelectArticle(art);
  };

  return (
    <div 
      style={{ 
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        backgroundImage: 'url(/client-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: '#ffffff',
        overflowX: 'hidden',
      }} 
      className="animate-fade-in"
    >
      {/* Leve Película Transparente de Sobreposição Esverdeada (97% de Transparência / 3% Opacidade) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(39, 219, 136, 0.03) 0%, rgba(16, 185, 129, 0.03) 50%, rgba(5, 150, 105, 0.03) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1080px', margin: '0 auto', width: '100%', padding: '40px 24px 80px 24px' }}>
        {readingArticle ? (
          /* TELA DE LEITURA DO ARTIGO PARA CLIENTES */
          <div 
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
              padding: '36px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            }}
          >
            <button
              type="button"
              onClick={() => setReadingArticle(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#94a3b8',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '24px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              <ArrowLeft size={16} />
              <span>Voltar para manuais</span>
            </button>

            {/* Cabeçalho do Artigo */}
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '20px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(92, 183, 128, 0.2)',
                    color: '#5cb780',
                    border: '1px solid rgba(92, 183, 128, 0.4)',
                    fontFamily: 'monospace',
                  }}
                >
                  {readingArticle.code || 'MANUAL'}
                </span>
                <span style={{ fontSize: '0.80rem', color: '#38bdf8', fontWeight: 700 }}>
                  {readingArticle.categoryName}
                </span>
              </div>

              <h1 style={{ fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.3, margin: '0 0 16px 0', color: '#ffffff' }}>
                {readingArticle.title}
              </h1>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem', color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} />
                  <span>Publicado em {new Date(readingArticle.createdAt).toLocaleDateString('pt-BR')}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Eye size={14} />
                  <span>{readingArticle.viewCount} visualizações</span>
                </span>
              </div>

              {readingArticle.tags && readingArticle.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '14px', flexWrap: 'wrap' }}>
                  {readingArticle.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '0.74rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#cbd5e1',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Conteúdo HTML do Artigo */}
            <div
              style={{
                lineHeight: 1.8,
                fontSize: '1rem',
                color: '#e2e8f0',
                padding: '10px 0 30px 0',
              }}
              dangerouslySetInnerHTML={{ __html: readingArticle.contentHtml }}
            />

            {/* Avaliação Útil / Não Útil */}
            <div
              style={{
                marginTop: '32px',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff' }}>
                Este manual esclareceu sua dúvida?
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => voteArticle(readingArticle.id, 'like')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#10b981',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <ThumbsUp size={14} />
                  <span>Sim ({readingArticle.likesCount || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => voteArticle(readingArticle.id, 'dislike')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <ThumbsDown size={14} />
                  <span>Não ({readingArticle.dislikesCount || 0})</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* TELA INICIAL CLEAN DO CLIENTE */
          <div>
            {/* Header Amigável e Clean */}
            <div style={{ textAlign: 'center', marginBottom: '36px', paddingTop: '10px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(92, 183, 128, 0.15)',
                  border: '1px solid rgba(92, 183, 128, 0.35)',
                  color: '#5cb780',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '14px',
                }}
              >
                <span>Central de Conhecimento</span>
              </div>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-0.02em', color: '#ffffff', textShadow: '0 2px 14px rgba(0, 0, 0, 0.85), 0 1px 4px rgba(0, 0, 0, 0.9)' }}>
                Como podemos ajudar você hoje?
              </h1>
              <p style={{ color: '#e2e8f0', fontSize: '1rem', margin: '0 auto', maxWidth: '620px', lineHeight: 1.5, textShadow: '0 1px 8px rgba(0, 0, 0, 0.85)' }}>
                Acesse procedimentos práticos, soluções para conciliação e guias passo a passo.
              </p>
            </div>

            {/* Barra de Busca + Botão Links Úteis */}
            <div 
              style={{ 
                display: 'flex', 
                gap: '12px', 
                marginBottom: '28px',
                maxWidth: '760px',
                margin: '0 auto 28px auto',
                position: 'relative',
              }}
            >
              <div 
                style={{ 
                  flex: 1, 
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Search size={18} style={{ position: 'absolute', left: '16px', color: '#5cb780' }} />
                <input
                  type="text"
                  placeholder="Pesquisar por assunto, banco, extrato ou dúvida..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 46px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(92, 183, 128, 0.35)',
                    borderRadius: '14px',
                    color: '#ffffff',
                    fontSize: '0.94rem',
                    outline: 'none',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                  }}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Botão: Links Úteis */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsLinksMenuOpen(!isLinksMenuOpen)}
                  style={{
                    height: '100%',
                    padding: '0 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '14px',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#5cb780')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
                >
                  <Globe size={16} color="#5cb780" />
                  <span>Links Úteis</span>
                  <ChevronDown size={14} color="#94a3b8" />
                </button>

                {/* Dropdown Menu Flutuante */}
                {isLinksMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '230px',
                      background: '#0f172a',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '14px',
                      boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)',
                      padding: '8px',
                      zIndex: 50,
                      animation: 'fadeIn 0.15s ease-out',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsLinksMenuOpen(false);
                        setIsSupportModalOpen(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(92, 183, 128, 0.12)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LifeBuoy size={16} color="#5cb780" />
                      <div>
                        <div>Suporte Técnico</div>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Fale com nosso time</span>
                      </div>
                    </button>

                    <a
                      href="https://conciliadorcontabil.com.br"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsLinksMenuOpen(false)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'none',
                        textAlign: 'left',
                        transition: 'background 0.15s',
                        boxSizing: 'border-box',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Globe size={16} color="#38bdf8" />
                      <div>
                        <div>Site do Conciliador</div>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>conciliadorcontabil.com.br</span>
                      </div>
                      <ExternalLink size={13} style={{ marginLeft: 'auto', color: '#64748b' }} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Categorias em Chips Elegantes */}
            {categories.length > 0 && (
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  flexWrap: 'wrap', 
                  marginBottom: '32px' 
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid',
                    borderColor: selectedCategory === 'ALL' ? '#5cb780' : 'rgba(255, 255, 255, 0.12)',
                    background: selectedCategory === 'ALL' ? 'rgba(92, 183, 128, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    color: selectedCategory === 'ALL' ? '#5cb780' : '#94a3b8',
                    fontSize: '0.80rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Todos ({availableArticles.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid',
                      borderColor: selectedCategory === cat ? '#5cb780' : 'rgba(255, 255, 255, 0.12)',
                      background: selectedCategory === cat ? 'rgba(92, 183, 128, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                      color: selectedCategory === cat ? '#5cb780' : '#94a3b8',
                      fontSize: '0.80rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Listagem dos Artigos em Cards Clean */}
            {filteredArticles.length === 0 ? (
              <div
                style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  maxWidth: '680px',
                  margin: '0 auto',
                }}
              >
                <BookOpen size={40} color="#64748b" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '6px' }}>
                  Nenhum manual encontrado
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                  {searchTerm
                    ? `Não encontramos resultados para "${searchTerm}". Tente outros termos.`
                    : 'Ainda não há manuais publicados nesta categoria.'}
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '20px',
                }}
              >
                {filteredArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => handleOpenArticle(art)}
                    style={{
                      background: 'rgba(15, 23, 42, 0.78)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      padding: '22px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(92, 183, 128, 0.4)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            background: 'rgba(92, 183, 128, 0.15)',
                            color: '#5cb780',
                            border: '1px solid rgba(92, 183, 128, 0.3)',
                            fontFamily: 'monospace',
                          }}
                        >
                          {art.code || 'DOC'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
                          {art.categoryName}
                        </span>
                      </div>

                      <h3
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          lineHeight: 1.4,
                          margin: '0 0 10px 0',
                          color: '#ffffff',
                        }}
                      >
                        {art.title}
                      </h3>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '16px',
                        paddingTop: '12px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        fontSize: '0.76rem',
                        color: '#94a3b8',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Eye size={13} />
                        <span>{art.viewCount} acessos</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontWeight: 700 }}>
                        <ThumbsUp size={13} />
                        <span>{art.likesCount || 0}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Suporte Técnico */}
      {isSupportModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSupportModalOpen(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              background: '#0f172a',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '28px',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LifeBuoy size={22} color="#5cb780" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff', fontWeight: 700 }}>
                  Suporte Técnico
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              Nosso time especializado de suporte está à disposição para auxiliar na parametrização de regras e conciliações contábeis.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href="mailto:suporte@conciliadorcontabil.com.br"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                }}
              >
                <Mail size={18} color="#38bdf8" />
                <span>suporte@conciliadorcontabil.com.br</span>
              </a>

              <a
                href="https://conciliadorcontabil.com.br"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(92, 183, 128, 0.15)',
                  border: '1px solid rgba(92, 183, 128, 0.3)',
                  color: '#5cb780',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                }}
              >
                <Globe size={18} />
                <span>Acessar Portal do Conciliador Contábil</span>
                <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
