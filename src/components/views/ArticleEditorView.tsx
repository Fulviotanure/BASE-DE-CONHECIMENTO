import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useArticleImageFallback } from '../../utils/imageFallback';
import { getDeletedCategoryIds } from '../../services/authService';
import {
  Send,
  ArrowLeft,
  MessageSquare,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Tag,
  Lock,
  Globe,
  List,
  ListOrdered,
  Quote,
  Table,
  Image as ImageIcon,
  ImagePlus,
  Film,
  Paperclip,
  Upload,
  Trash2,
  Eye,
  X,
  FileText,
  AlertTriangle,
  Lightbulb,
  Info,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Undo2,
  Redo2,
  Palette,
  Layers,
  Clock,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Article } from '../../types';

interface ArticleEditorViewProps {
  editingArticle: Article | null;
  isProposalMode?: boolean;
  onClose: () => void;
}

// Cores Dinâmicas Semânticas Curadas (Perfeitas no Modo Claro e Modo Escuro)
type EditorColorKey = 'default' | 'muted' | 'blue' | 'green' | 'amber' | 'red' | 'purple';

interface DynamicColorOption {
  id: EditorColorKey;
  label: string;
  previewColor: string;
  className: string;
}

const DYNAMIC_COLORS: DynamicColorOption[] = [
  { id: 'default', label: 'Padrão (Tema Dinâmico)', previewColor: 'var(--text-main)', className: 'dyn-color-default' },
  { id: 'muted', label: 'Cinza Suave (Secundário)', previewColor: 'var(--text-muted)', className: 'dyn-color-muted' },
  { id: 'blue', label: 'Azul Técnico / Destaque', previewColor: 'var(--editor-color-blue, #38bdf8)', className: 'dyn-color-blue' },
  { id: 'green', label: 'Verde Sucesso / Concluído', previewColor: 'var(--editor-color-green, #34d399)', className: 'dyn-color-green' },
  { id: 'amber', label: 'Âmbar Atenção / Alerta', previewColor: 'var(--editor-color-amber, #fbbf24)', className: 'dyn-color-amber' },
  { id: 'red', label: 'Vermelho Crítico / Erro', previewColor: 'var(--editor-color-red, #f87171)', className: 'dyn-color-red' },
  { id: 'purple', label: 'Roxo / Especial', previewColor: 'var(--editor-color-purple, #c084fc)', className: 'dyn-color-purple' },
];

