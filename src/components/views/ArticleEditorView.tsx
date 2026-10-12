import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useArticleImageFallback } from '../../utils/imageFallback';
import {
  FileEdit,
  Send,
  ArrowLeft,
  MessageSquare,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  Code,
  Tag,
  Sparkles,
  Lock,
  Globe,
  List,
  ListOrdered,
  Quote,
  Table,
  Image as ImageIcon,
  ImagePlus,
  Link as LinkIcon,
  Film,
  ExternalLink,
  Paperclip,
  Upload,
  Trash2,
  Columns,
  Eye,
  Code2,
  X,
  FileText,
  AlertTriangle,
  Lightbulb,
  Info,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Maximize2,
  Grid,
  Video,
  Undo2,
  Redo2,
  Palette,
  Contrast
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
  const { categories, createArticle, updateArticleContent, proposeArticleEdit, currentUser, addArticleComment, articles } = useApp();

  const [title, setTitle] = useState(editingArticle?.title || '');
  const [categoryId, setCategoryId] = useState(editingArticle?.categoryId || categories[0]?.id || '');
  const [subcategoryId, setSubcategoryId] = useState(editingArticle?.subcategoryId || '');
  const [tagInput, setTagInput] = useState(editingArticle?.tags.join(', ') || '');

  // Verificação de categoria Interna ou Playbook (sempre restrito a colaboradores internos)
  const selectedCatObj = categories.find((c) => c.id === categoryId);
  const isInternalOnlyCategory = Boolean(
    categoryId === 'cat-11' ||
    categoryId === 'cat-12' ||
    selectedCatObj?.accessLevel === 'INTERNAL' ||
    selectedCatObj?.title?.toLowerCase().includes('playbook')
  );
  const isPlaybookCategory = isInternalOnlyCategory;

  const [accessLevel, setAccessLevel] = useState<'INTERNAL' | 'ALL'>(() => {
    if (editingArticle?.categoryId === 'cat-11' || editingArticle?.categoryId === 'cat-12') return 'INTERNAL';
    const initCat = categories.find((c) => c.id === (editingArticle?.categoryId || categoryId));
    if (initCat?.accessLevel === 'INTERNAL') return 'INTERNAL';
    return editingArticle?.accessLevel === 'ALL' || editingArticle?.accessLevel === 'EXTERNAL' ? 'ALL' : 'INTERNAL';
  });

  // Se a categoria selecionada for interna, garante que accessLevel seja sempre INTERNAL
  useEffect(() => {
    if (isInternalOnlyCategory && accessLevel !== 'INTERNAL') {
      setAccessLevel('INTERNAL');
    }
  }, [categoryId, isInternalOnlyCategory]);

  const [proposalNote, setProposalNote] = useState(editingArticle?.proposalNote || '');
  const [content, setContent] = useState(
    editingArticle?.contentHtml || ''
  );

  // Modo de Edição: Texto Visual (Padrão WYSIWYG) vs Código HTML
  const [editorMode, setEditorMode] = useState<'VISUAL' | 'HTML'>('VISUAL');

  // Anexos do Artigo
  const [attachments, setAttachments] = useState<{ id: string; name: string; size: string; url?: string }[]>(
    editingArticle?.attachments || []
  );

  // Modal Unificado Inteligente de Mídia (Imagem, Vídeo ou Hiperlink)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaActiveTab, setMediaActiveTab] = useState<'link' | 'upload'>('link');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaCaption, setMediaCaption] = useState('');
  const [mediaInsertWidth, setMediaInsertWidth] = useState<number>(100);
  const [mediaInsertAlign, setMediaInsertAlign] = useState<'center' | 'left' | 'right'>('center');
  const [manualMediaType, setManualMediaType] = useState<'auto' | 'video' | 'image' | 'link'>('auto');

  // Estados legados mantidos para compatibilidade
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageInsertWidth, setImageInsertWidth] = useState<number>(100);
  const [imageInsertAlign, setImageInsertAlign] = useState<'center' | 'left' | 'right'>('center');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoCaption, setVideoCaption] = useState('');
  const [videoInsertWidth, setVideoInsertWidth] = useState<number>(100);
  const [videoInsertAlign, setVideoInsertAlign] = useState<'center' | 'left' | 'right'>('center');

  // Referência para salvar a posição exata do cursor antes de abrir o modal
  const savedSelectionRangeRef = useRef<Range | null>(null);

  // Dropdown e Grid Interativo de Criação de Tabela por Mouse
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const [tableHoverRows, setTableHoverRows] = useState(3);
  const [tableHoverCols, setTableHoverCols] = useState(3);

  // Imagem Selecionada para Redimensionamento e Alinhamento
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [selectedImageWidth, setSelectedImageWidth] = useState<number>(100);
  const [selectedImageAlign, setSelectedImageAlign] = useState<'center' | 'left' | 'right'>('center');
  const [overlayRect, setOverlayRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  // Vídeo Selecionado para Redimensionamento e Alinhamento
  const [selectedVideoElement, setSelectedVideoElement] = useState<HTMLElement | null>(null);
  const [selectedVideoWidth, setSelectedVideoWidth] = useState<number>(100);
  const [selectedVideoAlign, setSelectedVideoAlign] = useState<'center' | 'left' | 'right'>('center');

  // Conversa com o Revisor
  const [creatorReplyInput, setCreatorReplyInput] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const visualEditorRef = useRef<HTMLDivElement>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const draggedImageElementRef = useRef<HTMLElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Atualiza coordenadas dos pontos de redimensionamento em tempo real (para Imagem OU Vídeo)
  const updateOverlayRect = () => {
    const target = selectedImage || selectedVideoElement;
    if (!target || !editorWrapperRef.current) {
      setOverlayRect(null);
      return;
    }
    const wrapperRect = editorWrapperRef.current.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    if (
      targetRect.width === 0 ||
      targetRect.height === 0 ||
      targetRect.bottom < wrapperRect.top ||
      targetRect.top > wrapperRect.bottom
    ) {
      setOverlayRect(null);
      return;
    }

    setOverlayRect({
      top: targetRect.top - wrapperRect.top,
      left: targetRect.left - wrapperRect.left,
      width: targetRect.width,
      height: targetRect.height,
    });
  };

  useEffect(() => {
    updateOverlayRect();
  }, [selectedImage, selectedVideoElement]);

  useEffect(() => {
    const onResizeOrScroll = () => {
      if (selectedImage || selectedVideoElement) updateOverlayRect();
    };
    window.addEventListener('resize', onResizeOrScroll);
    visualEditorRef.current?.addEventListener('scroll', onResizeOrScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', onResizeOrScroll);
      visualEditorRef.current?.removeEventListener('scroll', onResizeOrScroll);
    };
  }, [selectedImage, selectedVideoElement]);

  // Intercepta imagens com links expirados do Movidesk no editor visual e na prévia
  useArticleImageFallback(visualEditorRef, [content, editorMode]);
  useArticleImageFallback(previewRef, [content, editorMode]);

  // Artigo atualizado em tempo real da lista
  const currentArticle = articles.find((a) => a.id === editingArticle?.id) || editingArticle;
  const latestReview = currentArticle?.reviews?.[0];
  const isAdjustmentMode = currentArticle?.currentStatus === 'IN_ADJUSTMENT';
  const showConversationSidebar = Boolean(
    currentArticle && (
      (currentArticle.comments && currentArticle.comments.length > 0) ||
      isAdjustmentMode ||
      currentArticle.reviews?.length ||
      currentArticle.proposalNote
    )
  );

  // Sincronização inicial e contínua do editor visual
  useEffect(() => {
    if (visualEditorRef.current) {
      visualEditorRef.current.innerHTML = content;
    }
  }, []);

  useEffect(() => {
    if (visualEditorRef.current && editorMode === 'VISUAL') {
      if (visualEditorRef.current.innerHTML !== content) {
        visualEditorRef.current.innerHTML = content;
      }
    }
  }, [editorMode]);

  const syncFromVisualEditor = () => {
    if (visualEditorRef.current) {
      setContent(visualEditorRef.current.innerHTML);
    }
  };

  // Inserir trecho HTML na posição exata do cursor ou seleção
  const insertHtmlAtCursor = (html: string) => {
    if (editorMode === 'VISUAL' && visualEditorRef.current) {
      visualEditorRef.current.focus();
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (visualEditorRef.current.contains(range.commonAncestorContainer)) {
          range.deleteContents();
          const el = document.createElement('div');
          el.innerHTML = html;
          const frag = document.createDocumentFragment();
          let node: Node | null;
          let lastNode: Node | null = null;
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node);
          }
          range.insertNode(frag);
          if (lastNode) {
            range.setStartAfter(lastNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }
          syncFromVisualEditor();
          return;
        }
      }
      visualEditorRef.current.innerHTML += html;
      syncFromVisualEditor();
    } else {
      insertSnippet(html);
    }
  };

  // Inserir trecho no textarea (Modo HTML)
  const insertSnippet = (snippet: string) => {
    if (!textareaRef.current) {
      setContent((prev) => prev + '\n' + snippet);
      return;
    }
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const before = content.substring(0, start);
    const after = content.substring(end);
    const newContent = before + snippet + after;
    setContent(newContent);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + snippet.length, start + snippet.length);
      }
    }, 0);
  };

  // Envolver seleção (Modo HTML)
  const wrapSelection = (tagOpen: string, tagClose: string, defaultText = 'texto') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = content.substring(start, end) || defaultText;
    const before = content.substring(0, start);
    const after = content.substring(end);
    const wrapped = `${tagOpen}${selected}${tagClose}`;
    setContent(before + wrapped + after);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + tagOpen.length, start + tagOpen.length + selected.length);
      }
    }, 0);
  };

  // Formatação Visual direta (WYSIWYG)
  const formatVisual = (command: string, value: string = '') => {
    if (editorMode === 'VISUAL' && visualEditorRef.current) {
      visualEditorRef.current.focus();
      document.execCommand(command, false, value);
      syncFromVisualEditor();
    } else {
      if (command === 'bold') wrapSelection('<strong>', '</strong>', 'negrito');
      else if (command === 'italic') wrapSelection('<em>', '</em>', 'itálico');
      else if (command === 'underline') wrapSelection('<u>', '</u>', 'sublinhado');
      else if (command === 'strikeThrough') wrapSelection('<s>', '</s>', 'riscado');
      else if (command === 'insertUnorderedList') insertSnippet('<ul>\n  <li>Primeiro item...</li>\n  <li>Segundo item...</li>\n</ul>');
      else if (command === 'insertOrderedList') insertSnippet('<ol>\n  <li>Passo 1: ...</li>\n  <li>Passo 2: ...</li>\n</ol>');
    }
  };

  // Desfazer (Undo / Ctrl+Z) e Refazer (Redo / Ctrl+Y)
  const handleUndo = () => {
    if (editorMode === 'VISUAL' && visualEditorRef.current) {
      visualEditorRef.current.focus();
      document.execCommand('undo', false);
      syncFromVisualEditor();
    } else if (textareaRef.current) {
      textareaRef.current.focus();
      document.execCommand('undo', false);
    }
  };

  const handleRedo = () => {
    if (editorMode === 'VISUAL' && visualEditorRef.current) {
      visualEditorRef.current.focus();
      document.execCommand('redo', false);
      syncFromVisualEditor();
    } else if (textareaRef.current) {
      textareaRef.current.focus();
      document.execCommand('redo', false);
    }
  };

  // Aplicação de Cor no Texto (com suporte a Cor Padrão / Dinâmica do Tema e Cores Customizadas)
  const applyTextColor = (color: string) => {
    if (editorMode === 'VISUAL' && visualEditorRef.current) {
      visualEditorRef.current.focus();
      if (color === 'default' || color === 'dynamic' || color === 'inherit') {
        // Remove cor forçada inline para que o texto herde dinamicamente o tema (Branco no Escuro, Preto no Claro)
        document.execCommand('styleWithCSS', false, 'true');
        document.execCommand('foreColor', false, 'inherit');

        // Limpeza adicional de spans/fonts com style de cor na seleção ativa
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          let parent: Node | null = range.commonAncestorContainer;
          if (parent.nodeType === Node.TEXT_NODE) parent = parent.parentElement;
          if (parent && parent !== visualEditorRef.current) {
            const el = parent as HTMLElement;
            if (el.style && el.style.color) {
              el.style.color = '';
            }
          }
        }
      } else {
        document.execCommand('styleWithCSS', false, 'true');
        document.execCommand('foreColor', false, color);
      }
      syncFromVisualEditor();
    } else {
      if (color === 'default' || color === 'dynamic' || color === 'inherit') {
        wrapSelection('<span class="text-dynamic">', '</span>', 'texto dinâmico');
      } else {
        wrapSelection(`<span style="color: ${color}">`, '</span>', 'texto colorido');
      }
    }
  };

  // Aplicação de Tamanho de Fonte / Título
  const applyFontSize = (size: string) => {
    if (editorMode === 'VISUAL' && visualEditorRef.current) {
      visualEditorRef.current.focus();
      if (size === 'h2') {
        document.execCommand('formatBlock', false, '<h2>');
      } else if (size === 'h3') {
        document.execCommand('formatBlock', false, '<h3>');
      } else if (size === 'p') {
        document.execCommand('formatBlock', false, '<p>');
      } else {
        insertHtmlAtCursor(`<span style="font-size: ${size};">${window.getSelection()?.toString() || 'texto'}</span>`);
      }
      syncFromVisualEditor();
    } else {
      if (size === 'h2') {
        wrapSelection('<h2>', '</h2>', 'Título Principal');
      } else if (size === 'h3') {
        wrapSelection('<h3>', '</h3>', 'Subtítulo da Seção');
      } else {
        wrapSelection(`<span style="font-size: ${size}">`, '</span>', 'texto destacado');
      }
    }
  };

  // Inserção de Caixas de Destaque (Callouts) - Sem texto de exemplo pré-inserido
  const insertCalloutTip = () => {
    const html = `<div class="callout callout-tip" style="padding: 14px 18px; margin: 16px 0; background: rgba(92, 183, 128, 0.12); border-left: 4px solid #5cb780; border-radius: 8px; color: var(--text-main);"><strong style="color: #5cb780; display: block; margin-bottom: 4px;">💡 Dica:</strong><p><br></p></div><p><br></p>`;
    insertHtmlAtCursor(html);
  };

  const insertCalloutInfo = () => {
    const html = `<div class="callout callout-info" style="padding: 14px 18px; margin: 16px 0; background: rgba(56, 189, 248, 0.12); border-left: 4px solid #38bdf8; border-radius: 8px; color: var(--text-main);"><strong style="color: #38bdf8; display: block; margin-bottom: 4px;">ℹ️ Observação:</strong><p><br></p></div><p><br></p>`;
    insertHtmlAtCursor(html);
  };

  const insertCalloutWarning = () => {
    const html = `<div class="callout callout-warning" style="padding: 14px 18px; margin: 16px 0; background: rgba(245, 158, 11, 0.12); border-left: 4px solid #f59e0b; border-radius: 8px; color: var(--text-main);"><strong style="color: #f59e0b; display: block; margin-bottom: 4px;">⚠️ Atenção:</strong><p><br></p></div><p><br></p>`;
    insertHtmlAtCursor(html);
  };

  // Helper para Inserção de Vídeo por Link (YouTube, Vimeo ou MP4) com Tamanho e Alinhamento
  const getEmbedVideoHtml = (
    url: string,
    caption?: string,
    widthPercent: number = 100,
    align: 'center' | 'left' | 'right' = 'center'
  ) => {
    const trimmed = url.trim();
    let embedUrl = '';

    // YouTube: suporta watch?v=, youtu.be/, embed/
    const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    } else {
      // Vimeo: suporta vimeo.com/ID
      const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
      if (vimeoMatch && vimeoMatch[1]) {
        embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      }
    }

    let figureStyle = `width: ${widthPercent}%; margin: 20px auto; text-align: center; display: block;`;
    if (align === 'left') {
      figureStyle = `width: ${widthPercent}%; float: left; margin: 10px 20px 20px 0; text-align: left; display: block;`;
    } else if (align === 'right') {
      figureStyle = `width: ${widthPercent}%; float: right; margin: 10px 0 20px 20px; text-align: right; display: block;`;
    }

    let videoPlayerHtml = '';
    if (embedUrl) {
      videoPlayerHtml = `
        <div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.3); background: #000;">
          <iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 8px;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      `;
    } else {
      // Vídeo direto (ex: .mp4, .webm)
      videoPlayerHtml = `
        <div style="border-radius: 8px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.3); background: #000;">
          <video controls style="width: 100%; max-height: 480px; display: block; border-radius: 8px;" src="${trimmed}">
            Seu navegador não suporta a tag de vídeo. Link: <a href="${trimmed}" target="_blank" rel="noopener noreferrer">${trimmed}</a>
          </video>
        </div>
      `;
    }

    return `
      <figure class="article-video-figure" data-align="${align}" style="${figureStyle}">
        ${videoPlayerHtml}
        ${caption ? `<figcaption style="font-size: 0.82rem; color: var(--text-subtle); margin-top: 8px;">${caption}</figcaption>` : ''}
      </figure><p><br></p>
    `;
  };

  const handleConfirmVideoUrl = () => {
    if (!videoUrl.trim()) return;
    const html = getEmbedVideoHtml(videoUrl, videoCaption, videoInsertWidth, videoInsertAlign);
    insertHtmlAtCursor(html);
    setVideoUrl('');
    setVideoCaption('');
    setIsVideoModalOpen(false);
  };

  // Criação de Tabela Interativa (Arrastando/Hovering o Mouse)
  const insertTable = (rows: number, cols: number) => {
    let html = `<table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid var(--border-subtle);"><thead><tr>`;
    for (let c = 1; c <= cols; c++) {
      html += `<th style="border: 1px solid var(--border-subtle); padding: 9px 12px; background: rgba(255,255,255,0.06); font-weight: 700;">Coluna ${c}</th>`;
    }
    html += `</tr></thead><tbody>`;
    for (let r = 1; r <= rows; r++) {
      html += `<tr>`;
      for (let c = 1; c <= cols; c++) {
        html += `<td style="border: 1px solid var(--border-subtle); padding: 8px 12px;">Item ${r}.${c}</td>`;
      }
      html += `</tr>`;
    }
    html += `</tbody></table><p><br></p>`;
    insertHtmlAtCursor(html);
    setIsTableDropdownOpen(false);
  };

  // Inserção de Duas Imagens Lado a Lado
  const insertTwoImagesSideBySide = () => {
    const html = `
      <div class="image-row-2" style="display: flex; gap: 16px; margin: 18px 0; align-items: flex-start; justify-content: space-between;">
        <div style="flex: 1 1 calc(50% - 8px); text-align: center; border: 1px dashed var(--border-subtle); padding: 10px; border-radius: 8px; background: rgba(255,255,255,0.02);">
          <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80" alt="Imagem 1" style="width: 100%; border-radius: 6px; display: block;" />
          <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 6px;">Legenda da Imagem 1 (clique para editar)</p>
        </div>
        <div style="flex: 1 1 calc(50% - 8px); text-align: center; border: 1px dashed var(--border-subtle); padding: 10px; border-radius: 8px; background: rgba(255,255,255,0.02);">
          <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80" alt="Imagem 2" style="width: 100%; border-radius: 6px; display: block;" />
          <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 6px;">Legenda da Imagem 2 (clique para editar)</p>
        </div>
      </div><p><br></p>
    `;
    insertHtmlAtCursor(html);
  };

  // Helper para verificar se um texto colado é URL de Imagem
  const isImageUrl = (url: string): boolean => {
    const clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.startsWith('data:image/')) {
      return false;
    }
    if (clean.startsWith('data:image/')) return true;
    if (/\.(png|jpe?g|gif|webp|svg|bmp|avif)(\?.*)?$/i.test(clean)) return true;
    if (/images\.unsplash\.com|res\.cloudinary\.com|i\.imgur\.com|media\.giphy\.com/i.test(clean)) return true;
    return false;
  };

  // Helper para verificar se um texto colado é URL de Vídeo
  const isVideoUrl = (url: string): boolean => {
    const clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) return false;
    if (/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i.test(clean)) return true;
    if (/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i.test(clean)) return true;
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(clean)) return true;
    return false;
  };

  // Inserir elemento de Imagem com suporte nativo a fluxo lado a lado e arrastar para redimensionar/reordenar
  const insertImageElement = (
    src: string,
    alt: string = 'Imagem',
    align: 'center' | 'left' | 'right' = 'center',
    widthPercent: number = 48
  ) => {
    let floatStyle = 'float: none; margin: 8px 6px;';
    if (align === 'left') floatStyle = 'float: left; margin: 8px 16px 12px 0;';
    else if (align === 'right') floatStyle = 'float: right; margin: 8px 0 12px 16px;';

    const figureHtml = `
      <figure class="article-image-figure" data-align="${align}" style="display: inline-block; vertical-align: top; width: ${widthPercent}%; max-width: 100%; box-sizing: border-box; text-align: center; ${floatStyle}">
        <img src="${src}" alt="${alt}" draggable="true" style="width: 100%; height: auto; border-radius: 8px; border: 1px solid var(--border-subtle); box-shadow: 0 4px 14px rgba(0,0,0,0.25); display: block;" />
        ${alt && alt !== 'Imagem' && alt !== 'Imagem colada' ? `<figcaption style="font-size: 0.8rem; color: var(--text-subtle); margin-top: 6px; text-align: center;">${alt}</figcaption>` : ''}
      </figure>&nbsp;
    `;
    insertHtmlAtCursor(figureHtml);
  };

  // Helper de detecção inteligente do tipo de mídia a partir da URL
  const detectMediaTypeFromUrl = (url: string): 'video' | 'image' | 'link' | 'none' => {
    const clean = url.trim();
    if (!clean) return 'none';
    if (isVideoUrl(clean)) return 'video';
    if (isImageUrl(clean)) return 'image';
    if (/^(https?:\/\/|\/|#|mailto:)/i.test(clean)) return 'link';
    return 'link';
  };

  const detectedMediaType = useMemo<'video' | 'image' | 'link' | 'none'>(() => {
    if (manualMediaType !== 'auto') return manualMediaType;
    return detectMediaTypeFromUrl(mediaUrl);
  }, [mediaUrl, manualMediaType]);

  // Salvar cursor e abrir modal unificado de mídia
  const openMediaModal = (defaultTab: 'link' | 'upload' = 'link', forcedType: 'auto' | 'video' | 'image' | 'link' = 'auto') => {
    if (editorMode === 'VISUAL' && visualEditorRef.current) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && visualEditorRef.current.contains(sel.anchorNode)) {
        savedSelectionRangeRef.current = sel.getRangeAt(0).cloneRange();
        const selectedText = sel.toString().trim();
        if (selectedText) {
          setMediaCaption(selectedText);
        }
      }
    }
    setMediaActiveTab(defaultTab);
    setManualMediaType(forcedType);
    setIsMediaModalOpen(true);
  };

  // Restaurar seleção salva e inserir HTML
  const restoreSelectionAndInsert = (html: string) => {
    if (editorMode === 'VISUAL' && visualEditorRef.current) {
      visualEditorRef.current.focus();
      if (savedSelectionRangeRef.current) {
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(savedSelectionRangeRef.current);
        }
      }
    }
    insertHtmlAtCursor(html);
    savedSelectionRangeRef.current = null;
  };

  // Inserir a mídia selecionada ou hiperlink
  const handleConfirmMediaModal = () => {
    if (mediaActiveTab === 'link') {
      const trimmedUrl = mediaUrl.trim();
      if (!trimmedUrl) return;

      const type = detectedMediaType;
      if (type === 'video') {
        const html = getEmbedVideoHtml(trimmedUrl, mediaCaption, mediaInsertWidth, mediaInsertAlign);
        restoreSelectionAndInsert(html);
      } else if (type === 'image') {
        insertImageElement(trimmedUrl, mediaCaption || 'Imagem', mediaInsertAlign, mediaInsertWidth);
      } else {
        // Hiperlink
        const linkText = mediaCaption.trim() || trimmedUrl;
        const linkHtml = `<a href="${trimmedUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline; font-weight: 600;">${linkText}</a>&nbsp;`;
        restoreSelectionAndInsert(linkHtml);
      }
    }

    setMediaUrl('');
    setMediaCaption('');
    setManualMediaType('auto');
    setIsMediaModalOpen(false);
  };

  // Colar do Clipboard (Ctrl + V): detecta imagem de arquivo, link de imagem ou link de vídeo
  const handleVisualPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // 1. Arquivos colados diretamente (ex: print screen com Ctrl+V)
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              const base64 = evt.target?.result as string;
              insertImageElement(base64, file.name || 'Imagem colada');
            };
            reader.readAsDataURL(file);
          }
          return;
        }
      }
    }

    // 2. Links colados: transformar automaticamente em vídeo ou imagem
    const pastedText = e.clipboardData?.getData('text/plain')?.trim();
    if (pastedText) {
      if (isVideoUrl(pastedText)) {
        e.preventDefault();
        const html = getEmbedVideoHtml(pastedText);
        insertHtmlAtCursor(html);
        return;
      }
      if (isImageUrl(pastedText)) {
        e.preventDefault();
        insertImageElement(pastedText, 'Imagem');
        return;
      }
    }

    setTimeout(syncFromVisualEditor, 0);
  };

  // Início de Arraste de Imagem (Reorganização de Posição)
  const handleVisualDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const img = target.tagName === 'IMG' ? (target as HTMLImageElement) : target.querySelector('img');
    if (img) {
      const figureOrImg = (img.closest('figure.article-image-figure') as HTMLElement) || img;
      draggedImageElementRef.current = figureOrImg;
      e.dataTransfer.setData('text/html', figureOrImg.outerHTML);
      e.dataTransfer.setData('application/x-kb-image-drag', 'true');
      e.dataTransfer.effectAllowed = 'move';
      setSelectedImage(null);
      setOverlayRect(null);
    }
  };

  // Soltar Imagem (Drop): suporta mover imagem interna ou importar arquivo externo
  const handleVisualDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    // 1. Arquivo externo arrastado do computador
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const base64 = evt.target?.result as string;
            insertImageElement(base64, file.name);
          };
          reader.readAsDataURL(file);
        }
      }
      return;
    }

    // 2. Mover imagem existente para nova posição no texto
    if (draggedImageElementRef.current) {
      const draggedEl = draggedImageElementRef.current;
      draggedImageElementRef.current = null;

      let range: Range | null = null;
      if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(e.clientX, e.clientY);
      } else if ((document as any).caretPositionFromPoint) {
        const pos = (document as any).caretPositionFromPoint(e.clientX, e.clientY);
        if (pos) {
          range = document.createRange();
          range.setStart(pos.offsetNode, pos.offset);
          range.collapse(true);
        }
      }

      if (range && visualEditorRef.current?.contains(range.commonAncestorContainer)) {
        draggedEl.remove();
        range.insertNode(draggedEl);
        syncFromVisualEditor();

        const img = draggedEl.tagName === 'IMG' ? (draggedEl as HTMLImageElement) : draggedEl.querySelector('img');
        if (img) {
          setTimeout(() => {
            selectImageForResize(img);
          }, 60);
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleVisualScroll = () => {
    if (selectedImage) {
      updateOverlayRect();
    }
  };

  // Selecionar Imagem e ativar pontos interativos de redimensionamento
  const selectImageForResize = (img: HTMLImageElement) => {
    visualEditorRef.current?.querySelectorAll('.img-selected, .video-selected').forEach((el) => {
      el.classList.remove('img-selected', 'video-selected');
    });
    img.classList.add('img-selected');
    setSelectedImage(img);
    setSelectedVideoElement(null);

    const parentFigure = img.closest('figure.article-image-figure') as HTMLElement | null;
    const wStr = parentFigure?.style.width || img.style.width;
    if (wStr && wStr.endsWith('%')) {
      setSelectedImageWidth(parseInt(wStr, 10));
    } else if (img.offsetWidth && visualEditorRef.current) {
      const editorWidth = visualEditorRef.current.clientWidth - 48;
      const pct = Math.round((img.offsetWidth / editorWidth) * 100);
      setSelectedImageWidth(Math.min(100, Math.max(10, pct)));
    } else {
      setSelectedImageWidth(48);
    }

    const alignAttr = parentFigure?.getAttribute('data-align') || img.style.float;
    if (alignAttr === 'left' || img.style.float === 'left') setSelectedImageAlign('left');
    else if (alignAttr === 'right' || img.style.float === 'right') setSelectedImageAlign('right');
    else setSelectedImageAlign('center');

    setTimeout(updateOverlayRect, 10);
  };

  // Selecionar Vídeo e ativar pontos interativos de redimensionamento
  const selectVideoForResize = (videoEl: HTMLElement) => {
    visualEditorRef.current?.querySelectorAll('.img-selected, .video-selected').forEach((el) => {
      el.classList.remove('img-selected', 'video-selected');
    });
    videoEl.classList.add('video-selected');
    setSelectedVideoElement(videoEl);
    setSelectedImage(null);

    const wStr = videoEl.style.width;
    if (wStr && wStr.endsWith('%')) {
      setSelectedVideoWidth(parseInt(wStr, 10));
    } else if (videoEl.offsetWidth && visualEditorRef.current) {
      const editorWidth = visualEditorRef.current.clientWidth - 48;
      const pct = Math.round((videoEl.offsetWidth / editorWidth) * 100);
      setSelectedVideoWidth(Math.min(100, Math.max(10, pct)));
    } else {
      setSelectedVideoWidth(100);
    }

    const alignAttr = videoEl.getAttribute('data-align');
    if (alignAttr === 'left' || videoEl.style.float === 'left') setSelectedVideoAlign('left');
    else if (alignAttr === 'right' || videoEl.style.float === 'right') setSelectedVideoAlign('right');
    else setSelectedVideoAlign('center');

    setTimeout(updateOverlayRect, 10);
  };

  // Clique no editor visual (detecta clique em imagem ou vídeo)
  const handleVisualClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // 1. Detectar clique em Imagem
    if (target.tagName === 'IMG') {
      selectImageForResize(target as HTMLImageElement);
      return;
    }

    // 2. Detectar clique em Vídeo (figure, container, video ou iframe)
    const videoFigure = (target.closest('.article-video-figure') ||
      target.closest('.video-container') ||
      (target.tagName === 'VIDEO' ? target.closest('.article-video-figure') || target : null) ||
      (target.tagName === 'IFRAME' ? target.closest('.article-video-figure') || target : null)) as HTMLElement | null;

    if (videoFigure) {
      selectVideoForResize(videoFigure);
      return;
    }

    // 3. Clique fora: desmarcar se não foi em nenhuma das barras flutuantes ou pontos
    if (
      !target.closest('.image-floating-toolbar') &&
      !target.closest('.video-floating-toolbar') &&
      !target.closest('.image-resize-overlay')
    ) {
      visualEditorRef.current?.querySelectorAll('.img-selected, .video-selected').forEach((el) => {
        el.classList.remove('img-selected', 'video-selected');
      });
      setSelectedImage(null);
      setSelectedVideoElement(null);
      setOverlayRect(null);
    }
  };

  // Arrastar pontos nos cantos/bordas para redimensionar a imagem ou vídeo
  const handleStartResize = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    const targetEl = selectedImage || selectedVideoElement;
    if (!targetEl || !visualEditorRef.current || !editorWrapperRef.current) return;

    const startX = e.clientX;
    const startWidth = targetEl.offsetWidth;
    const editorWidth = visualEditorRef.current.clientWidth - 48;

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - startX;
      let newWidth = startWidth;

      if (handle === 'bottom-right' || handle === 'right' || handle === 'top-right') {
        newWidth = startWidth + deltaX;
      } else if (handle === 'bottom-left' || handle === 'left' || handle === 'top-left') {
        newWidth = startWidth - deltaX;
      }

      const clampedWidth = Math.max(80, Math.min(newWidth, editorWidth));
      const widthPercent = Math.max(10, Math.min(100, Math.round((clampedWidth / editorWidth) * 100)));

      if (selectedImage) {
        const parentFigure = selectedImage.closest('figure.article-image-figure') as HTMLElement | null;
        if (parentFigure) {
          parentFigure.style.width = `${widthPercent}%`;
          selectedImage.style.width = '100%';
        } else {
          selectedImage.style.width = `${widthPercent}%`;
        }
        selectedImage.style.height = 'auto';
        setSelectedImageWidth(widthPercent);
      } else if (selectedVideoElement) {
        selectedVideoElement.style.width = `${widthPercent}%`;
        setSelectedVideoWidth(widthPercent);
      }

      updateOverlayRect();
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      syncFromVisualEditor();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Alinhar Imagem Selecionada (Centro, Esquerda, Direita)
  const alignSelectedImage = (align: 'center' | 'left' | 'right') => {
    if (!selectedImage) return;
    setSelectedImageAlign(align);
    const parentFigure = selectedImage.closest('figure.article-image-figure') as HTMLElement | null;
    const target = parentFigure || selectedImage;

    target.setAttribute('data-align', align);

    if (align === 'center') {
      target.style.display = 'inline-block';
      target.style.verticalAlign = 'top';
      target.style.float = 'none';
      target.style.margin = '8px auto';
      target.style.textAlign = 'center';
      if (target.parentElement && target.parentElement !== visualEditorRef.current) {
        target.parentElement.style.textAlign = 'center';
      }
    } else if (align === 'left') {
      target.style.display = 'inline-block';
      target.style.verticalAlign = 'top';
      target.style.float = 'left';
      target.style.margin = '8px 16px 12px 0';
      target.style.textAlign = 'left';
    } else if (align === 'right') {
      target.style.display = 'inline-block';
      target.style.verticalAlign = 'top';
      target.style.float = 'right';
      target.style.margin = '8px 0 12px 16px';
      target.style.textAlign = 'right';
    }
    syncFromVisualEditor();
    updateOverlayRect();
  };

  // Redimensionar Imagem Selecionada
  const applyImageWidth = (pct: number) => {
    if (!selectedImage) return;
    setSelectedImageWidth(pct);
    const parentFigure = selectedImage.closest('figure.article-image-figure') as HTMLElement | null;
    if (parentFigure) {
      parentFigure.style.width = `${pct}%`;
      selectedImage.style.width = '100%';
    } else {
      selectedImage.style.width = `${pct}%`;
    }
    selectedImage.style.height = 'auto';
    syncFromVisualEditor();
    setTimeout(updateOverlayRect, 10);
  };

  // Remover Imagem Selecionada
  const removeSelectedImage = () => {
    if (!selectedImage) return;
    const parentFigure = selectedImage.closest('figure');
    if (parentFigure) {
      parentFigure.remove();
    } else {
      selectedImage.remove();
    }
    setSelectedImage(null);
    setOverlayRect(null);
    syncFromVisualEditor();
  };

  // Ação unificada de alinhamento para a barra de ferramentas (Texto, Imagem ou Vídeo)
  const handleAlignClick = (align: 'left' | 'center' | 'right') => {
    if (selectedImage) {
      alignSelectedImage(align);
      return;
    }
    if (selectedVideoElement) {
      alignSelectedVideo(align);
      return;
    }

    // Verifica se o cursor está dentro de uma imagem ou vídeo
    const sel = window.getSelection();
    if (sel && sel.anchorNode) {
      let node: Node | null = sel.anchorNode;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
      const el = node as HTMLElement | null;
      const foundImg = el?.closest('figure.article-image-figure, img') as HTMLElement | null;
      if (foundImg) {
        const img = foundImg.tagName === 'IMG' ? (foundImg as HTMLImageElement) : foundImg.querySelector('img');
        if (img) {
          selectImageForResize(img);
          alignSelectedImage(align);
          return;
        }
      }
      const foundVideo = el?.closest('.article-video-figure, .video-container') as HTMLElement | null;
      if (foundVideo) {
        setSelectedVideoElement(foundVideo);
        alignSelectedVideo(align);
        return;
      }
    }

    // Alinhamento padrão de texto
    if (editorMode === 'VISUAL' && visualEditorRef.current) {
      visualEditorRef.current.focus();
      if (align === 'center') document.execCommand('justifyCenter', false);
      else if (align === 'left') document.execCommand('justifyLeft', false);
      else if (align === 'right') document.execCommand('justifyRight', false);
      syncFromVisualEditor();
    } else {
      wrapSelection(`<div style="text-align: ${align};">`, '</div>', 'texto alinhado');
    }
  };

  // Alinhar Vídeo Selecionado (Centro, Esquerda, Direita)
  const alignSelectedVideo = (align: 'center' | 'left' | 'right') => {
    if (!selectedVideoElement) return;
    setSelectedVideoAlign(align);
    selectedVideoElement.setAttribute('data-align', align);

    if (align === 'center') {
      selectedVideoElement.style.display = 'block';
      selectedVideoElement.style.margin = '20px auto';
      selectedVideoElement.style.float = 'none';
      selectedVideoElement.style.textAlign = 'center';
    } else if (align === 'left') {
      selectedVideoElement.style.display = 'block';
      selectedVideoElement.style.float = 'left';
      selectedVideoElement.style.margin = '10px 20px 20px 0';
      selectedVideoElement.style.textAlign = 'left';
    } else if (align === 'right') {
      selectedVideoElement.style.display = 'block';
      selectedVideoElement.style.float = 'right';
      selectedVideoElement.style.margin = '10px 0 20px 20px';
      selectedVideoElement.style.textAlign = 'right';
    }
    syncFromVisualEditor();
    updateOverlayRect();
  };

  // Redimensionar Vídeo Selecionado
  const applyVideoWidth = (pct: number) => {
    if (!selectedVideoElement) return;
    setSelectedVideoWidth(pct);
    selectedVideoElement.style.width = `${pct}%`;
    syncFromVisualEditor();
    setTimeout(updateOverlayRect, 10);
  };

  // Remover Vídeo Selecionado
  const removeSelectedVideo = () => {
    if (!selectedVideoElement) return;
    selectedVideoElement.remove();
    setSelectedVideoElement(null);
    setOverlayRect(null);
    syncFromVisualEditor();
  };

  // Upload e Inserção de Imagem por Arquivo
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      insertImageElement(base64, file.name, mediaInsertAlign || 'center', mediaInsertWidth || 100);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
    setIsMediaModalOpen(false);
    setIsImageModalOpen(false);
  };

  const handleConfirmImageUrl = () => {
    if (!imageUrl.trim()) return;
    insertImageElement(
      imageUrl.trim(),
      imageCaption.trim() || 'Imagem do manual',
      imageInsertAlign,
      imageInsertWidth
    );
    setImageUrl('');
    setImageCaption('');
    setIsImageModalOpen(false);
  };

  // Upload de Anexos
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments = Array.from(files).map((f) => {
      const sizeKb = (f.size / 1024).toFixed(1);
      const sizeMb = (f.size / (1024 * 1024)).toFixed(1);
      const formattedSize = f.size > 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;

      return {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: f.name,
        size: formattedSize,
        url: URL.createObjectURL(f),
      };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Enviar Resposta do Criador em Balão
  const handleSendCreatorReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentArticle || !creatorReplyInput.trim()) return;
    addArticleComment(currentArticle.id, creatorReplyInput.trim());
    setCreatorReplyInput('');
  };

  // Submissão do Artigo
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

    const selCat = categories.find((c) => c.id === categoryId);
    const selSubcat = selCat?.subcategories?.find((s) => s.id === subcategoryId);
    const subcategoryName = selSubcat?.title;
    const isPb = Boolean(
      categoryId === 'cat-11' ||
      categoryId === 'cat-12' ||
      selCat?.title?.toLowerCase().includes('playbook')
    );
    const effectiveAccessLevel = isPb ? 'INTERNAL' : accessLevel;

    if (isProposalMode && editingArticle) {
      if (!proposalNote.trim()) {
        alert('Por favor, preencha a justificativa da proposta de edição.');
        return;
      }
      proposeArticleEdit(
        editingArticle.id,
        title.trim(),
        categoryId,
        content,
        tags,
        effectiveAccessLevel,
        proposalNote.trim(),
        attachments
      );
      alert('Proposta de edição submetida com sucesso para a Fila Editorial!');
    } else if (editingArticle) {
      updateArticleContent(editingArticle.id, title.trim(), categoryId, content, tags, effectiveAccessLevel, attachments, subcategoryId, subcategoryName);
      alert('Artigo atualizado com sucesso!');
    } else {
      createArticle(title.trim(), categoryId, content, tags, effectiveAccessLevel, attachments, subcategoryId, subcategoryName);
      alert('Artigo criado com sucesso e adicionado na árvore de navegação!');
    }

    onClose();
  };

  return (
    <div style={{ padding: '24px 32px', height: '100%', display: 'flex', flexDirection: 'column' }} className="animate-fade-in">
      {/* Input de arquivo de imagem montado permanentemente no DOM */}
      <input
        type="file"
        accept="image/*"
        ref={imageUploadRef}
        onChange={handleImageFileChange}
        style={{ display: 'none' }}
      />
      {/* Top Bar Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
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
              <h1 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>
                {isProposalMode
                  ? `Proposta de Edição: ${editingArticle?.title || 'Artigo'}`
                  : editingArticle
                  ? `Editando: ${editingArticle.title}`
                  : 'Criador de Artigo Técnico'}
              </h1>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
              {isProposalMode
                ? 'Sua proposta de edição será avaliada pelos revisores antes da publicação'
                : isAdjustmentMode
                ? 'Artigo em fase de ajuste • Converse com o revisor nos balões à direita'
                : 'Artigo submetido para a fila de curadoria e validação editorial'}
            </span>
          </div>
        </div>

        {/* Ações de Envio */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSaveAndSubmit}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
          >
            <Send size={14} />
            <span>{isProposalMode ? 'Enviar Proposta' : 'Submeter para Revisão'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div style={{ display: 'flex', flex: 1, gap: '20px', overflow: 'hidden' }}>
        {/* Editor Form Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '4px' }}>
          {/* Linha 1: Título e Categoria */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Título do Artigo / Procedimento:
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
                  color: 'var(--text-main)',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Módulo / Categoria:
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubcategoryId('');
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategoria em cascata */}
            {(() => {
              const currentCat = categories.find((c) => c.id === categoryId);
              if (!currentCat?.subcategories || currentCat.subcategories.length === 0) return null;
              return (
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Subcategoria / Ramo da Árvore:
                  </label>
                  <select
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem',
                      color: 'var(--text-main)',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Geral (Direto na Categoria)</option>
                    {currentCat.subcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.title}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })()}
          </div>

          {/* Proposta de Edição Justification */}
          {isProposalMode && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--status-pending)', marginBottom: '4px' }}>
                Justificativa da Proposta de Edição:
              </label>
              <textarea
                rows={2}
                required
                value={proposalNote}
                onChange={(e) => setProposalNote(e.target.value)}
                placeholder="Descreva o que mudou na regra de conciliação ou layout do extrato..."
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
                  resize: 'none',
                }}
              />
            </div>
          )}

          {/* Row: Visibilidade & Tags (AJUSTADO: APENAS 1 ÍCONE POR BOTÃO) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            {/* Visibilidade: 1 único ícone limpo */}
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
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
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Lock size={14} />
                  <span>Interno (Equipe)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isPlaybookCategory) {
                      setAccessLevel('ALL');
                    }
                  }}
                  disabled={isPlaybookCategory}
                  title={isPlaybookCategory ? 'Módulos Playbook são exclusivos para colaboradores internos e não podem ser externos.' : undefined}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${accessLevel === 'ALL' && !isPlaybookCategory ? '#38bdf8' : 'var(--border-subtle)'}`,
                    background: isPlaybookCategory
                      ? 'rgba(255, 255, 255, 0.03)'
                      : accessLevel === 'ALL'
                      ? 'rgba(56, 189, 248, 0.15)'
                      : 'var(--bg-input)',
                    color: isPlaybookCategory
                      ? 'var(--text-subtle)'
                      : accessLevel === 'ALL'
                      ? '#38bdf8'
                      : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: isPlaybookCategory ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    opacity: isPlaybookCategory ? 0.45 : 1,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Globe size={14} />
                  <span>Externo (Clientes)</span>
                </button>
              </div>
              {isPlaybookCategory && (
                <span style={{ display: 'block', fontSize: '0.70rem', color: '#f59e0b', marginTop: '4px', fontWeight: 600 }}>
                  🔒 Playbooks são restritos à equipe interna e não podem ser compartilhados com clientes.
                </span>
              )}
            </div>

            {/* Tags */}
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Tags de Busca (separadas por vírgula):
              </label>
              <div style={{ position: 'relative' }}>
                <Tag size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  type="text"
                  placeholder="itau, extrato, ofx, siscon, cartao"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 32px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.86rem',
                    color: 'var(--text-main)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* BARRA FLUTUANTE DE FORMATAÇÃO DA IMAGEM SELECIONADA */}
          {selectedImage && (
            <div
              className="image-floating-toolbar animate-fade-in"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 14px',
                background: 'rgba(92, 183, 128, 0.12)',
                border: '1px solid var(--color-primary)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '10px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                <ImageIcon size={14} />
                <span>Formatação da Imagem Selecionada:</span>
              </div>

              {/* Alinhamento da Imagem */}
              <div style={{ display: 'flex', gap: '3px', background: 'var(--bg-surface)', padding: '2px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => alignSelectedImage('left')}
                  title="Alinhar à Esquerda (no canto com texto ao lado)"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '3px',
                    border: 'none',
                    background: selectedImageAlign === 'left' ? 'var(--color-primary)' : 'transparent',
                    color: selectedImageAlign === 'left' ? '#fff' : 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <AlignLeft size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => alignSelectedImage('center')}
                  title="Centralizar Imagem (bloco central)"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '3px',
                    border: 'none',
                    background: selectedImageAlign === 'center' ? 'var(--color-primary)' : 'transparent',
                    color: selectedImageAlign === 'center' ? '#fff' : 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <AlignCenter size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => alignSelectedImage('right')}
                  title="Alinhar à Direita (no canto com texto ao lado)"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '3px',
                    border: 'none',
                    background: selectedImageAlign === 'right' ? 'var(--color-primary)' : 'transparent',
                    color: selectedImageAlign === 'right' ? '#fff' : 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <AlignRight size={13} />
                </button>
              </div>

              {/* Presets de Tamanho */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tamanho:</span>
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyImageWidth(pct)}
                    style={{
                      padding: '2px 7px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                      background: selectedImageWidth === pct ? 'var(--color-primary)' : 'var(--bg-surface)',
                      color: selectedImageWidth === pct ? '#fff' : 'var(--text-main)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {/* Slider de Tamanho Arrastando */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="range"
                  min="15"
                  max="100"
                  value={selectedImageWidth}
                  onChange={(e) => applyImageWidth(Number(e.target.value))}
                  style={{ width: '90px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                  title="Arrastar para definir tamanho da imagem"
                />
                <span style={{ fontSize: '0.74rem', color: 'var(--color-primary)', fontWeight: 700, minWidth: '34px' }}>
                  {selectedImageWidth}%
                </span>
              </div>

              {/* Botão Remover Imagem */}
              <button
                type="button"
                onClick={removeSelectedImage}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginLeft: 'auto',
                }}
                title="Excluir imagem selecionada"
              >
                <Trash2 size={12} />
                <span>Excluir Imagem</span>
              </button>
            </div>
          )}

          {/* BARRA FLUTUANTE DE FORMATAÇÃO DO VÍDEO SELECIONADO */}
          {selectedVideoElement && (
            <div
              className="video-floating-toolbar animate-fade-in"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 14px',
                background: 'rgba(239, 68, 68, 0.10)',
                border: '1px solid #ef4444',
                borderRadius: 'var(--radius-md)',
                marginBottom: '10px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#ef4444' }}>
                <Video size={14} />
                <span>Ajuste do Vídeo Selecionado:</span>
              </div>

              {/* Alinhamento do Vídeo */}
              <div style={{ display: 'flex', gap: '3px', background: 'var(--bg-surface)', padding: '2px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => alignSelectedVideo('left')}
                  title="Alinhar à Esquerda (no canto com texto ao lado)"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '3px',
                    border: 'none',
                    background: selectedVideoAlign === 'left' ? '#ef4444' : 'transparent',
                    color: selectedVideoAlign === 'left' ? '#fff' : 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <AlignLeft size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => alignSelectedVideo('center')}
                  title="Centralizar Vídeo"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '3px',
                    border: 'none',
                    background: selectedVideoAlign === 'center' ? '#ef4444' : 'transparent',
                    color: selectedVideoAlign === 'center' ? '#fff' : 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <AlignCenter size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => alignSelectedVideo('right')}
                  title="Alinhar à Direita (no canto com texto ao lado)"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '3px',
                    border: 'none',
                    background: selectedVideoAlign === 'right' ? '#ef4444' : 'transparent',
                    color: selectedVideoAlign === 'right' ? '#fff' : 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <AlignRight size={13} />
                </button>
              </div>

              {/* Presets de Tamanho do Vídeo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tamanho:</span>
                {[35, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyVideoWidth(pct)}
                    style={{
                      padding: '2px 7px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                      background: selectedVideoWidth === pct ? '#ef4444' : 'var(--bg-surface)',
                      color: selectedVideoWidth === pct ? '#fff' : 'var(--text-main)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {/* Slider de Tamanho Arrastando */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={selectedVideoWidth}
                  onChange={(e) => applyVideoWidth(Number(e.target.value))}
                  style={{ width: '90px', cursor: 'pointer', accentColor: '#ef4444' }}
                  title="Arrastar para definir tamanho do vídeo"
                />
                <span style={{ fontSize: '0.74rem', color: '#ef4444', fontWeight: 700, minWidth: '34px' }}>
                  {selectedVideoWidth}%
                </span>
              </div>

              {/* Botão Remover Vídeo */}
              <button
                type="button"
                onClick={removeSelectedVideo}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginLeft: 'auto',
                }}
                title="Excluir vídeo selecionado"
              >
                <Trash2 size={12} />
                <span>Excluir Vídeo</span>
              </button>
            </div>
          )}

          {/* BARRA DE FERRAMENTAS RICA DO EDITOR */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderTopLeftRadius: 'var(--radius-md)',
              borderTopRightRadius: 'var(--radius-md)',
              borderBottom: 'none',
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {/* Linha Superior: Modo (Texto Visual vs HTML) + Tamanho de Letra + Cores + Split Preview */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              {/* Seletor de Modo */}
              <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setEditorMode('VISUAL');
                    if (visualEditorRef.current) {
                      visualEditorRef.current.innerHTML = content;
                    }
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    background: editorMode === 'VISUAL' ? 'var(--color-primary)' : 'transparent',
                    color: editorMode === 'VISUAL' ? '#ffffff' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <FileText size={13} />
                  <span>Texto Visual (Padrão)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    syncFromVisualEditor();
                    setEditorMode('HTML');
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    background: editorMode === 'HTML' ? '#38bdf8' : 'transparent',
                    color: editorMode === 'HTML' ? '#0f172a' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Code2 size={13} />
                  <span>Código HTML</span>
                </button>
              </div>

              {/* Tamanho de Letra / Cabeçalhos */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Formato:</span>
                <select
                  onChange={(e) => {
                    applyFontSize(e.target.value);
                    e.target.value = '';
                  }}
                  defaultValue=""
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="" disabled>Selecionar estilo...</option>
                  <option value="h2">Título Principal H2</option>
                  <option value="h3">Subtítulo da Seção H3</option>
                  <option value="p">Parágrafo Normal</option>
                  <option value="18px">Grande (18px)</option>
                  <option value="16px">Médio (16px)</option>
                  <option value="14px">Padrão (14px)</option>
                  <option value="12px">Pequeno (12px)</option>
                </select>
              </div>

              {/* Paleta de Cores e Cor Dinâmica */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Cor:</span>

                {/* Opção 1: Cor Padrão / Dinâmica (Adapta ao tema claro/escuro) */}
                <button
                  type="button"
                  onClick={() => applyTextColor('dynamic')}
                  title="Cor Dinâmica Padrão (Branco no Modo Escuro, Preto no Modo Claro)"
                  className="btn btn-secondary btn-sm"
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.73rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                  }}
                >
                  <Contrast size={13} color="var(--color-primary)" />
                  <span>Padrão Dinâmico</span>
                </button>

                {/* Cores Pré-definidas */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {[
                    { color: '#5cb780', title: 'Verde Conciliador' },
                    { color: '#38bdf8', title: 'Azul Info' },
                    { color: '#f59e0b', title: 'Âmbar Alerta' },
                    { color: '#ef4444', title: 'Vermelho Crítico' },
                    { color: '#a855f7', title: 'Roxo Destaque' },
                    { color: '#94a3b8', title: 'Cinza Suave' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => applyTextColor(c.color)}
                      title={c.title}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: c.color,
                        border: '1px solid rgba(255,255,255,0.25)',
                        cursor: 'pointer',
                        transition: 'transform 0.1s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  ))}
                </div>

                {/* Seletor Livre de Cor Personalizada */}
                <label
                  title="Selecionar Qualquer Cor Personalizada"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                    cursor: 'pointer',
                    position: 'relative',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                >
                  <input
                    type="color"
                    onChange={(e) => applyTextColor(e.target.value)}
                    style={{
                      position: 'absolute',
                      opacity: 0,
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer',
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Linha Inferior: Formatações de Estilo & Callouts & Tabela & Imagens */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
              {/* Desfazer (Ctrl+Z) e Refazer (Ctrl+Y) */}
              <div style={{ display: 'flex', gap: '2px' }}>
                <button
                  type="button"
                  onClick={handleUndo}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 8px' }}
                  title="Desfazer (Ctrl+Z)"
                >
                  <Undo2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 8px' }}
                  title="Refazer (Ctrl+Y / Ctrl+Shift+Z)"
                >
                  <Redo2 size={13} />
                </button>
              </div>

              <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', margin: '0 2px' }} />

              {/* Negrito, Itálico, Sublinhado, Riscado */}
              <div style={{ display: 'flex', gap: '2px' }}>
                <button
                  type="button"
                  onClick={() => formatVisual('bold')}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 8px' }}
                  title="Negrito (Ctrl+B)"
                >
                  <Bold size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => formatVisual('italic')}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 8px' }}
                  title="Itálico (Ctrl+I)"
                >
                  <Italic size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => formatVisual('underline')}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 8px' }}
                  title="Sublinhado"
                >
                  <Underline size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => formatVisual('strikeThrough')}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 8px' }}
                  title="Riscado"
                >
                  <Strikethrough size={13} />
                </button>
              </div>

              <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', margin: '0 2px' }} />

              {/* Alinhamento: Esquerda, Centro, Direita (Aplica em Texto, Imagem ou Vídeo) */}
              <div style={{ display: 'flex', gap: '2px' }}>
                <button
                  type="button"
                  onClick={() => handleAlignClick('left')}
                  className="btn btn-secondary btn-sm"
                  style={{
                    padding: '4px 8px',
                    color: selectedImageAlign === 'left' || selectedVideoAlign === 'left' ? 'var(--color-primary)' : undefined,
                  }}
                  title="Alinhar à Esquerda (Texto, Imagem ou Vídeo)"
                >
                  <AlignLeft size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleAlignClick('center')}
                  className="btn btn-secondary btn-sm"
                  style={{
                    padding: '4px 8px',
                    color: selectedImageAlign === 'center' || selectedVideoAlign === 'center' ? 'var(--color-primary)' : undefined,
                  }}
                  title="Centralizar (Texto, Imagem ou Vídeo)"
                >
                  <AlignCenter size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleAlignClick('right')}
                  className="btn btn-secondary btn-sm"
                  style={{
                    padding: '4px 8px',
                    color: selectedImageAlign === 'right' || selectedVideoAlign === 'right' ? 'var(--color-primary)' : undefined,
                  }}
                  title="Alinhar à Direita (Texto, Imagem ou Vídeo)"
                >
                  <AlignRight size={13} />
                </button>
              </div>

              <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', margin: '0 2px' }} />

              {/* Listas e Estruturas */}
              <button
                type="button"
                onClick={() => formatVisual('insertUnorderedList')}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 8px' }}
                title="Lista com Marcadores"
              >
                <List size={13} />
              </button>
              <button
                type="button"
                onClick={() => formatVisual('insertOrderedList')}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 8px' }}
                title="Lista Numerada"
              >
                <ListOrdered size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const sel = window.getSelection()?.toString() || 'Citação relevante';
                  insertHtmlAtCursor(`<blockquote><p>${sel}</p></blockquote><p><br></p>`);
                }}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 8px' }}
                title="Citação em Bloco"
              >
                <Quote size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const sel = window.getSelection()?.toString() || '// Código ou regra contábil';
                  insertHtmlAtCursor(`<pre><code>${sel}</code></pre><p><br></p>`);
                }}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 8px' }}
                title="Bloco de Código"
              >
                <Code size={13} />
              </button>

              <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', margin: '0 2px' }} />

              {/* CRIAÇÃO DE TABELA ARRASTANDO O MOUSE (INTERACTIVE GRID) */}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  type="button"
                  onClick={() => setIsTableDropdownOpen((prev) => !prev)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: isTableDropdownOpen ? 'var(--color-primary-subtle)' : undefined,
                    borderColor: isTableDropdownOpen ? 'var(--color-primary)' : undefined,
                    color: isTableDropdownOpen ? 'var(--color-primary)' : undefined,
                  }}
                  title="Criar tabela arrastando o mouse"
                >
                  <Table size={13} />
                  <span>Tabela ▾</span>
                </button>

                {isTableDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      zIndex: 100,
                      marginTop: '6px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      boxShadow: 'var(--shadow-lg)',
                      width: '210px',
                    }}
                  >
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
                      Arraste o mouse para definir tamanho:
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(8, 1fr)',
                        gap: '4px',
                        background: 'var(--bg-surface)',
                        padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {Array.from({ length: 8 }).map((_, rIdx) => {
                        const r = rIdx + 1;
                        return Array.from({ length: 8 }).map((_, cIdx) => {
                          const c = cIdx + 1;
                          const isHighlighted = r <= tableHoverRows && c <= tableHoverCols;
                          return (
                            <div
                              key={`${r}-${c}`}
                              onMouseEnter={() => {
                                setTableHoverRows(r);
                                setTableHoverCols(c);
                              }}
                              onClick={() => insertTable(tableHoverRows, tableHoverCols)}
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '2px',
                                border: isHighlighted ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                                background: isHighlighted ? 'var(--color-primary)' : 'rgba(255,255,255,0.06)',
                                cursor: 'pointer',
                                transition: 'background 0.1s ease',
                              }}
                            />
                          );
                        });
                      })}
                    </div>
                    <div style={{ marginTop: '8px', textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      Tabela {tableHoverRows} Linhas × {tableHoverCols} Colunas
                    </div>
                    <div style={{ marginTop: '3px', textAlign: 'center', fontSize: '0.70rem', color: 'var(--text-subtle)' }}>
                      Clique para inserir na página
                    </div>
                  </div>
                )}
              </div>

              <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', margin: '0 2px' }} />

              {/* Destaques (Callouts): Dica, Observação, Atenção */}
              <button
                type="button"
                onClick={insertCalloutTip}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 8px', borderColor: 'rgba(92, 183, 128, 0.4)', color: '#5cb780' }}
                title="Inserir Caixa de Dica (💡)"
              >
                <Lightbulb size={13} />
                <span>Dica</span>
              </button>

              <button
                type="button"
                onClick={insertCalloutInfo}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 8px', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
                title="Inserir Caixa de Observação (ℹ️)"
              >
                <Info size={13} />
                <span>Observação</span>
              </button>

              <button
                type="button"
                onClick={insertCalloutWarning}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 8px', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b' }}
                title="Inserir Caixa de Atenção (⚠️)"
              >
                <AlertTriangle size={13} />
                <span>Atenção</span>
              </button>

              <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', margin: '0 2px' }} />

              {/* Botão Unificado: Inserir Imagem ou Vídeo */}
              <button
                type="button"
                onClick={() => openMediaModal('link')}
                className="btn btn-secondary btn-sm"
                style={{
                  padding: '4px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(92, 183, 128, 0.14)',
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-primary)',
                  fontWeight: 700,
                }}
                title="Adicionar Imagem (upload ou link), Vídeo (YouTube, Vimeo, MP4) ou Hiperlink"
              >
                <ImagePlus size={14} />
                <span>Adicionar Imagem ou Vídeo</span>
              </button>

              {/* Atalho para Inserir Hiperlink */}
              <button
                type="button"
                onClick={() => openMediaModal('link', 'link')}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Inserir Hiperlink / Link Web no texto"
              >
                <LinkIcon size={13} />
                <span>Link</span>
              </button>
            </div>
          </div>

          {/* ÁREA DE TEXTO VISUAL WYSIWYG / CÓDIGO + PRÉVIA APENAS QUANDO CÓDIGO HTML */}
          <div
            ref={editorWrapperRef}
            style={{
              display: 'flex',
              flex: 1,
              minHeight: '440px',
              border: '1px solid var(--border-subtle)',
              borderBottomLeftRadius: 'var(--radius-md)',
              borderBottomRightRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: 'var(--bg-card)',
              position: 'relative',
            }}
          >
            {/* Modo 1: Editor Visual WYSIWYG (Padrão: 100% largura sem prévia lateral) */}
            {editorMode === 'VISUAL' ? (
              <>
                <div
                  ref={visualEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={syncFromVisualEditor}
                  onPaste={handleVisualPaste}
                  onDrop={handleVisualDrop}
                  onDragOver={handleDragOver}
                  onDragStart={handleVisualDragStart}
                  onScroll={handleVisualScroll}
                  onClick={handleVisualClick}
                  className="article-visual-editor"
                  style={{
                    flex: '1 1 100%',
                    padding: '20px 24px',
                    background: 'var(--bg-card)',
                    border: 'none',
                    fontSize: '0.92rem',
                    lineHeight: 1.7,
                    color: 'var(--text-main)',
                    outline: 'none',
                    overflowY: 'auto',
                  }}
                />

                {/* OVERLAY INTERATIVO DE REDIMENSIONAMENTO COM PONTOS DE ARRASTE (PARA IMAGEM OU VÍDEO) */}
                {(selectedImage || selectedVideoElement) && overlayRect && (
                  (() => {
                    const isVideo = Boolean(selectedVideoElement);
                    const accentColor = isVideo ? '#ef4444' : 'var(--color-primary)';
                    const currentWidth = isVideo ? selectedVideoWidth : selectedImageWidth;
                    const currentAlign = isVideo ? selectedVideoAlign : selectedImageAlign;

                    return (
                      <div
                        className="image-resize-overlay animate-fade-in"
                        style={{
                          position: 'absolute',
                          top: `${overlayRect.top}px`,
                          left: `${overlayRect.left}px`,
                          width: `${overlayRect.width}px`,
                          height: `${overlayRect.height}px`,
                          border: `2px solid ${accentColor}`,
                          borderRadius: '8px',
                          pointerEvents: 'none',
                          zIndex: 35,
                          boxShadow: `0 0 0 1px rgba(0, 0, 0, 0.2), 0 4px 14px ${isVideo ? 'rgba(239, 68, 68, 0.25)' : 'rgba(92, 183, 128, 0.25)'}`,
                        }}
                      >
                        {/* Barra Flutuante de Controles e Alinhamento fixada acima da mídia */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '-46px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'var(--bg-card, #0f172a)',
                            border: `1px solid ${accentColor}`,
                            borderRadius: '8px',
                            padding: '4px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                            pointerEvents: 'auto',
                            zIndex: 40,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: accentColor,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              paddingRight: '6px',
                              borderRight: '1px solid var(--border-subtle)',
                            }}
                          >
                            {isVideo ? <Film size={12} /> : <ImageIcon size={12} />}
                            {isVideo ? 'Vídeo' : 'Imagem'}
                          </span>

                          {/* Alinhamento */}
                          <div style={{ display: 'flex', gap: '2px' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                isVideo ? alignSelectedVideo('left') : alignSelectedImage('left');
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{
                                padding: '3px 6px',
                                background: currentAlign === 'left' ? accentColor : 'transparent',
                                color: currentAlign === 'left' ? '#ffffff' : 'var(--text-main)',
                              }}
                              title="Alinhar à Esquerda"
                            >
                              <AlignLeft size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                isVideo ? alignSelectedVideo('center') : alignSelectedImage('center');
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{
                                padding: '3px 6px',
                                background: currentAlign === 'center' ? accentColor : 'transparent',
                                color: currentAlign === 'center' ? '#ffffff' : 'var(--text-main)',
                              }}
                              title="Centralizar"
                            >
                              <AlignCenter size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                isVideo ? alignSelectedVideo('right') : alignSelectedImage('right');
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{
                                padding: '3px 6px',
                                background: currentAlign === 'right' ? accentColor : 'transparent',
                                color: currentAlign === 'right' ? '#ffffff' : 'var(--text-main)',
                              }}
                              title="Alinhar à Direita"
                            >
                              <AlignRight size={12} />
                            </button>
                          </div>

                          <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />

                          {/* Larguras pré-definidas */}
                          <div style={{ display: 'flex', gap: '3px' }}>
                            {[35, 50, 75, 100].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  isVideo ? applyVideoWidth(pct) : applyImageWidth(pct);
                                }}
                                style={{
                                  padding: '2px 6px',
                                  fontSize: '0.69rem',
                                  fontWeight: 700,
                                  borderRadius: '4px',
                                  border: `1px solid ${currentWidth === pct ? accentColor : 'var(--border-subtle)'}`,
                                  background: currentWidth === pct ? accentColor : 'transparent',
                                  color: currentWidth === pct ? '#ffffff' : 'var(--text-main)',
                                  cursor: 'pointer',
                                }}
                                title={`Definir tamanho para ${pct}%`}
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>

                          <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />

                          {/* Excluir */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              isVideo ? removeSelectedVideo() : removeSelectedImage();
                            }}
                            style={{
                              padding: '3px 6px',
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Remover do Artigo"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {/* Pontos nos 4 Cantos */}
                        <div
                          onMouseDown={(e) => handleStartResize(e, 'top-left')}
                          style={{
                            position: 'absolute',
                            top: '-7px',
                            left: '-7px',
                            width: '14px',
                            height: '14px',
                            background: '#ffffff',
                            border: `2px solid ${accentColor}`,
                            borderRadius: '50%',
                            cursor: 'nwse-resize',
                            pointerEvents: 'auto',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
                            zIndex: 36,
                          }}
                          title="Arrastar ponto para redimensionar"
                        />
                        <div
                          onMouseDown={(e) => handleStartResize(e, 'top-right')}
                          style={{
                            position: 'absolute',
                            top: '-7px',
                            right: '-7px',
                            width: '14px',
                            height: '14px',
                            background: '#ffffff',
                            border: `2px solid ${accentColor}`,
                            borderRadius: '50%',
                            cursor: 'nesw-resize',
                            pointerEvents: 'auto',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
                            zIndex: 36,
                          }}
                          title="Arrastar ponto para redimensionar"
                        />
                        <div
                          onMouseDown={(e) => handleStartResize(e, 'bottom-left')}
                          style={{
                            position: 'absolute',
                            bottom: '-7px',
                            left: '-7px',
                            width: '14px',
                            height: '14px',
                            background: '#ffffff',
                            border: `2px solid ${accentColor}`,
                            borderRadius: '50%',
                            cursor: 'nesw-resize',
                            pointerEvents: 'auto',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
                            zIndex: 36,
                          }}
                          title="Arrastar ponto para redimensionar"
                        />
                        <div
                          onMouseDown={(e) => handleStartResize(e, 'bottom-right')}
                          style={{
                            position: 'absolute',
                            bottom: '-7px',
                            right: '-7px',
                            width: '14px',
                            height: '14px',
                            background: '#ffffff',
                            border: `2px solid ${accentColor}`,
                            borderRadius: '50%',
                            cursor: 'nwse-resize',
                            pointerEvents: 'auto',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
                            zIndex: 36,
                          }}
                          title="Arrastar ponto para redimensionar"
                        />

                        {/* Pontos nas Bordas Laterais */}
                        <div
                          onMouseDown={(e) => handleStartResize(e, 'left')}
                          style={{
                            position: 'absolute',
                            top: 'calc(50% - 7px)',
                            left: '-7px',
                            width: '14px',
                            height: '14px',
                            background: '#ffffff',
                            border: `2px solid ${accentColor}`,
                            borderRadius: '50%',
                            cursor: 'ew-resize',
                            pointerEvents: 'auto',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
                            zIndex: 36,
                          }}
                          title="Ajustar largura"
                        />
                        <div
                          onMouseDown={(e) => handleStartResize(e, 'right')}
                          style={{
                            position: 'absolute',
                            top: 'calc(50% - 7px)',
                            right: '-7px',
                            width: '14px',
                            height: '14px',
                            background: '#ffffff',
                            border: `2px solid ${accentColor}`,
                            borderRadius: '50%',
                            cursor: 'ew-resize',
                            pointerEvents: 'auto',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
                            zIndex: 36,
                          }}
                          title="Ajustar largura"
                        />

                        {/* Pill com Porcentagem e Tamanho em Pixels */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '-28px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: accentColor,
                            color: '#ffffff',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                            pointerEvents: 'none',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {currentWidth}% ({Math.round(overlayRect.width)}px)
                        </div>
                      </div>
                    );
                  })()
                )}
              </>
            ) : (
              /* Modo 2: Editor Textarea de Código HTML (com prévia ao lado) */
              <>
                <textarea
                  ref={textareaRef}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Edite o código HTML diretamente aqui..."
                  style={{
                    flex: '0 0 50%',
                    padding: '16px',
                    background: 'var(--bg-card)',
                    border: 'none',
                    borderRight: '1px solid var(--border-subtle)',
                    fontSize: '0.86rem',
                    fontFamily: 'monospace',
                    lineHeight: 1.65,
                    color: 'var(--text-main)',
                    resize: 'none',
                    outline: 'none',
                  }}
                />

                {/* Coluna 2: Prévia em Tempo Real (Aberta apenas no modo Código HTML) */}
                <div
                  style={{
                    flex: '0 0 50%',
                    padding: '18px 22px',
                    background: 'var(--bg-surface)',
                    overflowY: 'auto',
                    lineHeight: 1.7,
                    color: 'var(--text-main)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      <Eye size={13} />
                      <span>Prévia em Tempo Real (Visão do Cliente)</span>
                    </div>
                    <span style={{ fontSize: '0.70rem', color: 'var(--text-subtle)' }}>Renderização instantânea</span>
                  </div>

                  <div 
                    ref={previewRef}
                    className="article-preview-content"
                    style={{ fontSize: '0.92rem' }}
                    dangerouslySetInnerHTML={{ __html: content }} 
                  />
                </div>
              </>
            )}
          </div>

          {/* SEÇÃO: CAMPO PARA ANEXOS DE ARQUIVO */}
          <div
            style={{
              marginTop: '16px',
              padding: '16px 20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Paperclip size={16} color="var(--color-primary)" />
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Anexos do Artigo (Manuais PDF, Planilhas de Apoio, Layouts):
                </span>
              </div>

              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleAttachmentUpload}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
              >
                <Upload size={13} />
                <span>Adicionar Arquivo</span>
              </button>
            </div>

            {attachments.length === 0 ? (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Nenhum anexo adicionado ainda. Clique em "Adicionar Arquivo" para anexar planilhas, modelos ou PDFs ao artigo.
              </span>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.80rem',
                      color: 'var(--text-main)',
                    }}
                  >
                    <FileText size={14} color="#38bdf8" />
                    <span>{att.name}</span>
                    <span style={{ color: 'var(--text-subtle)', fontSize: '0.72rem' }}>({att.size})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Remover anexo"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR DE CONVERSA COM REVISOR EM BALÕES */}
        {showConversationSidebar && (
          <div
            style={{
              width: '380px',
              minWidth: '340px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {/* Header da Conversa */}
            <div
              style={{
                padding: '14px 18px',
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={17} color="var(--color-primary)" />
                <span style={{ fontSize: '0.90rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Conversa com Revisor
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: isAdjustmentMode ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-surface)',
                  color: isAdjustmentMode ? '#f59e0b' : 'var(--text-subtle)',
                  fontWeight: 700,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {isAdjustmentMode ? 'Ajustes Solicitados' : 'Em Diálogo'}
              </span>
            </div>

            {/* Balões de Mensagem */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: 'var(--bg-surface)',
              }}
            >
              {latestReview?.generalFeedback && (
                <div
                  style={{
                    padding: '12px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    color: 'var(--text-main)',
                    lineHeight: 1.45,
                  }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Parecer da Revisão ({latestReview.reviewerName}):
                  </div>
                  {latestReview.generalFeedback}
                </div>
              )}

              {currentArticle?.proposalNote && (
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    fontSize: '0.80rem',
                    color: 'var(--text-main)',
                  }}
                >
                  <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '2px' }}>
                    Nota da Proposta:
                  </strong>
                  {currentArticle.proposalNote}
                </div>
              )}

              {(!currentArticle?.comments || currentArticle.comments.length === 0) && !latestReview?.generalFeedback ? (
                <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <MessageSquare size={24} style={{ margin: '0 auto 6px auto', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.82rem', margin: 0 }}>
                    Inicie a conversa com o revisor abaixo enviando uma mensagem em balão.
                  </p>
                </div>
              ) : (
                currentArticle?.comments?.map((c) => {
                  const isReviewerOrAdmin =
                    c.authorRole === 'SUPER_ADMIN' ||
                    c.authorRole === 'ADMIN' ||
                    c.authorRole === 'REVIEWER';

                  return (
                    <div
                      key={c.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isReviewerOrAdmin ? 'flex-start' : 'flex-end',
                        gap: '3px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.70rem',
                          color: 'var(--text-subtle)',
                        }}
                      >
                        <span style={{ fontWeight: 700, color: isReviewerOrAdmin ? 'var(--color-primary)' : '#38bdf8' }}>
                          {c.authorName}
                        </span>
                        <span>•</span>
                        <span
                          style={{
                            fontSize: '0.66rem',
                            padding: '1px 4px',
                            borderRadius: '3px',
                            background: isReviewerOrAdmin ? 'rgba(92, 183, 128, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                            color: isReviewerOrAdmin ? 'var(--color-primary)' : '#38bdf8',
                            fontWeight: 700,
                          }}
                        >
                          {isReviewerOrAdmin ? 'Revisor' : 'Criador'}
                        </span>
                        <span>•</span>
                        <span>{new Date(c.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        style={{
                          maxWidth: '92%',
                          padding: '10px 14px',
                          borderRadius: isReviewerOrAdmin
                            ? '14px 14px 14px 4px'
                            : '14px 14px 4px 14px',
                          background: isReviewerOrAdmin
                            ? 'rgba(92, 183, 128, 0.12)'
                            : 'var(--bg-card)',
                          border: `1px solid ${
                            isReviewerOrAdmin
                              ? 'rgba(92, 183, 128, 0.3)'
                              : 'var(--border-subtle)'
                          }`,
                          color: 'var(--text-main)',
                          fontSize: '0.84rem',
                          lineHeight: 1.45,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                          wordBreak: 'break-word',
                        }}
                      >
                        {c.message}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input para o criador responder em balão */}
            <form
              onSubmit={handleSendCreatorReply}
              style={{
                padding: '12px 14px',
                borderTop: '1px solid var(--border-subtle)',
                background: 'var(--bg-sidebar)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                <span>Responder ao revisor em balão:</span>
                <span style={{ fontSize: '0.69rem', color: 'var(--color-primary)' }}>
                  Como: <strong>{currentUser?.displayName || 'Criador'}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <textarea
                  rows={2}
                  placeholder="Responda em balão ao revisor..."
                  value={creatorReplyInput}
                  onChange={(e) => setCreatorReplyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendCreatorReply();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    color: 'var(--text-main)',
                    resize: 'none',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={!creatorReplyInput.trim()}
                  className="btn btn-primary"
                  style={{
                    padding: '0 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-md)',
                    opacity: creatorReplyInput.trim() ? 1 : 0.5,
                    cursor: creatorReplyInput.trim() ? 'pointer' : 'not-allowed',
                  }}
                  title="Enviar resposta em balão (Enter)"
                >
                  <Send size={15} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* MODAL INTELIGENTE UNIFICADO DE MÍDIA (IMAGEM, VÍDEO OU HIPERLINK) */}
      {isMediaModalOpen && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            overflowY: 'auto',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMediaModalOpen(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              maxHeight: 'calc(100vh - 40px)',
              overflowY: 'auto',
              background: 'var(--bg-card, #0f172a)',
              borderRadius: '16px',
              border: '1px solid var(--border-subtle)',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Cabeçalho */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ImagePlus size={19} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700 }}>
                  Adicionar Mídia ou Link
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '4px' }}
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Abas: Inserir por Link (Inteligente) vs Upload do Computador */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setMediaActiveTab('link')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: mediaActiveTab === 'link' ? 'var(--color-primary)' : 'var(--bg-surface)',
                  color: mediaActiveTab === 'link' ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <LinkIcon size={14} />
                <span>Inserir por Link (URL)</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaActiveTab('upload')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: mediaActiveTab === 'upload' ? 'var(--color-primary)' : 'var(--bg-surface)',
                  color: mediaActiveTab === 'upload' ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Upload size={14} />
                <span>Upload do Computador</span>
              </button>
            </div>

            {/* Conteúdo Aba 1: Link Inteligente (Reconhece Imagem, Vídeo ou Hiperlink) */}
            {mediaActiveTab === 'link' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      URL ou Link da Mídia:
                    </label>

                    {/* Badge de Reconhecimento Automático */}
                    {mediaUrl.trim() && (
                      <span
                        style={{
                          fontSize: '0.71rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background:
                            detectedMediaType === 'video'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : detectedMediaType === 'image'
                              ? 'rgba(92, 183, 128, 0.15)'
                              : 'rgba(56, 189, 248, 0.15)',
                          color:
                            detectedMediaType === 'video'
                              ? '#ef4444'
                              : detectedMediaType === 'image'
                              ? 'var(--color-primary)'
                              : '#38bdf8',
                          border: `1px solid ${
                            detectedMediaType === 'video'
                              ? 'rgba(239, 68, 68, 0.3)'
                              : detectedMediaType === 'image'
                              ? 'rgba(92, 183, 128, 0.3)'
                              : 'rgba(56, 189, 248, 0.3)'
                          }`,
                        }}
                      >
                        {detectedMediaType === 'video' && <><Film size={11} /> Vídeo Detectado</>}
                        {detectedMediaType === 'image' && <><ImageIcon size={11} /> Imagem Detectada</>}
                        {detectedMediaType === 'link' && <><ExternalLink size={11} /> Hiperlink Detectado</>}
                      </span>
                    )}
                  </div>

                  <input
                    type="url"
                    autoFocus
                    placeholder="Cole aqui o link do YouTube, Vimeo, imagem (.png, .jpg) ou link web..."
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                    Reconhece automaticamente: Vídeo (YouTube, Vimeo, MP4), Imagem (PNG, JPG, SVG, WebP) ou Hiperlink.
                  </span>
                </div>

                {/* Seletor Manual de Tipo (Permite sobrescrever a detecção) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Tipo de Inserção:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'auto', label: '⚡ Auto', title: 'Detectar automaticamente pelo link' },
                      { id: 'image', label: '🖼️ Imagem', title: 'Inserir como imagem com alças de redimensionamento' },
                      { id: 'video', label: '🎬 Vídeo', title: 'Inserir como player de vídeo com alças' },
                      { id: 'link', label: '🔗 Link', title: 'Inserir como hiperlink clicável' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setManualMediaType(opt.id as any)}
                        style={{
                          padding: '6px 4px',
                          borderRadius: '6px',
                          border: `1px solid ${manualMediaType === opt.id ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                          background: manualMediaType === opt.id ? 'rgba(92, 183, 128, 0.16)' : 'var(--bg-surface)',
                          color: manualMediaType === opt.id ? 'var(--color-primary)' : 'var(--text-muted)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                        title={opt.title}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campo de Legenda / Texto do Link */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {detectedMediaType === 'link' ? 'Texto do Hiperlink (âncora):' : 'Legenda ou Descrição (Opcional):'}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      detectedMediaType === 'link'
                        ? 'Ex: Clique aqui para acessar o portal'
                        : detectedMediaType === 'video'
                        ? 'Ex: Demonstração da conciliação bancária'
                        : 'Ex: Tela de configuração de extratos'
                    }
                    value={mediaCaption}
                    onChange={(e) => setMediaCaption(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Ajustes de Tamanho e Alinhamento (apenas para Imagem ou Vídeo) */}
                {detectedMediaType !== 'link' && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 1fr',
                      gap: '10px',
                      background: 'var(--bg-surface)',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                        Largura Inicial:
                      </label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[35, 50, 75, 100].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setMediaInsertWidth(pct)}
                            style={{
                              flex: 1,
                              padding: '4px 0',
                              borderRadius: '4px',
                              border: `1px solid ${mediaInsertWidth === pct ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                              background: mediaInsertWidth === pct ? 'var(--color-primary)' : 'transparent',
                              color: mediaInsertWidth === pct ? '#fff' : 'var(--text-main)',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                        Alinhamento:
                      </label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {(['left', 'center', 'right'] as const).map((aln) => (
                          <button
                            key={aln}
                            type="button"
                            onClick={() => setMediaInsertAlign(aln)}
                            style={{
                              flex: 1,
                              padding: '4px 0',
                              borderRadius: '4px',
                              border: `1px solid ${mediaInsertAlign === aln ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                              background: mediaInsertAlign === aln ? 'var(--color-primary)' : 'transparent',
                              color: mediaInsertAlign === aln ? '#fff' : 'var(--text-main)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title={aln === 'left' ? 'Esquerda' : aln === 'right' ? 'Direita' : 'Centro'}
                          >
                            {aln === 'left' ? <AlignLeft size={13} /> : aln === 'right' ? <AlignRight size={13} /> : <AlignCenter size={13} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Prévia Instantânea */}
                {mediaUrl.trim() && (
                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px dashed var(--border-subtle)',
                      padding: '10px',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ display: 'block', fontSize: '0.71rem', fontWeight: 700, color: 'var(--text-subtle)', marginBottom: '6px' }}>
                      Prévia do elemento a ser inserido:
                    </span>
                    {detectedMediaType === 'image' && (
                      <img
                        src={mediaUrl.trim()}
                        alt="Prévia"
                        style={{ maxWidth: '100%', maxHeight: '160px', borderRadius: '6px', objectFit: 'contain' }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}
                    {detectedMediaType === 'video' && (
                      <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>
                        🎬 Player de vídeo ({mediaUrl.trim().includes('youtu') ? 'YouTube' : mediaUrl.trim().includes('vimeo') ? 'Vimeo' : 'MP4/WebM'})
                      </div>
                    )}
                    {detectedMediaType === 'link' && (
                      <div style={{ fontSize: '0.84rem' }}>
                        🔗 <span style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>{mediaCaption || mediaUrl.trim()}</span>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsMediaModalOpen(false)}
                    style={{ flex: 1, padding: '10px' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleConfirmMediaModal}
                    disabled={!mediaUrl.trim()}
                    style={{ flex: 1, padding: '10px', fontWeight: 700 }}
                  >
                    {detectedMediaType === 'video'
                      ? 'Inserir Vídeo'
                      : detectedMediaType === 'image'
                      ? 'Inserir Imagem'
                      : 'Inserir Link'}
                  </button>
                </div>
              </div>
            )}

            {/* Conteúdo Aba 2: Upload de Imagem do Computador */}
            {mediaActiveTab === 'upload' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  onClick={() => imageUploadRef.current?.click()}
                  style={{
                    border: '2px dashed var(--color-primary)',
                    borderRadius: '12px',
                    padding: '30px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'rgba(92, 183, 128, 0.05)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(92, 183, 128, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(92, 183, 128, 0.05)')}
                >
                  <Upload size={32} color="var(--color-primary)" style={{ margin: '0 auto 10px' }} />
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Clique aqui para escolher uma imagem do seu computador
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    Suporta PNG, JPG, JPEG, SVG, WebP, GIF (redimensionamento com alças ativado)
                  </div>
                </div>

                {/* Ajustes de Tamanho e Alinhamento para a imagem do upload */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr',
                    gap: '10px',
                    background: 'var(--bg-surface)',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Largura Inicial da Imagem:
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[35, 50, 75, 100].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setMediaInsertWidth(pct)}
                          style={{
                            flex: 1,
                            padding: '4px 0',
                            borderRadius: '4px',
                            border: `1px solid ${mediaInsertWidth === pct ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                            background: mediaInsertWidth === pct ? 'var(--color-primary)' : 'transparent',
                            color: mediaInsertWidth === pct ? '#fff' : 'var(--text-main)',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Alinhamento:
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {(['left', 'center', 'right'] as const).map((aln) => (
                        <button
                          key={aln}
                          type="button"
                          onClick={() => setMediaInsertAlign(aln)}
                          style={{
                            flex: 1,
                            padding: '4px 0',
                            borderRadius: '4px',
                            border: `1px solid ${mediaInsertAlign === aln ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                            background: mediaInsertAlign === aln ? 'var(--color-primary)' : 'transparent',
                            color: mediaInsertAlign === aln ? '#fff' : 'var(--text-main)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title={aln === 'left' ? 'Esquerda' : aln === 'right' ? 'Direita' : 'Centro'}
                        >
                          {aln === 'left' ? <AlignLeft size={13} /> : aln === 'right' ? <AlignRight size={13} /> : <AlignCenter size={13} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsMediaModalOpen(false)}
                    style={{ flex: 1, padding: '10px' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => imageUploadRef.current?.click()}
                    style={{ flex: 1, padding: '10px', fontWeight: 700 }}
                  >
                    Escolher Arquivo...
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
