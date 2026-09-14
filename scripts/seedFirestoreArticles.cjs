const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Carregar variáveis de ambiente do .env
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const k = parts[0].trim();
    const v = parts.slice(1).join('=').trim();
    if (k && !k.startsWith('#')) env[k] = v;
  }
});

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

const rawArticles = require('./movidesk_crawled_articles.json');

function getCategoryForArticle(title, hint) {
  const t = title.toLowerCase();
  const h = (hint || '').toLowerCase();

  if (t.includes('primeiros passos')) return { id: 'cat-1', name: 'Primeiros Passos' };
  if (t.includes('usuário') || t.includes('empresa') || t.includes('cadastro da contabilidade') || t === 'cadastros') {
    return { id: 'cat-2', name: 'Cadastros' };
  }
  if (t.includes('layout') || t.includes('importa') || t.includes('plano de contas')) {
    return { id: 'cat-3', name: 'Importação' };
  }
  if (t.includes('migra') || t.includes('compartilha')) {
    return { id: 'cat-8', name: 'Migração de Regras' };
  }
  if (t.includes('regra') || t.includes('conciliação')) {
    return { id: 'cat-4', name: 'Regras Contábeis' };
  }
  if (t.includes('confronto') || t.includes('saldo') || t.includes('participante') || t.includes('desmembramento') || t.includes('sinais')) {
    return { id: 'cat-5', name: 'Confronto' };
  }
  if (t.includes('exporta') || t.includes('pdf')) {
    return { id: 'cat-6', name: 'Exportação' };
  }
  if (t.includes('open finance')) {
    return { id: 'cat-7', name: 'Open Finance' };
  }
  if (t.includes('chamado') || t.includes('suporte')) {
    return { id: 'cat-10', name: 'Abertura de Chamados' };
  }
  if (t.includes('faq') || t.includes('importante') || t.includes('dica')) {
    return { id: 'cat-9', name: 'Informações Importantes & FAQ' };
  }

  return { id: 'cat-1', name: 'Primeiros Passos' };
}

function generateSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function run() {
  console.log('Iniciando processamento de', rawArticles.length, 'artigos baixados do Movidesk...');

  // Deduplicar por movideskId
  const seenIds = new Set();
  const uniqueArticles = [];
  for (const a of rawArticles) {
    if (seenIds.has(a.movideskId)) continue;
    seenIds.add(a.movideskId);
    uniqueArticles.push(a);
  }

  console.log('Total de artigos únicos a inserir:', uniqueArticles.length);

  const formattedArticles = [];

  for (let i = 0; i < uniqueArticles.length; i++) {
    const raw = uniqueArticles[i];
    const cat = getCategoryForArticle(raw.title, raw.categoryHint);
    const code = `CC-${101 + i}`;
    const slug = generateSlug(raw.title);
    const id = `art-movidesk-${raw.movideskId || (101 + i)}`;

    // Criar tags automáticas
    const tags = [cat.name.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-'), 'movidesk', 'manual'];

    const article = {
      id,
      code,
      title: raw.title,
      slug,
      categoryId: cat.id,
      categoryName: cat.name,
      authorId: 'usr-fulvio',
      authorName: 'Fulvio Tanure',
      authorEmail: 'fulvio@conciliadorcontabil.com.br',
      currentStatus: 'APPROVED', // Aprovado & Oficial
      accessLevel: 'ALL',        // Disponível para todos (interno e clientes)
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

    console.log(`[${i + 1}/${uniqueArticles.length}] Gravando no Firestore: ${code} - "${raw.title}" -> [${cat.name}]`);
    const docRef = doc(db, 'articles', article.id);
    await setDoc(docRef, {
      ...article,
      serverCreatedAt: serverTimestamp(),
      serverUpdatedAt: serverTimestamp(),
    });
  }

  // Também salvar em scripts/formatted_articles.json para atualizar initialSeed.ts
  fs.writeFileSync('scripts/formatted_articles.json', JSON.stringify(formattedArticles, null, 2), 'utf8');
  console.log('\n✅ Todos os artigos foram gravados no Cloud Firestore com sucesso!');
}

run().catch(console.error);
