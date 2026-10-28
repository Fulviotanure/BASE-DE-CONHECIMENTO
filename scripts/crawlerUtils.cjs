const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

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

const TARGET_IMG_DIR = path.join(__dirname, '../public/article-images');
if (!fs.existsSync(TARGET_IMG_DIR)) {
  fs.mkdirSync(TARGET_IMG_DIR, { recursive: true });
}

const DIST_IMG_DIR = path.join(__dirname, '../dist/article-images');
if (fs.existsSync(path.join(__dirname, '../dist')) && !fs.existsSync(DIST_IMG_DIR)) {
  fs.mkdirSync(DIST_IMG_DIR, { recursive: true });
}

function cleanHtmlContent(rawHtml) {
  const contentMatch = rawHtml.match(/<div[^>]*class=["'][^"']*(?:md-article-content|article-content|fr-view)[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/article>/i) ||
                       rawHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                       rawHtml.match(/<div[^>]*class=["'][^"']*fr-view[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  let html = contentMatch ? contentMatch[1] : rawHtml;
  return html.trim();
}

function decodeHtmlEntities(str) {
  if (!str) return '';
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
    .replace(/&#193;/g, 'Á')
    .replace(/&#192;/g, 'À')
    .replace(/&#194;/g, 'Â')
    .replace(/&#195;/g, 'Ã')
    .replace(/&#201;/g, 'É')
    .replace(/&#202;/g, 'Ê')
    .replace(/&#205;/g, 'Í')
    .replace(/&#211;/g, 'Ó')
    .replace(/&#212;/g, 'Ô')
    .replace(/&#213;/g, 'Õ')
    .replace(/&#218;/g, 'Ú')
    .replace(/&#199;/g, 'Ç')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function generateSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

module.exports = {
  fetchUrl,
  downloadBinary,
  loginMovidesk,
  cleanHtmlContent,
  decodeHtmlEntities,
  generateSlug,
  TARGET_IMG_DIR,
  DIST_IMG_DIR
};

