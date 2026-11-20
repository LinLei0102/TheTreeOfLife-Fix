// 验收新覆盖的界面：设置页、信息页、分类学公式页
import { chromium } from './nodeenv/node_modules/playwright-core/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);if(p==='/')p='/index.html';const fp=path.join(ROOT,p);if(!fp.startsWith(ROOT)){res.writeHead(403);return res.end()}fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);return res.end()}res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'});res.end(d)})});
await new Promise(r=>server.listen(0,r)); const port=server.address().port;
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--no-sandbox','--disable-gpu']});
const page=await browser.newPage({viewport:{width:900,height:760}});
const errs=[]; page.on('pageerror',e=>errs.push(e.message));
await page.goto(`http://localhost:${port}/index.html?lang=zh`,{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForTimeout(3500);

// 英文残留检测（排除专有名词、代码符号、罗马数字、科学缩写）
function latinResidual(text){
  const allow=/^(DNA|RNA|mRNA|tRNA|siRNA|OOM|Jacorb|Digiprime|Lordshinjo|Virgil|Acamaeda|Modding|Tree|Prestige|Discord|The|by|and|Shift|Ctrl|I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|XXI|XXII|XXIII|XXIV|XXV|XXVI|XXVII|XXVIII|XXX|OFF|ON|AUTO|EX|dB|e|ln|log|sqrt|pow|max|min|NaN|NaN|ms|s|m|h|sec)$/;
  const toks=(text.match(/[A-Za-z][A-Za-z']{1,}/g)||[]);
  return [...new Set(toks.filter(t=>!allow.test(t)))];
}

async function snap(tab,file){
  await page.evaluate(t=>{ showTab(t); document.querySelectorAll('.popup').forEach(e=>e.remove()); },tab);
  await page.waitForTimeout(700);
  const txt=await page.evaluate(()=>document.body.innerText);
  await page.screenshot({path:file});
  const res=latinResidual(txt);
  console.log(`\n=== ${tab} === 英文残留 ${res.length}:`,res.slice(0,40).join(', '));
  return txt;
}

const opt=await snap('options-tab','tools/zh/shot_options_zh.png');
const info=await snap('info-tab','tools/zh/shot_info_zh.png');

// 公式页：直接调用全局函数取渲染文本
const formula=await page.evaluate(()=>{
  const out={};
  for(const fn of ['pointFormulaDisplay','dnaFormulaDisplay','dnaExpDisplay','cellFormulaDisplay','stemCellFormulaDisplay']){
    try{const h=window[fn](); const d=document.createElement('div'); d.innerHTML=h; out[fn]=d.innerText||d.textContent;}
    catch(e){out[fn]='ERR:'+e.message;}
  }
  return out;
});
let fAll='';
for(const [k,v] of Object.entries(formula)){
  const res=latinResidual(v);
  fAll+=v+'\n';
  console.log(`\n=== ${k} === 英文残留 ${res.length}:`,res.slice(0,30).join(', '));
}
fs.writeFileSync('tools/zh/formula_render_sample.txt',fAll.slice(0,3000));

console.log('\n页面错误:',errs.length,errs.slice(0,3));
await browser.close();server.close();
