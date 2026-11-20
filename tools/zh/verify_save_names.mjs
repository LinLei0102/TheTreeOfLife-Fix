// 验证内置存档列表：存档名中文化、EX 前缀、导入查找键仍有效
import { chromium } from './nodeenv/node_modules/playwright-core/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);if(p==='/')p='/index.html';const fp=path.join(ROOT,p);if(!fp.startsWith(ROOT)){res.writeHead(403);return res.end()}fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);return res.end()}res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'});res.end(d)})});
await new Promise(r=>server.listen(0,r)); const port=server.address().port;
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--no-sandbox','--disable-gpu']});
const page=await browser.newPage({viewport:{width:1200,height:900}});
const errs=[]; page.on('pageerror',e=>errs.push(e.message));
await page.goto(`http://localhost:${port}/index.html?lang=zh`,{waitUntil:'domcontentloaded'});
await page.waitForTimeout(3500);

// 打开系统面板 -> 显示内置存档
// 逐层 showTab，找到含"显示内置存档"的界面
await page.evaluate(()=>{ try{ player.showBuiltInSaves=true; }catch(e){} });
const layerIds=await page.evaluate(()=>Object.keys(typeof LAYERS!=='undefined'?LAYERS:(typeof layers!=='undefined'?layers:{})));
await page.evaluate(()=>{ try{ showTab('info'); }catch(e){} });
await page.waitForTimeout(600);

const r=await page.evaluate(()=>{
  // 直接检查数据源
  const ids = (typeof CUSTOM_SAVES_IDS!=='undefined')?CUSTOM_SAVES_IDS:[];
  const sample = ids.slice(0,20);
  const enPat=/\b(Hydrogen|Nitrogen|Oxygen|Phosphorus|Tokens?|Points?|Chromosomes?|Nucleuses?|Species|Ecosystems?|Plants|Humans?|Cells?|Tissue|Protein|Amino|Genes?|Biomass|upgrades?|resets?|completions?|challenges?|Coin|Science)\b/;
  const enLeft=ids.filter(k=>enPat.test(k));
  // 按钮文字
  const btns=[...document.querySelectorAll('button.savebutton')].map(b=>b.innerText.replace(/\s+/g,' ').trim());
  return {total:ids.length, sample, enLeftCount:enLeft.length, enLeft:enLeft.slice(0,15), btnCount:btns.length, btnSample:btns.slice(0,20),
          exKeys:ids.filter(k=>k.startsWith('EX: ')).length};
});
console.log('=== 数据源 ===');
console.log('存档总数:',r.total,'| EX 极限存档:',r.exKeys);
console.log('键英文残留:',r.enLeftCount, r.enLeft.join(' | '));
console.log('前20键:',r.sample.join(' / '));
console.log('\n=== 渲染按钮 ===');
console.log('按钮数:',r.btnCount);
r.btnSample.forEach(b=>console.log('  ',b));

// 验证导入查找键:取第1个键，确认 CUSTOM_SAVES[key] 是有效 base64
const imp=await page.evaluate(()=>{
  const k=CUSTOM_SAVES_IDS[0];
  const v=CUSTOM_SAVES[k];
  let ok=false,ver='';
  try{ const j=JSON.parse(atob(v)); ok=!!j; ver=j.version||''; }catch(e){}
  return {key:k, valLen:(v||'').length, ok, ver};
});
console.log('\n=== 导入查找键验证 ===');
console.log(imp);
console.log('\n页面错误:',errs.length,errs.slice(0,3));
await browser.close();server.close();
