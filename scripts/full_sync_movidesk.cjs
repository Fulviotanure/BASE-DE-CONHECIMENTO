const fs = require('fs');
const path = require('path');
const {
  fetchUrl,
  downloadBinary,
  loginMovidesk,
  cleanHtmlContent,
  decodeHtmlEntities,
  generateSlug,
  TARGET_IMG_DIR,
  DIST_IMG_DIR
} = require('./crawlerUtils.cjs');

// Leitura do CSV exportado diretamente do Movidesk
const rawCsv = fs.readFileSync('scripts/articles_export.csv').toString('utf8');
const lines = rawCsv.split('\n').filter(l => l.trim().length > 0).slice(1);

const movideskRows = lines.map(l => {
  const parts = l.split(';');
  return {
    code: parts[0]?.trim(),
    title: parts[1]?.trim(),
    category: parts[3]?.trim(),
    menu: parts[4]?.trim(),
    status: parts[5]?.trim(),
    author: parts[9]?.trim(),
  };
}).filter(r => r.status && r.status.toLowerCase().includes('publicad'));

console.log(`Carregados ${movideskRows.length} artigos publicados no Movidesk.`);

// Carregar artigos já rastreados anteriormente
let crawledArticles = [];
if (fs.existsSync('scripts/movidesk_crawled_articles.json')) {
  try {
    crawledArticles = JSON.parse(fs.readFileSync('scripts/movidesk_crawled_articles.json', 'utf8'));
  } catch {}
}
const crawledMap = new Map();
crawledArticles.forEach(a => {
  if (a.movideskId) crawledMap.set(String(a.movideskId), a);
});

// Carregar artigos formatados anteriores para preservar códigos CC-101 a CC-129
let previousFormatted = [];
if (fs.existsSync('scripts/formatted_articles.json')) {
  try {
    previousFormatted = JSON.parse(fs.readFileSync('scripts/formatted_articles.json', 'utf8'));
  } catch {}
}
const previousCodeMap = new Map();
previousFormatted.forEach(a => {
  const mId = a.id.replace('art-movidesk-', '');
  previousCodeMap.set(mId, a.code);
});

function categorize(item) {
  const t = item.title.toLowerCase();
  const c = item.category.toLowerCase();
  const m = item.menu.toLowerCase();
  const id = item.code;

  // Open finance
  if (t.includes('open finance') || c.includes('open finance')) {
    return { id: 'cat-7', name: 'Open Finance' };
  }

  // Migração de regras
  if (t.includes('migra') || c.includes('compartilhamento') || t.includes('contas exclusivas')) {
    return { id: 'cat-8', name: 'Migração de Regras' };
  }

  // Abertura de Chamados
  if (t.includes('chamado') || c.includes('ajuda')) {
    return { id: 'cat-10', name: 'Abertura de Chamados' };
  }

  // Informações Importantes & FAQ
  if (
    m.includes('faq') ||
    t.includes('faq') ||
    t.includes('importante') ||
    t.includes('backup') ||
    t.includes('atualização') ||
    t.includes('versão do sistema')
  ) {
    if (t.includes('confronto')) {
      return { id: 'cat-5', name: 'Confronto' };
    }
    return { id: 'cat-9', name: 'Informações Importantes & FAQ' };
  }

  // Movimentações (Novo Módulo solicitado pelo usuário)
  if (
    c.includes('movimenta') ||
    c.includes('grid') ||
    c === 'deletar' ||
    t.includes('movimenta') ||
    t.includes('desprezo') ||
    t.includes('inversão de sinais') ||
    t.includes('valores conciliados') ||
    t.includes('partida dobrada') ||
    t.includes('deletando lançamentos') ||
    t.includes('importando lançamentos') ||
    t.includes('excluir lançamentos') ||
    t.includes('gráficos - dashboards') ||
    id === '545678' || // Visualizador
    id === '545676' || // OFX
    id === '579465'    // Inversão de Sinais
  ) {
    if (t.includes('como conferir meu saldo') || t.includes('limpar participante') || t.includes('desmembramento')) {
      return { id: 'cat-5', name: 'Confronto' };
    }
    return { id: 'cat-movimentacoes', name: 'Movimentações' };
  }

  // Primeiros Passos
  if (t === 'primeiros passos' || t.includes('base de conhecimento') || t === 'imagens') {
    return { id: 'cat-1', name: 'Primeiros Passos' };
  }

  // Cadastros
  if (
    t.includes('usuário') ||
    t.includes('empresa') ||
    t.includes('contabilidade') ||
    t.includes('feriado') ||
    t.includes('cliente') ||
    t.includes('fornecedor') ||
    t.includes('conta fixa') ||
    t.includes('número do documento') ||
    t === 'cadastros' ||
    c.includes('usuário') ||
    c.includes('empresa') ||
    c.includes('contabilidade') ||
    c.includes('cliente') ||
    c.includes('feriado')
  ) {
    if (t.includes('importando plano de contas')) {
      return { id: 'cat-3', name: 'Importação' };
    }
    return { id: 'cat-2', name: 'Cadastros' };
  }

  // Regras Contábeis
  if (
    t.includes('regra') ||
    t.includes('informações contábeis') ||
    t.includes('contas contábeis') ||
    t.includes('histórico') ||
    t.includes('lançamentos semelhantes') ||
    c.includes('regras contábeis')
  ) {
    return { id: 'cat-4', name: 'Regras Contábeis' };
  }

  // Confronto
  if (
    t.includes('confronto') ||
    c.includes('confronto')
  ) {
    return { id: 'cat-5', name: 'Confronto' };
  }

  // Exportação
  if (
    t.includes('exporta') ||
    c.includes('exportar') ||
    c.includes('relatórios') ||
    t.includes('pdf') ||
    t.includes('auditoria') ||
    t.includes('produtividade')
  ) {
    return { id: 'cat-6', name: 'Exportação' };
  }

  // Importação
  if (
    t.includes('importa') ||
    t.includes('layout') ||
    c.includes('layout') ||
    c.includes('importar')
  ) {
    return { id: 'cat-3', name: 'Importação' };
  }

  return { id: 'cat-9', name: 'Informações Importantes & FAQ' };
}

