import React, { useState, useEffect, useRef } from 'react';
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
  Image as ImageIcon,
  Upload,
  Link2,
  X,
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

  // Estados para Upload & Inserção de Imagens
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageSource, setImageSource] = useState<'UPLOAD' | 'URL'>('UPLOAD');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compressão inteligente para WebP de alto desempenho
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDimension = 1280;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressedUrl = canvas.toDataURL('image/webp', 0.85);
          resolve(compressedUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const insertImageHtml = (src: string, caption: string) => {
    const figureHtml = `\n<figure style="margin: 24px auto; text-align: center; max-width: 100%;">\n  <img src="${src}" alt="${caption || 'Imagem do procedimento'}" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid var(--border-subtle); box-shadow: 0 4px 16px rgba(0,0,0,0.25);" />\n${caption ? `  <figcaption style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px; font-style: italic;">${caption}</figcaption>\n` : ''}</figure>\n`;
    setContent((prev) => prev + figureHtml);
  };

  // Permite colar print de tela (Ctrl + V) diretamente na caixa de edição
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          try {
            setToastMsg('📸 Processando print colado...');
            const compressed = await compressImage(file);
            insertImageHtml(compressed, 'Screenshot anexado');
            setToastMsg('✅ Print de tela inserido no artigo com sucesso!');
            setTimeout(() => setToastMsg(null), 3000);
          } catch (err) {
            console.error('Erro ao processar imagem colada:', err);
            setToastMsg('Erro ao processar imagem colada.');
            setTimeout(() => setToastMsg(null), 3000);
          }
          return;
        }
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
    } catch (err) {
      console.error('Erro ao comprimir imagem:', err);
      alert('Erro ao carregar imagem.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleConfirmInsertImage = () => {
    const finalUrl = imageSource === 'UPLOAD' ? imagePreview : imageUrlInput.trim();
    if (!finalUrl) {
      alert('Por favor, selecione uma imagem ou informe a URL.');
      return;
    }

    insertImageHtml(finalUrl, imageCaption.trim());
    setIsImageModalOpen(false);
    setImagePreview(null);
    setImageUrlInput('');
    setImageCaption('');
    setToastMsg('✅ Imagem inserida no artigo com sucesso!');
    setTimeout(() => setToastMsg(null), 3000);
  };

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

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsImageModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.12)',
                  borderColor: 'rgba(56, 189, 248, 0.35)',
                  fontWeight: 700,
                }}
              >
                <ImageIcon size={13} color="#38bdf8" />
                <span>Inserir Imagem / Print</span>
              </button>
            </div>
          )}

          {/* Toast informativo de Imagem Anexada */}
          {toastMsg && (
            <div
              className="animate-fade-in"
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                margin: '8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#38bdf8',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={15} />
              <span>{toastMsg}</span>
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
              onPaste={handlePaste}
              placeholder="Escreva seu artigo aqui... Dica: Você pode colar prints de tela (Ctrl + V) diretamente aqui ou clicar em 'Inserir Imagem / Print' acima!"
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

      {/* Modal de Inserção de Imagem / Print */}
      {isImageModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="animate-fade-in"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '540px',
              width: '100%',
              padding: '24px',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8',
                  }}
                >
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                    Inserir Imagem / Print no Artigo
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Suba imagens do seu computador ou vincule URLs do Cloudflare R2
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                padding: '3px',
                marginBottom: '18px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <button
                type="button"
                onClick={() => setImageSource('UPLOAD')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: 'none',
                  background: imageSource === 'UPLOAD' ? 'var(--bg-card)' : 'transparent',
                  color: imageSource === 'UPLOAD' ? 'var(--text-main)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: imageSource === 'UPLOAD' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <Upload size={14} />
                <span>Subir Imagem / Print</span>
              </button>
              <button
                type="button"
                onClick={() => setImageSource('URL')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: 'none',
                  background: imageSource === 'URL' ? 'var(--bg-card)' : 'transparent',
                  color: imageSource === 'URL' ? 'var(--text-main)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: imageSource === 'URL' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <Link2 size={14} />
                <span>URL / Cloudflare R2</span>
              </button>
            </div>

            {/* Tab 1: Upload / Arquivo local */}
            {imageSource === 'UPLOAD' && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '32px 16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: 'var(--bg-card)',
                      transition: 'border-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                  >
                    <Upload size={32} color="var(--color-primary)" style={{ margin: '0 auto 10px auto' }} />
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                      Clique para escolher imagem ou print do seu computador
                    </p>
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      PNG, JPG, GIF ou WebP (otimização e compressão automática)
                    </p>
                    <div
                      style={{
                        marginTop: '12px',
                        display: 'inline-block',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(56, 189, 248, 0.1)',
                        color: '#38bdf8',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      💡 Dica: Você também pode colar prints com <strong>Ctrl + V</strong> direto no texto!
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      position: 'relative',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: '1px solid var(--border-subtle)',
                      background: '#000',
                      textAlign: 'center',
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Prévia selecionada"
                      style={{ maxHeight: '220px', maxWidth: '100%', objectFit: 'contain' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                {isProcessingImage && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-primary)', marginTop: '8px' }}>
                    Processando e comprimindo imagem...
                  </p>
                )}
              </div>
            )}

            {/* Tab 2: URL / Cloudflare R2 */}
            {imageSource === 'URL' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  URL Pública da Imagem:
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="url"
                    placeholder="https://pub-47b999e464d143b8a140a73baf6ef575.r2.dev/minha-imagem.png"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.82rem',
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setImageUrlInput('https://pub-47b999e464d143b8a140a73baf6ef575.r2.dev/')}
                    style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                  >
                    Prefixo R2
                  </button>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '12px' }}>
                  Bucket R2 configurado: <code>https://pub-47b999e464d143b8a140a73baf6ef575.r2.dev/</code>
                </span>

                {imageUrlInput && (
                  <div
                    style={{
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: '1px solid var(--border-subtle)',
                      background: '#000',
                      textAlign: 'center',
                    }}
                  >
                    <img
                      src={imageUrlInput}
                      alt="Prévia por URL"
                      onError={() => {}}
                      style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Legenda / Caption */}
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Legenda / Descrição da Imagem (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ex: Tela de configuração de parâmetros no Domínio Sistemas"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
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

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsImageModalOpen(false);
                  setImagePreview(null);
                  setImageUrlInput('');
                  setImageCaption('');
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmInsertImage}
                disabled={imageSource === 'UPLOAD' ? !imagePreview : !imageUrlInput.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: (imageSource === 'UPLOAD' ? !imagePreview : !imageUrlInput.trim()) ? 0.5 : 1,
                }}
              >
                <ImageIcon size={14} />
                <span>Inserir no Artigo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
