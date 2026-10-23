import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/Starrism/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await context.addInitScript(()=>{window.rewardChoice=.5;Math.random=()=>window.rewardChoice;});
const page=await context.newPage();page.setDefaultTimeout(12000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const report={};
async function ready(){await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>document.querySelector('.playground canvas')?.dataset.frame!==undefined);await page.waitForFunction(()=>Array.from(document.querySelectorAll('button')).some(b=>b.textContent.startsWith('头像库')&&!b.disabled));}
const score=async()=>await page.locator('.affection-value').innerText();
const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('affectionByAvatarId')||'{}'));
async function waitIdle(){await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='idle');}
async function triple(){await page.getByRole('button',{name:'拍肚子',exact:true}).click();for(let i=0;i<3;i++){const r=await page.locator('.pet-platform').boundingBox();await page.touchscreen.tap(r.x+r.width*.46,r.y+r.height*.54);}}
async function startEgg(){await page.getByRole('button',{name:'丢臭鸡蛋',exact:true}).click();const r=await page.locator('.pet-platform').boundingBox();await page.touchscreen.tap(r.x+r.width*.5,r.y+r.height*.55);}
async function egg(){await startEgg();await waitIdle();}
async function lib(){await page.getByRole('button',{name:/^头像库/}).click();}
async function choose(name){await lib();await page.getByRole('button',{name:'使用 '+name,exact:true}).click();await page.waitForFunction(n=>document.querySelector('.stage-heading span:last-child').textContent===n,name);await page.getByRole('dialog').getByRole('button',{name:'关闭',exact:true}).click();}
try{
 await ready();assert.equal(await score(),'0');
 const values=await page.evaluate(async()=>{const {pickReward}=await import('/src/features/affection/useAffection.js');const previous=Math.random;const values=[0,.25,.5,.75].map(value=>{Math.random=()=>value;return pickReward();});Math.random=previous;return values;});
 assert.deepEqual(values,[26,32,606,5408]);report.fourEqualRandomIntervals=values;
 await page.getByRole('button',{name:'拍肚子',exact:true}).click();assert.equal(await score(),'0');
 await ready();assert.equal(await score(),'0');report.singleTapAndInterruptedComboNoReward=true;
 await triple();await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='waitingForBingEnd');
 assert.equal(await score(),'0');assert(await page.getByRole('button',{name:'丢臭鸡蛋',exact:true}).isDisabled());
 await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='laughing');
 assert.equal(await score(),'0');assert(await page.getByRole('button',{name:/^头像库/}).isDisabled());
 await page.waitForFunction(()=>document.querySelector('.playground canvas').dataset.cycle==='1');
 assert.equal(await score(),'0');
 for(let i=0;i<4;i++){const r=await page.locator('.playground canvas').boundingBox();await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);}
 await waitIdle();assert.equal(await score(),'606');
 await page.screenshot({path:'D:/naiwa/docs/affection-reward-mobile.png',fullPage:true});
 await page.waitForTimeout(180);assert.equal(await score(),'606');
 report.fullLaughRewardsExactlyOnce=true;report.noRewardPerTapOrPerJump=true;
 await egg();assert.equal(await score(),'606');await egg();assert.equal(await score(),'606');
 await page.evaluate(()=>window.rewardChoice=.99);
 await page.getByRole('button',{name:'丢臭鸡蛋',exact:true}).click();
 assert.equal(await score(),'606');assert(await page.getByRole('button',{name:'拍肚子',exact:true}).isDisabled());
 const beforeSound=await page.locator('audio').evaluateAll(as=>as.map(a=>a.currentTime));
 await page.screenshot({path:'D:/naiwa/docs/egg-flight-mobile.png',fullPage:true});
 await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='eggHit');
 assert.equal(await score(),'-4802');
 await page.screenshot({path:'D:/naiwa/docs/egg-impact-mobile.png',fullPage:true});
 await waitIdle();assert.equal(await score(),'-4802');
 report.onlyThirdImpactDeducts=true;report.negativeScores=true;report.interactionExclusion=true;
 await ready();assert.equal(await score(),'-4802');report.originalPersists=true;
 await lib();await page.getByRole('button',{name:'解锁隐藏头像',exact:true}).click();await page.getByLabel('解锁口令').fill('uugnb');await page.getByRole('button',{name:'解锁',exact:true}).click();
 await page.locator('[data-library="builtin"] .face-card').nth(7).waitFor();
 const names=['阿蛋','凌瑞','软软','小小飞','忆安','小辞','卡密望','重阳'];
 assert.deepEqual(await page.locator('[data-library="builtin"] .face-select>span').allTextContents(),names);
 for(const name of names){await page.getByRole('button',{name:'使用 '+name,exact:true}).click();await page.waitForFunction(n=>document.querySelector('.stage-heading span:last-child').textContent===n,name);assert.equal(await score(),'0');}
 await page.getByRole('dialog').getByRole('button',{name:'关闭',exact:true}).click();report.allEightInitiallyZero=true;
 await choose('阿蛋');await page.evaluate(()=>window.rewardChoice=.25);
 await egg();await egg();await egg();assert.equal(await score(),'-32');assert.equal((await stored()).original,'-4802');
 await choose('忆安');assert.equal(await score(),'0');await page.evaluate(()=>window.rewardChoice=0);
 await triple();await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='laughing');await waitIdle();
 assert.equal(await score(),'26');await choose('阿蛋');assert.equal(await score(),'-32');
 report.builtinScoresIndependent=true;
 await choose('忆安');await triple();await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='laughing');await ready();assert.equal(await score(),'26');
 report.interruptedLaughNoSettlement=true;
 await lib();await page.getByRole('button',{name:'uug',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.friends-toggle').getAttribute('aria-expanded')==='false');
 assert.equal(await score(),'26');await page.getByRole('button',{name:'＋ 上传新头像',exact:true}).click();
 const fixture=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=200;c.height=200;c.getContext('2d').fillRect(0,0,200,200);return c.toDataURL().split(',')[1];});
 await page.getByLabel('选择照片').setInputFiles({name:'friend.png',mimeType:'image/png',buffer:Buffer.from(fixture,'base64')});
 await page.waitForFunction(()=>document.querySelector('.preview-panel canvas')?.dataset.face==='true');
 await page.getByLabel('头像名称',{exact:true}).fill('个人好感度测试');await page.getByRole('button',{name:'保存头像并使用',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});
 await page.waitForFunction(()=>document.querySelector('.stage-heading span:last-child').textContent==='个人好感度测试');
 assert.equal(await score(),'0');
 const personalId=await page.evaluate(async()=>{const {readActive}=await import('/src/features/faces/storage.js');return readActive();});
 await page.evaluate(()=>window.rewardChoice=0);await egg();await egg();await egg();assert.equal(await score(),'-26');
 await lib();await page.getByRole('button',{name:'编辑 个人好感度测试',exact:true}).click();await page.getByLabel('头像名称',{exact:true}).fill('改名仍保留');
 await page.getByRole('button',{name:'保存头像并使用',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});await page.waitForFunction(()=>document.querySelector('.stage-heading span:last-child').textContent==='改名仍保留');
 assert.equal(await score(),'-26');await ready();assert.equal(await score(),'-26');assert.equal((await stored())[personalId],'-26');
 await lib();await page.getByRole('button',{name:'删除 改名仍保留',exact:true}).click();await page.getByRole('button',{name:'确认删除',exact:true}).click();
 await page.getByRole('button',{name:'使用 改名仍保留',exact:true}).waitFor({state:'detached'});
 assert(!Object.hasOwn(await stored(),personalId));assert.equal((await stored()).original,'-4802');
 assert.equal((await stored())['builtin-friend-01'],'-32');assert.equal((await stored())['builtin-friend-05'],'26');
 await page.getByRole('dialog').getByRole('button',{name:'关闭',exact:true}).click();assert.equal(await score(),'-4802');
 report.personalRenameRefreshAndDeleteIsolated=true;report.restoreOriginalDoesNotReset=true;
 await page.evaluate(()=>{const map=JSON.parse(localStorage.getItem('affectionByAvatarId'));map.original='999999999999999999999999999999999999';localStorage.setItem('affectionByAvatarId',JSON.stringify(map));});
 await ready();assert.equal(await score(),'999999999999999999999999999999999999');
 await page.evaluate(()=>window.rewardChoice=0);await egg();await egg();await egg();
 assert.equal(await score(),(999999999999999999999999999999999999n-26n).toString());report.arbitraryPrecisionWithoutScoreLimit=true;
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const volumes=await page.locator('audio').evaluateAll(as=>as.map(a=>a.volume));assert.deepEqual(volumes,[.5,.5]);
 assert.deepEqual(errors,[]);report.halfVolumePreserved=true;report.mobileNoHorizontalOverflow=true;report.browserErrors=errors;report.realPhoneTest=false;
 writeFileSync('D:/naiwa/docs/affection-eggs-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}

