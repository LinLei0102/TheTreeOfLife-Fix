// 验证本轮补漏：化学说明、挑战按钮、里程碑、资源单位、公式链、标题
import { chromium } from './nodeenv/node_modules/playwright-core/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);if(p==='/')p='/index.html';const fp=path.join(ROOT,p);if(!fp.startsWith(ROOT)){res.writeHead(403);return res.end()}fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);return res.end()}res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'});res.end(d)})});
await new Promise(r=>server.listen(0,r));
const port=server.address().port;
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--no-sandbox','--disable-gpu']});
const page=await browser.newPage({viewport:{width:900,height:600}});
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(`http://localhost:${port}/index.html?lang=zh`,{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForTimeout(3500);
const save=fs.readFileSync('save/endgame-v2.069.json','utf8').trim();
await page.evaluate(s=>localStorage.setItem('tree_of_life',s),save);
await page.reload({waitUntil:'domcontentloaded'});
await page.waitForTimeout(4000);

const r=await page.evaluate(()=>{
  const out={};
  const cjk=s=>/[\u4e00-\u9fff]/.test(String(s));
  out.chemEffectsTotal=Object.keys(chemInitialEffects).length;
  out.chemEffectsZh=Object.values(chemInitialEffects).filter(cjk).length;
  out.chemNamesZh=Object.values(chemAbbrev).filter(cjk).length;
  out.challengeButtons=['Start','Completed','Finish'].map(()=>null);
  try{ out.challengeButtons[0]=typeof challengeButtonText==='function'?challengeButtonText('hu',11):'NOFN'; }catch(e){out.challengeButtons[0]='ERR:'+e.message}
  try{ out.huMilestone2=layers.hu.milestones[2].requirementDescription(); }catch(e){out.huMilestone2='ERR:'+e.message}
  try{ out.huMilestone3=layers.hu.milestones[3].requirementDescription(); }catch(e){out.huMilestone3='ERR:'+e.message}
  try{ out.challFull=layers.hu.challenges[11].fullDisplay(); }catch(e){out.challFull='ERR:'+e.message}
  try{ out.chemFocus=layers.chem.clickables[15].title(); }catch(e){out.chemFocus='ERR:'+e.message}
  try{ out.widget=layers.r.buyables[11].title(); }catch(e){out.widget='ERR:'+e.message}
  try{ out.miniFood=layers.mini.upgrades[11].title(); }catch(e){out.miniFood='ERR:'+e.message}
  try{ out.miniColor=layers.mini.buyables[11].title; }catch(e){out.miniColor='ERR:'+e.message}
  try{ out.tokenTooltip=typeof layers.tokens.tooltip==='function'?layers.tokens.tooltip():'NOFN'; }catch(e){out.tokenTooltip='ERR:'+e.message}
  out.englishLeftovers=0;
  const scan=s=>{if(typeof s==='string'&&/\b(Completions|buildings|Decaseconds|Widgets|Mastery Tokens|Start|Requires)\b/.test(s))out.englishLeftovers++};
  scan(out.challFull);scan(out.chemFocus);scan(out.tokenTooltip);
  return out;
});
console.log(JSON.stringify(r,null,2));
console.log('页面错误:',errs.length,errs.slice(0,3));
await browser.close();server.close();
