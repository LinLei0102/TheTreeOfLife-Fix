// 浏览器实测：加载中文版，检查报错、中文覆盖、截图
import { chromium } from './nodeenv/node_modules/playwright-core/index.mjs';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
const server = http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p==='/') p='/index.html';
  const fp = path.join(ROOT, p);
  if (!fp.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(fp,(e,d)=>{
    if(e){res.writeHead(404);return res.end('404');}
    res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'});
    res.end(d);
  });
});
await new Promise(r=>server.listen(0,r));
const port = server.address().port;
console.log('server port', port);

const browser = await chromium.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
  args: ['--no-sandbox','--disable-gpu']
});
const page = await browser.newPage({ viewport:{width:1440,height:900} });
const errors=[];
page.on('pageerror', e=>errors.push('PAGEERROR: '+e.message));
page.on('console', m=>{ if(m.type()==='error') errors.push('CONSOLE: '+m.text()); });

async function scan(label, url, shot){
  console.log('\n===',label,'===');
  errors.length=0;
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(6000);
  // 采样可见文本
  const info = await page.evaluate(()=>{
    const txt = document.body.innerText || '';
    const cjk = (txt.match(/[\u4e00-\u9fff]/g)||[]).length;
    const latin = (txt.match(/[A-Za-z]/g)||[]).length;
    const chunks = txt.split('\n').map(s=>s.trim()).filter(Boolean);
    return {
      cjk, latin,
      sample: chunks.slice(0,25),
      appPresent: !!document.querySelector('#app'),
      vueReady: !!(window.tmp && window.player)
    };
  });
  console.log('CJK字符:',info.cjk,' 拉丁字符:',info.latin,' #app:',info.appPresent,' 引擎就绪:',info.vueReady);
  console.log('文本样本:', JSON.stringify(info.sample.slice(0,15),null,0));
  console.log('错误数:',errors.length);
  errors.slice(0,10).forEach(e=>console.log('  ',e.slice(0,180)));
  await page.screenshot({path:shot, fullPage:false});
  console.log('截图:',shot);
}

await scan('中文版', `http://localhost:${port}/index.html?lang=zh`, 'tools/zh/shot_zh.png');
await scan('英文版', `http://localhost:${port}/en/index.html?lang=en`, 'tools/zh/shot_en.png');

await browser.close();
server.close();
