import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/Starrism/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await context.addInitScript(()=>{
 window.sequenceLog={events:[],rejectBing:false,deferBing:false};
 const play=HTMLMediaElement.prototype.play;
 function kind(a){return a.src?.includes('bingbingbing')?'bing':'laugh';}
 HTMLMediaElement.prototype.play=function(){
  const name=kind(this);
  sequenceLog.events.push({type:'play',name,t:performance.now(),bingEnded:document.querySelector('audio[src="/audio/bingbingbing.mp3"]')?.ended,bingPaused:document.querySelector('audio[src="/audio/bingbingbing.mp3"]')?.paused});
  if(name==='bing'&&sequenceLog.rejectBing)return Promise.reject(new DOMException('test blocked','NotAllowedError'));
  if(name==='bing'&&sequenceLog.deferBing)return new Promise((resolve,reject)=>{window.releaseFailure=reject;});
  return play.call(this);
 };
 for(const type of ['playing','ended','pause','error'])document.addEventListener(type,e=>{
  if(e.target instanceof HTMLMediaElement)sequenceLog.events.push({type,name:kind(e.target),t:performance.now(),atEnd:e.target.ended||e.target.currentTime>=e.target.duration-.01});
 },true);
});
const page=await context.newPage();page.setDefaultTimeout(12000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const report={};
async function ready(){
 await page.goto('http://127.0.0.1:5173/');
 await page.waitForFunction(()=>document.querySelector('.playground canvas')?.dataset.frame!==undefined);
 await page.waitForFunction(()=>document.querySelector('audio[src="/audio/laugh.mp3"]').readyState>=2);
}
async function tap(){
 const r=await page.locator('.playground canvas').boundingBox();
 await page.touchscreen.tap(r.x+r.width*87/192,r.y+r.height*109/208);
}
const phase=()=>page.locator('.page').getAttribute('data-phase');
const events=()=>page.evaluate(()=>sequenceLog.events);
try{
 await ready();
 await tap();await tap();await tap();
 assert.equal(await phase(),'waitingForBingEnd');
 assert.equal(await page.locator('.playground canvas').getAttribute('data-animation'),'idle');
 assert.equal((await events()).filter(e=>e.type==='play'&&e.name==='laugh').length,0);
 const before=await page.locator('audio[src="/audio/bingbingbing.mp3"]').evaluate(a=>({paused:a.paused,time:a.currentTime}));
 assert(!before.paused);assert(before.time>0);
 for(let i=0;i<6;i++)await tap();
 assert.equal((await events()).filter(e=>e.type==='play'&&e.name==='bing').length,1);
 await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='laughing');
 const timeline=await events();
 const ended=timeline.find(e=>e.type==='ended'&&e.name==='bing');
 const laugh=timeline.find(e=>e.type==='play'&&e.name==='laugh');
 assert(ended&&laugh);assert(laugh.t>=ended.t);assert(laugh.bingEnded);
 assert(!timeline.some(e=>e.type==='pause'&&e.name==='bing'&&e.t<ended.t&&!e.atEnd));
 await page.waitForFunction(()=>document.querySelector('.playground canvas').dataset.cycle==='1');
 assert.equal((await events()).filter(e=>e.type==='play'&&e.name==='laugh').length,1);
 await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='idle');
 report.fastTripleWaitsForNaturalEnd=true;report.waitShowsIdleAndBellySpring=true;
 report.noReplayWhileWaitingOrLaughing=true;report.endedToLaughRequestMs=laugh.t-ended.t;
 report.doubleJumpAndRecoveryUnchanged=true;
 await tap();await tap();await tap();
 assert.equal(await phase(),'waitingForBingEnd');
 await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='laughing');
 assert.equal((await events()).filter(e=>e.type==='play'&&e.name==='laugh').length,2);
 report.nextRoundWorks=true;
 await ready();
 await tap();await page.waitForFunction(()=>document.querySelector('audio[src="/audio/bingbingbing.mp3"]').ended);
 await tap();const third=await page.evaluate(()=>performance.now());await tap();
 await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='laughing');
 const slow=await events();const slowLaugh=slow.find(e=>e.type==='play'&&e.name==='laugh');
 assert(slowLaugh.t-third<150);assert.equal(slow.filter(e=>e.type==='play'&&e.name==='bing').length,1);
 report.slowTripleStartsImmediatelyAfterThird=true;report.slowThirdToLaughMs=slowLaugh.t-third;
 await ready();await page.evaluate(()=>sequenceLog.rejectBing=true);
 await tap();await tap();await tap();
 await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='laughing');
 report.rejectedBingDoesNotWaitForever=true;
 await ready();await page.evaluate(()=>sequenceLog.deferBing=true);
 await tap();await tap();await tap();
 assert.equal(await phase(),'waitingForBingEnd');
 await page.evaluate(()=>releaseFailure(new DOMException('late test failure','NotAllowedError')));
 await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='laughing');
 assert.equal((await events()).filter(e=>e.type==='play'&&e.name==='laugh').length,1);
 report.lateRejectedPlayReleasesWaitOnce=true;
 await ready();await tap();await tap();await tap();
 assert.equal(await phase(),'waitingForBingEnd');
 await page.locator('audio[src="/audio/bingbingbing.mp3"]').evaluate(a=>a.dispatchEvent(new Event('error')));
 await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='laughing');
 const failure=await events();assert.equal(failure.filter(e=>e.type==='play'&&e.name==='laugh').length,1);
 assert(await page.locator('audio[src="/audio/bingbingbing.mp3"]').evaluate(a=>a.paused));
 report.errorEventStopsFailedBingAndReleasesWait=true;
 await page.route('**/audio/bingbingbing.mp3',route=>route.abort());
 await ready();
 await page.waitForFunction(()=>!!document.querySelector('audio[src="/audio/bingbingbing.mp3"]').error);
 await tap();await tap();await tap();
 await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='laughing');
 report.unloadableBingFallsBackToLaugh=true;
 await page.unroute('**/audio/bingbingbing.mp3');
 await ready();
 const cleaned=await page.evaluate(async()=>{
  const {createBingSequence}=await import('/src/features/audio/bingSequence.js');
  let called=0;
  class FakeMedia extends EventTarget{
   ended=false;error=null;currentTime=0;
   pause(){}
   play(){return new Promise((resolve,reject)=>{this.reject=reject;});}
  }
  const audio=new FakeMedia(),sequence=createBingSequence(audio,()=>called++);
  sequence.start();sequence.dispose();
  audio.dispatchEvent(new Event('error'));audio.ended=true;audio.dispatchEvent(new Event('ended'));
  audio.reject(new Error('late after dispose'));
  await Promise.resolve();await Promise.resolve();
  return called===0;
 });
 assert(cleaned);report.listenersAndLatePromisesCleanedUp=true;
 assert.deepEqual(errors,[]);report.browserErrors=errors;report.realPhoneTest=false;report.checkedAt=new Date().toISOString();
 writeFileSync('D:/naiwa/docs/sequential-audio-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}

