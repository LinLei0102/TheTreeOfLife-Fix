// 全界面残留扫描：遍历所有层所有节点的所有可调用文本函数 + DOM 全文，
// 统计含英文但不含中文的片段，按英文 token 归并，输出完整漏译清单。
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

// 解锁所有层 + 加载满资源存档，让尽可能多的文本函数可调用
const save=fs.readFileSync('save/endgame-v2.069.json','utf8').trim();
await page.evaluate(s=>localStorage.setItem('tree_of_life',s),save);
await page.reload({waitUntil:'domcontentloaded'});
await page.waitForTimeout(5000);

const result=await page.evaluate(()=>{
  const out={raw:[],byToken:{},domLines:[]};
  const cjk=/[\u4e00-\u9fff]/;
  const WHITELIST=new Set(['sup','sub','bdi','br','span','div','the','and','for','with','that','this','from','per','x','a','i']);
  function tokens(s){
    const clean=String(s).replace(/<[^>]*>/g,' ').replace(/\[[^\]]*\]/g,' ')
      .replace(/1e[\d,]+/g,' ').replace(/[0-9.+*/^%()=<>,:\-\s]/g,' ');
    return (clean.match(/[A-Za-z]{2,}/g)||[]).filter(w=>!WHITELIST.has(w.toLowerCase()));
  }
  function consider(s,where){
    if(typeof s!=='string'||!s.trim())return;
    if(cjk.test(s))return;                       // 已含中文，跳过
    const t=tokens(s);
    if(!t.length)return;
    const clean=s.replace(/<[^>]*>/g,'').trim().slice(0,140);
    out.raw.push({where,text:clean,tokens:t});
    // 按每个英文 token 归并，便于发现共性漏译
    for(const w of new Set(t.map(x=>x.toLowerCase()))){
      (out.byToken[w] ||= {count:0,samples:[]});
      out.byToken[w].count++;
      if(out.byToken[w].samples.length<3) out.byToken[w].samples.push(clean);
    }
  }
  if(typeof chemInitialEffects!=='undefined') for(const [k,v] of Object.entries(chemInitialEffects)) consider(v,'chemInitialEffects['+k+']');
  if(typeof chemAbbrev!=='undefined') for(const [k,v] of Object.entries(chemAbbrev)) consider(v,'chemAbbrev['+k+']');
  const L=window.layers||{};
  for(const layer of Object.keys(L)){
    const def=L[layer];
    if(!def||typeof def!=='object')continue;
    consider(typeof def.prestegeButtonText==='function'?def.prestegeButtonText():'',layer+'.prestegeButtonText');
    consider(typeof def.tooltip==='function'?def.tooltip():'',layer+'.tooltip');
    consider(typeof def.name==='function'?def.name():def.name, layer+'.name');
    consider(typeof def.resource==='function'?def.resource():def.resource, layer+'.resource');
    for(const kind of ['upgrades','milestones','achievements','buyables','challenges','clickables']){
      const obj=def[kind];if(!obj||typeof obj!=='object')continue;
      for(const id in obj){
        const item=obj[id];if(!item||typeof item!=='object')continue;
        for(const key of ['title','description','name','text','done','requirement','goal','effectDisplay','costDisplay','display','fullDisplay','requirementDescription','effectDescription','prestigeButtonText','tooltip','name','resource','effect','cost']){
          try{
            const v=item[key];
            if(typeof v==='function') consider(v(),`${layer}.${kind}[${id}].${key}()`);
            else if(typeof v==='string') consider(v,`${layer}.${kind}[${id}].${key}`);
          }catch(e){}
        }
      }
    }
  }
  out.domLines=(document.body.innerText||'').split('\n').map(s=>s.trim())
    .filter(s=>s&&!cjk.test(s)&&tokens(s).length).slice(0,120);
  return out;
});

// 白名单：刻意保留的代号/缩写/文字游戏/公式函数名
const WL=new Set(['dna','intestine','testine','pro','pri','com','one','bb','r','sci','pm','wc','lg','tulinwl','tgwitlcwl','hula','e','x','y','z','n','a','b','c','d','max','min','log','sqrt','cbrt','pow','floor','ceil','abs','sin','cos','tan','ln','exp','mod','bot','if','else','true','false','null','undefined','nan','infinity','off','on']);
const sorted=Object.entries(result.byToken).filter(([w])=>!WL.has(w)).sort((a,b)=>b[1].count-a[1].count);
console.log(`含英文无中文片段 ${result.raw.length} 条，DOM 英文行 ${result.domLines.length}`);
console.log(`\n=== 非白名单英文 token（按频次） ===`);
for(const [w,o] of sorted.slice(0,120)) console.log(`  ${String(o.count).padStart(4)}  ${w}`);
console.log(`\n=== 样本（前 80 条原文） ===`);
result.raw.slice(0,80).forEach(x=>console.log(`  [${x.where}] ${x.text}`));
console.log(`\n=== DOM 英文行 ===`);
result.domLines.slice(0,60).forEach(x=>console.log('  '+x));
console.log('\n页面错误:',errs.length,errs.slice(0,3));
fs.writeFileSync('tools/zh/scan_residual_result.json',JSON.stringify(result,null,2));
await browser.close();server.close();
