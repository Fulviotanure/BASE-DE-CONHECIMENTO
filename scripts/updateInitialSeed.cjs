const fs = require('fs');

const articles = require('./formatted_articles.json');
const initialSeedPath = 'src/data/initialSeed.ts';
let content = fs.readFileSync(initialSeedPath, 'utf8');

// Substituir export const INITIAL_ARTICLES: Article[] = ...
const jsonStr = JSON.stringify(articles, null, 2);
content = content.replace(
  /export const INITIAL_ARTICLES: Article\[\] = \[[\s\S]*?\];/,
  `export const INITIAL_ARTICLES: Article[] = ${jsonStr};`
);

fs.writeFileSync(initialSeedPath, content, 'utf8');
console.log('src/data/initialSeed.ts atualizado com', articles.length, 'artigos!');