export const ArticleEditorView: React.FC<ArticleEditorViewProps> = ({
  editingArticle,
  isProposalMode = false,
  onClose,
}) => {
  const {
    categories,
    createArticle,
    updateArticleContent,
    deleteArticle,
    proposeArticleEdit,
    currentUser,
    isPermanentSuperAdmin,
    addArticleComment,
    articles,
  } = useApp();

  const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' || isPermanentSuperAdmin;
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeletingArticle, setIsDeletingArticle] = useState(false);

  // 1. SINCRONIZAÇÃO ESTATAL DOS MÓDULOS (exclui categorias apagadas)
  const activeCategories = useMemo(() => {
    const deletedIds = getDeletedCategoryIds();
    return categories.filter((c) => !deletedIds.has(c.id));
  }, [categories]);

  const [categoryId, setCategoryId] = useState<string>(() => {
    const deletedIds = getDeletedCategoryIds();
    const valid = categories.filter((c) => !deletedIds.has(c.id));
    if (editingArticle?.categoryId && valid.some((c) => c.id === editingArticle.categoryId)) {
      return editingArticle.categoryId;
    }
    return valid[0]?.id || '';
  });

  useEffect(() => {
    if (activeCategories.length > 0 && !activeCategories.some((c) => c.id === categoryId)) {
      setCategoryId(activeCategories[0].id);
    }
  }, [activeCategories, categoryId]);

  const selectedCategoryObj = useMemo(() => {
    return activeCategories.find((c) => c.id === categoryId);
  }, [activeCategories, categoryId]);

  // Restrição Playbook / Interno
  const isInternalOnlyCategory = Boolean(
    categoryId === 'cat-11' ||
    categoryId === 'cat-12' ||
    selectedCategoryObj?.accessLevel === 'INTERNAL' ||
    selectedCategoryObj?.title?.toLowerCase().includes('playbook')
  );

  const [accessLevel, setAccessLevel] = useState<'INTERNAL' | 'ALL'>(() => {
    if (editingArticle?.categoryId === 'cat-11' || editingArticle?.categoryId === 'cat-12') return 'INTERNAL';
    const initCat = categories.find((c) => c.id === (editingArticle?.categoryId || categoryId));
    if (initCat?.accessLevel === 'INTERNAL') return 'INTERNAL';
    return editingArticle?.accessLevel === 'ALL' || editingArticle?.accessLevel === 'EXTERNAL' ? 'ALL' : 'INTERNAL';
  });

  useEffect(() => {
    if (isInternalOnlyCategory && accessLevel !== 'INTERNAL') {
      setAccessLevel('INTERNAL');
    }
  }, [categoryId, isInternalOnlyCategory]);

  // Dados Básicos do Artigo
  const [title, setTitle] = useState(editingArticle?.title || '');
  const [tagInput, setTagInput] = useState(editingArticle?.tags.join(', ') || '');
  const [proposalNote, setProposalNote] = useState(editingArticle?.proposalNote || '');
  const [content, setContent] = useState(editingArticle?.contentHtml || '');

  // Anexos do Artigo
  const [attachments, setAttachments] = useState<{ id: string; name: string; size: string; url?: string }[]>(
    editingArticle?.attachments || []
  );
  const [isAttachmentsModalOpen, setIsAttachmentsModalOpen] = useState(false);

  // Modal Prévia do Leitor (Preview Mode)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Paleta de cores dropdown
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);

  // Dropdown e Grid Interativo de Criação de Tabela por Mouse
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const [tableHoverRows, setTableHoverRows] = useState(3);
  const [tableHoverCols, setTableHoverCols] = useState(3);

  // Seleção e Alças Interativas para Imagem
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [selectedImageWidth, setSelectedImageWidth] = useState<number>(100);
  const [selectedImageAlign, setSelectedImageAlign] = useState<'center' | 'left' | 'right'>('center');

  // Seleção e Alças Interativas para Vídeo
  const [selectedVideoElement, setSelectedVideoElement] = useState<HTMLElement | null>(null);
  const [selectedVideoWidth, setSelectedVideoWidth] = useState<number>(100);
  const [selectedVideoAlign, setSelectedVideoAlign] = useState<'center' | 'left' | 'right'>('center');

  // Bounding rect do overlay de redimensionamento
  const [overlayRect, setOverlayRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    isNearTop?: boolean;
  } | null>(null);

  // Resposta em balão com o revisor (quando em modo de ajuste)
  const [creatorReplyInput, setCreatorReplyInput] = useState('');

  // Refs
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const visualEditorRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pctBadgeRef = useRef<HTMLDivElement>(null);
  const draggedImageElementRef = useRef<HTMLElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const isResizingRef = useRef(false);

  // Artigo Atual e Modo de Ajuste
  const currentArticle = useMemo(() => {
    if (!editingArticle) return null;
    return articles.find((a) => a.id === editingArticle.id) || editingArticle;
  }, [articles, editingArticle]);

  const latestReview = useMemo(() => {
    if (!currentArticle?.reviews || currentArticle.reviews.length === 0) return null;
    return currentArticle.reviews[currentArticle.reviews.length - 1];
  }, [currentArticle]);

  const isAdjustmentMode = Boolean(
    currentArticle && (currentArticle.currentStatus === 'IN_ADJUSTMENT' || currentArticle.currentStatus === 'PENDING')
  );

  const showConversationSidebar = Boolean(
    currentArticle && (isAdjustmentMode || currentArticle.reviews?.length || currentArticle.proposalNote)
  );

  // Sincronização inicial do editor visual
  useEffect(() => {
    if (visualEditorRef.current) {
      visualEditorRef.current.innerHTML = content;
    }
  }, []);

  const syncFromVisualEditor = () => {
    if (visualEditorRef.current) {
      setContent(visualEditorRef.current.innerHTML);
    }
  };

  // Atualização em tempo real das alças de redimensionamento
  const updateOverlayRect = () => {
    const target = selectedImage 
      ? (selectedImage.closest('figure.article-image-figure') || selectedImage)
      : selectedVideoElement;
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

    const isNearTop = targetRect.top - wrapperRect.top < 45;

    setOverlayRect({
      top: targetRect.top - wrapperRect.top + editorWrapperRef.current.scrollTop,
      left: targetRect.left - wrapperRect.left + editorWrapperRef.current.scrollLeft,
      width: targetRect.width,
      height: targetRect.height,
      isNearTop,
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
    editorWrapperRef.current?.addEventListener('scroll', onResizeOrScroll, { passive: true });
    visualEditorRef.current?.addEventListener('scroll', onResizeOrScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', onResizeOrScroll);
      editorWrapperRef.current?.removeEventListener('scroll', onResizeOrScroll);
      visualEditorRef.current?.removeEventListener('scroll', onResizeOrScroll);
    };
  }, [selectedImage, selectedVideoElement]);

  // Intercepta imagens com links expirados do Movidesk no editor visual
  useArticleImageFallback(visualEditorRef, [content]);

  // Estatísticas de Leitura
  const stats = useMemo(() => {
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = plainText ? plainText.split(' ').length : 0;
    const chars = plainText.length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readingTime };
  }, [content]);

  // Desfazer (Ctrl+Z) e Refazer (Ctrl+Y)
  const handleUndo = () => {
    if (visualEditorRef.current) {
      visualEditorRef.current.focus();
      document.execCommand('undo', false);
      syncFromVisualEditor();
    }
  };

  const handleRedo = () => {
    if (visualEditorRef.current) {
      visualEditorRef.current.focus();
      document.execCommand('redo', false);
      syncFromVisualEditor();
    }
  };

  // Formatação Visual Direta
  const formatVisual = (command: string, value: string = '') => {
    if (visualEditorRef.current) {
      visualEditorRef.current.focus();
      document.execCommand(command, false, value);
      syncFromVisualEditor();
    }
  };

  // Formatação de Tamanho de Fonte Semântico
  const applyFontSize = (size: 'p' | 'h2' | 'h3' | 'small') => {
    if (!visualEditorRef.current) return;
    visualEditorRef.current.focus();
    if (size === 'h2') {
      document.execCommand('formatBlock', false, '<h2>');
    } else if (size === 'h3') {
      document.execCommand('formatBlock', false, '<h3>');
    } else if (size === 'p') {
      document.execCommand('formatBlock', false, '<p>');
    } else if (size === 'small') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const selected = range.extractContents();
        const smallEl = document.createElement('small');
        smallEl.className = 'text-small';
        smallEl.appendChild(selected);
        range.insertNode(smallEl);
      }
    }
    syncFromVisualEditor();
  };

  // Aplicação de Cores Dinâmicas
  const applyTextColor = (colorKey: EditorColorKey) => {
    if (!visualEditorRef.current) return;
    visualEditorRef.current.focus();
    setIsColorDropdownOpen(false);

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    if (colorKey === 'default') {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('foreColor', false, 'inherit');
      let node: Node | null = range.commonAncestorContainer;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
      const el = node as HTMLElement | null;
      if (el && el !== visualEditorRef.current) {
        el.classList.remove(
          'dyn-color-default',
          'dyn-color-muted',
          'dyn-color-blue',
          'dyn-color-green',
          'dyn-color-amber',
          'dyn-color-red',
          'dyn-color-purple'
        );
        if (el.style.color) el.style.color = '';
      }
    } else {
      const option = DYNAMIC_COLORS.find((c) => c.id === colorKey);
      if (!option) return;

      if (!range.collapsed) {
        const selectedFragment = range.extractContents();
        const span = document.createElement('span');
        span.className = option.className;
        span.style.color = option.previewColor;
        span.appendChild(selectedFragment);
        range.insertNode(span);
        range.selectNodeContents(span);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    syncFromVisualEditor();
  };

  // Inserir Trecho HTML na Posição do Cursor
  const insertHtmlAtCursor = (html: string) => {
    if (!visualEditorRef.current) return;
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
  };

  // Caixas de Destaque
  const insertCalloutTip = () => {
    const html = `<div class="callout callout-tip" style="padding: 12px 16px; margin: 14px 0; background: rgba(92, 183, 128, 0.12); border-left: 4px solid #5cb780; border-radius: 6px; color: var(--text-main);"><strong style="color: #5cb780; display: block; margin-bottom: 4px;">💡 Dica:</strong><p><br></p></div><p><br></p>`;
    insertHtmlAtCursor(html);
  };

  const insertCalloutInfo = () => {
    const html = `<div class="callout callout-info" style="padding: 12px 16px; margin: 14px 0; background: rgba(56, 189, 248, 0.12); border-left: 4px solid #38bdf8; border-radius: 6px; color: var(--text-main);"><strong style="color: #38bdf8; display: block; margin-bottom: 4px;">ℹ️ Observação:</strong><p><br></p></div><p><br></p>`;
    insertHtmlAtCursor(html);
  };

  const insertCalloutWarning = () => {
    const html = `<div class="callout callout-warning" style="padding: 12px 16px; margin: 14px 0; background: rgba(245, 158, 11, 0.12); border-left: 4px solid #f59e0b; border-radius: 6px; color: var(--text-main);"><strong style="color: #f59e0b; display: block; margin-bottom: 4px;">⚠️ Atenção:</strong><p><br></p></div><p><br></p>`;
    insertHtmlAtCursor(html);
  };

  // Tabela por Arraste do Mouse
  const insertTable = (rows: number, cols: number) => {
    let html = `<table style="width: 100%; border-collapse: collapse; margin: 14px 0; border: 1px solid var(--border-subtle);"><thead><tr>`;
    for (let c = 1; c <= cols; c++) {
      html += `<th style="border: 1px solid var(--border-subtle); padding: 8px 12px; background: rgba(255,255,255,0.06); font-weight: 700;">Coluna ${c}</th>`;
    }
    html += `</tr></thead><tbody>`;
    for (let r = 1; r <= rows; r++) {
      html += `<tr>`;
      for (let c = 1; c <= cols; c++) {
        html += `<td style="border: 1px solid var(--border-subtle); padding: 7px 12px;">Item ${r}.${c}</td>`;
      }
      html += `</tr>`;
    }
    html += `</tbody></table><p><br></p>`;
    insertHtmlAtCursor(html);
    setIsTableDropdownOpen(false);
  };

  // Helper de detecção de URLs
  const isVideoUrl = (url: string): boolean => {
    const clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) return false;
    if (/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i.test(clean)) return true;
    if (/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i.test(clean)) return true;
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(clean)) return true;
    return false;
  };

  const isImageUrl = (url: string): boolean => {
    const clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.startsWith('data:image/')) return false;
    if (clean.startsWith('data:image/')) return true;
    if (/\.(png|jpe?g|gif|webp|svg|bmp|avif)(\?.*)?$/i.test(clean)) return true;
    if (/images\.unsplash\.com|res\.cloudinary\.com|i\.imgur\.com|media\.giphy\.com/i.test(clean)) return true;
    return false;
  };

  const getEmbedVideoHtml = (
    url: string,
    widthPercent: number = 100,
    align: 'center' | 'left' | 'right' = 'center'
  ) => {
    const trimmed = url.trim();
    let embedUrl = '';
    const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    } else {
      const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
      if (vimeoMatch && vimeoMatch[1]) {
        embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      }
    }

    let figureStyle = `width: ${widthPercent}%; max-width: 100%; box-sizing: border-box; margin: 16px auto; text-align: center; display: block; clear: both;`;
    if (align === 'left') {
      figureStyle = `width: ${widthPercent}%; max-width: 100%; box-sizing: border-box; float: left; margin: 10px 18px 16px 0; text-align: left; display: block; clear: none;`;
    } else if (align === 'right') {
      figureStyle = `width: ${widthPercent}%; max-width: 100%; box-sizing: border-box; float: right; margin: 10px 0 16px 18px; text-align: right; display: block; clear: none;`;
    }

    const videoInner = embedUrl
      ? `<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; width: 100%; max-width: 100%; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.3); background: #000;">
          <iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 8px; object-fit: contain;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>`
      : `<div style="border-radius: 8px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.3); background: #000; width: 100%;">
          <video controls style="width: 100%; max-height: 520px; display: block; border-radius: 8px; object-fit: contain;" src="${trimmed}">
            Seu navegador não suporta a tag de vídeo. Link: <a href="${trimmed}" target="_blank" rel="noopener noreferrer">${trimmed}</a>
          </video>
        </div>`;

    return `
      <figure class="article-video-figure" data-align="${align}" style="${figureStyle}">
        ${videoInner}
      </figure><p><br></p>
    `;
  };

  const insertImageElement = (
    src: string,
    alt: string = 'Imagem',
    align: 'center' | 'left' | 'right' = 'center',
    widthPercent: number = 60
  ) => {
    let floatStyle = 'float: none; margin: 14px auto; display: block; clear: both;';
    if (align === 'left') floatStyle = 'float: left; margin: 8px 18px 14px 0; display: block; clear: none;';
    else if (align === 'right') floatStyle = 'float: right; margin: 8px 0 14px 18px; display: block; clear: none;';

    const figureHtml = `
      <figure class="article-image-figure" data-align="${align}" style="width: ${widthPercent}%; max-width: 100%; box-sizing: border-box; text-align: center; ${floatStyle}">
        <img src="${src}" alt="Imagem" draggable="false" style="width: 100%; max-width: 100%; height: auto; object-fit: contain; border-radius: 8px; border: 1px solid var(--border-subtle); box-shadow: 0 4px 14px rgba(0,0,0,0.25); display: block; margin: 0 auto; cursor: pointer;" />
      </figure><p><br></p>
    `;
    insertHtmlAtCursor(figureHtml);
  };

  // [3. UPLOAD DIRETO DE MÍDIA] - Aciona explorador de arquivos nativo do SO (sem legendas)
  const handleDirectMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          insertImageElement(base64, 'Imagem');
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const videoDataUrl = event.target?.result as string;
          const figureHtml = `
            <figure class="article-video-figure" data-align="center" style="width: 100%; max-width: 100%; box-sizing: border-box; margin: 16px auto; text-align: center; display: block; clear: both;">
              <div style="border-radius: 8px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.3); background: #000; width: 100%;">
                <video controls style="width: 100%; max-height: 520px; display: block; border-radius: 8px; object-fit: contain;" src="${videoDataUrl}">
                  Seu navegador não suporta a tag de vídeo.
                </video>
              </div>
            </figure><p><br></p>
          `;
          insertHtmlAtCursor(figureHtml);
        };
        reader.readAsDataURL(file);
      }
    });

    e.target.value = '';
  };

  // [5. AUTO-EMBED INTELIGENTE DE LINKS] - Scan em tempo real ao digitar/colar URLs de imagem ou vídeo
  const handleAutoEmbedTextScan = () => {
    if (!visualEditorRef.current) return;
    const walker = document.createTreeWalker(
      visualEditorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );
    let node: Node | null;
    const toProcess: { textNode: Text; url: string; isVideo: boolean }[] = [];

    while ((node = walker.nextNode())) {
      const val = node.nodeValue || '';
      const urlRegex = /(https?:\/\/[^\s<]+)/g;
      let match: RegExpExecArray | null;
      while ((match = urlRegex.exec(val)) !== null) {
        const rawUrl = match[1].replace(/[.,;)]+$/, '');
        if (isVideoUrl(rawUrl)) {
          toProcess.push({ textNode: node as Text, url: rawUrl, isVideo: true });
          break;
        } else if (isImageUrl(rawUrl)) {
          toProcess.push({ textNode: node as Text, url: rawUrl, isVideo: false });
          break;
        }
      }
    }

    if (toProcess.length > 0) {
      toProcess.forEach(({ textNode, url, isVideo }) => {
        const parent = textNode.parentNode;
        if (!parent) return;
        const fullText = textNode.nodeValue || '';
        const idx = fullText.indexOf(url);
        if (idx === -1) return;

        const before = fullText.substring(0, idx);
        const after = fullText.substring(idx + url.length);

        const tempContainer = document.createElement('div');
        if (isVideo) {
          tempContainer.innerHTML = getEmbedVideoHtml(url);
        } else {
          tempContainer.innerHTML = `
            <figure class="article-image-figure" data-align="center" style="display: inline-block; vertical-align: top; width: 60%; max-width: 100%; box-sizing: border-box; text-align: center; float: none; margin: 12px auto;">
              <img src="${url}" alt="Imagem" draggable="true" style="width: 100%; height: auto; border-radius: 8px; border: 1px solid var(--border-subtle); box-shadow: 0 4px 14px rgba(0,0,0,0.25); display: block;" />
            </figure><p><br></p>
          `;
        }

        const frag = document.createDocumentFragment();
        if (before) frag.appendChild(document.createTextNode(before));
        while (tempContainer.firstChild) {
          frag.appendChild(tempContainer.firstChild);
        }
        if (after) frag.appendChild(document.createTextNode(after));

        parent.replaceChild(frag, textNode);
      });
      syncFromVisualEditor();
    }
  };

  // Evento de Colar (Auto-Embed Instantâneo ao colar link ou imagem do clipboard)
  const handleVisualPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // 1. Arquivos de imagem no clipboard (ex: PrintScreen colado)
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

    // 2. URLs de Vídeo ou Imagem coladas
    const pastedText = e.clipboardData?.getData('text/plain')?.trim();
    if (pastedText) {
      if (isVideoUrl(pastedText)) {
        e.preventDefault();
        insertHtmlAtCursor(getEmbedVideoHtml(pastedText));
        return;
      }
      if (isImageUrl(pastedText)) {
        e.preventDefault();
        insertImageElement(pastedText, 'Imagem');
        return;
      }
    }

    // Permite colar texto normal e verifica se há links para Auto-Embed
    setTimeout(() => {
      handleAutoEmbedTextScan();
      syncFromVisualEditor();
    }, 10);
  };

  const handleEditorKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      handleAutoEmbedTextScan();
    }
  };

  const handleEditorInput = () => {
    syncFromVisualEditor();
  };

  // [4. MANIPULAÇÃO DE MÍDIA NA TELA (RESIZE E ALINHAMENTO)]
  const selectImageForResize = (img: HTMLImageElement) => {
    visualEditorRef.current?.querySelectorAll('.img-selected, .video-selected').forEach((el) => {
      el.classList.remove('img-selected', 'video-selected');
    });
    img.classList.add('img-selected');
    setSelectedImage(img);
    setSelectedVideoElement(null);

    // Garante que a imagem esteja envolvida por um wrapper figure.article-image-figure
    let parentFigure = img.closest('figure.article-image-figure') as HTMLElement | null;
    if (!parentFigure) {
      parentFigure = document.createElement('figure');
      parentFigure.className = 'article-image-figure';
      const initialAlign = img.getAttribute('data-align') || 'center';
      parentFigure.setAttribute('data-align', initialAlign);
      parentFigure.style.width = img.style.width && img.style.width.endsWith('%') ? img.style.width : '60%';
      parentFigure.style.maxWidth = '100%';
      parentFigure.style.boxSizing = 'border-box';
      parentFigure.style.display = 'block';
      parentFigure.style.margin = initialAlign === 'center' ? '14px auto' : initialAlign === 'left' ? '8px 18px 14px 0' : '8px 0 14px 18px';
      parentFigure.style.float = initialAlign === 'center' ? 'none' : initialAlign;
      parentFigure.style.clear = initialAlign === 'center' ? 'both' : 'none';
      parentFigure.style.textAlign = initialAlign;
      img.parentNode?.insertBefore(parentFigure, img);
      parentFigure.appendChild(img);
    }

    // A tag img interna DEVE ter width: 100%, height: auto e object-fit: contain
    img.style.width = '100%';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.objectFit = 'contain';
    img.style.display = 'block';
    img.style.margin = '0 auto';

    // Remove qualquer figcaption ou legenda associada à imagem
    parentFigure.querySelectorAll('figcaption').forEach((fc) => fc.remove());

    const wStr = parentFigure.style.width;
    if (wStr && wStr.endsWith('%')) {
      setSelectedImageWidth(parseInt(wStr, 10));
    } else if (parentFigure.offsetWidth && visualEditorRef.current) {
      const editorWidth = visualEditorRef.current.clientWidth - 32;
      const pct = Math.round((parentFigure.offsetWidth / editorWidth) * 100);
      setSelectedImageWidth(Math.min(100, Math.max(15, pct)));
    } else {
      setSelectedImageWidth(60);
    }

    const alignAttr = parentFigure.getAttribute('data-align') || img.getAttribute('data-align');
    const determinedAlign = (alignAttr === 'left' || parentFigure.style.float === 'left')
      ? 'left'
      : (alignAttr === 'right' || parentFigure.style.float === 'right')
      ? 'right'
      : 'center';
    setSelectedImageAlign(determinedAlign);

    if (determinedAlign === 'center') {
      parentFigure.style.display = 'block';
      parentFigure.style.marginLeft = 'auto';
      parentFigure.style.marginRight = 'auto';
      parentFigure.style.float = 'none';
      parentFigure.style.clear = 'both';
      parentFigure.setAttribute('data-align', 'center');
      img.setAttribute('data-align', 'center');
      if (parentFigure.parentElement && parentFigure.parentElement !== visualEditorRef.current) {
        parentFigure.parentElement.style.textAlign = 'center';
      }
    }

    // Sincroniza bounded box imediatamente no frame do primeiro clique
    if (editorWrapperRef.current) {
      const wrapperRect = editorWrapperRef.current.getBoundingClientRect();
      const targetRect = parentFigure.getBoundingClientRect();
      if (targetRect.width > 0 && targetRect.height > 0) {
        const isNearTop = targetRect.top - wrapperRect.top < 45;
        setOverlayRect({
          top: targetRect.top - wrapperRect.top + editorWrapperRef.current.scrollTop,
          left: targetRect.left - wrapperRect.left + editorWrapperRef.current.scrollLeft,
          width: targetRect.width,
          height: targetRect.height,
          isNearTop,
        });
      }
    }

    setTimeout(updateOverlayRect, 20);
  };

  const selectVideoForResize = (videoEl: HTMLElement) => {
    visualEditorRef.current?.querySelectorAll('.img-selected, .video-selected').forEach((el) => {
      el.classList.remove('img-selected', 'video-selected');
    });
    videoEl.classList.add('video-selected');
    setSelectedVideoElement(videoEl);
    setSelectedImage(null);

    // Remove qualquer figcaption remanescente do vídeo
    videoEl.querySelectorAll('figcaption').forEach((fc) => fc.remove());

    const wStr = videoEl.style.width;
    if (wStr && wStr.endsWith('%')) {
      setSelectedVideoWidth(parseInt(wStr, 10));
    } else if (videoEl.offsetWidth && visualEditorRef.current) {
      const editorWidth = visualEditorRef.current.clientWidth - 32;
      const pct = Math.round((videoEl.offsetWidth / editorWidth) * 100);
      setSelectedVideoWidth(Math.min(100, Math.max(15, pct)));
    } else {
      setSelectedVideoWidth(100);
    }

    const alignAttr = videoEl.getAttribute('data-align');
    if (alignAttr === 'left' || videoEl.style.float === 'left') setSelectedVideoAlign('left');
    else if (alignAttr === 'right' || videoEl.style.float === 'right') setSelectedVideoAlign('right');
    else setSelectedVideoAlign('center');

    if (editorWrapperRef.current) {
      const wrapperRect = editorWrapperRef.current.getBoundingClientRect();
      const targetRect = videoEl.getBoundingClientRect();
      if (targetRect.width > 0 && targetRect.height > 0) {
        const isNearTop = targetRect.top - wrapperRect.top < 45;
        setOverlayRect({
          top: targetRect.top - wrapperRect.top + editorWrapperRef.current.scrollTop,
          left: targetRect.left - wrapperRect.left + editorWrapperRef.current.scrollLeft,
          width: targetRect.width,
          height: targetRect.height,
          isNearTop,
        });
      }
    }

    setTimeout(updateOverlayRect, 20);
  };

  // Ativação instantânea no primeiro clique / focus (Single Click Trigger)
  const handleVisualPointerDown = (e: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Se clicou na barra flutuante ou nas alças, não desmarca
    if (
      target.closest('.image-floating-toolbar') ||
      target.closest('.video-floating-toolbar') ||
      target.closest('.image-resize-overlay')
    ) {
      return;
    }

    const img = (target.tagName === 'IMG'
      ? target
      : target.closest('figure.article-image-figure img') || target.querySelector('img')) as HTMLImageElement | null;

    if (img) {
      selectImageForResize(img);
      return;
    }

    const videoFigure = (target.closest('.article-video-figure') ||
      target.closest('.video-container') ||
      (target.tagName === 'VIDEO' ? target.closest('.article-video-figure') || target : null) ||
      (target.tagName === 'IFRAME' ? target.closest('.article-video-figure') || target : null)) as HTMLElement | null;

    if (videoFigure) {
      selectVideoForResize(videoFigure);
      return;
    }

    // Clique fora desmarca a seleção
    visualEditorRef.current?.querySelectorAll('.img-selected, .video-selected').forEach((el) => {
      el.classList.remove('img-selected', 'video-selected');
    });
    setSelectedImage(null);
    setSelectedVideoElement(null);
    setOverlayRect(null);
  };

  // Arraste de alças interativas com clamp de 15% a 100% e fluidez a 60fps sem delay
  const handleStartResize = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    const targetEl = (selectedImage 
      ? (selectedImage.closest('figure.article-image-figure') || selectedImage)
      : selectedVideoElement) as HTMLElement | null;
    if (!targetEl || !visualEditorRef.current || !editorWrapperRef.current) return;

    isResizingRef.current = true;
    const startX = e.clientX;
    const editorEl = visualEditorRef.current;
    const wrapperEl = editorWrapperRef.current;
    const editorRect = editorEl.getBoundingClientRect();
    const editorWidth = Math.max(200, editorRect.width - 32);

    const startRect = targetEl.getBoundingClientRect();
    const startWidthPx = startRect.width;
    const align = targetEl.getAttribute('data-align') || 'center';

    document.body.style.userSelect = 'none';
    const iframes = editorEl.querySelectorAll('iframe');
    iframes.forEach((ifr) => (ifr.style.pointerEvents = 'none'));

    let currentClampedPercent = 100;
    const wStr = targetEl.style.width;
    if (wStr && wStr.endsWith('%')) {
      currentClampedPercent = Math.min(100, Math.max(15, parseFloat(wStr)));
    } else {
      currentClampedPercent = Math.min(100, Math.max(15, Math.round((startWidthPx / editorWidth) * 100)));
    }

    let rafId: number | null = null;

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - startX;

      let calculatedPx = startWidthPx;
      const isRightHandle = handle === 'right' || handle === 'top-right' || handle === 'bottom-right';
      const isLeftHandle = handle === 'left' || handle === 'top-left' || handle === 'bottom-left';

      if (isRightHandle) {
        if (align === 'center') {
          calculatedPx = startWidthPx + (deltaX * 2);
        } else {
          calculatedPx = startWidthPx + deltaX;
        }
      } else if (isLeftHandle) {
        if (align === 'center') {
          calculatedPx = startWidthPx - (deltaX * 2);
        } else {
          calculatedPx = startWidthPx - deltaX;
        }
      }

      const calculatedPercent = (calculatedPx / editorWidth) * 100;

      // [2. CORREÇÃO DO BUG DE OVERFLOW NO REDIMENSIONAMENTO (> 100%)]
      // Clamp rigoroso: NUNCA excede 100% e NUNCA cai abaixo de 15%.
      // Trava estritamente em 100% se o usuário arrastar para fora.
      currentClampedPercent = Math.min(100, Math.max(15, Math.round(calculatedPercent)));

      // [4. OTIMIZAÇÃO DE PERFORMANCE (60FPS DIRETO NO DOM VIA RAF)]
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        // 1. Atualiza diretamente o container wrapper no DOM
        targetEl.style.width = `${currentClampedPercent}%`;
        targetEl.style.maxWidth = '100%';
        targetEl.style.boxSizing = 'border-box';

        // 2. Garante que a imagem interna acompanhe 100% do wrapper com object-fit contain
        if (selectedImage) {
          selectedImage.style.width = '100%';
          selectedImage.style.maxWidth = '100%';
          selectedImage.style.height = 'auto';
          selectedImage.style.objectFit = 'contain';
          selectedImage.style.display = 'block';
        }

        // 3. Atualiza as alças/overlay bounding box diretamente no DOM em sincronia absoluta
        const updatedTargetRect = targetEl.getBoundingClientRect();
        const updatedWrapperRect = wrapperEl.getBoundingClientRect();
        const overlayEl = overlayRef.current;
        if (overlayEl) {
          overlayEl.style.width = `${updatedTargetRect.width}px`;
          overlayEl.style.height = `${updatedTargetRect.height}px`;
          overlayEl.style.top = `${updatedTargetRect.top - updatedWrapperRect.top + wrapperEl.scrollTop}px`;
          overlayEl.style.left = `${updatedTargetRect.left - updatedWrapperRect.left + wrapperEl.scrollLeft}px`;
        }

        // 4. Atualiza o badge indicador de porcentagem diretamente no DOM
        const badgeEl = pctBadgeRef.current;
        if (badgeEl) {
          badgeEl.textContent = `${currentClampedPercent}% (${Math.round(updatedTargetRect.width)}px)`;
        }
      });
    };

    const onMouseUp = () => {
      isResizingRef.current = false;
      if (rafId) cancelAnimationFrame(rafId);
      document.body.style.userSelect = '';
      iframes.forEach((ifr) => (ifr.style.pointerEvents = 'auto'));
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      // Atualiza o estado React apenas UMA VEZ no término do redimensionamento
      if (selectedImage) {
        setSelectedImageWidth(currentClampedPercent);
      } else if (selectedVideoElement) {
        setSelectedVideoWidth(currentClampedPercent);
      }
      updateOverlayRect();
      syncFromVisualEditor();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Alinhamentos de Mídia
  const alignSelectedImage = (align: 'center' | 'left' | 'right') => {
    if (!selectedImage) return;
    setSelectedImageAlign(align);
    const parentFigure = selectedImage.closest('figure.article-image-figure') as HTMLElement | null;
    const target = parentFigure || selectedImage;
    target.setAttribute('data-align', align);
    selectedImage.setAttribute('data-align', align);

    if (align === 'center') {
      target.style.display = 'block';
      target.style.float = 'none';
      target.style.clear = 'both';
      target.style.marginLeft = 'auto';
      target.style.marginRight = 'auto';
      target.style.marginTop = '14px';
      target.style.marginBottom = '14px';
      target.style.textAlign = 'center';
      if (parentFigure) {
        selectedImage.style.display = 'block';
        selectedImage.style.margin = '0 auto';
      }
      if (target.parentElement && target.parentElement !== visualEditorRef.current) {
        target.parentElement.style.textAlign = 'center';
      }
    } else if (align === 'left') {
      target.style.display = 'block';
      target.style.float = 'left';
      target.style.clear = 'none';
      target.style.marginLeft = '0';
      target.style.marginRight = '18px';
      target.style.marginTop = '8px';
      target.style.marginBottom = '14px';
      target.style.textAlign = 'left';
      if (target.parentElement && target.parentElement !== visualEditorRef.current) {
        target.parentElement.style.textAlign = 'left';
      }
    } else if (align === 'right') {
      target.style.display = 'block';
      target.style.float = 'right';
      target.style.clear = 'none';
      target.style.marginLeft = '18px';
      target.style.marginRight = '0';
      target.style.marginTop = '8px';
      target.style.marginBottom = '14px';
      target.style.textAlign = 'right';
      if (target.parentElement && target.parentElement !== visualEditorRef.current) {
        target.parentElement.style.textAlign = 'right';
      }
    }
    syncFromVisualEditor();
    updateOverlayRect();
    setTimeout(updateOverlayRect, 30);
  };

  const applyImageWidth = (pct: number) => {
    if (!selectedImage) return;
    const clamped = Math.min(100, Math.max(15, pct));
    setSelectedImageWidth(clamped);
    const parentFigure = selectedImage.closest('figure.article-image-figure') as HTMLElement | null;
    const target = parentFigure || selectedImage;
    target.style.width = `${clamped}%`;
    target.style.maxWidth = '100%';
    target.style.boxSizing = 'border-box';
    selectedImage.style.width = '100%';
    selectedImage.style.maxWidth = '100%';
    selectedImage.style.height = 'auto';
    selectedImage.style.objectFit = 'contain';
    selectedImage.style.display = 'block';
    selectedImage.style.margin = '0 auto';
    if (selectedImageAlign === 'center') {
      target.style.display = 'block';
      target.style.marginLeft = 'auto';
      target.style.marginRight = 'auto';
      target.style.float = 'none';
      target.style.clear = 'both';
      if (target.parentElement && target.parentElement !== visualEditorRef.current) {
        target.parentElement.style.textAlign = 'center';
      }
    }
    syncFromVisualEditor();
    setTimeout(updateOverlayRect, 30);
  };

  const removeSelectedImage = () => {
    if (!selectedImage) return;
    const parentFigure = selectedImage.closest('figure');
    if (parentFigure) parentFigure.remove();
    else selectedImage.remove();
    setSelectedImage(null);
    setOverlayRect(null);
    syncFromVisualEditor();
  };

  const alignSelectedVideo = (align: 'center' | 'left' | 'right') => {
    if (!selectedVideoElement) return;
    setSelectedVideoAlign(align);
    selectedVideoElement.setAttribute('data-align', align);

    if (align === 'center') {
      selectedVideoElement.style.display = 'block';
      selectedVideoElement.style.float = 'none';
      selectedVideoElement.style.clear = 'both';
      selectedVideoElement.style.marginLeft = 'auto';
      selectedVideoElement.style.marginRight = 'auto';
      selectedVideoElement.style.marginTop = '16px';
      selectedVideoElement.style.marginBottom = '16px';
      selectedVideoElement.style.textAlign = 'center';
      if (selectedVideoElement.parentElement && selectedVideoElement.parentElement !== visualEditorRef.current) {
        selectedVideoElement.parentElement.style.textAlign = 'center';
      }
    } else if (align === 'left') {
      selectedVideoElement.style.display = 'block';
      selectedVideoElement.style.float = 'left';
      selectedVideoElement.style.clear = 'none';
      selectedVideoElement.style.marginLeft = '0';
      selectedVideoElement.style.marginRight = '18px';
      selectedVideoElement.style.marginTop = '10px';
      selectedVideoElement.style.marginBottom = '16px';
      selectedVideoElement.style.textAlign = 'left';
      if (selectedVideoElement.parentElement && selectedVideoElement.parentElement !== visualEditorRef.current) {
        selectedVideoElement.parentElement.style.textAlign = 'left';
      }
    } else if (align === 'right') {
      selectedVideoElement.style.display = 'block';
      selectedVideoElement.style.float = 'right';
      selectedVideoElement.style.clear = 'none';
      selectedVideoElement.style.marginLeft = '18px';
      selectedVideoElement.style.marginRight = '0';
      selectedVideoElement.style.marginTop = '10px';
      selectedVideoElement.style.marginBottom = '16px';
      selectedVideoElement.style.textAlign = 'right';
      if (selectedVideoElement.parentElement && selectedVideoElement.parentElement !== visualEditorRef.current) {
        selectedVideoElement.parentElement.style.textAlign = 'right';
      }
    }
    syncFromVisualEditor();
    updateOverlayRect();
    setTimeout(updateOverlayRect, 30);
  };

  const applyVideoWidth = (pct: number) => {
    if (!selectedVideoElement) return;
    const clamped = Math.min(100, Math.max(15, pct));
    setSelectedVideoWidth(clamped);
    selectedVideoElement.style.width = `${clamped}%`;
    selectedVideoElement.style.maxWidth = '100%';
    selectedVideoElement.style.boxSizing = 'border-box';
    if (selectedVideoAlign === 'center') {
      selectedVideoElement.style.display = 'block';
      selectedVideoElement.style.marginLeft = 'auto';
      selectedVideoElement.style.marginRight = 'auto';
      selectedVideoElement.style.float = 'none';
      selectedVideoElement.style.clear = 'both';
      if (selectedVideoElement.parentElement && selectedVideoElement.parentElement !== visualEditorRef.current) {
        selectedVideoElement.parentElement.style.textAlign = 'center';
      }
    }
    syncFromVisualEditor();
    setTimeout(updateOverlayRect, 30);
  };

  const removeSelectedVideo = () => {
    if (!selectedVideoElement) return;
    selectedVideoElement.remove();
    setSelectedVideoElement(null);
    setOverlayRect(null);
    syncFromVisualEditor();
  };

  // Alinhamento geral da barra de ferramentas
  const handleToolbarAlign = (align: 'left' | 'center' | 'right') => {
    if (selectedImage) {
      alignSelectedImage(align);
      return;
    }
    if (selectedVideoElement) {
      alignSelectedVideo(align);
      return;
    }
    if (visualEditorRef.current) {
      visualEditorRef.current.focus();
      if (align === 'center') document.execCommand('justifyCenter', false);
      else if (align === 'left') document.execCommand('justifyLeft', false);
      else if (align === 'right') document.execCommand('justifyRight', false);
      syncFromVisualEditor();
    }
  };

  // Arrastar e soltar para reposicionar imagens no texto
  const handleVisualDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const img = target.tagName === 'IMG' ? target : target.querySelector('img');
    if (img) {
      const figureOrImg = (img.closest('figure.article-image-figure') as HTMLElement) || img;
      draggedImageElementRef.current = figureOrImg;
      e.dataTransfer.setData('text/html', figureOrImg.outerHTML);
      e.dataTransfer.effectAllowed = 'move';
      setSelectedImage(null);
      setOverlayRect(null);
    }
  };

  const handleVisualDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            insertImageElement(evt.target?.result as string, 'Imagem');
          };
          reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const videoUrl = evt.target?.result as string;
            const figureHtml = `
              <figure class="article-video-figure" data-align="center" style="width: 100%; max-width: 100%; box-sizing: border-box; margin: 16px auto; text-align: center; display: block; clear: both;">
                <div style="border-radius: 8px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.3); background: #000; width: 100%;">
                  <video controls style="width: 100%; max-height: 520px; display: block; border-radius: 8px; object-fit: contain;" src="${videoUrl}">
                    Seu navegador não suporta a tag de vídeo.
                  </video>
                </div>
              </figure><p><br></p>
            `;
            insertHtmlAtCursor(figureHtml);
          };
          reader.readAsDataURL(file);
        }
      });
      return;
    }

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
          setTimeout(() => selectImageForResize(img), 60);
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Upload e gerenciamento de Anexos
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

  // Responder ao Revisor
  const handleSendCreatorReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentArticle || !creatorReplyInput.trim()) return;
    addArticleComment(currentArticle.id, creatorReplyInput.trim());
    setCreatorReplyInput('');
  };

  // Salvar Artigo
  const handleSaveAndSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      alert('Por favor, defina um título para o procedimento ou artigo.');
      return;
    }

    const tags = tagInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const selCat = categories.find((c) => c.id === categoryId);
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
      updateArticleContent(
        editingArticle.id,
        title.trim(),
        categoryId,
        content,
        tags,
        effectiveAccessLevel,
        attachments
      );
      alert('Artigo atualizado com sucesso!');
    } else {
      createArticle(
        title.trim(),
        categoryId,
        content,
        tags,
        effectiveAccessLevel,
        attachments
      );
      alert('Artigo criado com sucesso e adicionado na árvore de navegação!');
    }

    onClose();
  };

  // Exclusão definitiva do artigo pelo Administrador
  const handleConfirmDeleteArticle = async () => {
    if (!editingArticle) return;
    try {
      setIsDeletingArticle(true);
      await deleteArticle(editingArticle.id);
      setIsConfirmDeleteOpen(false);
      onClose();
    } catch (err) {
      console.error('Erro ao excluir artigo:', err);
      alert('Erro ao excluir o artigo. Tente novamente.');
      setIsDeletingArticle(false);
    }
  };

  // Tags Interativas
  const tagsList = useMemo(() => {
    return tagInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);
  }, [tagInput]);

  const removeTag = (tagToRemove: string) => {
    const newTags = tagsList.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase());
    setTagInput(newTags.join(', '));
  };

  return (
    <div
      className="article-editor-fullscreen-overlay animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1200,
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Input nativo oculto para upload direto de mídia (imagens e vídeos) */}
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        ref={mediaFileInputRef}
        onChange={handleDirectMediaUpload}
        style={{ display: 'none' }}
      />

      {/* Input nativo oculto para upload de anexos de documentos */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleAttachmentUpload}
        style={{ display: 'none' }}
      />

      {/* =========================================================================
          1. BARRA SUPERIOR COMPACTA FIXA (MÁXIMO APROVEITAMENTO DE TELA)
          ========================================================================= */}
      <header
        style={{
          height: '44px',
          minHeight: '44px',
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          zIndex: 60,
        }}
      >
        {/* Esquerda: Voltar + Identificador */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', fontSize: '0.80rem', fontWeight: 600 }}
            title="Voltar / Fechar editor"
          >
            <ArrowLeft size={14} />
            <span>Voltar</span>
          </button>

          <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {editingArticle?.code && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '1px 6px',
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

            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {isProposalMode
                ? 'Proposta de Edição'
                : editingArticle
                ? 'Editando Procedimento'
                : 'Novo Artigo Técnico'}
            </span>

            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '9999px',
                background: 'rgba(92, 183, 128, 0.12)',
                color: 'var(--color-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <Check size={10} /> Visual
            </span>
          </div>
        </div>

        {/* Centro: Métricas de leitura */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
            background: 'var(--bg-surface)',
            padding: '2px 10px',
            borderRadius: '9999px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} color="var(--color-primary)" />
            <span>~{stats.readingTime} min</span>
          </span>
          <span>•</span>
          <span>{stats.words} palavras</span>
        </div>

        {/* Direita: Ações */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Opção de Apagar Artigo (Apenas Administradores ao Editar Artigo Existente) */}
          {editingArticle && isAdmin && !isProposalMode && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setIsConfirmDeleteOpen(true)}
              disabled={isDeletingArticle}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#ef4444',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '6px',
                cursor: isDeletingArticle ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
              title="Excluir este artigo permanentemente da base de conhecimento"
            >
              <Trash2 size={13} />
              <span>Excluir Artigo</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsPreviewOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', fontSize: '0.78rem' }}
            title="Pré-visualizar como o leitor verá"
          >
            <Eye size={13} />
            <span>Prévia</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSaveAndSubmit}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 12px', fontSize: '0.80rem', fontWeight: 700 }}
          >
            <Send size={13} />
            <span>{isProposalMode ? 'Enviar Proposta' : 'Salvar e Publicar'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-subtle)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Fechar (Esc)"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. BARRA DE METADADOS COMPACTA FIXA (MÁXIMO APROVEITAMENTO DE TELA)
          ========================================================================= */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          zIndex: 55,
          flexShrink: 0,
        }}
      >
            {/* Módulo / Categoria */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '220px' }}>
              <Layers size={13} color="var(--color-primary)" />
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>Módulo:</span>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{
                  padding: '4px 8px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {activeCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Visibilidade do Artigo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={13} color={isInternalOnlyCategory ? '#f59e0b' : 'var(--text-muted)'} />
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>Acesso:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setAccessLevel('INTERNAL')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${accessLevel === 'INTERNAL' ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                    background: accessLevel === 'INTERNAL' ? 'var(--color-primary-subtle)' : 'var(--bg-surface)',
                    color: accessLevel === 'INTERNAL' ? 'var(--color-primary)' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                  }}
                >
                  Interno
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isInternalOnlyCategory) setAccessLevel('ALL');
                  }}
                  disabled={isInternalOnlyCategory}
                  title={isInternalOnlyCategory ? 'Playbooks são restritos à equipe interna.' : undefined}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${accessLevel === 'ALL' && !isInternalOnlyCategory ? '#38bdf8' : 'var(--border-subtle)'}`,
                    background: isInternalOnlyCategory
                      ? 'rgba(255, 255, 255, 0.02)'
                      : accessLevel === 'ALL'
                      ? 'rgba(56, 189, 248, 0.15)'
                      : 'var(--bg-surface)',
                    color: isInternalOnlyCategory
                      ? 'var(--text-subtle)'
                      : accessLevel === 'ALL'
                      ? '#38bdf8'
                      : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    cursor: isInternalOnlyCategory ? 'not-allowed' : 'pointer',
                    opacity: isInternalOnlyCategory ? 0.45 : 1,
                  }}
                >
                  Clientes
                </button>
              </div>
            </div>

            {/* Tags */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', minWidth: '220px' }}>
              <Tag size={13} color="var(--text-subtle)" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', flex: 1 }}>
                {tagsList.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '0.70rem',
                      fontWeight: 600,
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      background: 'rgba(56, 189, 248, 0.12)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Tags separadas por vírgula..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '160px',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.76rem',
                    color: 'var(--text-main)',
                  }}
                />
              </div>
            </div>

            {/* Anexos */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsAttachmentsModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', padding: '3px 8px' }}
            >
              <Paperclip size={12} color="var(--color-primary)" />
              <span>Anexos ({attachments.length})</span>
            </button>
          </div>

      {/* Justificativa de Proposta */}
      {isProposalMode && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.35)',
            padding: '6px 14px',
            zIndex: 54,
            flexShrink: 0,
          }}
        >
          <textarea
            rows={2}
            required
            value={proposalNote}
            onChange={(e) => setProposalNote(e.target.value)}
            placeholder="Descreva detalhadamente o que mudou na regra ou procedimento..."
            style={{
              width: '100%',
              padding: '6px 10px',
              background: 'var(--bg-surface)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '6px',
              fontSize: '0.78rem',
              color: 'var(--text-main)',
              lineHeight: 1.4,
              outline: 'none',
              resize: 'none',
            }}
          />
        </div>
      )}

      {/* =========================================================================
          3. BARRA DE FERRAMENTAS FIXA COMPACTA (DOCK PERMANENTE)
          ========================================================================= */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '4px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexWrap: 'wrap',
          zIndex: 50,
          flexShrink: 0,
          width: '100%',
        }}
      >
            {/* Formato / Tamanho de Fonte */}
            <select
              onChange={(e) => {
                applyFontSize(e.target.value as any);
                e.target.value = '';
              }}
              defaultValue=""
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
              title="Tamanho do texto"
            >
              <option value="" disabled>Tamanho...</option>
              <option value="p">📝 Parágrafo</option>
              <option value="h2">🔠 Título H2</option>
              <option value="h3">🔡 Subtítulo H3</option>
              <option value="small">🔍 Pequeno</option>
            </select>

            <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)', margin: '0 2px' }} />

            {/* Cores Dinâmicas */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsColorDropdownOpen((prev) => !prev)}
                className="btn btn-secondary btn-sm"
                style={{
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                }}
                title="Cores de texto com contraste dinâmico"
              >
                <Palette size={12} color="var(--color-primary)" />
                <span>Cor ▾</span>
              </button>

              {isColorDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    zIndex: 100,
                    marginTop: '4px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '6px',
                    boxShadow: 'var(--shadow-lg)',
                    minWidth: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  {DYNAMIC_COLORS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => applyTextColor(opt.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-main)',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: opt.previewColor,
                          border: '1px solid rgba(255,255,255,0.2)',
                          flexShrink: 0,
                        }}
                      />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)', margin: '0 2px' }} />

            {/* Undo / Redo */}
            <button type="button" onClick={handleUndo} className="btn btn-secondary btn-sm" style={{ padding: '4px 6px' }} title="Desfazer">
              <Undo2 size={12} />
            </button>
            <button type="button" onClick={handleRedo} className="btn btn-secondary btn-sm" style={{ padding: '4px 6px' }} title="Refazer">
              <Redo2 size={12} />
            </button>

            <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)', margin: '0 2px' }} />

            {/* Estilos de Texto */}
            <button type="button" onClick={() => formatVisual('bold')} className="btn btn-secondary btn-sm" style={{ padding: '4px 6px' }} title="Negrito">
              <Bold size={12} />
            </button>
            <button type="button" onClick={() => formatVisual('italic')} className="btn btn-secondary btn-sm" style={{ padding: '4px 6px' }} title="Itálico">
              <Italic size={12} />
            </button>
            <button type="button" onClick={() => formatVisual('underline')} className="btn btn-secondary btn-sm" style={{ padding: '4px 6px' }} title="Sublinhado">
              <Underline size={12} />
            </button>
            <button type="button" onClick={() => formatVisual('strikeThrough')} className="btn btn-secondary btn-sm" style={{ padding: '4px 6px' }} title="Riscado">
              <Strikethrough size={12} />
            </button>

            <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)', margin: '0 2px' }} />

            {/* Alinhamento */}
            <button type="button" onClick={() => handleToolbarAlign('left')} className="btn btn-secondary btn-sm" style={{ padding: '4px 6px' }} title="Alinhar à Esquerda">
              <AlignLeft size={12} />
            </button>
            <button type="button" onClick={() => handleToolbarAlign('center')} className="btn btn-secondary btn-sm" style={{ padding: '4px 6px' }} title="Centralizar">
              <AlignCenter size={12} />
            </button>
            <button type="button" onClick={() => handleToolbarAlign('right')} className="btn btn-secondary btn-sm" style={{ padding: '4px 6px' }} title="Alinhar à Direita">
              <AlignRight size={12} />
            </button>

            <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)', margin: '0 2px' }} />

            {/* Listas e Estrutura */}
            <button type="button" onClick={() => formatVisual('insertUnorderedList')} className="btn btn-secondary btn-sm" style={{ padding: '4px 6px' }} title="Lista Marcadores">
              <List size={12} />
            </button>
            <button type="button" onClick={() => formatVisual('insertOrderedList')} className="btn btn-secondary btn-sm" style={{ padding: '4px 6px' }} title="Lista Numerada">
              <ListOrdered size={12} />
            </button>
            <button
              type="button"
              onClick={() => {
                const sel = window.getSelection()?.toString() || 'Citação';
                insertHtmlAtCursor(`<blockquote><p>${sel}</p></blockquote><p><br></p>`);
              }}
              className="btn btn-secondary btn-sm"
              style={{ padding: '4px 6px' }}
              title="Citação"
            >
              <Quote size={12} />
            </button>
            <button
              type="button"
              onClick={() => {
                const sel = window.getSelection()?.toString() || '// Código ou regra';
                insertHtmlAtCursor(`<pre><code>${sel}</code></pre><p><br></p>`);
              }}
              className="btn btn-secondary btn-sm"
              style={{ padding: '4px 6px' }}
              title="Código"
            >
              <Code size={12} />
            </button>

            <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)', margin: '0 2px' }} />

            {/* Tabela Interativa */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsTableDropdownOpen((prev) => !prev)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 6px', display: 'flex', alignItems: 'center', gap: '3px' }}
                title="Inserir Tabela"
              >
                <Table size={12} />
                <span>Tabela</span>
              </button>

              {isTableDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    zIndex: 100,
                    marginTop: '4px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '8px',
                    boxShadow: 'var(--shadow-lg)',
                    width: '180px',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, 1fr)',
                      gap: '3px',
                      background: 'var(--bg-surface)',
                      padding: '6px',
                      borderRadius: '4px',
                    }}
                  >
                    {Array.from({ length: 6 }).map((_, rIdx) => {
                      const r = rIdx + 1;
                      return Array.from({ length: 6 }).map((_, cIdx) => {
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
                              width: '14px',
                              height: '14px',
                              borderRadius: '2px',
                              border: isHighlighted ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                              background: isHighlighted ? 'var(--color-primary)' : 'transparent',
                              cursor: 'pointer',
                            }}
                          />
                        );
                      });
                    })}
                  </div>
                  <div style={{ marginTop: '4px', textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {tableHoverRows} × {tableHoverCols}
                  </div>
                </div>
              )}
            </div>

            <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)', margin: '0 2px' }} />

            {/* Callouts */}
            <button type="button" onClick={insertCalloutTip} className="btn btn-secondary btn-sm" style={{ padding: '4px 6px', color: '#5cb780' }} title="Dica">
              <Lightbulb size={12} />
            </button>
            <button type="button" onClick={insertCalloutInfo} className="btn btn-secondary btn-sm" style={{ padding: '4px 6px', color: '#38bdf8' }} title="Observação">
              <Info size={12} />
            </button>
            <button type="button" onClick={insertCalloutWarning} className="btn btn-secondary btn-sm" style={{ padding: '4px 6px', color: '#f59e0b' }} title="Atenção">
              <AlertTriangle size={12} />
            </button>

            <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)', margin: '0 2px' }} />

            {/* [3. BOTÃO ADICIONAR MÍDIA: ABRE DIRETO O EXPLORADOR DE ARQUIVOS DO SO] */}
            <button
              type="button"
              onClick={() => mediaFileInputRef.current?.click()}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(92, 183, 128, 0.14)',
                borderColor: 'var(--color-primary)',
                color: 'var(--color-primary)',
                fontWeight: 700,
                fontSize: '0.76rem',
              }}
              title="Abrir explorador de arquivos para subir imagens ou vídeos do computador"
            >
              <ImagePlus size={13} />
              <span>Adicionar Mídia</span>
            </button>

            <span style={{ fontSize: '0.70rem', color: 'var(--text-subtle)', marginLeft: 'auto' }}>
              💡 Cole ou digite links de YouTube, vídeos e fotos diretamente no texto para Auto-Embed
            </span>
          </div>

      {/* =========================================================================
          4. CANVAS COMPLETO DISTRACTION-FREE (OCUPA 100% DA ALTURA RESTANTE)
          ========================================================================= */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <div
          ref={editorWrapperRef}
          className="article-editor-scroll-container"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            background: 'var(--bg-card)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '100%',
              padding: '24px 28px 120px 28px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            {/* TÍTULO DO ARTIGO ESTILO NOTION / MEDIUM / GOOGLE DOCS */}
            <input
              type="text"
              required
              autoFocus={!editingArticle}
              placeholder="Título do Artigo ou Procedimento Técnico..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  visualEditorRef.current?.focus();
                }
              }}
              style={{
                width: '100%',
                padding: '0 0 14px 0',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border-subtle)',
                borderRadius: 0,
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                outline: 'none',
                marginBottom: '20px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />

            {/* ÁREA EDITÁVEL DO ARTIGO */}
            <div
              ref={visualEditorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              onKeyUp={handleEditorKeyUp}
              onPaste={handleVisualPaste}
              onDrop={handleVisualDrop}
              onDragOver={handleDragOver}
              onDragStart={handleVisualDragStart}
              onPointerDown={handleVisualPointerDown}
              onClick={handleVisualPointerDown}
              className="article-visual-editor"
              style={{
                flex: 1,
                minHeight: 'calc(100vh - 260px)',
                outline: 'none',
                fontSize: '0.98rem',
                lineHeight: 1.8,
                color: 'var(--text-main)',
                width: '100%',
                boxSizing: 'border-box',
                padding: 0,
              }}
            />
          </div>

          {/* ALÇAS INTERATIVAS DE REDIMENSIONAMENTO E POSICIONAMENTO DE MÍDIA */}
          {(selectedImage || selectedVideoElement) && overlayRect && (
            (() => {
              const isVideo = Boolean(selectedVideoElement);
              const accentColor = isVideo ? '#ef4444' : 'var(--color-primary)';
              const currentWidth = isVideo ? selectedVideoWidth : selectedImageWidth;
              const currentAlign = isVideo ? selectedVideoAlign : selectedImageAlign;

              // Margem de segurança dinâmica:
              // Se o topo da imagem estiver muito próximo do topo do canvas (< 45px),
              // renderiza a barra flutuante logo dentro da borda superior da imagem (top: 8px).
              // Caso contrário, renderiza flutuando perfeitamente acima da imagem (top: -36px).
              const toolbarTopOffset = overlayRect.isNearTop ? 8 : -36;

                return (
                  <div
                    ref={overlayRef}
                    className="image-resize-overlay animate-fade-in"
                    style={{
                      position: 'absolute',
                      top: `${overlayRect.top}px`,
                      left: `${overlayRect.left}px`,
                      width: `${overlayRect.width}px`,
                      height: `${overlayRect.height}px`,
                      boxSizing: 'border-box',
                      border: `2px solid ${accentColor}`,
                      borderRadius: '8px',
                      pointerEvents: 'none',
                      zIndex: 35,
                    }}
                  >
                    {/* Barra Flutuante com Controles de Alinhamento e Tamanho */}
                    <div
                      className={isVideo ? 'video-floating-toolbar' : 'image-floating-toolbar'}
                      style={{
                        position: 'absolute',
                        top: `${toolbarTopOffset}px`,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'var(--bg-card)',
                        border: `1.5px solid ${accentColor}`,
                        borderRadius: '6px',
                        padding: '3px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                        pointerEvents: 'auto',
                        zIndex: 50,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.70rem',
                          fontWeight: 700,
                          color: accentColor,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          paddingRight: '5px',
                          borderRight: '1px solid var(--border-subtle)',
                        }}
                      >
                        {isVideo ? <Film size={11} /> : <ImageIcon size={11} />}
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
                            padding: '2px 5px',
                            background: currentAlign === 'left' ? accentColor : 'transparent',
                            color: currentAlign === 'left' ? '#ffffff' : 'var(--text-main)',
                          }}
                          title="Alinhar à Esquerda"
                        >
                          <AlignLeft size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            isVideo ? alignSelectedVideo('center') : alignSelectedImage('center');
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{
                            padding: '2px 5px',
                            background: currentAlign === 'center' ? accentColor : 'transparent',
                            color: currentAlign === 'center' ? '#ffffff' : 'var(--text-main)',
                          }}
                          title="Centralizar"
                        >
                          <AlignCenter size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            isVideo ? alignSelectedVideo('right') : alignSelectedImage('right');
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{
                            padding: '2px 5px',
                            background: currentAlign === 'right' ? accentColor : 'transparent',
                            color: currentAlign === 'right' ? '#ffffff' : 'var(--text-main)',
                          }}
                          title="Alinhar à Direita"
                        >
                          <AlignRight size={11} />
                        </button>
                      </div>

                      <div style={{ width: '1px', height: '12px', background: 'var(--border-subtle)' }} />

                      {/* Presets de Tamanho */}
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[25, 50, 75, 100].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              isVideo ? applyVideoWidth(pct) : applyImageWidth(pct);
                            }}
                            style={{
                              padding: '2px 5px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              borderRadius: '3px',
                              border: `1px solid ${currentWidth === pct ? accentColor : 'var(--border-subtle)'}`,
                              background: currentWidth === pct ? accentColor : 'transparent',
                              color: currentWidth === pct ? '#ffffff' : 'var(--text-main)',
                              cursor: 'pointer',
                            }}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>

                      <div style={{ width: '1px', height: '12px', background: 'var(--border-subtle)' }} />

                      {/* Excluir Mídia */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          isVideo ? removeSelectedVideo() : removeSelectedImage();
                        }}
                        style={{
                          padding: '2px 5px',
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title="Remover Mídia"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>

                    {/* 4 Cantos Interativos de Redimensionamento Perfeitamente Aderidos ao Bounded Box */}
                    <div
                      onMouseDown={(e) => handleStartResize(e, 'top-left')}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        transform: 'translate(-50%, -50%)',
                        width: '12px',
                        height: '12px',
                        boxSizing: 'border-box',
                        background: '#ffffff',
                        border: `2px solid ${accentColor}`,
                        borderRadius: '50%',
                        cursor: 'nwse-resize',
                        pointerEvents: 'auto',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                        zIndex: 40,
                      }}
                      title="Arrastar para redimensionar"
                    />
                    <div
                      onMouseDown={(e) => handleStartResize(e, 'top-right')}
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        transform: 'translate(50%, -50%)',
                        width: '12px',
                        height: '12px',
                        boxSizing: 'border-box',
                        background: '#ffffff',
                        border: `2px solid ${accentColor}`,
                        borderRadius: '50%',
                        cursor: 'nesw-resize',
                        pointerEvents: 'auto',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                        zIndex: 40,
                      }}
                      title="Arrastar para redimensionar"
                    />
                    <div
                      onMouseDown={(e) => handleStartResize(e, 'bottom-left')}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        transform: 'translate(-50%, 50%)',
                        width: '12px',
                        height: '12px',
                        boxSizing: 'border-box',
                        background: '#ffffff',
                        border: `2px solid ${accentColor}`,
                        borderRadius: '50%',
                        cursor: 'nesw-resize',
                        pointerEvents: 'auto',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                        zIndex: 40,
                      }}
                      title="Arrastar para redimensionar"
                    />
                    <div
                      onMouseDown={(e) => handleStartResize(e, 'bottom-right')}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        transform: 'translate(50%, 50%)',
                        width: '12px',
                        height: '12px',
                        boxSizing: 'border-box',
                        background: '#ffffff',
                        border: `2px solid ${accentColor}`,
                        borderRadius: '50%',
                        cursor: 'nwse-resize',
                        pointerEvents: 'auto',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                        zIndex: 40,
                      }}
                      title="Arrastar para redimensionar"
                    />

                    {/* Alças Laterais */}
                    <div
                      onMouseDown={(e) => handleStartResize(e, 'left')}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        transform: 'translate(-50%, -50%)',
                        width: '12px',
                        height: '12px',
                        boxSizing: 'border-box',
                        background: '#ffffff',
                        border: `2px solid ${accentColor}`,
                        borderRadius: '50%',
                        cursor: 'ew-resize',
                        pointerEvents: 'auto',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                        zIndex: 40,
                      }}
                      title="Ajustar largura"
                    />
                    <div
                      onMouseDown={(e) => handleStartResize(e, 'right')}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: 0,
                        transform: 'translate(50%, -50%)',
                        width: '12px',
                        height: '12px',
                        boxSizing: 'border-box',
                        background: '#ffffff',
                        border: `2px solid ${accentColor}`,
                        borderRadius: '50%',
                        cursor: 'ew-resize',
                        pointerEvents: 'auto',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                        zIndex: 40,
                      }}
                      title="Ajustar largura"
                    />

                    {/* Indicador de Porcentagem */}
                    <div
                      ref={pctBadgeRef}
                      style={{
                        position: 'absolute',
                        bottom: '-24px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: accentColor,
                        color: '#ffffff',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '1px 6px',
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
          </div>

        {/* SIDEBAR DE DIÁLOGO COM REVISOR (SE EM AJUSTE) */}
        {showConversationSidebar && (
          <aside
            style={{
              width: '320px',
              minWidth: '280px',
              background: 'var(--bg-card)',
              borderLeft: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 30,
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={14} color="var(--color-primary)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Diálogo Editorial
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  background: isAdjustmentMode ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-surface)',
                  color: isAdjustmentMode ? '#f59e0b' : 'var(--text-subtle)',
                  fontWeight: 700,
                }}
              >
                {isAdjustmentMode ? 'Ajustes' : 'Em Análise'}
              </span>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: 'var(--bg-surface)',
              }}
            >
              {latestReview?.generalFeedback && (
                <div
                  style={{
                    padding: '10px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    color: 'var(--text-main)',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f59e0b', marginBottom: '2px', textTransform: 'uppercase' }}>
                    Parecer ({latestReview.reviewerName}):
                  </div>
                  {latestReview.generalFeedback}
                </div>
              )}

              {currentArticle?.comments?.map((c) => {
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
                      gap: '2px',
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>
                      <span style={{ fontWeight: 700, color: isReviewerOrAdmin ? 'var(--color-primary)' : '#38bdf8' }}>
                        {c.authorName}
                      </span>
                    </div>

                    <div
                      style={{
                        maxWidth: '92%',
                        padding: '8px 10px',
                        borderRadius: isReviewerOrAdmin ? '8px 8px 8px 2px' : '8px 8px 2px 8px',
                        background: isReviewerOrAdmin ? 'rgba(92, 183, 128, 0.12)' : 'var(--bg-card)',
                        border: `1px solid ${isReviewerOrAdmin ? 'rgba(92, 183, 128, 0.3)' : 'var(--border-subtle)'}`,
                        color: 'var(--text-main)',
                        fontSize: '0.80rem',
                      }}
                    >
                      {c.message}
                    </div>
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={handleSendCreatorReply}
              style={{
                padding: '10px',
                borderTop: '1px solid var(--border-subtle)',
                background: 'var(--bg-card)',
                display: 'flex',
                gap: '6px',
              }}
            >
              <input
                type="text"
                placeholder="Responder ao revisor..."
                value={creatorReplyInput}
                onChange={(e) => setCreatorReplyInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={!creatorReplyInput.trim()}
                className="btn btn-primary btn-sm"
                style={{ padding: '6px 10px' }}
              >
                <Send size={12} />
              </button>
            </form>
          </aside>
        )}
      </div>

      {/* =========================================================================
          MODAL DE PRÉVIA (VISÃO DO LEITOR)
          ========================================================================= */}
      {isPreviewOpen && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPreviewOpen(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '920px',
              maxHeight: 'calc(100vh - 60px)',
              background: 'var(--bg-card)',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={16} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Pré-visualização do Artigo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                {selectedCategoryObj?.title}
              </div>

              <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>
                {title || 'Sem Título'}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.76rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '20px' }}>
                <span>Por {currentUser?.displayName || 'Autor'}</span>
                <span>•</span>
                <span>~{stats.readingTime} min leitura</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString('pt-BR')}</span>
              </div>

              <div
                className="article-preview-content article-visual-editor"
                style={{ fontSize: '0.96rem', lineHeight: 1.8 }}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
          MODAL GESTOR DE ANEXOS
          ========================================================================= */}
      {isAttachmentsModalOpen && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAttachmentsModalOpen(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              background: 'var(--bg-card)',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              padding: '20px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Paperclip size={16} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Anexos do Artigo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAttachmentsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '100%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Upload size={14} />
                <span>Adicionar Arquivo (PDF, XLS, DOC, Layout)</span>
              </button>
            </div>

            {attachments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-subtle)', fontSize: '0.80rem' }}>
                Nenhum anexo adicionado.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto' }}>
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <FileText size={14} color="#38bdf8" />
                      <span style={{ fontSize: '0.80rem', fontWeight: 600, color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {att.name}
                      </span>
                      <span style={{ fontSize: '0.70rem', color: 'var(--text-subtle)' }}>({att.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                      title="Excluir"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsAttachmentsModalOpen(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Confirmação de Exclusão de Artigo (Acesso Restrito a Administradores) */}
      {isConfirmDeleteOpen && editingArticle &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.82)',
              backdropFilter: 'blur(6px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
            onClick={() => !isDeletingArticle && setIsConfirmDeleteOpen(false)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '480px',
                background: 'var(--bg-surface)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
                overflow: 'hidden',
                animation: 'fadeIn 0.2s ease-out',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ height: '4px', background: 'linear-gradient(90deg, #ef4444, #dc2626)', flexShrink: 0 }} />

              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ef4444',
                      flexShrink: 0,
                    }}
                  >
                    <Trash2 size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: '0 0 4px 0', fontWeight: 800 }}>
                      Excluir Artigo
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                      Confirmação de exclusão permanente
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  Você tem certeza que deseja excluir permanentemente o artigo{' '}
                  <strong style={{ color: 'var(--text-main)' }}>"{editingArticle.title}"</strong>
                  {editingArticle.code ? (
                    <> (<code>{editingArticle.code}</code>)</>
                  ) : null}?
                </p>

                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#f87171',
                    fontSize: '0.82rem',
                    marginBottom: '20px',
                    lineHeight: 1.4,
                  }}
                >
                  ⚠️ <strong>Atenção:</strong> Esta ação apagará o artigo permanentemente da base de conhecimento, incluindo suas versões, comentários e métricas. Esta ação não pode ser revertida.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={isDeletingArticle}
                    onClick={() => setIsConfirmDeleteOpen(false)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isDeletingArticle}
                    onClick={handleConfirmDeleteArticle}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 18px',
                      borderRadius: 'var(--radius-md)',
                      background: '#ef4444',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: isDeletingArticle ? 'not-allowed' : 'pointer',
                      opacity: isDeletingArticle ? 0.7 : 1,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Trash2 size={15} />
                    <span>{isDeletingArticle ? 'Excluindo...' : 'Sim, Excluir Artigo'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
