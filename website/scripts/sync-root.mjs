import { cp, copyFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import './build.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
for(const name of ['index.html','privacidade.html','termos.html','suporte.html','404.html','.nojekyll'])await copyFile(resolve(root,'website/dist',name),resolve(root,name));
await cp(resolve(root,'website/dist/assets'),resolve(root,'assets'),{recursive:true});
console.log('HTML estático sincronizado com a raiz de publicação.');