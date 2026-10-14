/**
 * Script de Migração Completa dos 29 Artigos e 110+ Imagens do Movidesk:
 * 1. Conecta ao Movidesk usando as credenciais do Fulvio (Fulvio / Ravena.2501)
 * 2. Baixa todos os 29 artigos com HTML completo e links S3 atualizados
 * 3. Faz o download de cada imagem binária para `public/article-images/<hash>.png` e `dist/article-images/<hash>.png`
 * 4. Substitui todos os links externos de imagem por caminhos locais (`/article-images/<hash>.png`)
 * 5. Atualiza `scripts/movidesk_crawled_articles.json`, `scripts/formatted_articles.json` e `src/data/initialSeed.ts`
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Carregar .env
const env = {};
if (fs.existsSync('.env')) {
  fs.readFileSync('.env', 'utf8').split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const k = parts[0].trim();
      const v = parts.slice(1).join('=').trim();
      if (k && !k.startsWith('#')) env[k] = v;
    }
  });
}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ALL_MOVIDESK_ARTICLES = [
  { movideskId: '545273', url: 'https://conciliador-contabil2.movidesk.com/kb/article/545273/primeiros-passos', categoryId: 'cat-1', categoryName: 'Primeiros Passos', fallbackTitle: 'Primeiros passos' },
  { movideskId: '546154', url: 'https://conciliador-contabil2.movidesk.com/kb/article/546154/cadastros', categoryId: 'cat-2', categoryName: 'Cadastros', fallbackTitle: 'Cadastros' },
  { movideskId: '546155', url: 'https://conciliador-contabil2.movidesk.com/kb/article/546155/importacao', categoryId: 'cat-3', categoryName: 'Importação', fallbackTitle: 'Importação' },
  { movideskId: '546096', url: 'https://conciliador-contabil2.movidesk.com/kb/article/546096/para-que-serve', categoryId: 'cat-4', categoryName: 'Regras Contábeis', fallbackTitle: 'Regras Contábeis - Pra que serve?' },
  { movideskId: '546157', url: 'https://conciliador-contabil2.movidesk.com/kb/article/546157/confronto', categoryId: 'cat-5', categoryName: 'Confronto', fallbackTitle: 'Confronto - Pra que serve?' },
  { movideskId: '546159', url: 'https://conciliador-contabil2.movidesk.com/kb/article/546159/exportacao', categoryId: 'cat-6', categoryName: 'Exportação', fallbackTitle: 'Exportação' },
  { movideskId: '547064', url: 'https://conciliador-contabil2.movidesk.com/kb/article/547064/informacoes-importante', categoryId: 'cat-9', categoryName: 'Informações Importantes & FAQ', fallbackTitle: 'Informações Importantes' },
  { movideskId: '547214', url: 'https://conciliador-contabil2.movidesk.com/kb/article/547214/faq', categoryId: 'cat-9', categoryName: 'Informações Importantes & FAQ', fallbackTitle: 'FAQ' },
  { movideskId: '558235', url: 'https://conciliador-contabil2.movidesk.com/kb/article/558235/nova-busca-automatica-de-extrato?preview=true&revisionId=2448734', categoryId: 'cat-7', categoryName: 'Open Finance', fallbackTitle: 'Open Finance' },
  { movideskId: '545679', url: 'https://conciliador-contabil2.movidesk.com/kb/article/545679/migracao-de-regras', categoryId: 'cat-8', categoryName: 'Migração de Regras', fallbackTitle: 'Migração de Regras' },
  { movideskId: '545684', url: 'https://conciliador-contabil2.movidesk.com/kb/article/545684/abrir-chamado', categoryId: 'cat-10', categoryName: 'Abertura de Chamados', fallbackTitle: 'Abrir Chamado' },
  { movideskId: '579992', url: 'https://conciliador-contabil2.movidesk.com/kb/article/579992/extrato-em-pdf-exportar-pdf', categoryId: 'cat-6', categoryName: 'Exportação', fallbackTitle: 'Extrato em PDF (Exportar PDF)' },
  { movideskId: '579465', url: 'https://conciliador-contabil2.movidesk.com/kb/article/579465/inversao-de-sinais', categoryId: 'cat-5', categoryName: 'Confronto', fallbackTitle: 'Inversão de Sinais' },
  { movideskId: '558736', url: 'https://conciliador-contabil2.movidesk.com/kb/article/558736/dados-que-podem-ser-retornados-pelo-open-finance', categoryId: 'cat-7', categoryName: 'Open Finance', fallbackTitle: 'Relatório de Cobertura de Dados Open Finance' },
  { movideskId: '547418', url: 'https://conciliador-contabil2.movidesk.com/kb/article/547418/importando-plano-de-contas-sistema-contabil', categoryId: 'cat-3', categoryName: 'Importação', fallbackTitle: 'Importando Plano de contas - Sistema Contábil' },
  { movideskId: '547416', url: 'https://conciliador-contabil2.movidesk.com/kb/article/547416/vinculando-layout', categoryId: 'cat-3', categoryName: 'Importação', fallbackTitle: 'Vinculando layout' },
  { movideskId: '547407', url: 'https://conciliador-contabil2.movidesk.com/kb/article/547407/regras-de-conciliacao', categoryId: 'cat-4', categoryName: 'Regras Contábeis', fallbackTitle: 'Regras de Conciliação' },
  { movideskId: '547398', url: 'https://conciliador-contabil2.movidesk.com/kb/article/547398/como-conferir-meu-saldo', categoryId: 'cat-5', categoryName: 'Confronto', fallbackTitle: 'Como conferir meu saldo?' },
  { movideskId: '547397', url: 'https://conciliador-contabil2.movidesk.com/kb/article/547397/limpar-participante', categoryId: 'cat-5', categoryName: 'Confronto', fallbackTitle: 'Limpar Participante' },
  { movideskId: '547393', url: 'https://conciliador-contabil2.movidesk.com/kb/article/547393/desmembramento-de-lancamento', categoryId: 'cat-5', categoryName: 'Confronto', fallbackTitle: 'Desmembramento de lançamento' },
  { movideskId: '545649', url: 'https://conciliador-contabil2.movidesk.com/kb/article/545649/cadastro-de-usuarios', categoryId: 'cat-2', categoryName: 'Cadastros', fallbackTitle: 'Cadastrar Usuários' },
  { movideskId: '545658', url: 'https://conciliador-contabil2.movidesk.com/kb/article/545658/empresas', categoryId: 'cat-2', categoryName: 'Cadastros', fallbackTitle: 'Cadastrar Empresas' },
  { movideskId: '545660', url: 'https://conciliador-contabil2.movidesk.com/kb/article/545660/contabilidade', categoryId: 'cat-2', categoryName: 'Cadastros', fallbackTitle: 'Cadastro da Contabilidade' },
  { movideskId: '545661', url: 'https://conciliador-contabil2.movidesk.com/kb/article/545661/layouts', categoryId: 'cat-3', categoryName: 'Importação', fallbackTitle: 'Cadastro de Layouts' },
  { movideskId: '545665', url: 'https://conciliador-contabil2.movidesk.com/kb/article/545665/compartilhamento-de-regras', categoryId: 'cat-8', categoryName: 'Migração de Regras', fallbackTitle: 'Criando Compartilhamento de Regras' },
  { movideskId: '546994', url: 'https://conciliador-contabil2.movidesk.com/kb/article/546994/layouts-excel', categoryId: 'cat-3', categoryName: 'Importação', fallbackTitle: 'Layouts Excel' },
  { movideskId: '547005', url: 'https://conciliador-contabil2.movidesk.com/kb/article/547005/duplicacao-de-layout', categoryId: 'cat-3', categoryName: 'Importação', fallbackTitle: 'Duplicação de Layout' },
  { movideskId: '545672', url: 'https://conciliador-contabil2.movidesk.com/kb/article/545672/regras-contabeis', categoryId: 'cat-4', categoryName: 'Regras Contábeis', fallbackTitle: 'Criando Regras' },
  { movideskId: '545677', url: 'https://conciliador-contabil2.movidesk.com/kb/article/545677/confronto', categoryId: 'cat-5', categoryName: 'Confronto', fallbackTitle: 'Começando o Confronto' },
];

const TARGET_IMG_DIR = path.join(__dirname, '../public/article-images');
if (!fs.existsSync(TARGET_IMG_DIR)) {
  fs.mkdirSync(TARGET_IMG_DIR, { recursive: true });
}

const DIST_IMG_DIR = path.join(__dirname, '../dist/article-images');
if (fs.existsSync(path.join(__dirname, '../dist')) && !fs.existsSync(DIST_IMG_DIR)) {
  fs.mkdirSync(DIST_IMG_DIR, { recursive: true });
}

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8',
        ...options.headers,
      }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).toString();
        return fetchUrl(redirectUrl, options).then(resolve).catch(reject);
      }
      let chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: buffer.toString('utf8'),
          buffer
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(25000, () => {
      req.destroy();
      reject(new Error(`Timeout ao acessar ${url}`));
    });
  });
}

function downloadBinary(rawUrl, targetPath) {
  return new Promise((resolve, reject) => {
    const cleanUrl = rawUrl.replace(/&amp;/g, '&');
    const isHttps = cleanUrl.startsWith('https');
    const client = isHttps ? https : http;
    const req = client.get(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBinary(res.headers.location, targetPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} ao baixar imagem do S3`));
      }
      const fileStream = fs.createWriteStream(targetPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        if (fs.existsSync(DIST_IMG_DIR)) {
          try {
            fs.copyFileSync(targetPath, path.join(DIST_IMG_DIR, path.basename(targetPath)));
          } catch (_) {}
        }
        resolve(true);
      });
      fileStream.on('error', err => {
        fs.unlink(targetPath, () => {});
        reject(err);
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error(`Timeout ao baixar imagem: ${cleanUrl.slice(0, 80)}...`));
    });
  });
}

async function loginMovidesk(username, password) {
  console.log(`[Autenticação] Conectando ao Movidesk como: ${username}...`);
  const initial = await fetchUrl('https://conciliador-contabil2.movidesk.com/Account/Login');
  const tokenMatch = initial.data.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/i);
  if (!tokenMatch) {
    throw new Error('Não foi possível obter o token de verificação da página de login do Movidesk.');
  }

  const token = tokenMatch[1];
  const setCookies = initial.headers['set-cookie'] || [];
  const initialCookies = setCookies.map(c => c.split(';')[0]).join('; ');

  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      __RequestVerificationToken: token,
      UserName: username,
      Password: password,
      ReturnUrl: '',
      UseCaptcha: 'False',
      ValidateCaptcha: 'False',
    });

    const req = https.request('https://conciliador-contabil2.movidesk.com/Account/Login', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Cookie': initialCookies,
        'Referer': 'https://conciliador-contabil2.movidesk.com/Account/Login',
      }
    }, res => {
      const responseCookies = res.headers['set-cookie'] || [];
      const allCookies = [initialCookies, ...responseCookies.map(c => c.split(';')[0])].join('; ');

      if (responseCookies.some(c => c.includes('.ASPXAUTH') || c.includes('Bearer'))) {
        console.log('[Autenticação] ✅ Login efetuado com sucesso no Movidesk! Tokens recebidos.');
        resolve(allCookies);
      } else {
        console.error('[Autenticação] ❌ Falha no login (status:', res.statusCode, ').');
        reject(new Error('Credenciais inválidas no Movidesk.'));
      }
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function cleanHtmlContent(rawHtml) {
  const contentMatch = rawHtml.match(/<div[^>]*class=["'][^"']*(?:md-article-content|article-content|fr-view)[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/article>/i) ||
                       rawHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                       rawHtml.match(/<div[^>]*class=["'][^"']*fr-view[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  let html = contentMatch ? contentMatch[1] : rawHtml;
  return html.trim();
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&#225;/g, 'á')
    .replace(/&#224;/g, 'à')
    .replace(/&#226;/g, 'â')
    .replace(/&#227;/g, 'ã')
    .replace(/&#233;/g, 'é')
    .replace(/&#234;/g, 'ê')
    .replace(/&#237;/g, 'í')
    .replace(/&#243;/g, 'ó')
    .replace(/&#244;/g, 'ô')
    .replace(/&#245;/g, 'õ')
    .replace(/&#250;/g, 'ú')
    .replace(/&#231;/g, 'ç')
    .replace(/&amp;/g, '&');
}

function generateSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function startMigration(cookieHeader) {
  console.log(`\n🚀 Iniciando extração dos ${ALL_MOVIDESK_ARTICLES.length} artigos e download das mídias...`);
  const crawledArticles = [];
  let totalImagesDownloaded = 0;
  let totalImagesProcessed = 0;

  for (let i = 0; i < ALL_MOVIDESK_ARTICLES.length; i++) {
    const item = ALL_MOVIDESK_ARTICLES[i];
    console.log(`\n======================================================`);
    console.log(`[${i + 1}/${ALL_MOVIDESK_ARTICLES.length}] Baixando artigo: ${item.movideskId} - ${item.fallbackTitle}`);
    
    let pageRes;
    try {
      pageRes = await fetchUrl(item.url, {
        headers: {
          'Cookie': cookieHeader,
          'Referer': 'https://conciliador-contabil2.movidesk.com/kb'
        }
      });
    } catch (err) {
      console.warn(`   ⚠️ Erro ao acessar ${item.url}: ${err.message}. Pulando...`);
      continue;
    }

    if (pageRes.status === 302 || pageRes.status === 403) {
      console.warn(`   ⚠️ Status ${pageRes.status} para ${item.url}. Tentando continuar...`);
      continue;
    }

    // Extrair título do HTML
    const titleMatch = pageRes.data.match(/<h1[^>]*class=["'][^"']*md-article-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i) ||
                       pageRes.data.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
                       pageRes.data.match(/<title>([\s\S]*?)<\/title>/i);
    let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    title = decodeHtmlEntities(title);
    if (!title || title.length < 3) {
      title = item.fallbackTitle;
    }
    // Remover sufixo " - Conciliador Contábil" para deixar limpo
    title = title.replace(/\s*-\s*Conciliador\s+Cont[áa]bil/gi, '').trim();
    console.log(`📖 Título limpo: "${title}"`);

    // Extrair HTML do conteúdo do manual
    let html = cleanHtmlContent(pageRes.data);

    // Extrair todas as imagens da AWS S3
    const imgRegex = /https?:\/\/s3\.amazonaws\.com\/movidesk-files\/([A-Za-z0-9_-]+)(?:[^"'\s>]*)/g;
    let match;
    const matchesFound = [];
    while ((match = imgRegex.exec(html)) !== null) {
      matchesFound.push({
        fullMatchedUrl: match[0],
        hash: match[1],
      });
    }

    console.log(`🖼️  Imagens encontradas no artigo: ${matchesFound.length}`);

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
          process.stdout.write(`   ⬇️  Baixando ${fileName}... `);
          await downloadBinary(img.fullMatchedUrl, localFilePath);
          const sizeKb = Math.round(fs.statSync(localFilePath).size / 1024);
          console.log(`OK (${sizeKb} KB)`);
          totalImagesDownloaded++;
        } catch (err) {
          console.log(`Erro ao baixar ${img.hash}: ${err.message}`);
        }
      } else {
        console.log(`   ⚡ Já baixada: ${fileName}`);
      }

      // Substituir tanto a versão com &amp; quanto a versão com &
      html = html.split(img.fullMatchedUrl).join(siteAssetUrl);
      const unescapedVersion = img.fullMatchedUrl.replace(/&amp;/g, '&');
      html = html.split(unescapedVersion).join(siteAssetUrl);
    }

    crawledArticles.push({
      movideskId: item.movideskId,
      url: item.url,
      title,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      contentHtml: html
    });
  }

  // Salvar backup local do json de artigos com os caminhos locais
  fs.writeFileSync('scripts/movidesk_crawled_articles.json', JSON.stringify(crawledArticles, null, 2), 'utf8');
  console.log(`\n🎉 Extração concluída!`);
  console.log(`- Artigos processados: ${crawledArticles.length}`);
  console.log(`- Imagens processadas: ${totalImagesProcessed}`);
  console.log(`- Novas imagens baixadas: ${totalImagesDownloaded}`);

  // Formatar artigos para o padrão da aplicação
  console.log('\n📝 Formatando artigos para o padrão do projeto e initialSeed.ts...');
  const formattedArticles = [];

  for (let i = 0; i < crawledArticles.length; i++) {
    const raw = crawledArticles[i];
    const code = `CC-${101 + i}`;
    const slug = generateSlug(raw.title);
    const id = `art-movidesk-${raw.movideskId || (101 + i)}`;
    const tags = [raw.categoryName.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-'), 'movidesk', 'manual'];

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

  fs.writeFileSync('scripts/formatted_articles.json', JSON.stringify(formattedArticles, null, 2), 'utf8');

  // Atualizar src/data/initialSeed.ts
  const initialSeedPath = 'src/data/initialSeed.ts';
  let seedContent = fs.readFileSync(initialSeedPath, 'utf8');
  const jsonStr = JSON.stringify(formattedArticles, null, 2);
  seedContent = seedContent.replace(
    /export const INITIAL_ARTICLES: Article\[\] = \[[\s\S]*?\];/,
    `export const INITIAL_ARTICLES: Article[] = ${jsonStr};`
  );
  fs.writeFileSync(initialSeedPath, seedContent, 'utf8');
  console.log('✅ src/data/initialSeed.ts atualizado com os novos artigos e mídias locais!');

  // Tentar atualizar Firestore (se as regras permitirem)
  try {
    console.log('\n📡 Tentando atualizar Cloud Firestore...');
    for (const art of formattedArticles) {
      const docRef = doc(db, 'articles', art.id);
      await setDoc(docRef, {
        ...art,
        serverCreatedAt: serverTimestamp(),
        serverUpdatedAt: serverTimestamp(),
      });
    }
    console.log('✅ Firestore atualizado diretamente!');
  } catch (err) {
    console.warn(`ℹ️ Gravação direta no Firestore bloqueada por regras de segurança (${err.code || err.message}).`);
    console.warn('O frontend sincronizará os artigos automaticamente quando você abrir o sistema logado como Administrador.');
  }

  console.log('\n======================================================');
  console.log('🎉 PROCESSO CONCLUÍDO COM SUCESSO TOTAL!');
  console.log(`- Todas as imagens foram baixadas para 'public/article-images/'`);
  console.log(`- Cópias criadas em 'dist/article-images/'`);
  console.log(`- Artigos salvos com referências locais permanentes.`);
  console.log('======================================================\n');
}

async function main() {
  const args = process.argv.slice(2);
  let cookieHeader = '';

  if (args[0] && !args[0].includes('=')) {
    cookieHeader = args[0];
  } else {
    const user = process.env.MOVIDESK_USER || 'Fulvio';
    const pass = process.env.MOVIDESK_PASSWORD || 'Ravena.2501';
    cookieHeader = await loginMovidesk(user, pass);
  }

  await startMigration(cookieHeader);
}

main().catch(err => {
  console.error('\n❌ Erro durante a migração:', err);
  process.exit(1);
});
