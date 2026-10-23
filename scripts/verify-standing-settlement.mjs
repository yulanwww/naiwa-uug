import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/Starrism/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await context.addInitScript(()=>{
 Math.random=()=>.5;window.audit={scores:[],sounds:[],gains:[]};const tags=new WeakMap();
 const Base=AudioContext;window.AudioContext=class extends Base{
  async decodeAudioData(bytes){const length=bytes.byteLength,b=await super.decodeAudioData(bytes);tags.set(b,length===11151?'plus':length===9843?'minus':'egg');return b;}
  createGain(){const g=super.createGain();audit.gains.push(g);return g;}
  createBufferSource(){const s=super.createBufferSource(),start=s.start;s.start=function(...args){const pet=document.querySelector('.pet-sprite');audit.sounds.push({kind:tags.get(s.buffer),time:performance.now(),phase:document.querySelector('.page')?.dataset.phase,animation:pet?.dataset.animation,stable:pet?.dataset.stable});return start.apply(s,args);};return s;}
 };
 const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='affectionByAvatarId'){const pet=document.querySelector('.pet-sprite');audit.scores.push({values:JSON.parse(v),time:performance.now(),phase:document.querySelector('.page')?.dataset.phase,animation:pet?.dataset.animation,stable:pet?.dataset.stable,spring:pet?.dataset.spring,egg:!!document.querySelector('.egg-effect')});}return set.call(this,k,v);};
});
const page=await context.newPage();page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));const report={};
const score=()=>page.locator('.affection-value').innerText();const waitIdle=()=>page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='idle');
async function hit(){const r=await page.locator('.pet-platform').boundingBox();await page.touchscreen.tap(r.x+r.width*.46,r.y+r.height*.54);}
async function triple(){for(let i=0;i<3;i++)await hit();}
try{
 await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>document.querySelector('.pet-sprite')?.dataset.animation==='idle');
 assert.equal(await score(),'0');await triple();
 await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='laughing');assert.equal(await score(),'0');
 await page.waitForFunction(()=>document.querySelector('.pet-sprite').dataset.cycle==='1');assert.equal(await score(),'0');assert.equal(await page.evaluate(()=>audit.sounds.filter(x=>x.kind==='plus').length),0);
 await waitIdle();assert.equal(await score(),'606');assert.equal(await page.locator('.affection-float.positive').innerText(),'+606 ♥');
 let log=await page.evaluate(()=>({scores:audit.scores,sounds:audit.sounds,gains:audit.gains.map(g=>g.gain.value)}));
 assert.equal(log.scores.length,1);assert.equal(log.sounds.filter(x=>x.kind==='plus').length,1);
 for(const entry of log.scores){assert.equal(entry.phase,'recovering');assert.equal(entry.animation,'idle');assert.equal(entry.stable,'true');assert.equal(entry.spring,'0');assert.equal(entry.egg,false);}
 assert(Math.abs(log.sounds.find(x=>x.kind==='plus').time-log.scores[0].time)<20);assert(log.gains.every(v=>v===.5));report.plusAfterStanding=log;
 await page.getByRole('button',{name:'丢臭鸡蛋',exact:true}).click();
 for(let i=0;i<3;i++){
  await hit();await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='eggHit');
  assert.equal(await score(),'606');assert.equal(await page.evaluate(()=>audit.sounds.filter(x=>x.kind==='minus').length),0);assert(await page.getByRole('button',{name:'重置好感度',exact:true}).isDisabled());
  await hit();await waitIdle();assert.equal(await score(),i===2?'0':'606');
 }
 assert.equal(await page.locator('.affection-float.negative').innerText(),'−606 ♥');
 log=await page.evaluate(()=>({scores:audit.scores,sounds:audit.sounds}));assert.equal(log.scores.length,2);assert.equal(log.sounds.filter(x=>x.kind==='egg').length,3);assert.equal(log.sounds.filter(x=>x.kind==='plus').length,1);
 assert.equal(log.scores[1].phase,'recovering');assert.equal(log.scores[1].animation,'idle');assert.equal(log.scores[1].stable,'true');assert.equal(log.scores[1].egg,false);const minus=log.sounds.filter(x=>x.kind==='minus');assert.equal(minus.length,1);assert.equal(minus[0].animation,'idle');assert.equal(minus[0].stable,'true');assert.equal(minus[0].phase,'recovering');assert(Math.abs(minus[0].time-log.scores[1].time)<20);report.minusSoundAtStandingSettlement=minus;report.debitAfterEffectsAndStanding=log.scores[1];
 await page.getByRole('button',{name:'重置好感度',exact:true}).click();await page.getByRole('button',{name:'确认重置',exact:true}).click();assert.equal(await page.evaluate(()=>audit.sounds.filter(x=>x.kind==='plus').length),1);assert.equal(await page.evaluate(()=>audit.sounds.filter(x=>x.kind==='minus').length),1);report.resetSilent=true;
 await page.getByRole('button',{name:/^头像库/}).click();await page.getByRole('button',{name:'解锁隐藏头像',exact:true}).click();await page.getByLabel('解锁口令').fill('uugnb');await page.getByRole('button',{name:'解锁',exact:true}).click();await page.getByRole('button',{name:'使用 忆安',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'关闭',exact:true}).click();assert.equal(await score(),'0');assert.equal(await page.evaluate(()=>audit.sounds.filter(x=>x.kind==='plus').length),1);
 await page.getByRole('button',{name:'拍肚子',exact:true}).click();await triple();await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='laughing');await waitIdle();assert.equal(await score(),'606');
 const map=await page.evaluate(()=>JSON.parse(localStorage.getItem('affectionByAvatarId')));assert.equal(map.original,'0');assert.equal(map['builtin-friend-05'],'606');assert.equal(await page.evaluate(()=>audit.sounds.filter(x=>x.kind==='plus').length),2);assert.equal(await page.evaluate(()=>audit.sounds.filter(x=>x.kind==='minus').length),1);report.avatarIndependent=true;
 await page.reload();await page.waitForFunction(()=>document.querySelector('.stage-heading span:last-child').textContent==='忆安');assert.equal(await score(),'606');assert.equal(await page.evaluate(()=>audit.sounds.length),0);report.refreshSilent=true;
 await page.getByRole('button',{name:'拍肚子',exact:true}).click();await triple();await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='laughing');await page.reload();await page.waitForFunction(()=>document.querySelector('.stage-heading span:last-child').textContent==='忆安');assert.equal(await score(),'606');report.interruptedAnimationNoSettlement=true;
 assert.deepEqual(errors,[]);report.errors=errors;report.realPhoneTest=false;writeFileSync('D:/naiwa/docs/standing-settlement-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
