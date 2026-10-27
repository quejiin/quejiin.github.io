import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');const dist=resolve(root,'dist');
const c=JSON.parse(await readFile(resolve(root,'site.config.json'),'utf8'));const errors=[];
for(const name of ['appName','responsibleName','contactEmail','repositoryUrl','siteUrl','lastUpdated'])if(!c[name]||/PREENCHER|TODO|example\.(com|org)|a definir/i.test(c[name]))errors.push('Configuração ausente/inválida: '+name);
if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(c.contactEmail))errors.push('E-mail público inválido.');
if(new URL(c.siteUrl).protocol!=='https:')errors.push('URL pública precisa usar HTTPS.');
if(!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(c.repositoryUrl))errors.push('URL do repositório inválida.');
let linkCount=0;
for(const name of (await readdir(dist)).filter(n=>n.endsWith('.html'))){
 const html=await readFile(resolve(dist,name),'utf8');
 if(!html.includes('lang="pt-BR"')||!html.includes('name="viewport"'))errors.push(name+': idioma/viewport ausente.');
 if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push(name+': deve ter um H1.');
 if(/<script|<form|<iframe|<input/i.test(html))errors.push(name+': recursos dinâmicos/formulário inesperados.');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);if(new Set(ids).size!==ids.length)errors.push(name+': IDs duplicados.');
 for(const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
  const url=m[1].replaceAll('&amp;','&');linkCount++;
  if(url.startsWith('https:')||url.startsWith('mailto:'))continue;
  if(/^(?:http:|javascript:|data:|\/)/i.test(url)){errors.push(name+': link inesperado '+url);continue;}
  const [path,fragment]=url.split('#');const target=resolve(dist,path||name);
  if(relative(dist,target).startsWith('..')){errors.push(name+': link fora do site');continue;}
  try{await stat(target);if(fragment){const linked=await readFile(target,'utf8');if(!linked.includes(`id="${fragment}"`))errors.push(name+': âncora inexistente '+url);}}catch{errors.push(name+': arquivo inexistente '+url);}
 }
}
const css=await readFile(resolve(dist,'assets/style.css'),'utf8');if(/@import|url\s*\(\s*['"]?https?:/i.test(css))errors.push('CSS usa recurso remoto.');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`PASS: configuração, ${linkCount} links/referências, âncoras, HTML, CSS e ausência de scripts externos.`);
console.log('Esta verificação local não comprova publicação ou HTTPS público.');
