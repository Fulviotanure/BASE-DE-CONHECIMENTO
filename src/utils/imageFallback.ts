import { useEffect, type RefObject } from 'react';

/**
 * Intercepta imagens quebradas em corpos de artigos (como links expirados do Movidesk na AWS S3)
 * e substitui o ícone nativo quebrado do navegador por um card informativo elegante e integrado ao tema.
 */
export function useArticleImageFallback(containerRef: RefObject<HTMLElement | null>, deps: any[] = []) {
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const imgs = container.querySelectorAll('img');

    imgs.forEach((img) => {
      const handleBroken = () => {
        img.style.display = 'none';

        const parent = img.parentElement;
        if (parent && !parent.querySelector('.article-image-fallback')) {
          const fallback = document.createElement('div');
          fallback.className = 'article-image-fallback';
          fallback.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 10px; font-size: 0.82rem; color: var(--text-muted, #94a3b8); background: var(--bg-surface, rgba(255,255,255,0.03)); padding: 12px 18px; border-radius: 8px; border: 1px dashed var(--border-subtle, rgba(255,255,255,0.15)); margin: 12px 0;">
              <span style="font-size: 1.2rem; line-height: 1;">📷</span>
              <div>
                <strong style="color: var(--text-main, #e2e8f0); display: block; margin-bottom: 2px;">Imagem do manual original (link temporário expirado no Movidesk)</strong>
                <span>Esta imagem fazia parte do manual antigo exportado. Você pode abrir o editor e colar um novo print atualizado diretamente com <em>Ctrl + V</em>.</span>
              </div>
            </div>
          `;
          img.insertAdjacentElement('afterend', fallback);
        }
      };

      if (img.complete && (img.naturalWidth === 0 || !img.src)) {
        handleBroken();
      } else {
        img.addEventListener('error', handleBroken, { once: true });
      }
    });
  }, deps);
}
