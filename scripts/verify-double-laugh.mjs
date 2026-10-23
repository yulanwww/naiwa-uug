import {createRequire} from 'node:module';
import {writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {ANIMATIONS,frameAt,durationOf} from '../src/pet/animations.js';
assert.equal(durationOf(ANIMATIONS.laugh),3000);
assert.deepEqual([0,300,600,900,1200,1500,1800,2100,2400,2700,3000].map(t=>frameAt(ANIMATIONS.laugh,t)),[0,1,2,3,4,0,1,2,3,4,4]);
const require=createRequire('C:/Users/Starrism/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await context.addInitScript(()=>{
 window.soundLog={calls:[],playing:[],ended:[],errors:[]};
 const play=HTMLMediaElement.prototype.play;
 HTMLMediaElement.prototype.play=function(){
   const name=this.src.includes('bingbingbing.mp3')?'slap':this.src.includes('/laugh.mp3')?'laugh':'other';
   soundLog.calls.push({name,t:performance.now(),activated:navigator.userActivation.isActive});
   const result=play.call(this);result?.catch(e=>soundLog.errors.push(e.name));return result;
 };
 document.addEventListener('playing',e=>soundLog.playing.push({src:e.target.src,t:performance.now()}),true);
 document.addEventListener('ended',e=>soundLog.ended.push({src:e.target.src,t:performance.now()}),true);
});
const page=await context.newPage();page.setDefaultTimeout(12000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const report={};
async function ready(){
 await page.goto('http://127.0.0.1:5173/');
 await page.waitForFunction(()=>document.querySelector('.playground canvas')?.dataset.frame!==undefined);
 await page.waitForFunction(()=>Array.from(document.querySelectorAll('audio')).every(a=>a.readyState>=2));
}
async function tap(){
 const r=await page.locator('.playground canvas').boundingBox();
 await page.touchscreen.tap(r.x+r.width*87/192,r.y+r.height*109/208);
}
try{
 await ready();
 const response=await page.request.get('http://127.0.0.1:5173/audio/laugh.mp3');
 assert.equal(response.status(),200);
 const hash=createHash('sha256').update(await response.body()).digest('hex');
 assert.equal(hash,createHash('sha256').update(readFileSync('D:/Downloads/naiwa_laugh.mp3')).digest('hex'));
 report.sourceAudioHash=hash;
 report.audioDurations=await page.locator('audio').evaluateAll(nodes=>nodes.map(a=>({src:a.getAttribute('src'),duration:a.duration,rate:a.playbackRate,loop:a.loop})));
 console.log('AUDIO METADATA',JSON.stringify(report.audioDurations));
 await page.evaluate(async()=>{
  const {saveFace,writeActive}=await import('/src/features/faces/storage.js');
  const c=document.createElement('canvas');c.width=180;c.height=260;c.getContext('2d').fillRect(0,0,180,260);
  const face={id:'jump-face',name:'跳跃跟随测试',source:c.toDataURL(),crop:{x:0,y:0,zoom:1},placement:{x:1,y:2,scale:1},anchors:{},updatedAt:1};
  await saveFace(face);await writeActive(face.id);
 });
 await ready();
 await page.waitForFunction(()=>document.querySelector('.playground canvas').dataset.face==='true');
 await page.evaluate(()=>{
  window.motionSamples=[];window.motionDone=false;let prev='',wasLaugh=false;
  function sample(){
   const c=document.querySelector('.playground canvas');
   const action=c.dataset.animation,frame=c.dataset.frame,cycle=c.dataset.cycle;
   const key=action+':'+cycle+':'+frame;
   if(key!==prev){
    motionSamples.push({action,frame:Number(frame),cycle:Number(cycle),elapsed:Number(c.dataset.elapsed),anchor:JSON.parse(c.dataset.anchor),face:c.dataset.face,t:performance.now()});prev=key;
   }
   if(action==='laugh')wasLaugh=true;
   if(wasLaugh&&action==='idle'){window.motionDone=true;return;}
   requestAnimationFrame(sample);
  }
  requestAnimationFrame(sample);
 });
 await tap();await tap();await tap();
 await page.waitForFunction(()=>document.querySelector('.playground canvas').dataset.animation==='laugh');
 assert(await page.locator('audio[src="/audio/bingbingbing.mp3"]').evaluate(a=>a.paused));
 for(let i=0;i<5;i++)await tap();
 await page.waitForFunction(()=>motionDone);
 const first=await page.evaluate(()=>({motion:motionSamples,logs:soundLog}));
 const jumped=first.motion.filter(s=>s.action==='laugh');
 assert.deepEqual(jumped.map(s=>s.frame),[0,1,2,3,4,0,1,2,3,4]);
 assert.deepEqual(jumped.map(s=>s.cycle),[0,0,0,0,0,1,1,1,1,1]);
 const start=jumped[0].t-jumped[0].elapsed;
 const second=jumped.find(s=>s.cycle===1).t;
 const end=first.motion.find(s=>s.action==='idle'&&s.t>second).t;
 const timing={firstMs:second-start,secondMs:end-second,totalMs:end-start};
 assert(Math.abs(timing.firstMs-1500)<80);assert(Math.abs(timing.secondMs-1500)<80);assert(Math.abs(timing.totalMs-3000)<80);
 const laughCalls=first.logs.calls.filter(c=>c.name==='laugh');
 assert.equal(laughCalls.length,1);assert.equal(first.logs.calls.filter(c=>c.name==='slap').length,1);
 const actualPlaying=first.logs.playing.find(c=>c.src.endsWith('/laugh.mp3'));
 assert(actualPlaying);
 assert(Math.abs(laughCalls[0].t-start)<40);
 report.timing=timing;report.frameSequence=jumped.map(s=>s.frame);
 report.audioRequestOffsetMs=laughCalls[0].t-start;
 report.audioPlayingOffsetMs=actualPlaying.t-start;
 report.oneLaughPlayForBothJumps=true;report.slapStoppedWhenLaughStarts=true;
 const {getFaceAnchor}=await import('../src/pet/anchors.js');
 for(const s of jumped){
  assert.equal(s.face,'true');assert.deepEqual(s.anchor,getFaceAnchor('laugh',s.frame,{placement:{x:1,y:2,scale:1}}));
  assert.equal(s.anchor.w,s.anchor.h);assert(!('angle'in s.anchor));
 }
 report.faceFollowsBothCyclesWithoutRotation=true;
 const laughDuration=report.audioDurations.find(a=>a.src==='/audio/laugh.mp3').duration;
 if(laughDuration>3.1){
  assert(await page.locator('audio[src="/audio/laugh.mp3"]').evaluate(a=>!a.paused));
  await page.waitForFunction(()=>document.querySelector('audio[src="/audio/laugh.mp3"]').ended);
  report.audioTailFinishesNaturally=true;
 }else report.audioFinishesNaturallyWithinMotion=true;
 await tap();await tap();await tap();
 await page.waitForFunction(()=>document.querySelector('.playground canvas').dataset.animation==='laugh');
 assert.equal(await page.evaluate(()=>soundLog.calls.filter(c=>c.name==='laugh').length),2);
 await page.waitForFunction(()=>document.querySelector('.playground canvas').dataset.animation==='idle');
 report.nextTripleTapRound=true;
 assert.equal(await page.locator('audio[src="/audio/laugh.mp3"]').count(),1);
 assert.equal(await page.locator('audio[src="/audio/bingbingbing.mp3"]').count(),1);
 assert.deepEqual(errors,[]);report.browserErrors=errors;
 report.playbackErrors=await page.evaluate(()=>soundLog.errors);
 assert.deepEqual(report.playbackErrors,[]);
 report.checkedAt=new Date().toISOString();report.realPhoneTest=false;
 writeFileSync('D:/naiwa/docs/double-laugh-verification.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
