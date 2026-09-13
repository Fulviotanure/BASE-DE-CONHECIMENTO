import React, { useEffect, useState } from 'react';
import { Search, X, BookOpen, Wrench, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Article, ToolItem } from '../../types';

interface SearchSpotlightModalProps {
  onSelectArticle: (article: Article) => void;
  onSelectTool: (tool: ToolItem) => void;
}

export const SearchSpotlightModal: React.FC<SearchSpotlightModalProps> = ({
  onSelectArticle,
  onSelectTool,
}) => {
  const { isSearchOpen, setIsSearchOpen, articles, tools, categories, currentUser } = useApp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const normalized = query.toLowerCase().trim();
  const isExternal = !currentUser || currentUser.userType === 'EXTERNAL' || currentUser.role === 'READER';
  const availableArticles = articles.filter(
    (a) => a.currentStatus === 'APPROVED' && (!isExternal || (a.accessLevel === 'ALL' || a.accessLevel === 'EXTERNAL'))
  );

  // Filtrar artigos aprovados e com permissão de acesso (incluindo busca por código único como CC-101)
  const matchedArticles = normalized
    ? availableArticles.filter(
        (a) =>
          (a.code && a.code.toLowerCase().includes(normalized)) ||
          a.title.toLowerCase().includes(normalized) ||
          a.categoryName.toLowerCase().includes(normalized) ||
          a.tags.some((t) => t.toLowerCase().includes(normalized)) ||
          a.contentHtml.toLowerCase().includes(normalized)
      )
    : availableArticles.slice(0, 6);

  const matchedTools = normalized
    ? tools.filter(
        (t) =>
          t.title.toLowerCase().includes(normalized) ||
          t.description.toLowerCase().includes(normalized)
      )
    : tools.slice(0, 3);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px',
      }}
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            gap: '12px',
          }}
        >
          <Search size={20} color="var(--color-primary)" />
          <input
            autoFocus
            type="text"
            placeholder="Pesquise por código rápido (ex: CC-101, CC-102) ou termos (OFX, SISPAG, regras)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              fontSize: '1rem',
              outline: 'none',
              color: 'var(--text-main)',
            }}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} style={{ color: 'var(--text-subtle)' }}>
              <X size={18} />
            </button>
          )}
          <kbd
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '0.72rem',
              color: 'var(--text-subtle)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Search Results */}
        <div style={{ maxHeight: '440px', overflowY: 'auto', padding: '12px' }}>
          {/* Artigos */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-subtle)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '4px 8px',
                marginBottom: '4px',
              }}
            >
              Artigos & Manuais ({matchedArticles.length})
            </div>
            {matchedArticles.length === 0 ? (
              <div style={{ padding: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Nenhum artigo encontrado para esta busca rápida.
              </div>
            ) : (
              matchedArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => {
                    onSelectArticle(art);
                    setIsSearchOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BookOpen size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(92, 183, 128, 0.15)',
                            color: 'var(--color-primary)',
                            border: '1px solid rgba(92, 183, 128, 0.3)',
                            fontFamily: 'monospace',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {art.code || 'CC-DOC'}
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {art.title}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                        Módulo: <strong>{art.categoryName}</strong> • Criado por: <strong>{art.authorName || 'Fulvio Tanure'}</strong> em {new Date(art.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={15} color="var(--text-subtle)" />
                </div>
              ))
            )}
          </div>

          {/* Ferramentas e Softwares */}
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-subtle)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '4px 8px',
                marginBottom: '4px',
              }}
            >
              Ferramentas & Utilitários ({matchedTools.length})
            </div>
            {matchedTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool);
                  setIsSearchOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Wrench size={16} color="var(--color-secondary)" />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {tool.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                      {tool.description}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-secondary-subtle)',
                    color: 'var(--color-secondary)',
                    fontWeight: 600,
                  }}
                >
                  {tool.resourceType === 'DOWNLOAD_FILE' ? tool.fileSize : 'Link'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer hint */}
        <div
          style={{
            padding: '10px 20px',
            background: 'var(--bg-sidebar)',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            color: 'var(--text-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Pressione Enter para selecionar ou clique no item</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CornerDownLeft size={13} />
            <span>Navegar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
