import { mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
for (const name of ['react', 'styles', 'icons-react']) {
  const root = path.dirname(require.resolve(`@carbon/${name}/package.json`));
  const target = `dist/licenses/carbon-${name}`;
  mkdirSync(target, {recursive:true});
  copyFileSync(path.join(root, 'LICENSE'), `${target}/LICENSE`);
  if (existsSync(path.join(root, 'NOTICE'))) copyFileSync(path.join(root, 'NOTICE'), `${target}/NOTICE`);
}
copyFileSync('THIRD_PARTY_NOTICES.md', 'dist/THIRD_PARTY_NOTICES.md');
