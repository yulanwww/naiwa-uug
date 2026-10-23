import {createRequire} from 'node:module';
import {writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/Starrism/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
await context.addInitScript(()=>{
 const stats=window.soundStats={plays:[],seeks:[],playing:0,ended:0,rejections:[],fail:false};
 const play=HTMLMediaElement.prototype.play;
 const descriptor=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'currentTime');
 HTMLMediaElement.prototype.play=function(){
   if(!this.src.includes('bingbingbing.mp3'))return play.call(this);
   stats.plays.push({element:this,time:performance.now(),gesture:navigator.userActivation.isActive});
   if(stats.fail)return Promise.reject(new DOMException('test playback blocked','NotAllowedError'));
   const promise=play.call(this);promise?.catch(e=>stats.rejections.push(e.name));return promise;
 };
 Object.defineProperty(HTMLMediaElement.prototype,'currentTime',{...descriptor,set(value){
   if(this.src.includes('bingbingbing.mp3'))stats.seeks.push(value);
   descriptor.set.call(this,value);
 }});
 document.addEventListener('playing',e=>{if(e.target.src?.includes('bingbingbing.mp3'))stats.playing++;},true);
 document.addEventListener('ended',e=>{if(e.target.src?.includes('bingbingbing.mp3'))stats.ended++;},true);
});
const page=await context.newPage();page.setDefaultTimeout(12000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const report={};
async function ready(){
 await page.goto('http://127.0.0.1:5173/');
 await page.waitForFunction(()=>document.querySelector('.playground canvas')?.dataset.frame!==undefined);
 await page.waitForFunction(()=>document.querySelector('audio').readyState>=2);
}
async function tap(){
 const r=await page.locator('.playground canvas').boundingBox();
 await page.touchscreen.tap(r.x+r.width*87/192,r.y+r.height*109/208);
}
const stats=()=>page.evaluate(()=>({plays:soundStats.plays.length,seeks:soundStats.seeks.length,playing:soundStats.playing,ended:soundStats.ended,rejections:soundStats.rejections,activeGestures:soundStats.plays.every(x=>x.gesture),singleElement:soundStats.plays.every(x=>x.element===document.querySelector('audio'))}));
try{
 await ready();
 const response=await page.request.get('http://127.0.0.1:5173/audio/bingbingbing.mp3');
 assert.equal(response.status(),200);
 const original=readFileSync('D:/Downloads/%E5%86%B0%E5%86%B0%E5%86%B0%E7%89%B9%E6%95%88.mp3');
 assert.equal(createHash('sha256').update(await response.body()).digest('hex'),createHash('sha256').update(original).digest('hex'));
 const config=await page.locator('audio[src="/audio/bingbingbing.mp3"]').evaluate(a=>({duration:a.duration,loop:a.loop,rate:a.playbackRate,count:document.querySelectorAll('audio[src="/audio/bingbingbing.mp3"]').length}));
 assert(config.duration>0);assert.equal(config.loop,false);assert.equal(config.rate,1);assert.equal(config.count,1);
 assert.equal((await stats()).plays,0);
 await tap();await page.waitForFunction(()=>soundStats.ended===1);
 assert.equal((await stats()).plays,1);
 assert(await page.locator('audio[src="/audio/bingbingbing.mp3"]').evaluate(a=>a.ended&&a.currentTime>=a.duration-.01));
 report.singleTapFinishesNaturally=true;
 await ready();
 await tap();await page.waitForFunction(()=>soundStats.playing===1);
 assert.equal((await stats()).plays,1);report.singleTapActualPlayback=true;
 await tap();assert.equal((await stats()).plays,1);assert.equal((await stats()).seeks,1);
 await tap();await page.waitForFunction(()=>document.querySelector('.playground canvas').dataset.animation==='laugh');
 assert.equal((await stats()).plays,1);assert.equal((await stats()).seeks,1);
 report.twoAndThreeTapsPlayOnce=true;
 for(let i=0;i<5;i++)await tap();
 assert.equal((await stats()).plays,1);report.noReplayDuringLaugh=true;
 await page.waitForFunction(()=>document.querySelector('.playground canvas').dataset.animation==='idle');
 await tap();assert.equal((await stats()).plays,2);assert.equal((await stats()).seeks,2);
 report.nextRoundAfterLaugh=true;
 await ready();await tap();await page.waitForTimeout(1300);await tap();
 assert.equal((await stats()).plays,2);report.sameComboTimeoutAllowsNextSound=true;
 await ready();
 // Audio ending must never reset the combo. For long source files, seek only
 // in the TEST to simulate an early end; application code never does this.
 await tap();
 const time=await page.evaluate(()=>{const a=document.querySelector('audio');a.currentTime=Math.max(0,a.duration-.03);return a.duration;});
 await page.waitForFunction(()=>soundStats.ended>=1);
 const seekBaseline=(await stats()).seeks;
 await tap();await tap();
 assert.equal((await stats()).plays,1);assert.equal((await stats()).seeks,seekBaseline);
 report.endedBeforeThirdTapDoesNotUnlock=true;
 await ready();
 const bounds=await page.locator('.playground canvas').boundingBox();
 await page.touchscreen.tap(bounds.x+bounds.width*85/192,bounds.y+bounds.height*28/208);
 assert.equal((await stats()).plays,0);report.outsideBellySilent=true;
 await page.getByRole('button',{name:'拍肚子',exact:true}).click();
 assert.equal((await stats()).plays,1);report.buttonAlsoUsesFirstTap=true;
 await ready();await page.evaluate(()=>soundStats.fail=true);
 await tap();await tap();await tap();
 await page.waitForFunction(()=>document.querySelector('.playground canvas').dataset.animation==='laugh');
 assert.equal((await stats()).plays,1);report.rejectedPlaybackDoesNotBreakLaugh=true;
 await ready();
 await page.getByRole('button',{name:'换脸',exact:true}).click();
 const fixture=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=100;c.height=100;c.getContext('2d').fillRect(0,0,100,100);return c.toDataURL().split(',')[1];});
 const dlg=page.getByRole('dialog');
 await dlg.getByLabel('选择照片').setInputFiles({name:'sound-test.png',mimeType:'image/png',buffer:Buffer.from(fixture,'base64')});
 await page.waitForFunction(()=>document.querySelector('.preview-panel canvas')?.dataset.face==='true');
 await dlg.getByLabel('头像名称',{exact:true}).fill('音效测试');
 await dlg.getByRole('button',{name:'保存头像并使用',exact:true}).click();await dlg.waitFor({state:'hidden'});
 await tap();await page.waitForFunction(()=>soundStats.playing>=1);
 assert.equal((await stats()).plays,1);report.faceSwapStillPlays=true;
 await ready();await page.waitForFunction(()=>document.querySelector('.playground canvas').dataset.face==='true');
 await tap();await page.waitForFunction(()=>soundStats.playing>=1);
 const last=await stats();assert.equal(last.plays,1);assert(last.activeGestures);assert(last.singleElement);
 assert.deepEqual(last.rejections,[]);report.reloadStillPlays=true;report.singleAudioElement=true;report.realUserGesturePlayback=true;
 assert.deepEqual(errors,[]);report.browserErrors=errors;report.audio=config;report.originalBytesMatch=true;
 report.realPhoneTest=false;report.checkedAt=new Date().toISOString();
 writeFileSync('D:/naiwa/docs/slap-audio-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}



