import React, { useState, useEffect } from 'react';
import {
  FileEdit,
  Send,
  ArrowLeft,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  List,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Code,
  Tag,
  Sparkles,
  Info,
  CheckSquare2,
  Lock,
  Globe,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Article } from '../../types';

interface ArticleEditorViewProps {
  editingArticle: Article | null;
  isProposalMode?: boolean;
  onClose: () => void;
}

export const ArticleEditorView: React.FC<ArticleEditorViewProps> = ({
  editingArticle,
  isProposalMode = false,
  onClose,
}) => {
  const { categories, createArticle, updateArticleContent, proposeArticleEdit, currentUser } = useApp();

  const [title, setTitle] = useState(editingArticle?.title || '');
  const [categoryId, setCategoryId] = useState(editingArticle?.categoryId || categories[0]?.id || '');
  const [tagInput, setTagInput] = useState(editingArticle?.tags.join(', ') || '');
  const [accessLevel, setAccessLevel] = useState<'INTERNAL' | 'ALL'>(
    editingArticle?.accessLevel === 'ALL' || editingArticle?.accessLevel === 'EXTERNAL' ? 'ALL' : 'INTERNAL'
  );
  const [proposalNote, setProposalNote] = useState(editingArticle?.proposalNote || '');
  const [content, setContent] = useState(
    editingArticle?.contentHtml ||
      `<h2>Visão Geral do Procedimento</h2>\n<p>Descreva detalhadamente o passo a passo da rotina contábil...</p>\n\n<div class="callout callout-info">\n  <strong>💡 Dica:</strong> Utilize arquivos no formato .OFX para maior precisão no confronto.\n</div>`
  );

  const [previewMode, setPreviewMode] = useState(false);
  const [resolvedChecklist, setResolvedChecklist] = useState<Record<string, boolean>>({});

  // Obter a última revisão se o artigo estiver em ajuste
  const latestReview = editingArticle?.reviews?.[0];
  const isAdjustmentMode = editingArticle?.currentStatus === 'IN_ADJUSTMENT' && latestReview;

  const insertSnippet = (snippet: string) => {
    setContent((prev) => prev + '\n' + snippet);
  };

  const handleSaveAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Por favor, defina um título para o artigo.');
      return;
    }

    const tags = tagInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    if (isProposalMode && editingArticle) {
      if (!proposalNote.trim()) {
        alert('Por favor, preencha a justificativa da proposta de edição para orientar os revisores.');
        return;
      }
      proposeArticleEdit(
        editingArticle.id,
        title.trim(),
        categoryId,
        content,
        tags,
        accessLevel,
        proposalNote.trim()
      );
      alert('Proposta de edição submetida com sucesso para a Fila Editorial!');
    } else if (editingArticle) {
      updateArticleContent(editingArticle.id, title.trim(), categoryId, content, tags, accessLevel);
    } else {
      createArticle(title.trim(), categoryId, content, tags, accessLevel);
    }

    onClose();
  };

  return (
    <div style={{ padding: '24px 32px', height: '100%', display: 'flex', flexDirection: 'column' }} className="animate-fade-in">
      {/* Top Bar Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            <ArrowLeft size={14} />
            <span>Voltar</span>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              {editingArticle?.code && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: 'rgba(92, 183, 128, 0.15)',
                    color: 'var(--color-primary)',
                    border: '1px solid rgba(92, 183, 128, 0.3)',
                    fontFamily: 'monospace',
                  }}
                >
                  {editingArticle.code}
                </span>
              )}
              <h1 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>
                {isProposalMode
                  ? `📝 Proposta de Edição: ${editingArticle?.title || 'Artigo'}`
                  : editingArticle
                  ? `Editando: ${editingArticle.title}`
                  : 'Redigir Novo Artigo Técnico'}
              </h1>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
              {isProposalMode
                ? 'Sua proposta de edição será avaliada pela Fila de Revisores antes da publicação'
                : isAdjustmentMode
                ? 'Artigo em fase de ajuste • Siga as notas na barra lateral direita'
                : editingArticle
                ? `Criado por: ${editingArticle.authorName || 'Fulvio Tanure'} em ${new Date(editingArticle.createdAt).toLocaleDateString('pt-BR')}`
                : 'Todo input é submetido para a fila de revisão antes de ser publicado'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Voltar para Edição' : 'Visualizar Prévia'}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSaveAndSubmit}
          >
            <Send size={14} />
            <span>{isProposalMode ? 'Enviar Proposta para Revisão' : 'Submeter para Revisão'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Split between Editor and Context Sidebar if in adjustment */}
      <div style={{ display: 'flex', flex: 1, gap: '24px', overflow: 'hidden' }}>
        {/* Editor Form Left Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {/* Title & Category Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Título do Artigo / Solução:
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Como Configurar Regras de Desmembramento de Extrato SISPAG"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Módulo / Categoria:
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} style={{ background: '#1e2227' }}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Proposta de Edição Justification (Quando em modo proposta) */}
          {isProposalMode && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--status-pending)', marginBottom: '4px' }}>
                📝 Justificativa / Motivo da Proposta de Edição (Obrigatório para revisão):
              </label>
              <textarea
                rows={3}
                required
                value={proposalNote}
                onChange={(e) => setProposalNote(e.target.value)}
                placeholder="Descreva o que mudou na regra de conciliação, layout do extrato, correção de procedimento..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.5,
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* Row: Visibilidade & Tags */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            {/* Visibilidade: Interno vs Externo */}
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Visibilidade do Artigo:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setAccessLevel('INTERNAL')}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${accessLevel === 'INTERNAL' ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                    background: accessLevel === 'INTERNAL' ? 'var(--color-primary-subtle)' : 'var(--bg-input)',
                    color: accessLevel === 'INTERNAL' ? 'var(--color-primary)' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Lock size={14} />
                  <span>🔒 Interno (Equipe)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccessLevel('ALL')}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${accessLevel === 'ALL' ? '#38bdf8' : 'var(--border-subtle)'}`,
                    background: accessLevel === 'ALL' ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-input)',
                    color: accessLevel === 'ALL' ? '#38bdf8' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Globe size={14} />
                  <span>🌐 Externo (Clientes)</span>
                </button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Tags & Palavras-Chave (separadas por vírgula):
              </label>
              <input
                type="text"
                placeholder="OFX, SISPAG, Banco Itaú, Regras, Domínio"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                }}
              />
            </div>
          </div>

          {/* Formatting Toolbar */}
          {!previewMode && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '6px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderBottom: 'none',
                padding: '8px 12px',
                borderTopLeftRadius: 'var(--radius-md)',
                borderTopRightRadius: 'var(--radius-md)',
              }}
            >
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => insertSnippet('<h2>Novo Título de Seção</h2>\n<p>Explicação técnica...</p>')}
              >
                <Heading2 size={13} />
                <span>H2</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => insertSnippet('<h3>Subtítulo</h3>')}
              >
                <Heading3 size={13} />
                <span>H3</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  insertSnippet(
                    '<div class="callout callout-info">\n  <strong>💡 Dica Contábil:</strong> Informação de apoio...\n</div>'
                  )
                }
              >
                <Info size={13} color="#3b82f6" />
                <span>Callout Dica</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  insertSnippet(
                    '<div class="callout callout-warning">\n  <strong>⚠️ Atenção:</strong> Cuidado com a duplicação...\n</div>'
                  )
                }
              >
                <AlertCircle size={13} color="#f59e0b" />
                <span>Callout Atenção</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  insertSnippet(
                    '<ol style="margin-left: 20px; line-height: 1.8;">\n  <li>Passo 1: Acessar o menu...</li>\n  <li>Passo 2: Selecionar o arquivo...</li>\n</ol>'
                  )
                }
              >
                <List size={13} />
                <span>Lista Passo a Passo</span>
              </button>
            </div>
          )}

          {/* Editor TextArea or Preview */}
          {previewMode ? (
            <div
              className="card"
              style={{
                flex: 1,
                padding: '24px',
                overflowY: 'auto',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                lineHeight: 1.7,
              }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva seu artigo aqui em formato HTML ou texto estruturado..."
              style={{
                flex: 1,
                minHeight: '380px',
                padding: '16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderBottomLeftRadius: 'var(--radius-md)',
                borderBottomRightRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontFamily: 'monospace',
                lineHeight: 1.6,
                resize: 'none',
              }}
            />
          )}
        </div>

        {/* Context Sidebar: Barra Lateral de Contexto (Exclusivo p/ Artigos Em Ajuste) */}
        {isAdjustmentMode && (
          <div
            style={{
              width: '340px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <MessageSquare size={18} color="var(--status-adjust)" />
              <div>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: 0 }}>
                  Orientações do Revisor
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                  Por {latestReview.reviewerName}
                </span>
              </div>
            </div>

            {/* General Feedback Box */}
            <div
              style={{
                padding: '12px',
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.84rem',
                color: 'var(--text-main)',
                lineHeight: 1.5,
                marginBottom: '18px',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--status-adjust)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Parecer Geral:
              </div>
              {latestReview.generalFeedback}
            </div>

            {/* Checklist of Technical Points */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                Checklist de Ajustes ({latestReview.comments.length})
              </span>

              {latestReview.comments.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Siga o parecer geral acima para ajustar o texto.
                </span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {latestReview.comments.map((comment) => {
                    const isChecked = resolvedChecklist[comment.id] ?? comment.isResolved;
                    return (
                      <div
                        key={comment.id}
                        onClick={() =>
                          setResolvedChecklist((prev) => ({ ...prev, [comment.id]: !isChecked }))
                        }
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)',
                          border: `1px solid ${isChecked ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          style={{ marginTop: '3px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                        />
                        <div style={{ flex: 1 }}>
                          <span
                            style={{
                              fontSize: '0.82rem',
                              color: isChecked ? 'var(--text-subtle)' : 'var(--text-main)',
                              textDecoration: isChecked ? 'line-through' : 'none',
                              lineHeight: 1.4,
                              display: 'block',
                            }}
                          >
                            {comment.message}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Hint */}
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={13} color="var(--color-primary)" />
              <span>Marque os itens resolvidos antes de reenviar</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
