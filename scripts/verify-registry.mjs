import { setTimeout } from "node:timers/promises";
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const {name, version} = JSON.parse(readFileSync('packages/docs/package.json','utf8'));
const dir = mkdtempSync(path.join(tmpdir(),'docs-registry-'));
writeFileSync(path.join(dir,'package.json'), JSON.stringify({private:true,type:'module'}));
writeFileSync(path.join(dir,'.npmrc'), `${name.split('/')[0]}:registry=https://registry.npmjs.org\n`);
// Registry indexing can lag a successful publish. Wait for the exact version,
// then install once with authentication disabled.
const anonymousEnv = {...process.env,NPM_CONFIG_USERCONFIG:path.join(dir,'.npmrc'),NODE_AUTH_TOKEN:'',NPM_TOKEN:''};
for (let attempt = 0; ; attempt++) {
  try {
    const found = JSON.parse(execFileSync('npm', ['view', `${name}@${version}`, 'version', '--json', '--prefer-online'], {cwd:dir,env:anonymousEnv,stdio:['ignore','pipe','pipe'],encoding:'utf8'}));
    if (found !== version) throw new Error('Registry version is not available yet');
    break;
  } catch (error) {
    if (attempt >= 17) throw error;
    console.log(`Waiting for npm index: ${name}@${version}`);
    await setTimeout(10000);
  }
}
execFileSync('npm',['install','--ignore-scripts','--save-exact',`${name}@${version}`],{cwd:dir,stdio:'inherit',env:{...process.env,NPM_CONFIG_USERCONFIG:path.join(dir,'.npmrc'),NODE_AUTH_TOKEN:'',NPM_TOKEN:''}});
const installed = JSON.parse(readFileSync(path.join(dir,'node_modules',name,'package.json'),'utf8'));
if(installed.version!==version) throw new Error('Registry version mismatch');
execFileSync(process.execPath,['--input-type=module','-e',`import {defineDocsConfig} from '${name}/content'; if(typeof defineDocsConfig !== 'function') throw new Error('Missing package API');`],{cwd:dir,stdio:'inherit'});
console.log(`Verified registry install: ${name}@${version}`);
