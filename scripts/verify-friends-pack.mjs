import {createRequire} from 'node:module';
import {writeFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/Starrism/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const profile='D:/naiwa/.qa/friends-'+Date.now();mkdirSync(profile,{recursive:true});
const options={executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,viewport:{width:390,height:844},isMobile:true,hasTouch:true};
let context=await chromium.launchPersistentContext(profile,options);
let page=await context.newPage();page.setDefaultTimeout(12000);
const report={},names=['阿蛋','凌瑞','软软','小小飞','忆安','小辞','卡密望','重阳'];
async function ready(){
 await page.goto('http://127.0.0.1:5173/');
 await page.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(b=>b.textContent.startsWith('头像库'))?.disabled);
}
async function library(){await page.getByRole('button',{name:/^头像库/}).click();}
try{
 await ready();assert.equal(await page.locator('.stage-heading span').last().innerText(),'原版奶娃');
 await library();
 assert.equal(await page.locator('[data-library="builtin"]').count(),0);
 for(const n of names)assert.equal(await page.getByRole('button',{name:'使用 '+n,exact:true}).count(),0);
 await page.getByRole('button',{name:'解锁隐藏头像',exact:true}).click();
 await page.getByLabel('解锁口令',{exact:true}).fill('UUGNB');
 await page.getByRole('button',{name:'解锁',exact:true}).click();
 await page.getByRole('alert').waitFor();assert((await page.getByRole('alert').innerText()).includes('口令不正确'));
 assert.equal(await page.locator('[data-library="builtin"]').count(),0);
 report.freshLockedAndCaseSensitive=true;
 await page.getByRole('button',{name:'关闭',exact:true}).click();
 const legacy=await page.evaluate(async()=>{
  const {getBuiltinCatalog}=await import('/src/features/faces/builtinFaces.js');
  const {openDatabase,writeActive}=await import('/src/features/faces/storage.js');
  const b=(await getBuiltinCatalog())[0],blob=await(await fetch(b.source)).blob();
  const source=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(blob);});
  const old={...b,id:b.originalId,source};delete old.builtIn;
  const duplicate={...old,id:'copied-photo-new-id'};
  const own={id:'own-face',name:'个人测试',source,crop:{x:0,y:0,zoom:1},placement:{x:0,y:0,scale:1},anchors:{},updatedAt:2};
  const db=await openDatabase();
  await new Promise((resolve,reject)=>{const tx=db.transaction('faces','readwrite');for(const f of [old,duplicate,own])tx.objectStore('faces').put(f);tx.oncomplete=resolve;tx.onerror=reject;});
  await writeActive(old.id);
  return {active:old.id,source};
 });
 await ready();assert.equal(await page.locator('.stage-heading span').last().innerText(),'原版奶娃');
 await library();assert.equal(await page.locator('[data-library="personal"] .face-card').count(),1);
 await page.getByRole('button',{name:'解锁隐藏头像',exact:true}).click();
 await page.getByLabel('解锁口令',{exact:true}).fill('uugnb');
 await page.getByRole('button',{name:'解锁',exact:true}).click();
 await page.locator('[data-library="builtin"] .face-card').nth(7).waitFor();
 assert.deepEqual(await page.locator('[data-library="builtin"] .face-select>span').allTextContents(),names);
 assert.equal(await page.locator('.stage-heading span').last().innerText(),'原版奶娃');
 const unchanged=await page.evaluate(async()=>{
  const {readActive,listFaces}=await import('/src/features/faces/storage.js');
  return {id:await readActive(),count:(await listFaces()).length};
 });
 assert.equal(unchanged.id,legacy.active);assert.equal(unchanged.count,3);
 assert.equal(await page.locator('[data-library="builtin"] button.danger').count(),0);
 assert.equal(await page.locator('[data-library="builtin"]').getByRole('button',{name:/编辑|删除/}).count(),0);
 report.unlockAllWithoutChangingSelection=true;report.nonDestructiveOriginalAndHashDedup=true;report.noBuiltinEditOrDelete=true;
 for(const name of names){
  await page.getByRole('button',{name:'使用 '+name,exact:true}).click();
  await page.waitForFunction(n=>document.querySelector('.stage-heading span:last-child').textContent===n,name);
  await page.waitForFunction(()=>document.querySelector('.playground canvas').dataset.face==='true');
 }
 report.allEightSwitchCorrectly=true;
 await page.screenshot({path:'D:/naiwa/docs/friends-unlocked-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'关闭',exact:true}).click();
 await page.reload();await page.waitForFunction(()=>document.querySelector('.stage-heading span:last-child').textContent==='重阳');
 await library();assert.deepEqual(await page.locator('[data-library="builtin"] .face-select>span').allTextContents(),names);
 await page.getByRole('dialog').getByRole('button',{name:'恢复原版',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.playground canvas').dataset.face==='false');
 await page.getByRole('button',{name:'关闭',exact:true}).click();
 report.refreshUnlockOrderAndRestore=true;
 await context.close();
 context=await chromium.launchPersistentContext(profile,options);
 page=await context.newPage();page.setDefaultTimeout(12000);await ready();await library();
 assert.equal(await page.getByRole('button',{name:'解锁隐藏头像',exact:true}).count(),0);
 assert.deepEqual(await page.locator('[data-library="builtin"] .face-select>span').allTextContents(),names);
 report.browserRestartRetainsUnlock=true;
 await page.getByRole('button',{name:'使用 阿蛋',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.stage-heading span:last-child').textContent==='阿蛋');
 await page.getByRole('button',{name:'关闭',exact:true}).click();
 const r=await page.locator('.playground canvas').boundingBox();
 for(let i=0;i<3;i++)await page.touchscreen.tap(r.x+r.width*87/192,r.y+r.height*109/208);
 await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='laughing');
 const frames=new Set();
 for(let i=0;i<62;i++){
  const data=await page.locator('.playground canvas').evaluate(c=>({face:c.dataset.face,action:c.dataset.animation,frame:c.dataset.frame,cycle:c.dataset.cycle,anchor:JSON.parse(c.dataset.anchor)}));
  if(data.action==='laugh'){
   assert.equal(data.face,'true');assert.equal(data.anchor.w,data.anchor.h);assert(!('angle'in data.anchor));frames.add(data.cycle+':'+data.frame);
  }
  await page.waitForTimeout(50);
 }
 assert.equal(frames.size,10);report.builtinFaceFollowsBothJumpsWithoutRotation=true;
 await page.waitForFunction(()=>document.querySelector('.page').dataset.phase==='idle');
 await library();await page.getByRole('button',{name:'编辑 个人测试',exact:true}).click();
 await page.getByLabel('头像名称',{exact:true}).fill('个人已编辑');
 await page.getByRole('button',{name:'保存头像并使用',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.stage-heading span:last-child').textContent==='个人已编辑');
 await library();await page.getByRole('button',{name:'删除 个人已编辑',exact:true}).click();
 await page.getByRole('button',{name:'确认删除',exact:true}).click();
 await page.getByRole('button',{name:'使用 个人已编辑',exact:true}).waitFor({state:'detached'});
 const survivors=await page.evaluate(async()=>{const {listFaces}=await import('/src/features/faces/storage.js');return (await listFaces()).map(f=>f.id);});
 assert(survivors.includes(legacy.active));assert(survivors.includes('copied-photo-new-id'));
 report.personalEditDeleteAndLegacyPreservation=true;
 // Personal upload remains available after unlock.
 await page.getByRole('button',{name:'＋ 上传新头像',exact:true}).click();
 await page.getByLabel('选择照片').setInputFiles({name:'my-photo.webp',mimeType:'image/webp',buffer:Buffer.from(legacy.source.split(',')[1],'base64')});
 await page.waitForFunction(()=>document.querySelector('.preview-panel canvas')?.dataset.face==='true');
 await page.getByLabel('头像名称',{exact:true}).fill('新的个人头像');
 await page.getByRole('button',{name:'保存头像并使用',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.stage-heading span:last-child').textContent==='新的个人头像');
 report.personalUploadWorks=true;
 report.checkedAt=new Date().toISOString();
 writeFileSync('D:/naiwa/docs/friends-pack-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await context.close();}


