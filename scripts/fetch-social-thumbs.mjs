#!/usr/bin/env node
/**
 * Download social carousel thumbnails from permalinks in src/content/home.md.
 * Run: npm run fetch:social-thumbs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const homePath = path.join(root, 'src/content/home.md');
const imagesDir = path.join(root, 'public/images');

function slugFromUrl(url) {
  const ig = url.match(/instagram\.com\/(?:p|reel)\/([^/?#]+)/i);
  if (ig) return `instagram-${ig[1].toLowerCase()}-browser.jpg`;
  const tt = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i);
  if (tt) return `tiktok-${tt[1]}.jpg`;
  throw new Error(`Unsupported URL: ${url}`);
}

function decodeTikTokUrl(raw) {
  return raw.replace(/\\u002F/gi, '/').replace(/\\\//g, '/');
}

async function fetchOgImage(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);

  if (/instagram\.com/i.test(url)) {
    return page.locator('meta[property="og:image"]').getAttribute('content');
  }

  if (/tiktok\.com/i.test(url)) {
    return page.evaluate(() => {
      const og = document.querySelector('meta[property="og:image"]')?.content;
      if (og) return og;
      const scripts = [...document.querySelectorAll('script')]
        .map((s) => s.textContent || '')
        .join('\n');
      const m =
        scripts.match(/"originCover":"(https:[^"]+)"/) ||
        scripts.match(/"cover":"(https:[^"]+)"/);
      return m?.[1] || '';
    });
  }

  return null;
}

async function downloadImage(imageUrl, dest) {
  const res = await fetch(imageUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; marena-cutz-thumb-fetch)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${imageUrl}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

function parsePermalinks(markdown) {
  return [...markdown.matchAll(/permalink:\s*'([^']+)'/g)].map((m) => m[1]);
}

async function main() {
  const md = fs.readFileSync(homePath, 'utf8');
  const urls = parsePermalinks(md);
  if (!urls.length) {
    console.log('No permalinks found in home.md');
    return;
  }

  fs.mkdirSync(imagesDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const permalink of urls) {
    const filename = slugFromUrl(permalink);
    const dest = path.join(imagesDir, filename);
    process.stdout.write(`Fetching ${permalink} → ${filename} … `);

    let raw = await fetchOgImage(page, permalink);
    if (!raw) {
      console.log('skip (no image URL)');
      continue;
    }
    if (/tiktok\.com/i.test(permalink)) raw = decodeTikTokUrl(raw);

    await downloadImage(raw, dest);
    console.log(`ok (${fs.statSync(dest).size} bytes)`);
  }

  await browser.close();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});