async function run() {
  const cookie = await loginMovidesk('Fulvio', 'Ravena.2501');

  const finalCrawled = [];
  let totalImagesDownloaded = 0;
  let totalImagesProcessed = 0;

  for (let i = 0; i < movideskRows.length; i++) {
    const item = movideskRows[i];
    const mId = item.code;
    const cat = categorize(item);

    console.log(`\n======================================================`);
    console.log(`[${i + 1}/${movideskRows.length}] Artigo ${mId} - "${item.title}" -> [${cat.name}]`);

    let html = '';
    const existing = crawledMap.get(mId);

    if (existing && existing.contentHtml && existing.contentHtml.length > 50) {
      console.log(`   ⚡ Conteúdo recuperado do cache local existente (${existing.contentHtml.length} bytes)`);
      html = existing.contentHtml;
    } else {
      console.log(`   🌐 Baixando HTML do Movidesk...`);
      const url = `https://conciliador-contabil2.movidesk.com/kb/article/${mId}`;
      let pageRes;
      try {
        pageRes = await fetchUrl(url, {
          headers: { Cookie: cookie, Referer: 'https://conciliador-contabil2.movidesk.com/kb' }
        });
      } catch (err) {
        console.warn(`   ⚠️ Erro ao baixar página ${url}: ${err.message}`);
      }

      if (pageRes && pageRes.data) {
        html = cleanHtmlContent(pageRes.data);
      } else {
        html = `<p>${item.title}</p>`;
      }
    }

    // Processar imagens do S3
    const imgRegex = /https?:\/\/s3\.amazonaws\.com\/movidesk-files\/([A-Za-z0-9_-]+)(?:[^"'\s>]*)/g;
    let match;
    const matchesFound = [];
    while ((match = imgRegex.exec(html)) !== null) {
      matchesFound.push({
        fullMatchedUrl: match[0],
        hash: match[1],
      });
    }

    if (matchesFound.length > 0) {
      console.log(`   🖼️  Imagens S3 detectadas: ${matchesFound.length}`);
    }

    for (const img of matchesFound) {
      totalImagesProcessed++;
      const fileName = `${img.hash}.png`;
      const localFilePath = path.join(TARGET_IMG_DIR, fileName);
      const siteAssetUrl = `/article-images/${fileName}`;

      let needsDownload = true;
      if (fs.existsSync(localFilePath)) {
        const stats = fs.statSync(localFilePath);
        if (stats.size > 200) {
          needsDownload = false;
        }
      }

      if (needsDownload) {
        try {
          process.stdout.write(`      ⬇️ Baixando ${fileName}... `);
          await downloadBinary(img.fullMatchedUrl, localFilePath);
          const sizeKb = Math.round(fs.statSync(localFilePath).size / 1024);
          console.log(`OK (${sizeKb} KB)`);
          totalImagesDownloaded++;
        } catch (err) {
          console.log(`Erro ao baixar ${img.hash}: ${err.message}`);
        }
      }

      // Substituir para link local
      html = html.split(img.fullMatchedUrl).join(siteAssetUrl);
      const unescapedVersion = img.fullMatchedUrl.replace(/&amp;/g, '&');
      html = html.split(unescapedVersion).join(siteAssetUrl);
    }

    // Título limpo e decodificado
    let cleanTitle = decodeHtmlEntities(item.title).trim();
    cleanTitle = cleanTitle.replace(/\s*-\s*Conciliador\s+Cont[áa]bil/gi, '').trim();

    finalCrawled.push({
      movideskId: mId,
      url: `https://conciliador-contabil2.movidesk.com/kb/article/${mId}`,
      title: cleanTitle,
      categoryId: cat.id,
      categoryName: cat.name,
      contentHtml: html
    });
  }

  // Salvar backup local do json de artigos rastreados
  fs.writeFileSync('scripts/movidesk_crawled_articles.json', JSON.stringify(finalCrawled, null, 2), 'utf8');
  console.log(`\n🎉 Extração concluída! Artigos: ${finalCrawled.length}, Imagens baixadas: ${totalImagesDownloaded}`);

  // Formatar artigos para initialSeed.ts e Firestore
  console.log('\n📝 Formatando artigos com códigos únicos e preservação de IDs...');

  // Preservar códigos antigos para não alterar CC-101 .. CC-129
  // Atribuir CC-130 .. CC-xxx para novos artigos
  let nextCodeNum = 130;
  const formattedArticles = [];

  for (let i = 0; i < finalCrawled.length; i++) {
    const raw = finalCrawled[i];
    const id = `art-movidesk-${raw.movideskId}`;
    
    // Obter código preservado ou atribuir próximo
    let code = previousCodeMap.get(raw.movideskId);
    if (!code) {
      code = `CC-${nextCodeNum++}`;
    }

    const slug = generateSlug(raw.title);
    const tags = [
      raw.categoryName.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-'),
      'movidesk',
      'manual'
    ];

    const article = {
      id,
      code,
      title: raw.title,
      slug,
      categoryId: raw.categoryId,
      categoryName: raw.categoryName,
      authorId: 'usr-fulvio',
      authorName: 'Fulvio Tanure',
      authorEmail: 'fulvio@conciliadorcontabil.com.br',
      currentStatus: 'APPROVED',
      accessLevel: 'ALL',
      tags,
      viewCount: Math.floor(Math.random() * 80) + 20,
      likesCount: Math.floor(Math.random() * 15) + 3,
      dislikesCount: 0,
      contentHtml: raw.contentHtml,
      attachments: [],
      createdAt: '2026-07-15T10:00:00.000Z',
      updatedAt: new Date().toISOString(),
    };

    formattedArticles.push(article);
  }

  // Ordenar de forma consistente: primeiro os códigos CC-101 a CC-129, depois os novos
  formattedArticles.sort((a, b) => {
    const numA = parseInt(a.code.replace('CC-', ''), 10) || 999;
    const numB = parseInt(b.code.replace('CC-', ''), 10) || 999;
    return numA - numB;
  });

  fs.writeFileSync('scripts/formatted_articles.json', JSON.stringify(formattedArticles, null, 2), 'utf8');
  console.log(`✅ Salvo em scripts/formatted_articles.json (${formattedArticles.length} artigos formatados)`);
}

run().catch(err => {
  console.error('❌ Erro no processo:', err);
  process.exit(1);
});

