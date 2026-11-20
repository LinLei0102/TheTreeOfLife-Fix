// 验证 improveName() 动态资源名与三张截面对应的真实显示
import { chromium } from './nodeenv/node_modules/playwright-core/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);if(p==='/')p='/index.html';const fp=path.join(ROOT,p);if(!fp.startsWith(ROOT)){res.writeHead(403);return res.end()}fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);return res.end()}res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'});res.end(d)})});
await new Promise(r=>server.listen(0,r)); const port=server.address().port;
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--no-sandbox','--disable-gpu']});
const page=await browser.newPage({viewport:{width:1000,height:800}});
const errs=[]; page.on('pageerror',e=>errs.push(e.message));
const save=fs.readFileSync('save/endgame-v2.069.json','utf8').trim();
await page.addInitScript(s=>{try{localStorage.setItem('tree_of_life',s)}catch(e){}},save);
await page.goto(`http://localhost:${port}/index.html?lang=zh`,{waitUntil:'domcontentloaded'});
await page.waitForTimeout(4000);

// 1) 直接调用 improveName
const names=await page.evaluate(()=>{
  const ids=['genes','widgets','mastery_tokens','thoughts','mu','lambda','kappa','iota','stem_cells','protein','deuterium','atomic_hydrogen','contaminants','air','energy','coins','dna_science','mastery_tokens'];
  return ids.map(id=>[id,improveName(id)]);
});
console.log('=== improveName ===');
for(const [k,v] of names) console.log(`  ${k} -> ${v}`);

// 2) 全部 secondary-display 的 id -> 中文，确认没有英文返回
const BAD=/\b(Genes|Widgets|Mastery|Tokens|Thoughts|Protein|Energy|Air|Coins|Cells|Science|Hydrogen|Oxygen|Carbon|Nitrogen|Organ|Nucleus)\b/;
const bad=names.filter(([k,v])=>BAD.test(v));
console.log('\n英文残留:',bad.length,bad.map(x=>x.join('->')).join(', '));

// 3) 遍历所有 tab，抓 body 文本里的动态资源名残留
async function residualForTab(tab){
  try{ await page.evaluate(t=>{showTab(t);document.querySelectorAll('.popup').forEach(e=>e.remove())},tab); }
  catch(e){ return null; }
  await page.waitForTimeout(400);
  return await page.evaluate(()=>document.body.innerText);
}
const ENRES=/\b(Genes|Widgets|Mastery Tokens|Thoughts|Stem Cells|Contaminants|Deuterium|Atomic Hydrogen|Hydrogen Science|Oxygen Science|Carbon Science|Nitrogen Science|Protein Science|DNA Science|Organ Science|Nucleus Science)\b/g;
const tabs=['an','r','tokens','hu','h','sci','a','or','cells','pl'];
let totalHits=[];
for(const t of tabs){
  const txt=await residualForTab(t);
  if(txt==null) continue;
  const hits=[...new Set(txt.match(ENRES)||[])];
  if(hits.length){ console.log(`  TAB ${t} 残留:`,hits.join(', ')); totalHits=totalHits.concat(hits.map(h=>t+':'+h)); }
}
console.log('\nTab 英文资源名残留:',totalHits.length);
console.log('页面错误:',errs.length,errs.slice(0,3));
await browser.close();server.close();
