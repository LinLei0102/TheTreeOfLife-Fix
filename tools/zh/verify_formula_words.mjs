// 验证公式/描述串普通英文词已中文化；遍历所有 layer 所有 tab 抓渲染文本
import { chromium } from './nodeenv/node_modules/playwright-core/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);if(p==='/')p='/index.html';const fp=path.join(ROOT,p);if(!fp.startsWith(ROOT)){res.writeHead(403);return res.end()}fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);return res.end()}res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'});res.end(d)})});
await new Promise(r=>server.listen(0,r)); const port=server.address().port;
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--no-sandbox','--disable-gpu']});
const page=await browser.newPage({viewport:{width:1100,height:900}});
const errs=[]; page.on('pageerror',e=>errs.push(e.message));
const save=fs.readFileSync('save/endgame-v2.069.json','utf8').trim();
await page.addInitScript(s=>{try{localStorage.setItem('tree_of_life',s)}catch(e){}},save);
await page.goto(`http://localhost:${port}/index.html?lang=zh`,{waitUntil:'domcontentloaded'});
await page.waitForTimeout(4000);

// 收集所有 layer 的 display-text / effectDescription / tooltip 渲染文本
const allText=await page.evaluate(()=>{
  const out=[];
  const L=window.layers||{};
  const grab=(fn,label)=>{try{const r=typeof fn==='function'?fn():fn; if(typeof r==='string')out.push([label,r]);}catch(e){}};
  for(const id of Object.keys(L)){
    const d=L[id]||{};
    for(const k of ['effectDescription','tooltip']) grab(d[k],id+'.'+k);
    // milestones
    if(d.milestones) for(const i of Object.keys(d.milestones)){const m=d.milestones[i]; if(m&&typeof m==='object'){grab(m.effectDescription,id+'.milestone['+i+'].effectDescription');grab(m.tooltip,id+'.milestone['+i+'].tooltip');}}
    // upgrades
    if(d.upgrades) for(const i of Object.keys(d.upgrades)){const u=d.upgrades[i]; if(u&&typeof u==='object'){grab(u.description,id+'.upgrade['+i+'].description');grab(u.effectDescription,id+'.upgrade['+i+'].effectDescription');}}
    // achievements
    if(d.achievements) for(const i of Object.keys(d.achievements)){const a=d.achievements[i]; if(a&&typeof a==='object')grab(a.description,id+'.ach['+i+']');}
    // tabFormat 里的 display-text / d-t 函数（公式说明页）
    const walkContent=(content,path)=>{
      if(!Array.isArray(content))return;
      for(const item of content){
        if(typeof item==='function'){grab(item,path+'.fn');continue;}
        if(Array.isArray(item)){
          if((item[0]==='display-text'||item[0]==='d-t')&&typeof item[1]==='function') grab(item[1],path+'.'+item[0]);
          for(const sub of item) if(Array.isArray(sub)||typeof sub==='function') walkContent([sub],path);
        }
      }
    };
    if(d.tabFormat) for(const t of Object.keys(d.tabFormat)){const tab=d.tabFormat[t]; if(tab&&tab.content)walkContent(tab.content,id+'.tab['+t+']');}
    if(d.microtabs) for(const mt of Object.keys(d.microtabs)){for(const t of Object.keys(d.microtabs[mt])){const tab=d.microtabs[mt][t]; if(tab&&tab.content)walkContent(tab.content,id+'.micro['+mt+']['+t+']');}}
  }
  return out;
});

// 普通英文词残留检测（带中文的串里夹这些词）；注意排除 makeBlue 参数/混淆词已不在渲染文本里
const BAD=/\b(Thoughts|resets|Amino Acid|Hydrogen|Phosphorus|seconds played|depth|Mastery 代币|coins|slots)\b/g;
let bad=[];
for(const [label,text] of allText){
  if(!/[\u4e00-\u9fff]/.test(text)) continue;
  const m=text.match(BAD);
  if(m) bad.push([label,[...new Set(m)].join(','),text.slice(0,90)]);
}
console.log('渲染文本总数:',allText.length);
console.log('普通英文词残留:',bad.length);
for(const x of bad.slice(0,30)) console.log('  ',x[0],'|',x[1],'|',x[2]);

// 确认关键中文译文存在
const zh=['sqrt(思想)','cbrt(重置次数)','[重置次数]','log10(10+氨基酸)','log10(氢)','log10(磷)','游玩时间','sqrt(深度)','sqrt(精通代币)','log10(金币'];
const found=new Set();
for(const [label,text] of allText) for(const z of zh) if(text.includes(z)) found.add(z);
console.log('\n中文译文命中:',found.size,'/',zh.length);
for(const z of zh) console.log('  ',found.has(z)?'OK':'--',z);
console.log('\n页面错误:',errs.length,errs.slice(0,3));
await browser.close();server.close();
