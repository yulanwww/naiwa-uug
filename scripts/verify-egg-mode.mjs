import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/Starrism/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await context.addInitScript(()=>{Math.random=()=>.5;window.audioCalls=[];const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.audioCalls.push(this.getAttribute('src'));return play.call(this);};});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
const report={};
const phase=()=>page.locator('.page').getAttribute('data-phase');
const score=()=>page.locator('.affection-value').innerText();
const waitIdle=()=>page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='idle');
async function hit(u,v){const box=await page.locator('.pet-platform').boundingBox();await page.touchscreen.tap(box.x+box.width*u,box.y+box.height*v);}
async function egg(u,v){await hit(u,v);await page.waitForSelector('.egg-effect');await page.waitForFunction(()=>document.querySelector('.egg-effect')?.dataset.stage && document.querySelector('.egg-effect').dataset.stage!=='flight');const target=await page.locator('.egg-effect').getAttribute('data-target');await waitIdle();return JSON.parse(target);}
try{
 await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>document.querySelector('.playground canvas')?.dataset.frame!==undefined);
 await page.getByRole('button',{name:'丢臭鸡蛋',exact:true}).click();assert.equal(await phase(),'idle');assert.equal(await page.locator('.egg-effect').count(),0);assert.equal(await score(),'0');
 assert.equal(await page.getByRole('button',{name:'丢臭鸡蛋',exact:true}).getAttribute('aria-pressed'),'true');
 assert.equal(await page.locator('.egg-credit').innerText(),'该创意来自 @翻斗兵神 强烈要求');
 report.enterModeDoesNotThrow=true;
 await page.locator('.affection').click();assert.equal(await page.locator('.egg-effect').count(),0);
 const alpha=await page.evaluate(async()=>{const im=new Image();im.src='/effects/egg-stages.png';await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);const a=ctx.getImageData(0,0,c.width,c.height).data;let empty=0,soft=0,solid=0;for(let i=3;i<a.length;i+=4){if(a[i]===0)empty++;else if(a[i]<200)soft++;else solid++;}return {empty,soft,solid};});assert(alpha.empty>800000);assert(alpha.solid>300000);report.transparentTexture=alpha;
 // Package independent transparent stage files from the edited alpha atlas without altering pixels.
 const cuts=await page.evaluate(async()=>{const {EGG_STAGES}=await import('/src/features/eggs/EggEffect.jsx');const im=new Image();im.src='/effects/egg-stages.png';await im.decode();return EGG_STAGES.map(([x,y,w,h])=>{const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,x,y,w,h,0,0,w,h);return c.toDataURL('image/png').split(',')[1];});});
 cuts.forEach((data,i)=>writeFileSync('D:/naiwa/public/effects/egg-'+String(i).padStart(2,'0')+'.png',Buffer.from(data,'base64')));
 const head=await egg(.47,.2);assert(Math.abs(head.x-90.24)<1);assert(Math.abs(head.y-41.6)<1);assert.equal(await score(),'0');
 const belly=await egg(.5,.55);assert(Math.abs(belly.y-114.4)<1);assert.equal(await score(),'0');
 await hit(.8,.6);await page.waitForSelector('.egg-effect');
 await page.screenshot({path:'D:/naiwa/docs/egg-mode-flight.png',fullPage:true});
 // Further taps while a flight is active are ignored.
 await hit(.2,.3);await hit(.9,.1);
 await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='eggHit');
 assert.equal(await score(),'-606');const target=JSON.parse(await page.locator('.egg-effect').getAttribute('data-target'));assert(Math.abs(target.x-153.6)<1);
 await page.waitForTimeout(180);await page.screenshot({path:'D:/naiwa/docs/egg-mode-splash.png',fullPage:true});
 await waitIdle();assert.equal(await score(),'-606');assert.equal(await page.locator('.egg-effect').count(),0);
 assert((await page.locator('.caption').innerText()).includes('已投掷 0 / 3'));
 assert.deepEqual(await page.evaluate(()=>window.audioCalls),[]);
 report.targetCoordinates={head,belly,side:target};report.thirdHitOnlyMinus606=true;report.noSlapOrLaughSoundInEggMode=true;
 await page.evaluate(()=>window.scrollTo(0,180));const scrolled=await egg(.15,.8);assert(Math.abs(scrolled.x-28.8)<1);assert(Math.abs(scrolled.y-166.4)<1);report.scrollCoordinatesCorrect=true;
 await page.getByRole('button',{name:'拍肚子',exact:true}).click();assert.equal(await page.locator('.egg-credit').count(),0);assert.equal(await phase(),'idle');
 await page.waitForTimeout(1300);assert.equal(await phase(),'idle');
 for(let i=0;i<3;i++)await hit(.46,.54);
 await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='waitingForBingEnd');
 assert.equal(await page.locator('.egg-effect').count(),0);assert(await page.getByRole('button',{name:'丢臭鸡蛋',exact:true}).isDisabled());
 await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='laughing');
 await page.waitForFunction(()=>document.querySelector('.pet-sprite').dataset.cycle==='1');await waitIdle();assert.equal(await score(),'0');
 const sounds=await page.evaluate(()=>window.audioCalls);assert.deepEqual(sounds,['/audio/bingbingbing.mp3','/audio/laugh.mp3']);report.bellyAndEggMutuallyExclusive=true;report.sequentialAudioAndTwoJumpsPreserved=true;
 await page.getByRole('button',{name:/^头像库/}).click();await page.getByRole('button',{name:'解锁隐藏头像',exact:true}).click();await page.getByLabel('解锁口令').fill('uugnb');await page.getByRole('button',{name:'解锁',exact:true}).click();await page.getByRole('button',{name:'使用 忆安',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'关闭',exact:true}).click();assert.equal(await score(),'0');
 await page.getByRole('button',{name:'丢臭鸡蛋',exact:true}).click();for(let i=0;i<3;i++)await egg(.4,.3);assert.equal(await score(),'-606');
 await page.reload();await page.waitForFunction(()=>document.querySelector('.stage-heading span:last-child').textContent==='忆安');assert.equal(await score(),'-606');
 await page.getByRole('button',{name:'恢复原版',exact:true}).click();assert.equal(await score(),'0');report.avatarIndependentAndPersists=true;
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);report.mobileViewportNoOverflow=true;report.pageErrors=errors;
 writeFileSync('D:/naiwa/docs/egg-mode-test-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}

