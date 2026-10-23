import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/Starrism/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await context.addInitScript(()=>{
 Math.random=()=>.5;window.audit={starts:[],stops:[],scores:[],active:new Set(),gains:[],decoded:0};const kinds=new WeakMap();
 const Base=AudioContext;window.AudioContext=class extends Base{
  async decodeAudioData(bytes){const size=bytes.byteLength,b=await super.decodeAudioData(bytes);kinds.set(b,size===9843?'minus':size===11151?'plus':'crack');audit.decoded++;return b;}
  createGain(){const g=super.createGain();audit.gains.push(g);return g;}
  createBufferSource(){const node=super.createBufferSource(),start=node.start,stop=node.stop;node.start=function(...args){const kind=kinds.get(node.buffer);audit.starts.push({kind,t:performance.now(),peers:[...audit.active].map(n=>kinds.get(n.buffer)),phase:document.querySelector('.page')?.dataset.phase,eggCount:document.querySelectorAll('.egg-effect').length,stable:document.querySelector('.pet-sprite')?.dataset.stable});audit.active.add(node);node.addEventListener('ended',()=>audit.active.delete(node),{once:true});return start.apply(node,args);};node.stop=function(...args){audit.stops.push(kinds.get(node.buffer));audit.active.delete(node);return stop.apply(node,args);};return node;}
 };
 const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='affectionByAvatarId')audit.scores.push({value:JSON.parse(v),t:performance.now(),phase:document.querySelector('.page').dataset.phase,stable:document.querySelector('.pet-sprite').dataset.stable,eggs:document.querySelectorAll('.egg-effect').length});return set.call(this,k,v);};
});
const page=await context.newPage();page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));const report={};
const score=()=>page.locator('.affection-value').innerText();const idle=()=>page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='idle');
async function tap(u,v){const r=await page.locator('.pet-platform').boundingBox();await page.touchscreen.tap(r.x+r.width*u,r.y+r.height*v);}
async function burst(n){for(let i=0;i<n;i++)await tap(.2+(i%3)*.3,.2+(i%3)*.25);}
try{
 await page.goto(process.env.NAIWA_PREVIEW_URL||'http://127.0.0.1:5173/');await page.waitForFunction(()=>document.querySelector('.pet-sprite')?.dataset.animation==='idle'&&audit.decoded>=3);
 await page.getByRole('button',{name:'丢臭鸡蛋',exact:true}).click();assert.equal(await page.locator('.egg-effect').count(),0);
 let expected=0,totalEggs=0,totalDebits=0;
 for(const n of [3,6,9]){
  const before=await page.evaluate(()=>audit.starts.length);await burst(n);
  assert.equal(await page.locator('.egg-effect').count(),n);
  await page.waitForFunction(n=>[...document.querySelectorAll('.egg-effect')].filter(c=>c.dataset.stage==='flight').length===n,n);
  const targets=await page.locator('.egg-effect').evaluateAll(cs=>cs.map(c=>JSON.parse(c.dataset.target)));assert.equal(new Set(targets.map(p=>p.x)).size,3);
  assert(await page.getByRole('button',{name:/^头像库/}).isDisabled());assert(await page.getByRole('button',{name:'重置好感度',exact:true}).isDisabled());assert(await page.getByRole('button',{name:'拍肚子',exact:true}).isDisabled());
  await page.waitForFunction(n=>audit.starts.filter(a=>a.kind==='crack').length===n,totalEggs+n);
  assert.equal(await score(),String(expected));
  if(n===9){await page.screenshot({path:'D:/naiwa/docs/concurrent-eggs.png',fullPage:true});}
  await idle();expected-=n/3*606;totalEggs+=n;totalDebits+=n/3;
  assert.equal(await score(),String(expected));assert.equal(await page.locator('.affection-float.negative').count(),n/3);
  const log=await page.evaluate(()=>({starts:audit.starts,stops:audit.stops,scores:audit.scores}));
  assert.equal(log.starts.filter(a=>a.kind==='crack').length,totalEggs);assert.equal(log.starts.filter(a=>a.kind==='minus').length,totalDebits);assert.equal(log.scores.length,totalDebits);
  assert.deepEqual(log.stops,[]);
  for(const entry of log.scores){assert.equal(entry.phase,'recovering');assert.equal(entry.stable,'true');assert.equal(entry.eggs,0);}
  report['burst'+n]={concurrent:n,targets,score:expected,debits:n/3};
  await page.waitForTimeout(1150);
 }
 const voices=await page.evaluate(()=>audit.starts);assert(voices.some(a=>a.kind==='crack'&&a.peers.includes('crack')));assert(voices.some(a=>a.kind==='minus'&&a.peers.includes('crack')));assert(voices.some(a=>a.kind==='minus'&&a.peers.includes('minus')));report.crackAndMinusPolyphony=true;
 // Throw while a prior debit is still sounding: a new impact must not stop it.
 await burst(3);await idle();await tap(.5,.4);await page.waitForFunction(n=>audit.starts.filter(a=>a.kind==='crack').length===n,totalEggs+4);await idle();
 assert.deepEqual(await page.evaluate(()=>audit.stops),[]);report.newImpactsDoNotStopMinus=true;
 await page.waitForTimeout(1300);assert.equal(await page.evaluate(()=>audit.active.size),0);report.sourcesCleanedAfterEnded=true;
 await page.getByRole('button',{name:'重置好感度',exact:true}).click();await page.getByRole('button',{name:'确认重置',exact:true}).click();assert.equal(await score(),'0');
 await page.getByRole('button',{name:/^头像库/}).click();await page.getByRole('button',{name:'解锁隐藏头像',exact:true}).click();await page.getByLabel('解锁口令').fill('uugnb');await page.getByRole('button',{name:'解锁',exact:true}).click();await page.getByRole('button',{name:'使用 忆安',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'关闭',exact:true}).click();await burst(6);await idle();assert.equal(await score(),'-1212');
 const map=await page.evaluate(()=>JSON.parse(localStorage.getItem('affectionByAvatarId')));assert.equal(map.original,'0');assert.equal(map['builtin-friend-05'],'-1212');report.avatarIdsIsolated=true;
 await page.getByRole('button',{name:'拍肚子',exact:true}).click();for(let i=0;i<3;i++)await tap(.46,.54);await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='laughing');await page.waitForFunction(()=>document.querySelector('.pet-sprite').dataset.cycle==='1');await idle();assert.equal(await score(),'-606');report.bellyDoubleJumpAndPlusPreserved=true;
 assert(await page.evaluate(()=>audit.gains.every(g=>g.gain.value===.5)));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);report.errors=errors;report.realPhoneTest=false;
 writeFileSync('D:/naiwa/docs/concurrent-eggs-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
