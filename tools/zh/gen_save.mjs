import { chromium } from './nodeenv/node_modules/playwright-core/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.');
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
const server=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';const f=path.join(ROOT,p);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});r.end(d)})});
await new Promise(r=>server.listen(0,r));const port=server.address().port;
const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--no-sandbox','--disable-gpu']});
const page=await b.newPage();
await page.goto(`http://localhost:${port}/index.html?lang=zh`,{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForTimeout(4000);
const b64=await page.evaluate(()=>{
  try{
    // 解锁所有层 + 大量资源
    for(const layer of LAYERS){
      if(player[layer]){
        player[layer].unlocked=true;
        if(player[layer].points!==undefined) player[layer].points=new Decimal('1e100');
        if(player[layer].best!==undefined) player[layer].best=new Decimal('1e100');
        if(player[layer].total!==undefined) player[layer].total=new Decimal('1e100');
        if(Array.isArray(player[layer].upgrades)) player[layer].upgrades=Object.keys(layers[layer].upgrades||{}).map(Number);
        if(Array.isArray(player[layer].milestones)) player[layer].milestones=Object.keys(layers[layer].milestones||{}).map(Number);
        if(Array.isArray(player[layer].achievements)) player[layer].achievements=Array.from({length:100},(_,i)=>i+1);
      }
    }
    player.points=new Decimal('1e300');
    return btoa(unescape(encodeURIComponent(JSON.stringify(player))));
  }catch(e){return 'ERR:'+e.message}
});
fs.writeFileSync('save/endgame-v2.069.json',b64);
console.log('存档字节:',b64.length, b64.startsWith('ERR')?b64.slice(0,100):'');
await b.close();server.close();
