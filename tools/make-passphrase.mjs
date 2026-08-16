/*
 * tools/make-passphrase.mjs — turn a passphrase into the hash the server stores.
 *
 *   node tools/make-passphrase.mjs "some long passphrase you will remember"
 *
 * Then put the printed value in as a secret:
 *   npx wrangler pages secret put PASSPHRASE_HASH
 *
 * The passphrase itself is never stored anywhere — only this hash, and it is
 * useless for signing in without the original.
 */
import { makePassphraseHash } from '../shared/api.js';

const passphrase = process.argv.slice(2).join(' ').trim();

if (!passphrase) {
  console.error('Usage: node tools/make-passphrase.mjs "your passphrase"');
  process.exit(1);
}
if (passphrase.length < 12) {
  console.error(`That passphrase is ${passphrase.length} characters. Use at least 12 —`);
  console.error('it is the only thing standing between the internet and your data.');
  process.exit(1);
}

console.log(await makePassphraseHash(passphrase));
