// 深度扫描：直接调用游戏运行时的所有层文本函数，统计中英残留
import { chromium } from './nodeenv/node_modules/playwright-core/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);if(p==='/')p='/index.html';const fp=path.join(ROOT,p);if(!fp.startsWith(ROOT)){res.writeHead(403);return res.end()}fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);return res.end()}res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'});res.end(d)})});
await new Promise(r=>server.listen(0,r));
const port=server.address().port;
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--no-sandbox','--disable-gpu']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(`http://localhost:${port}/index.html?lang=zh`,{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForTimeout(5000);

const result=await page.evaluate(()=>{
  const out={functionsCalled:0,cjk:0,latinOnly:[],samples:[],tabLabels:[],tabTextResidual:[],domResidual:[]};
  const cjkRe=/[\u4e00-\u9fff]/;
  function consider(s,where){
    if(typeof s!=='string'||!s.trim())return;
    // 去掉 HTML 标签、占位符、数字、符号后看是否仍有英文单词
    let clean=s.replace(/<[^>]*>/g,' ').replace(/\[[^\]]*\]/g,' ').replace(/[A-Za-z]*\([^)]*\)/g,' ').replace(/1e[\d,]+/g,' ').replace(/[0-9.+\-*/^%^(=)<>]/g,' ');
    const words=(clean.match(/[A-Za-z]{3,}/g)||[]).filter(w=>!['sup','sub','bdi','br','span','div','the','and','for','with','that','this','from'].includes(w.toLowerCase()));
    out.functionsCalled++;
    if(cjkRe.test(s)) out.cjk++;
    else if(words.length>=2 && out.latinOnly.length<400) out.latinOnly.push({where,text:s.replace(/<[^>]*>/g,'').trim().slice(0,120)});
    if(out.samples.length<20 && cjkRe.test(s)) out.samples.push({where,text:s.replace(/<[^>]*>/g,'').trim().slice(0,100)});
  }
  // 遍历所有层的 title / description
  const layers=window.LAYERS||[];
  for(const layer of layers){
    const L=window.layers?.[layer]||window[layer];
    const def=(window.layers&&window.layers[layer])||null;
    try{
      if(def&&typeof def.name==='function') consider(def.name(),layer+'.name()');
      if(def&&typeof def.resource==='function') consider(def.resource(),layer+'.resource()');
      if(def&&typeof def.baseResource==='function') consider(def.baseResource(),layer+'.baseResource()');
    }catch(e){}
    // 逐层节点升级/里程碑/成就
    for(const kind of ['upgrades','milestones','achievements','buyables','challenges','clickables']){
      const obj=def&&def[kind];
      if(!obj||typeof obj!=='object')continue;
      for(const id in obj){
        const item=obj[id];
        if(!item||typeof item!=='object')continue;
        for(const key of ['title','description','name','text','done']){
          try{ if(typeof item[key]==='function') consider(item[key](),`${layer}.${kind}[${id}].${key}()`);
               else if(typeof item[key]==='string') consider(item[key],`${layer}.${kind}[${id}].${key}`); }catch(e){}
        }
      }
    }
  }
  // 标签页按钮与 tabFormat 里的展示文本（截图里漏掉的那一类）
  const LABELS = window.ZH_TAB_LABELS || {};
  const wordsIn = s => (String(s).replace(/<[^>]*>/g,' ').match(/[A-Za-z]{3,}/g)||[])
    .filter(w=>!['sup','sub','bdi','br','span','div','the','and','for','with','that','this','from'].includes(w.toLowerCase()));
  out.tabLabels = [];
  out.tabTextResidual = [];
  for (const layer of Object.keys(window.layers || {})) {
    const def = window.layers[layer];
    const groups = [];
    if (def.tabFormat && !Array.isArray(def.tabFormat)) groups.push(['mainTabs', def.tabFormat]);
    for (const fam in (def.microtabs || {})) groups.push([fam, def.microtabs[fam]]);
    for (const [fam, grp] of groups) {
      for (const tab of Object.keys(grp)) {
        const shown = LABELS[tab] || tab;
        if (/[A-Za-z]{3,}/.test(shown) && !/[\u4e00-\u9fff]/.test(shown)) {
          out.tabLabels.push({layer, fam, tab});
        }
        const content = grp[tab] && grp[tab].content;
        if (!Array.isArray(content)) continue;
        for (const item of content) {
          if (!Array.isArray(item) || !['display-text','raw-html','info-box'].includes(item[0])) continue;
          let text = item[1];
          try { if (typeof text === 'function') text = text(); } catch (e) { continue; }
          if (typeof text !== 'string' || !text.trim()) continue;
          if (wordsIn(text).length >= 2 && !/[\u4e00-\u9fff]/.test(text)) {
            out.tabTextResidual.push({layer, fam, tab, text: text.replace(/<[^>]*>/g,'').trim().slice(0,120)});
          }
        }
      }
    }
  }
  out.domResidual = (document.body.innerText || '').split('\n')
    .map(s=>s.trim()).filter(s=>s && wordsIn(s).length>=2 && !/[\u4e00-\u9fff]/.test(s))
    .slice(0,60);
  return out;
});
console.log(`文本函数调用 ${result.functionsCalled}，其中含中文 ${result.cjk}`);
console.log(`标签按钮英文残留 ${result.tabLabels.length}，标签内容英文残留 ${result.tabTextResidual.length}，DOM 英文行 ${result.domResidual.length}`);
console.log(`纯英文残留 ${result.latinOnly.length} 条`);
console.log('\n--- 纯英文残留样本 ---');
result.latinOnly.slice(0,60).forEach(x=>console.log(`  [${x.where}] ${x.text}`));
console.log('\n--- 标签按钮英文残留 ---');
result.tabLabels.slice(0,30).forEach(x=>console.log(`  [${x.layer}.${x.fam}] ${x.tab}`));
console.log('\n--- 标签内容英文残留 ---');
result.tabTextResidual.slice(0,40).forEach(x=>console.log(`  [${x.layer}.${x.fam}.${x.tab}] ${x.text}`));
console.log('\n--- DOM 英文行 ---');
result.domResidual.slice(0,40).forEach(x=>console.log('  '+x));
console.log('\n--- 中文样本 ---');
result.samples.slice(0,10).forEach(x=>console.log(`  [${x.where}] ${x.text}`));
console.log('\n页面错误:',errs.length, errs.slice(0,3));
fs.writeFileSync('tools/zh/deep_scan_result.json',JSON.stringify(result,null,2));
await browser.close();server.close();
