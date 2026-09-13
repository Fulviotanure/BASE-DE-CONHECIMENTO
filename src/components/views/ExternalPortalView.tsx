import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  FileDown, 
  HelpCircle, 
  LifeBuoy, 
  ExternalLink, 
  CheckCircle2, 
  FileText, 
  Globe, 
  ShieldAlert,
  ArrowRight,
  Download,
  Lock,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Article, ToolItem } from '../../types';

interface ExternalPortalViewProps {
  onBackToPresentation?: () => void;
  onSelectArticle?: (art: Article) => void;
}

export const ExternalPortalView: React.FC<ExternalPortalViewProps> = ({ 
  onBackToPresentation,
  onSelectArticle 
}) => {
  const { articles, tools, currentUser, setIsAuthModalOpen, setSelectedArticle, voteArticle } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'articles' | 'downloads' | 'support'>('articles');
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);

  // Filtra apenas artigos públicos / externos (accessLevel === 'ALL' || accessLevel === 'EXTERNAL')
  const publicArticles = articles.filter(
    (a) => a.currentStatus === 'APPROVED' && (a.accessLevel === 'ALL' || a.accessLevel === 'EXTERNAL')
  );

  const filteredArticles = publicArticles.filter((a) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (a.code && a.code.toLowerCase().includes(q)) ||
      a.title.toLowerCase().includes(q) ||
      a.categoryName.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  // Filtra ferramentas/downloads públicos
  const publicTools = tools.filter((t) => t.isActive && t.accessLevel !== 'INTERNAL');

  const handleOpenArticle = (art: Article) => {
    setReadingArticle(art);
    if (onSelectArticle) onSelectArticle(art);
  };

  return (
    <div 
      style={{ 
        maxWidth: '1140px', 
        margin: '0 auto', 
        padding: '32px 20px 80px 20px', 
        width: '100%',
        color: 'var(--text-main)',
      }} 
      className="animate-fade-in"
    >
      {/* Staff Callout if visitor or external */}
      {(!currentUser || currentUser.userType === 'EXTERNAL') && (
        <div 
          style={{
            padding: '12px 18px',
            background: 'rgba(92, 183, 128, 0.08)',
            border: '1px solid rgba(92, 183, 128, 0.25)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={18} color="var(--color-primary)" />
            <span style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>
              Você está navegando no <strong>Portal do Cliente e Suporte Externo</strong>.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary)',
              color: '#1a1d20',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Lock size={12} />
            <span>Acesso Colaborador (@conciliadorcontabil.com.br)</span>
          </button>
        </div>
      )}

      {/* Hero Title */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span 
            style={{ 
              fontSize: '0.72rem', 
              fontWeight: 800, 
              color: '#38bdf8', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(56, 189, 248, 0.12)',
            }}
          >
            Portal do Cliente
          </span>
          {onBackToPresentation && (
            <button
              type="button"
              onClick={onBackToPresentation}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-subtle)',
                fontSize: '0.76rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              ← Voltar à Apresentação
            </button>
          )}
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' }}>
          Central de Manuais, Modelos & Suporte
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0, maxWidth: '700px' }}>
          Consulte guias de importação de extratos bancários, modelos de planilhas para integração
          e acione nosso time de atendimento técnico especializado.
        </p>
      </div>

      {/* Tabs */}
      <div 
        style={{ 
          display: 'flex', 
          borderBottom: '1px solid var(--border-subtle)', 
          marginBottom: '28px',
          gap: '8px',
        }}
      >
        {[
          { id: 'articles', label: 'Manuais & Tutoriais', icon: BookOpen },
          { id: 'downloads', label: 'Modelos & Downloads', icon: FileDown },
          { id: 'support', label: 'Suporte & Chamados', icon: LifeBuoy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as any);
                setReadingArticle(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ARTICLES */}
      {activeTab === 'articles' && (
        <div>
          {readingArticle ? (
            <div 
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px',
              }}
            >
              <button
                type="button"
                onClick={() => setReadingArticle(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '24px',
                }}
              >
                ← Voltar para a listagem de manuais
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    fontFamily: 'monospace',
                    letterSpacing: '0.04em',
                  }}
                >
                  {readingArticle.code || 'CC-DOC'}
                </span>
                <span 
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'var(--color-primary-subtle)',
                    color: 'var(--color-primary)',
                  }}
                >
                  {readingArticle.categoryName}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                  Criado por: <strong>{readingArticle.authorName || 'Fulvio Tanure'}</strong> em {new Date(readingArticle.createdAt).toLocaleDateString('pt-BR')} • {readingArticle.viewCount} visualizações
                </span>
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 20px 0', color: 'var(--text-main)' }}>
                {readingArticle.title}
              </h2>

              <div 
                style={{
                  lineHeight: 1.7,
                  color: 'var(--text-main)',
                  fontSize: '0.94rem',
                }}
                dangerouslySetInnerHTML={{ __html: readingArticle.contentHtml }}
              />

              {/* Helpful Feedback: Joinha & Deslike com Contadores */}
              <div
                style={{
                  marginTop: '32px',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Este manual técnico esclareceu sua dúvida?
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => voteArticle(readingArticle.id, 'like')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    <ThumbsUp size={14} />
                    <span>Útil ({readingArticle.likesCount || 0})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => voteArticle(readingArticle.id, 'dislike')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    <ThumbsDown size={14} />
                    <span>Não ajudou ({readingArticle.dislikesCount || 0})</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Search Bar */}
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <Search 
                  size={18} 
                  color="var(--text-subtle)" 
                  style={{ position: 'absolute', left: '14px', top: '14px' }} 
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar manual de importação, extratos, ERPs ou dúvidas comuns..."
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Grid of Public Articles */}
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                  gap: '16px' 
                }}
              >
                {filteredArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => handleOpenArticle(art)}
                    style={{
                      padding: '22px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(56, 189, 248, 0.15)',
                              color: '#38bdf8',
                              border: '1px solid rgba(56, 189, 248, 0.3)',
                              fontFamily: 'monospace',
                            }}
                          >
                            {art.code || 'CC-DOC'}
                          </span>
                          <span 
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: 'var(--color-primary-subtle)',
                              color: 'var(--color-primary)',
                            }}
                          >
                            {art.categoryName}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                          Manual Oficial
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-main)', lineHeight: 1.4 }}>
                        {art.title}
                      </h3>

                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                        Orientações para exportação no banco, formatação correta e validação no Conciliador.
                      </p>

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginBottom: '12px' }}>
                        Criado por: <strong>{art.authorName || 'Fulvio Tanure'}</strong> • {new Date(art.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {art.tags.slice(0, 3).map((tag, idx) => (
                          <span 
                            key={idx}
                            style={{
                              fontSize: '0.68rem',
                              padding: '1px 6px',
                              borderRadius: '3px',
                              background: 'var(--bg-input)',
                              color: 'var(--text-subtle)',
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem' }}>
                          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                            <ThumbsUp size={12} />
                            {art.likesCount || 0}
                          </span>
                          <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                            <ThumbsDown size={12} />
                            {art.dislikesCount || 0}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          Ler manual <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DOWNLOADS & TEMPLATES */}
      {activeTab === 'downloads' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px 0' }}>
              Modelos de Arquivos e Planilhas Oficiais
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
              Baixe os padrões aceitos para conciliação manual, conversores e layouts de sistemas ERP.
            </p>
          </div>

          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '16px' 
            }}
          >
            {publicTools.map((tool) => (
              <div
                key={tool.id}
                style={{
                  padding: '20px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span 
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                      }}
                    >
                      {tool.category}
                    </span>
                    {tool.fileSize && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                        {tool.fileSize}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-main)' }}>
                    {tool.title}
                  </h3>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                    {tool.description}
                  </p>
                </div>

                <a
                  href={tool.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '9px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.color = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.color = 'var(--text-main)';
                  }}
                >
                  <Download size={14} />
                  <span>Baixar Arquivo Oficial</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SUPPORT */}
      {activeTab === 'support' && (
        <div 
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div 
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(92, 183, 128, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
              }}
            >
              <LifeBuoy size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                Central de Suporte Técnico & Chamados
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                Atendimento N3 especializado para clientes da plataforma
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            Se você encontrou dificuldades na leitura do seu arquivo bancário, divergência de saldo
            ou precisa de auxílio para homologar um novo formato de extrato, utilize nosso canal oficial de chamados.
          </p>

          <div 
            style={{
              padding: '16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Antes de abrir seu chamado, verifique:
            </span>
            {[
              'Se o formato do extrato exportado do banco é OFX original (sem edição prévia).',
              'Se o arquivo PDF possui texto selecionável (não é uma imagem escaneada).',
              'Se o cadastro da conta corrente e banco no Conciliador coincidem com o arquivo.',
            ].map((check, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={14} color="var(--color-primary)" />
                <span>{check}</span>
              </div>
            ))}
          </div>

          <a
            href="https://conciliador-contabil2.movidesk.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '14px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary)',
              color: '#1a1d20',
              fontWeight: 800,
              fontSize: '0.94rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(92, 183, 128, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <LifeBuoy size={18} />
            <span>Acessar Central de Chamados Movidesk</span>
            <ExternalLink size={16} />
          </a>
        </div>
      )}
    </div>
  );
};
