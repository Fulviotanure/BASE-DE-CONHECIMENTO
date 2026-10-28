/**
 * Sanitiza o HTML de artigos removendo resíduos legados do Movidesk:
 * - Cabeçalho do artigo (<header class="md-article-header">...</header>) com tempo de leitura e autores legados
 * - Caixa de avaliação de satisfação do Movidesk
 * - Lista de últimos artigos visitados do Movidesk
 * - Converte URLs S3 remanescentes para imagens locais
 */
export function sanitizeArticleHtml(html: string | undefined | null): string {
  if (!html) return '';

  let cleaned = html;

  // 1. Remove cabeçalho legado do Movidesk (<header class="md-article-header">...</header>)
  cleaned = cleaned.replace(/<header\b[^>]*class=["']?[^"'>]*md-article-header[^"'>]*["']?[^>]*>[\s\S]*?<\/header>\s*/gi, '');

  // 2. Remove caixas de pesquisa de satisfação e formulários do Movidesk
  cleaned = cleaned.replace(/<div\b[^>]*class=["']?[^"'>]*satisfaction-survey-container[^"'>]*["']?[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi, '');
  cleaned = cleaned.replace(/<div\b[^>]*class=["']?[^"'>]*satisfaction-survey-container[^"'>]*["']?[^>]*>[\s\S]*?<\/div>/gi, '');

  // 3. Remove painel de últimos artigos visitados do Movidesk
  cleaned = cleaned.replace(/<div\b[^>]*id=["']?last-visited-articles["']?[^>]*>[\s\S]*?<\/div>/gi, '');

  // 4. Remove rodapé se não contiver bloco de anexos
  cleaned = cleaned.replace(/<footer\b[^>]*class=["']?[^"'>]*article-footer[^"'>]*["']?[^>]*>(?![\s\S]*?id=["']?attachments["']?)[\s\S]*?<\/footer>\s*/gi, '');

  // 5. Converte links de imagens S3 do Movidesk para a pasta local /article-images/
  cleaned = cleaned.replace(
    /https:\/\/s3\.amazonaws\.com\/movidesk-files\/([A-F0-9]+)\.png/gi,
    '/article-images/$1.png'
  );

  return cleaned.trim();
}
