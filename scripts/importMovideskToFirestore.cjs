/**
 * Script de Migração Automatizada dos Artigos do Movidesk para o Cloud Firestore
 *
 * Como usar:
 * node scripts/importMovideskToFirestore.cjs "<COPIAR_COOKIE_AQUI>"
 */

const https = require('https');
const fs = require('fs');

const MOVIDESK_ARTICLES = [
  { url: 'https://conciliador-contabil2.movidesk.com/kb/article/545273/primeiros-passos', categoryId: 'cat-1', categoryName: 'Primeiros Passos' },
  { url: 'https://conciliador-contabil2.movidesk.com/kb/article/546154/cadastros', categoryId: 'cat-2', categoryName: 'Cadastros' },
  { url: 'https://conciliador-contabil2.movidesk.com/kb/article/546155/importacao', categoryId: 'cat-3', categoryName: 'Importação' },
  { url: 'https://conciliador-contabil2.movidesk.com/kb/article/546096/para-que-serve', categoryId: 'cat-4', categoryName: 'Regras Contábeis' },
  { url: 'https://conciliador-contabil2.movidesk.com/kb/article/546157/confronto', categoryId: 'cat-5', categoryName: 'Confronto' },
  { url: 'https://conciliador-contabil2.movidesk.com/kb/article/546159/exportacao', categoryId: 'cat-6', categoryName: 'Exportação' },
  { url: 'https://conciliador-contabil2.movidesk.com/kb/article/547064/informacoes-importante', categoryId: 'cat-9', categoryName: 'Informações Importantes & FAQ' },
  { url: 'https://conciliador-contabil2.movidesk.com/kb/article/547214/faq', categoryId: 'cat-9', categoryName: 'Informações Importantes & FAQ' },
  { url: 'https://conciliador-contabil2.movidesk.com/kb/article/558235/nova-busca-automatica-de-extrato?preview=true&revisionId=2448734', categoryId: 'cat-7', categoryName: 'Open Finance' },
  { url: 'https://conciliador-contabil2.movidesk.com/kb/article/545679/migracao-de-regras', categoryId: 'cat-8', categoryName: 'Migração de Regras' },
  { url: 'https://conciliador-contabil2.movidesk.com/kb/article/545684/abrir-chamado', categoryId: 'cat-10', categoryName: 'Abertura de Chamados' },
];

function fetchWithCookie(url, cookie) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cookie': cookie,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

function cleanHtmlContent(rawHtml) {
  // Extrair o miolo principal do artigo no Movidesk
  const contentMatch = rawHtml.match(/<div[^>]*class=["'][^"']*(?:md-article-content|article-content|fr-view)[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/article>/i) ||
                       rawHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                       rawHtml.match(/<div[^>]*class=["'][^"']*fr-view[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);

  let html = contentMatch ? contentMatch[1] : rawHtml;
  return html.trim();
}

console.log('Script preparado para importar os 11 manuais do Movidesk para o Firestore.');
module.exports = { MOVIDESK_ARTICLES, fetchWithCookie, cleanHtmlContent };
