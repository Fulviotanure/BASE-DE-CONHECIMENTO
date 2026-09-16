import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  X,
  Mail,
  Compass,
  Database,
  FileDown,
  Sliders,
  Scale,
  FileUp,
  ArrowLeftRight,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Article } from '../../types';
import { INITIAL_ARTICLES } from '../../data/initialSeed';
import { useArticleImageFallback } from '../../utils/imageFallback';

interface ExternalPortalViewProps {
  onBackToPresentation?: () => void;
  onSelectArticle?: (art: Article) => void;
}

export const ExternalPortalView: React.FC<ExternalPortalViewProps> = ({ 
  onSelectArticle 
}) => {
  const { 
    articles,
    categories: allCategories,
    incrementArticleView, 
    voteArticle, 
    selectedArticle, 
    setSelectedArticle,
    theme
  } = useApp();

  const isDark = theme === 'dark';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [localArticle, setLocalArticle] = useState<Article | null>(null);
  const [isLinksMenuOpen, setIsLinksMenuOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const articleBodyRef = React.useRef<HTMLDivElement>(null);

  // Sincroniza estado local quando selectedArticle for resetado externamente (ex: clique na logo/home)
  useEffect(() => {
    if (!selectedArticle) {
      setLocalArticle(null);
    }
  }, [selectedArticle]);

  // O artigo em leitura sincroniza com a barra lateral de árvore e com a navegação do portal
  const readingArticle = selectedArticle || localArticle;

  // Intercepta imagens quebradas para exibir aviso elegante
  useArticleImageFallback(articleBodyRef, [readingArticle?.id, readingArticle?.contentHtml]);

  // Incrementa visualização quando um artigo é selecionado
  useEffect(() => {
    if (selectedArticle) {
      incrementArticleView(selectedArticle.id);
    }
  }, [selectedArticle?.id]);

  // Garante que haja artigos imediatos desde o primeiro frame
  const sourceArticles = articles && articles.length > 0 ? articles : INITIAL_ARTICLES;

  // Filtra apenas artigos aprovados para clientes/externos (excluindo estritamente Playbooks)
  const availableArticles = sourceArticles.filter((a) => {
    const isPb =
      a.categoryName?.toLowerCase().includes('playbook') ||
      a.categoryId === 'cat-11' ||
      a.categoryId === 'cat-12';
    if (isPb) return false;
    return a.currentStatus === 'APPROVED' && (a.accessLevel === 'ALL' || a.accessLevel === 'EXTERNAL');
  });

  // Categorias únicas existentes nos artigos disponíveis (sem Playbooks)
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
    setLocalArticle(art);
    setSelectedArticle(art);
    incrementArticleView(art.id);
    if (onSelectArticle) onSelectArticle(art);
  };

  const handleCloseArticle = () => {
    setLocalArticle(null);
    setSelectedArticle(null);
  };

  // Mapeamento de ícones por categoria (sem Playbooks)
  const getCategoryIcon = (iconName: string, size = 22) => {
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
      default: return <Compass size={size} color="#5cb780" />;
    }
  };

  // Módulos visíveis para clientes (sem Playbooks)
  const visibleModules = allCategories.filter((cat) => {
    const isPlaybook = cat.title.toLowerCase().includes('playbook') || cat.id === 'cat-11' || cat.id === 'cat-12';
    if (isPlaybook) return false;
    // Somente categorias com pelo menos 1 artigo externo aprovado
    return availableArticles.some((a) => a.categoryId === cat.id);
  });

  return (
    <div 
      style={{ 
        minHeight: '100%',
        width: '100%',
        position: 'relative',
        backgroundImage: 'url(/client-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: isDark ? '#ffffff' : '#0f172a',
        overflowX: 'hidden',
      }} 
      className="animate-fade-in"
    >
      {/* Overlay suave — permite ver a imagem de fundo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'linear-gradient(135deg, rgba(5, 12, 28, 0.42) 0%, rgba(5, 12, 28, 0.35) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.38) 0%, rgba(240, 249, 255, 0.32) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      <div 
        style={{ 
          position: 'relative', 
          zIndex: 10, 
          maxWidth: readingArticle ? '100%' : '1180px', 
          margin: readingArticle ? '0' : '0 auto', 
          width: '100%', 
          padding: readingArticle ? '24px 32px 60px 24px' : '40px 24px 80px 24px',
          boxSizing: 'border-box',
        }}
      >
        {readingArticle ? (
          /* TELA DE LEITURA DO ARTIGO PARA CLIENTES (EXPANDIDA EM QUASE TODA A TELA) */
          <div 
            style={{
              background: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '16px',
              padding: '36px 44px',
              boxShadow: isDark ? '0 20px 50px rgba(0, 0, 0, 0.5)' : '0 15px 35px rgba(0, 0, 0, 0.06)',
              width: '100%',
              boxSizing: 'border-box',
              color: isDark ? '#ffffff' : '#0f172a',
            }}
          >
            <button
              type="button"
              onClick={handleCloseArticle}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.1)',
                color: isDark ? '#94a3b8' : '#475569',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '24px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = isDark ? '#ffffff' : '#0f172a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? '#94a3b8' : '#475569')}
            >
              <ArrowLeft size={16} />
              <span>Voltar para manuais</span>
            </button>

            {/* Cabeçalho do Artigo */}
            <div style={{ borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)', paddingBottom: '20px', marginBottom: '28px' }}>
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
                <span style={{ fontSize: '0.80rem', color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 700 }}>
                  {readingArticle.categoryName}
                </span>
              </div>

              <h1 style={{ fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.3, margin: '0 0 16px 0', color: isDark ? '#ffffff' : '#0f172a' }}>
                {readingArticle.title}
              </h1>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem', color: isDark ? '#94a3b8' : '#64748b' }}>
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
                        background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                        color: isDark ? '#cbd5e1' : '#475569',
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
              ref={articleBodyRef}
              className="article-rendered-body"
              style={{
                lineHeight: 1.8,
                fontSize: '1rem',
                color: isDark ? 'var(--text-main)' : '#334155',
                padding: '10px 0 30px 0',
              }}
              dangerouslySetInnerHTML={{ __html: readingArticle.contentHtml }}
            />

            {/* Avaliação Útil / Não Útil */}
            <div
              style={{
                marginTop: '32px',
                padding: '20px',
                background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: isDark ? '#ffffff' : '#0f172a' }}>
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
          <div style={{ paddingBottom: '40px' }}>
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
              <h1
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  margin: '0 0 10px 0',
                  letterSpacing: '-0.02em',
                  color: isDark ? '#ffffff' : '#0f172a',
                  textShadow: isDark ? '0 2px 14px rgba(0, 0, 0, 0.85), 0 1px 4px rgba(0, 0, 0, 0.9)' : 'none',
                }}
              >
                Como podemos ajudar você hoje?
              </h1>
              <p
                style={{
                  color: isDark ? '#e2e8f0' : '#475569',
                  fontSize: '1rem',
                  margin: '0 auto',
                  maxWidth: '620px',
                  lineHeight: 1.5,
                  textShadow: isDark ? '0 1px 8px rgba(0, 0, 0, 0.85)' : 'none',
                }}
              >
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
                    background: isDark ? 'rgba(15, 23, 42, 0.85)' : '#ffffff',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: isDark ? '1px solid rgba(92, 183, 128, 0.35)' : '1px solid rgba(92, 183, 128, 0.5)',
                    borderRadius: '14px',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '0.94rem',
                    outline: 'none',
                    boxShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.35)' : '0 8px 25px rgba(0, 0, 0, 0.06)',
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
                      color: isDark ? '#94a3b8' : '#64748b',
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
                    background: isDark ? 'rgba(15, 23, 42, 0.85)' : '#ffffff',
                    backdropFilter: 'blur(16px)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '14px',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.35)' : '0 8px 25px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#5cb780')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)')}
                >
                  <Globe size={16} color="#5cb780" />
                  <span>Links Úteis</span>
                  <ChevronDown size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                </button>

                {/* Dropdown Menu Flutuante */}
                {isLinksMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '230px',
                      background: isDark ? '#0f172a' : '#ffffff',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '14px',
                      boxShadow: isDark ? '0 16px 36px rgba(0, 0, 0, 0.5)' : '0 16px 36px rgba(0, 0, 0, 0.12)',
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
                        color: isDark ? '#ffffff' : '#0f172a',
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
                        <span style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b' }}>Fale com nosso time</span>
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
                        color: isDark ? '#ffffff' : '#0f172a',
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
                        <span style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b' }}>conciliadorcontabil.com.br</span>
                      </div>
                      <ExternalLink size={13} style={{ marginLeft: 'auto', color: isDark ? '#64748b' : '#94a3b8' }} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* ===== GRADE DE MÓDULOS OPERACIONAIS ===== */}
            {selectedCategory === 'ALL' && !searchTerm && visibleModules.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    marginBottom: '18px',
                    color: isDark ? '#ffffff' : '#0f172a',
                    letterSpacing: '-0.01em',
                    textShadow: isDark ? '0 2px 8px rgba(0,0,0,0.6)' : 'none',
                  }}
                >
                  Módulos Operacionais do Sistema
                </h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {visibleModules.map((cat) => {
                    const count = availableArticles.filter((a) => a.categoryId === cat.id).length;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.title)}
                        style={{
                          background: isDark
                            ? 'rgba(15, 23, 42, 0.55)'
                            : 'rgba(255, 255, 255, 0.55)',
                          backdropFilter: 'blur(18px)',
                          WebkitBackdropFilter: 'blur(18px)',
                          border: isDark
                            ? '1px solid rgba(255, 255, 255, 0.12)'
                            : '1px solid rgba(255, 255, 255, 0.7)',
                          borderRadius: '16px',
                          padding: '22px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease',
                          boxShadow: isDark
                            ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
                            : '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.borderColor = 'rgba(92, 183, 128, 0.6)';
                          e.currentTarget.style.boxShadow = isDark
                            ? '0 14px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(92,183,128,0.2)'
                            : '0 14px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(92,183,128,0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.7)';
                          e.currentTarget.style.boxShadow = isDark
                            ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
                            : '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)';
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <div
                              style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '12px',
                                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)',
                                border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {getCategoryIcon(cat.icon, 22)}
                            </div>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '3px 9px',
                                borderRadius: '20px',
                                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                color: isDark ? '#94a3b8' : '#64748b',
                                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                              }}
                            >
                              {count} artigos
                            </span>
                          </div>
                          <h3
                            style={{
                              fontSize: '1.02rem',
                              fontWeight: 700,
                              color: isDark ? '#ffffff' : '#0f172a',
                              marginBottom: '8px',
                              lineHeight: 1.3,
                            }}
                          >
                            {cat.title}
                          </h3>
                          <p
                            style={{
                              fontSize: '0.82rem',
                              color: isDark ? '#94a3b8' : '#475569',
                              lineHeight: 1.5,
                              margin: 0,
                            }}
                          >
                            {cat.description}
                          </p>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: '#5cb780',
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
                    borderColor: selectedCategory === 'ALL' ? '#5cb780' : isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
                    background: selectedCategory === 'ALL'
                      ? 'rgba(92, 183, 128, 0.2)'
                      : isDark
                      ? 'rgba(15, 23, 42, 0.6)'
                      : 'rgba(255,255,255,0.6)',
                    color: selectedCategory === 'ALL' ? '#5cb780' : isDark ? '#94a3b8' : '#64748b',
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
                      borderColor: selectedCategory === cat ? '#5cb780' : isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
                      background: selectedCategory === cat
                        ? 'rgba(92, 183, 128, 0.2)'
                        : isDark
                        ? 'rgba(15, 23, 42, 0.6)'
                        : 'rgba(255,255,255,0.6)',
                      color: selectedCategory === cat ? '#5cb780' : isDark ? '#94a3b8' : '#64748b',
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
                  background: isDark ? 'rgba(15, 23, 42, 0.75)' : '#ffffff',
                  backdropFilter: 'blur(16px)',
                  borderRadius: '20px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                  maxWidth: '680px',
                  margin: '0 auto',
                }}
              >
                <BookOpen size={40} color="#64748b" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '1.1rem', color: isDark ? '#ffffff' : '#0f172a', marginBottom: '6px' }}>
                  Nenhum manual encontrado
                </h3>
                <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.85rem', margin: 0 }}>
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
                      background: isDark ? 'rgba(15, 23, 42, 0.78)' : '#ffffff',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                      borderRadius: '16px',
                      padding: '22px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(92, 183, 128, 0.5)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
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
                        <span style={{ fontSize: '0.75rem', color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 600 }}>
                          {art.categoryName}
                        </span>
                      </div>

                      <h3
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          lineHeight: 1.4,
                          margin: '0 0 10px 0',
                          color: isDark ? '#ffffff' : '#0f172a',
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
                        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
                        fontSize: '0.76rem',
                        color: isDark ? '#94a3b8' : '#64748b',
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
            background: 'rgba(0, 0, 0, 0.65)',
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
              background: isDark ? '#0f172a' : '#ffffff',
              borderRadius: '20px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
              padding: '28px',
              boxShadow: isDark ? '0 24px 64px rgba(0, 0, 0, 0.6)' : '0 24px 64px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LifeBuoy size={22} color="#5cb780" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: isDark ? '#ffffff' : '#0f172a', fontWeight: 700 }}>
                  Suporte Técnico
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 20px 0' }}>
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
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                  color: isDark ? '#ffffff' : '#0f172a',
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
