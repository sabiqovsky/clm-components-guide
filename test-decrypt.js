#!/usr/bin/env node
/**
 * test-decrypt.js — Verifies encrypt/decrypt round-trip matches browser formula.
 *
 * This script must pass before any push that changes build.js or template.html.
 * It mirrors both sides of the crypto contract:
 *   - build.js encrypt() formula
 *   - template.html decryptContent() formula
 *
 * Usage:
 *   node test-decrypt.js
 *
 * If it prints ✅ PASS, the crypto contract is intact.
 * If it prints ❌ FAIL, build.js and template.html are mismatched — do not push.
 */

'use strict';
const crypto = require('crypto');

const BUILD_KEY    = 'test-key-for-round-trip-verification';
const PLAINTEXT    = 'Hello from Xendit Components Guide — round-trip test. session.submit()';
const PBKDF2_ITERS = 100000;
const KEY_LEN      = 32;

// ── Encrypt (same formula as build.js) ────────────────────────────────────────
function encrypt(plaintext, buildKey) {
  const browserPassword = crypto
    .createHmac('sha256', buildKey)
    .update('xendit-components-guide-v2')
    .digest('base64');

  const salt = crypto.randomBytes(16);
  const iv   = crypto.randomBytes(12);
  const key  = crypto.pbkdf2Sync(browserPassword, salt, PBKDF2_ITERS, KEY_LEN, 'sha256');

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const packed = Buffer.concat([salt, iv, authTag, encrypted]);
  return { blob: packed.toString('base64'), contentSalt: browserPassword };
}

// ── Decrypt (same formula as template.html browser-side) ──────────────────────
function decrypt(blob, contentSalt) {
  const packed  = Buffer.from(blob, 'base64');
  const salt    = packed.slice(0, 16);
  const iv      = packed.slice(16, 28);
  const authTag = packed.slice(28, 44);
  const cipher  = packed.slice(44);

  // PBKDF2 with contentSalt as password — matches browser's deriveKey(password, salt)
  const key = crypto.pbkdf2Sync(contentSalt, salt, PBKDF2_ITERS, KEY_LEN, 'sha256');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(cipher), decipher.final()]);
  return decrypted.toString('utf8');
}

// ── Run test ──────────────────────────────────────────────────────────────────
const { blob, contentSalt } = encrypt(PLAINTEXT, BUILD_KEY);
const result = decrypt(blob, contentSalt);

if (result === PLAINTEXT) {
  console.log('✅ PASS: Encrypt/decrypt round-trip successful');
  console.log(`   Blob: ${blob.length} base64 chars`);
  console.log(`   Password: ${contentSalt.length} chars`);
  process.exit(0);
} else {
  console.error('❌ FAIL: Decrypted text does not match plaintext');
  console.error('   Expected:', PLAINTEXT);
  console.error('   Got:     ', result);
  console.error('');
  console.error('   The encrypt (build.js) and decrypt (template.html) formulas are MISMATCHED.');
  console.error('   Fix both to match the Crypto Contract in CLAUDE.md before pushing.');
  process.exit(1);
}
