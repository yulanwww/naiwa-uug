import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/Starrism/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
const page=await context.newPage();page.setDefaultTimeout(12000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const requests=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:5173/')&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))requests.push(r.url());});
const report={};
try {
await page.goto('http://127.0.0.1:5173/');
const pet=page.locator('.playground canvas');
await page.waitForFunction(()=>document.querySelector('.playground canvas')?.dataset.frame!==undefined);
await page.getByRole('button',{name:'换脸',exact:true}).waitFor();
await page.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='换脸').disabled);
await page.screenshot({path:'D:/naiwa/docs/phase2-original-mobile.png',fullPage:true});
const frames=[];for(let i=0;i<7;i++){frames.push(await pet.getAttribute('data-frame'));await page.waitForTimeout(150);}
assert(new Set(frames).size>3);report.idleFrames=frames;
const bounds=await pet.boundingBox();
const tap=()=>page.touchscreen.tap(bounds.x+bounds.width*87/192,bounds.y+bounds.height*109/208);
await page.touchscreen.tap(bounds.x+bounds.width*86/192,bounds.y+bounds.height*30/208);
assert.equal(Number(await pet.getAttribute('data-spring')),0);
report.outsideBellyDoesNotTrigger=true;
await tap();
await page.waitForFunction(()=>Number(document.querySelector('.playground canvas').dataset.spring)>.1);
report.localSpring=true;
await page.screenshot({path:'D:/naiwa/docs/phase2-belly.png',fullPage:true});
await tap();await tap();
await page.waitForFunction(()=>document.querySelector('.playground canvas').dataset.animation==='laugh');
await page.waitForFunction(()=>document.querySelector('.playground canvas').dataset.animation==='idle');
report.tripleTapLaugh=true;
await page.waitForTimeout(1800);
assert(Number(await pet.getAttribute('data-spring'))<.01);report.springSettles=true;
await page.getByRole('button',{name:'换脸',exact:true}).click();
const dlg=page.getByRole('dialog');
const fixture=await page.evaluate(()=>{
 const c=document.createElement('canvas');c.width=400;c.height=500;const x=c.getContext('2d');
 x.fillStyle='#c7a37b';x.fillRect(0,0,400,500);
 x.fillStyle='#69513d';x.fillRect(0,0,400,85);x.fillRect(50,180,80,20);x.fillRect(255,180,80,20);
 x.strokeStyle='#714131';x.lineWidth=12;x.beginPath();x.moveTo(150,340);x.quadraticCurveTo(200,385,260,340);x.stroke();
 x.fillStyle='#d5b18e';x.beginPath();x.ellipse(210,255,25,38,0,0,Math.PI*2);x.fill();
 return c.toDataURL('image/png').split(',')[1];
});
const upload=()=>dlg.getByLabel('选择照片').setInputFiles({name:'test-portrait.png',mimeType:'image/png',buffer:Buffer.from(fixture,'base64')});
await upload();
await dlg.getByLabel('头像名称',{exact:true}).fill('测试头像 A');
await page.waitForFunction(()=>document.querySelector('.preview-panel canvas')?.dataset.face==='true');
await dlg.getByLabel('照片缩放',{exact:true}).fill('1.12');
const crop=dlg.getByLabel('拖动照片裁剪人脸');const cropBox=await crop.boundingBox();
await page.mouse.move(cropBox.x+cropBox.width/2,cropBox.y+cropBox.height/2);
await page.mouse.down();await page.mouse.move(cropBox.x+cropBox.width/2+12,cropBox.y+cropBox.height/2-10);await page.mouse.up();
report.cropDragAndScale=true;
await dlg.getByText('脸部整体位置与大小',{exact:true}).click();
await dlg.getByLabel('脸部左右',{exact:true}).fill('0.5');
await dlg.getByText('逐帧锚点微调',{exact:true}).click();
await dlg.getByLabel('锚点动作').selectOption('laugh');
await dlg.getByLabel('锚点帧').selectOption({value:'2'});
await dlg.getByLabel('本帧左右',{exact:true}).fill('0.75');
await dlg.getByRole('button',{name:'保存头像并使用',exact:true}).click();
await dlg.waitFor({state:'hidden'});
await page.waitForFunction(()=>document.querySelector('.playground canvas').dataset.face==='true');
await page.screenshot({path:'D:/naiwa/docs/phase2-face-mobile.png',fullPage:true});
await page.reload();
await page.waitForFunction(()=>document.querySelector('.playground canvas')?.dataset.face==='true');
assert((await page.locator('.stage-heading').innerText()).includes('测试头像 A'));
report.refreshRestoresActiveFace=true;
const saved=await page.evaluate(async()=>{
 const {listFaces}=await import('/src/features/faces/storage.js');return (await listFaces())[0];
});
assert(!('rotation' in saved.crop));assert.equal(saved.crop.zoom,1.12);
assert(saved.crop.x!==0 && saved.crop.y!==0);
assert.equal(saved.placement.x,.5);assert.equal(saved.anchors['laugh:2'].x,.75);
report.cropPlacementAndAnchorsPersist=true;
await page.getByRole('button',{name:'大笑',exact:true}).click();
const anchors=[];const seen=new Set();
for(let i=0;i<65;i++){
 const state=await pet.evaluate(c=>({action:c.dataset.animation,frame:c.dataset.frame,anchor:JSON.parse(c.dataset.anchor),face:c.dataset.face}));
 if(state.action==='laugh'&&!seen.has(state.frame)){anchors.push(state);seen.add(state.frame);}
 await page.waitForTimeout(50);
}
await page.waitForFunction(()=>document.querySelector('.playground canvas').dataset.animation==='idle');
assert(anchors.length>=3);assert(anchors.every(a=>a.face==='true'));assert(new Set(anchors.map(a=>a.anchor.y)).size>=3);
report.laughFaceFollows=anchors;
await page.getByRole('button',{name:'换脸',exact:true}).click();await upload();
await page.screenshot({path:'D:/naiwa/docs/phase2-editor-mobile.png',fullPage:true});
await dlg.getByLabel('头像名称',{exact:true}).fill('测试头像 B');
await dlg.getByRole('button',{name:'保存头像并使用',exact:true}).click();await dlg.waitFor({state:'hidden'});
await page.getByRole('button',{name:/^头像库/}).click();
await dlg.getByRole('button',{name:'使用 测试头像 A',exact:true}).click();
await dlg.getByRole('button',{name:'编辑 测试头像 A',exact:true}).click();
await dlg.getByLabel('头像名称',{exact:true}).fill('已编辑头像 A');
await dlg.getByRole('button',{name:'保存头像并使用',exact:true}).click();await dlg.waitFor({state:'hidden'});
await page.reload();
await page.waitForFunction(()=>document.querySelector('.playground canvas')?.dataset.face==='true');
await page.getByRole('button',{name:/^头像库/}).click();
assert(await dlg.getByRole('button',{name:'使用 已编辑头像 A',exact:true}).count()===1);
assert(await dlg.getByRole('button',{name:'使用 测试头像 B',exact:true}).count()===1);
await page.screenshot({path:'D:/naiwa/docs/phase2-library-mobile.png',fullPage:true});
await dlg.getByRole('button',{name:'删除 已编辑头像 A',exact:true}).click();
await dlg.getByRole('button',{name:'确认删除',exact:true}).click();
await dlg.getByRole('button',{name:'使用 已编辑头像 A',exact:true}).waitFor({state:'detached'});
await dlg.getByRole('button',{name:'使用 测试头像 B',exact:true}).click();
await dlg.getByRole('button',{name:'恢复原版',exact:true}).click();
await dlg.getByRole('button',{name:'关闭',exact:true}).click();
await page.waitForFunction(()=>document.querySelector('.playground canvas').dataset.face==='false');
await page.reload();
await page.waitForFunction(()=>document.querySelector('.playground canvas')?.dataset.face==='false');
await page.getByRole('button',{name:/^头像库/}).click();
await dlg.getByRole('button',{name:'删除 测试头像 B',exact:true}).click();
await dlg.getByRole('button',{name:'确认删除',exact:true}).click();
await dlg.getByRole('button',{name:'使用 测试头像 B',exact:true}).waitFor({state:'detached'});
await dlg.getByRole('button',{name:'关闭',exact:true}).click();
report.multipleSaveSwitchEditDelete=true;report.restoreOriginalPersists=true;
report.noHorizontalOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
assert(report.noHorizontalOverflow);assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
report.browserErrors=errors;report.externalRequests=requests;report.checkedAt=new Date().toISOString();
writeFileSync('D:/naiwa/docs/phase2-verification.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
} catch(e) {
await page.screenshot({path:'D:/naiwa/docs/phase2-failure.png',fullPage:true});
console.error('BROWSER ERRORS',errors);throw e;
} finally {await browser.close();}







