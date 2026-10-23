import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/Starrism/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await context.addInitScript(()=>{
 Math.random=()=>.5;window.eggSoundLog={starts:[],gains:[],durations:[]};
 const Base=window.AudioContext;
 window.AudioContext=class extends Base{
  createGain(){const g=super.createGain();window.eggSoundLog.gains.push(g);return g;}
  async decodeAudioData(bytes){const b=await super.decodeAudioData(bytes);window.eggSoundLog.durations.push(b.duration);return b;}
  createBufferSource(){const s=super.createBufferSource(),start=s.start;s.start=function(...args){const c=document.querySelector('.egg-effect');window.eggSoundLog.starts.push({time:performance.now(),elapsed:Number(c?.dataset.elapsed),target:c?.dataset.target,rate:s.playbackRate.value,loop:s.loop});return start.apply(s,args);};return s;}
 };
});
const page=await context.newPage();page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));const report={};
const map=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('affectionByAvatarId')));
const score=()=>page.locator('.affection-value').innerText();
const reset=()=>page.getByRole('button',{name:'重置好感度',exact:true});
const waitIdle=()=>page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='idle');
async function ready(){await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>Array.from(document.querySelectorAll('button')).some(b=>b.textContent.startsWith('头像库')&&!b.disabled));}
async function choose(name){await page.getByRole('button',{name:/^头像库/}).click();await page.getByRole('button',{name:'使用 '+name,exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'关闭',exact:true}).click();}
async function zero(name){await reset().click();const dialog=page.getByRole('dialog',{name:'重置'+name+'的好感度？'});await dialog.waitFor();assert(await page.getByRole('button',{name:/^头像库/}).isDisabled());await dialog.getByRole('button',{name:'确认重置',exact:true}).click();await dialog.waitFor({state:'hidden'});assert.equal(await score(),'0');}
async function hit(x=.5,y=.5){const r=await page.locator('.pet-platform').boundingBox();await page.touchscreen.tap(r.x+r.width*x,r.y+r.height*y);}
try{
 await ready();await page.evaluate(async()=>{
  localStorage.setItem('affectionByAvatarId',JSON.stringify({original:'632','builtin-friend-01':'-26','builtin-friend-05':'606','builtin-friend-08':'5408','personal-reset-test':'-32'}));
  const {saveFace,writeFriendsUnlocked}=await import('/src/features/faces/storage.js');const c=document.createElement('canvas');c.width=80;c.height=80;c.getContext('2d').fillRect(0,0,80,80);
  await saveFace({id:'personal-reset-test',name:'上传测试',source:c.toDataURL(),updatedAt:Date.now()});await writeFriendsUnlocked();
 });await ready();assert.equal(await score(),'632');
 for(const cancel of ['取消','关闭','Escape']){await reset().click();if(cancel==='Escape')await page.keyboard.press('Escape');else await page.getByRole('dialog').getByRole('button',{name:cancel,exact:true}).click();assert.equal(await score(),'632');}
 report.cancelCloseEscapeDoNotReset=true;
 await choose('阿蛋');const beforeAdan=await map();await zero('阿蛋');assert.deepEqual(await map(),{...beforeAdan,'builtin-friend-01':'0'});report.onlyAdanReset=true;
 await choose('忆安');const beforeYian=await map();await reset().click();await page.screenshot({path:'D:/naiwa/docs/reset-affection-confirm.png',fullPage:true});await page.getByRole('button',{name:'确认重置',exact:true}).click();assert.deepEqual(await map(),{...beforeYian,'builtin-friend-05':'0'});report.onlyYianReset=true;
 await choose('上传测试');const beforePersonal=await map();await zero('上传测试');assert.deepEqual(await map(),{...beforePersonal,'personal-reset-test':'0'});report.personalNegativeReset=true;
 await page.getByRole('button',{name:'恢复原版',exact:true}).click();const beforeOriginal=await map();await zero('原版奶娃');assert.deepEqual(await map(),{...beforeOriginal,original:'0'});report.originalPositiveReset=true;
 await ready();assert.equal(await score(),'0');assert.equal((await map())['builtin-friend-08'],'5408');report.resetPersistsAndOtherScoresUnchanged=true;
 await page.waitForFunction(()=>window.eggSoundLog.durations.length>0);
 await page.getByRole('button',{name:'丢臭鸡蛋',exact:true}).click();assert.equal(await page.evaluate(()=>eggSoundLog.starts.length),0);
 for(let i=0;i<3;i++){
  await hit(.3+i*.2,.25+i*.2);await page.waitForFunction(()=>document.querySelector('.egg-effect')?.dataset.stage==='flight');
  assert.equal(await page.evaluate(()=>eggSoundLog.starts.length),i);assert(await reset().isDisabled());
  await hit(.1,.1); // ignored while busy
  await page.waitForFunction(n=>eggSoundLog.starts.length===n,i+1);
  const last=await page.evaluate(()=>eggSoundLog.starts.at(-1));assert(last.elapsed>=420&&last.elapsed<550);assert.equal(last.rate,1);assert.equal(last.loop,false);
  if(i<2)assert.equal(await score(),'0');else assert.equal(await score(),'-606');await waitIdle();
 }
 assert.equal(await page.evaluate(()=>eggSoundLog.starts.length),3);
 const log=await page.evaluate(()=>({starts:eggSoundLog.starts,gains:eggSoundLog.gains.map(g=>g.gain.value),durations:eggSoundLog.durations}));assert(log.gains.every(v=>v===.5));
 report.eggSound={...log,modeAndFlightSilent:true,eachImpactOnce:true};
 await zero('原版奶娃');await page.getByRole('button',{name:'拍肚子',exact:true}).click();
 for(let i=0;i<3;i++){await hit(.46,.54);assert(await reset().isDisabled());}
 await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='laughing');assert(await reset().isDisabled());await waitIdle();assert.equal(await score(),'606');await zero('原版奶娃');await page.waitForTimeout(500);assert.equal(await score(),'0');report.interactionBlocksResetAndNoLateSettlement=true;report.postResetEggDebitAndBellyReward=true;
 // Loading failure never blocks impact/score. Reload with an aborted audio request.
 await page.route('**/audio/egg-crack.mp3',route=>route.abort());await ready();await page.getByRole('button',{name:'丢臭鸡蛋',exact:true}).click();
 for(let i=0;i<3;i++){await hit();await waitIdle();}assert.equal(await score(),'-606');report.failedAudioDoesNotBlockScoring=true;
 assert.deepEqual(await page.locator('audio').evaluateAll(a=>a.map(x=>x.volume)),[.5,.5]);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);report.mobileViewportNoOverflow=true;report.browserErrors=errors;report.realPhoneTest=false;
 writeFileSync('D:/naiwa/docs/reset-audio-test-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
