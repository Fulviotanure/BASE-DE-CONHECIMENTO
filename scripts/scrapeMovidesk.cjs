const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function inspectArticle(url) {
  console.log('Buscando:', url);
  const res = await fetchUrl(url);
  console.log('Status:', res.status, 'Bytes:', res.data.length);

  // Extrair título
  const titleMatch = res.data.match(/<h1[^>]*class=["'][^"']*md-article-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i) ||
                     res.data.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
                     res.data.match(/<title>([\s\S]*?)<\/title>/i);
  console.log('Título:', titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : 'N/A');

  // Extrair container de conteúdo
  const bodyMatch = res.data.match(/<div[^>]*class=["'][^"']*(?:md-article-content|article-content|kb-article-content)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
                    res.data.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  
  // Salvar uma cópia do HTML do artigo
  fs.writeFileSync('scripts/article_sample.html', res.data, 'utf8');

  // Buscar links dentro desta página
  const hrefRegex = /href=["']([^"']+)["']/g;
  let match;
  const pageLinks = new Set();
  while ((match = hrefRegex.exec(res.data)) !== null) {
    const link = match[1];
    if (link.includes('article') || link.includes('/kb')) {
      pageLinks.add(link);
    }
  }
  console.log('Links na página do artigo:', Array.from(pageLinks));
}

inspectArticle('https://conciliador-contabil2.movidesk.com/kb/article/545273/primeiros-passos').catch(console.error);
