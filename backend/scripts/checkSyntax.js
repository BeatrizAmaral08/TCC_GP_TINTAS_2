import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';

function list(dir){return readdirSync(dir).flatMap(n=>{const p=join(dir,n);return statSync(p).isDirectory()?list(p):(p.endsWith('.js')?[p]:[]);});}
const files=['server.js',...list('src'),...list('scripts')];
let fail=false;
for(const file of files){const r=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(r.status!==0)fail=true;}
if(fail)process.exit(1);console.log(`Sintaxe OK em ${files.length} arquivos JavaScript.`);
