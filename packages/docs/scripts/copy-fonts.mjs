import {mkdirSync,copyFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url);
const plex=path.dirname(require.resolve('@ibm/plex/package.json'));
mkdirSync('dist/fonts',{recursive:true});
for(const family of ['Sans','Mono'])for(const weight of ['Regular','SemiBold','Bold'])copyFileSync(path.join(plex,`IBM-Plex-${family}/fonts/complete/woff2/IBMPlex${family}-${weight}.woff2`),`dist/fonts/IBMPlex${family}-${weight}.woff2`);
copyFileSync(path.join(plex,'LICENSE.txt'),'dist/fonts/LICENSE.txt');
