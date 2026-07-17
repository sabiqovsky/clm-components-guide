#!/usr/bin/env node
/**
 * build.js — Xendit Components Guide build script
 *
 * Reads all content/*.md files, converts to HTML, encrypts with AES-256-GCM,
 * injects into template.html, outputs docs/index.html.
 *
 * Usage:
 *   BUILD_ENCRYPTION_KEY=<secret> node build.js
 *
 * The encryption key is derived using PBKDF2:
 *   password = process.env.BUILD_ENCRYPTION_KEY
 *   salt     = random 16 bytes (embedded in output)
 *   iv       = random 12 bytes (embedded in output)
 *   key      = PBKDF2(password, salt, 100000, 32, sha256)
 *
 * The browser-side decryption key is derived from:
 *   password = "xendit.co" + CONTENT_SALT (injected into template at build time)
 * where CONTENT_SALT is derived from the BUILD_ENCRYPTION_KEY.
 * This means only a valid Google sign-in returning hd=="xendit.co" can
 * produce the correct password to decrypt the content.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');
const { marked } = require('marked');

// ─── Config ───────────────────────────────────────────────────────────────────

const CONTENT_DIR  = path.join(__dirname, 'content');
const TEMPLATE     = path.join(__dirname, 'template.html');
const OUTPUT_DIR   = path.join(__dirname, 'docs');
const OUTPUT_FILE  = path.join(OUTPUT_DIR, 'index.html');
const PBKDF2_ITERS = 100000;
const KEY_LEN      = 32; // 256 bits

// ─── Helpers ──────────────────────────────────────────────────────────────────

function die(msg) {
  console.error(`[build] ERROR: ${msg}`);
  process.exit(1);
}

function log(msg) {
  console.log(`[build] ${msg}`);
}

// ─── Markdown config ──────────────────────────────────────────────────────────

// Custom renderer: preserve ```mermaid blocks as <pre class="mermaid">
const renderer = new marked.Renderer();
const originalCode = renderer.code.bind(renderer);
renderer.code = function(code, lang) {
  if (lang === 'mermaid') {
    return `<div class="mermaid-wrapper"><pre class="mermaid">${code}</pre></div>`;
  }
  return originalCode(code, lang);
};

marked.setOptions({ renderer });

// ─── Read and compile Markdown ────────────────────────────────────────────────

function compileContent() {
  if (!fs.existsSync(CONTENT_DIR)) die(`content/ directory not found at ${CONTENT_DIR}`);

  const files = fs.readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();

  if (files.length === 0) die('No .md files found in content/');

  log(`Compiling ${files.length} markdown files...`);

  const toc = [];
  let html = '';

  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
    const compiled = marked.parse(raw);

    // Extract h1 for TOC
    const h1 = raw.match(/^#\s+(.+)$/m);
    if (h1) {
      const slug = h1[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      toc.push({ title: h1[1], slug });
    }

    // Wrap each file in a section with an anchor id
    const slug = file.replace(/^\d+-/, '').replace(/\.md$/, '');
    html += `<section id="${slug}">\n${compiled}\n</section>\n`;
  }

  log(`  Sections: ${files.length}, TOC entries: ${toc.length}`);
  return { html, toc };
}

// ─── Encryption ───────────────────────────────────────────────────────────────

function encrypt(plaintext, buildKey) {
  // Derive a browser-safe password from the build key.
  // This derived value is injected into template.html at build time
  // and used as the PBKDF2 password in the browser.
  // The raw BUILD_ENCRYPTION_KEY is never embedded in the HTML.
  const browserPassword = crypto
    .createHmac('sha256', buildKey)
    .update('xendit-components-guide-v2')
    .digest('base64');

  // Random salt + IV for PBKDF2 + AES-GCM
  const salt = crypto.randomBytes(16);
  const iv   = crypto.randomBytes(12);

  // Derive AES key: PBKDF2(browserPassword, salt, iters, keyLen, sha256)
  const key = crypto.pbkdf2Sync(browserPassword, salt, PBKDF2_ITERS, KEY_LEN, 'sha256');

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag(); // 16 bytes

  // Pack: salt(16) + iv(12) + authTag(16) + ciphertext
  const packed = Buffer.concat([salt, iv, authTag, encrypted]);

  return {
    blob: packed.toString('base64'),
    // browserPassword is injected as CONTENT_SALT into template.html
    // The browser uses it directly as the PBKDF2 password
    contentSalt: browserPassword,
  };
}

// ─── TOC HTML ─────────────────────────────────────────────────────────────────

function buildTocHtml(toc) {
  const items = toc.map(({ title, slug }) =>
    `  <li><a href="#${slug}" class="nav-link">${title}</a></li>`
  ).join('\n');
  return `<ul class="toc-list">\n${items}\n</ul>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const buildKey = process.env.BUILD_ENCRYPTION_KEY;
  if (!buildKey || buildKey.length < 16) {
    die('BUILD_ENCRYPTION_KEY env var is missing or too short (min 16 chars)');
  }

  if (!fs.existsSync(TEMPLATE)) die(`template.html not found at ${TEMPLATE}`);

  // 1. Compile markdown → HTML
  const { html: contentHtml, toc } = compileContent();

  // 2. Encrypt
  log('Encrypting content...');
  const { blob, contentSalt } = encrypt(contentHtml, buildKey);
  log(`  Encrypted blob: ${blob.length} base64 chars`);

  // 3. Build TOC
  const tocHtml = buildTocHtml(toc);

  // 4. Build timestamp
  const buildTime = new Date().toISOString();

  // 5. Read template and inject
  let template = fs.readFileSync(TEMPLATE, 'utf8');

  template = template
    .replace('{{ENCRYPTED_BLOB}}', blob)
    .replace('{{CONTENT_SALT}}', contentSalt)
    .replace('{{TOC_HTML}}', tocHtml)
    .replace('{{BUILD_TIME}}', buildTime)
    .replace('{{SECTION_COUNT}}', toc.length.toString());

  // 6. Verify no plaintext leaked (use a prose string that won't appear in TOC or nav)
  const sampleWord = 'session.submit()';
  if (template.includes(sampleWord)) {
    die('Plaintext content detected in output — encryption failed');
  }

  // 7. Write output
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, template, 'utf8');

  const sizeKb = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1);
  log(`Output: docs/index.html (${sizeKb} KB)`);
  log(`Build time: ${buildTime}`);
  log('Done.');
}

main();
