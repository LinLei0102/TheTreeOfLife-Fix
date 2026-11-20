// 复现用户截图场景：残局存档 + 动物层 Milestones 标签
import { chromium } from './nodeenv/node_modules/playwright-core/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);if(p==='/')p='/index.html';const fp=path.join(ROOT,p);if(!fp.startsWith(ROOT)){res.writeHead(403);return res.end()}fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);return res.end()}res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'});res.end(d)})});
await new Promise(r=>server.listen(0,r)); const port=server.address().port;
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--no-sandbox','--disable-gpu']});
const page=await browser.newPage({viewport:{width:900,height:500}});
const errs=[]; page.on('pageerror',e=>errs.push(e.message));
const url=`http://localhost:${port}/index.html?lang=zh`;
await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForTimeout(3500);
await page.evaluate(()=>{
  try{
    player.an.unlocked=true;
    player.an.times=35;
    player.an.upgrades=Object.keys(layers.an.upgrades||{}).map(Number);
    player.keepGoing=true;
    if(window.tmp) tmp.gameEnded=false;
    player.notify={};
    player.subtabs.an.mainTabs='Milestones';
    showTab('an');
    updateTabFormats();
    window.scrollTo(0,0);
  }catch(e){console.log('nav err '+e.message)}
});
await page.waitForTimeout(1500);
await page.evaluate(()=>{
  document.querySelectorAll('.popup').forEach(e=>e.remove());
  document.querySelectorAll('*').forEach(el=>{if(el.scrollTop) el.scrollTop=0;});
  window.scrollTo(0,0);
});
await page.waitForTimeout(200);
const text=await page.evaluate(()=>document.body.innerText);
await page.screenshot({path:'tools/zh/shot_animal_milestones.png'});
console.log('=== 可见文本 ===\n'+text.slice(0,1200));
console.log('页面错误:',errs.length,errs.slice(0,3));
await browser.close();server.close();
