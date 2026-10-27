import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');const c=JSON.parse(await readFile(resolve(root,'site.config.json'),'utf8'));
let failed=false;
for(const page of ['','privacidade.html','termos.html','suporte.html']){
 const url=new URL(page,c.siteUrl+'/');
 try{
  const response=await fetch(url,{signal:AbortSignal.timeout(20000)});const text=await response.text();
  const expected=page==='privacidade.html'?'Política de Privacidade':page==='termos.html'?'Termos de Uso':page==='suporte.html'?'Como podemos ajudar?':c.appName;
  if(!response.ok||new URL(response.url).protocol!=='https:'||!text.includes(expected)||!text.includes(c.appName))throw new Error('HTTP '+response.status+' ou conteúdo/HTTPS incorreto');
  if(page==='privacidade.html'&&(!text.includes(c.contactEmail)||!text.includes('LGPD')))throw new Error('Identidade ou conteúdo da política não corresponde ao build');
  console.log('PASS HTTPS '+response.url);
 }catch(error){failed=true;console.error('PENDENTE '+url+' — '+error.message);}
}
if(failed)process.exitCode=1;
