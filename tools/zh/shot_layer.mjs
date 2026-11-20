// 打开某个层标签页截图，验证深层文本视觉渲染
import { chromium } from './nodeenv/node_modules/playwright-core/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);if(p==='/')p='/index.html';const fp=path.join(ROOT,p);if(!fp.startsWith(ROOT)){res.writeHead(403);return res.end()}fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);return res.end()}res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'});res.end(d)})});
await new Promise(r=>server.listen(0,r)); const port=server.address().port;
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--no-sandbox','--disable-gpu']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto(`http://localhost:${port}/index.html?lang=zh`,{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForTimeout(4000);
// 解锁氢层并切换到该标签
await page.evaluate(()=>{
  try{
    player.h.unlocked=true; player.h.best=new Decimal(1e10); player.points=new Decimal(1e20);
    player.h.upgrades=[11,12,13,14,15,21,22,23,24,25,31,32,33,34,35];
    showTab('h');
  }catch(e){console.log('unlock err',e.message)}
});
await page.waitForTimeout(2500);
await page.screenshot({path:'tools/zh/shot_layer_zh.png'});
const txt=await page.evaluate(()=>document.body.innerText.slice(0,1500));
console.log('=== 层界面文本 ===\n'+txt);
await browser.close();server.close();
