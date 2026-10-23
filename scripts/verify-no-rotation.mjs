import {createRequire} from 'node:module';
import {writeFileSync,readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/Starrism/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const page=await context.newPage();page.setDefaultTimeout(12000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const report={};
try{
 await page.goto('http://127.0.0.1:5173/');
 await page.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='换脸')?.disabled);
 const fixtures=await page.evaluate(async()=>{
  const {openDatabase}=await import('/src/features/faces/storage.js');
  const sources=[];
  for(const [w,h] of [[200,320],[400,180]]){
   const c=document.createElement('canvas');c.width=w;c.height=h;
   const x=c.getContext('2d');x.fillStyle='#f5aa71';x.fillRect(0,0,w,h);
   x.fillStyle='#204080';x.fillRect(0,0,w/2,h/2);x.fillStyle='#be3050';x.fillRect(w/2,h/2,w/2,h/2);
   sources.push(c.toDataURL());
  }
  const db=await openDatabase();
  const legacy={id:'old-portrait',name:'旧头像不丢失',source:sources[0],crop:{x:.1,y:-.15,zoom:1.2,rotation:47},placement:{x:1,y:-1,scale:.9,angle:31},anchors:{'laugh:0':{x:1,y:2,scale:1.1,angle:-28}},updatedAt:1};
  await new Promise((resolve,reject)=>{const t=db.transaction('faces','readwrite');t.objectStore('faces').put(legacy);t.oncomplete=resolve;t.onerror=reject;});
  return sources;
 });
 const orientation=await page.evaluate(async()=>{
  const {renderPatch,loadImage,drawFace}=await import('/src/features/faces/image.js');
  const {getFaceAnchor,FACE_ANCHORS}=await import('/src/pet/anchors.js');
  const {listFaces,openDatabase}=await import('/src/features/faces/storage.js');
  const rows=await listFaces(),old=rows.find(f=>f.id==='old-portrait');
  const image=await loadImage(old.source);
  const a=renderPatch(image,old.crop),b=renderPatch(image,{...old.crop,rotation:123});
  const same=a.toDataURL()===b.toDataURL();
  const draws=[];
  const fake={drawImage(...args){draws.push(args.slice(1));}};
  for(const action of ['idle','laugh'])for(let frame=0;frame<FACE_ANCHORS[action].length;frame++){
    const anchor=getFaceAnchor(action,frame,{...old,placement:{...old.placement,angle:90},anchors:{[action+':'+frame]:{angle:120}}});
    drawFace(fake,a,anchor);
  }
  const db=await openDatabase();
  const raw=await new Promise(resolve=>{const r=db.transaction('faces').objectStore('faces').get(old.id);r.onsuccess=()=>resolve(r.result);});
  return {same,draws,old,raw};
 });
 assert(orientation.same);assert(orientation.draws.every(d=>d[2]===d[3]));
 assert.equal(orientation.old.name,'旧头像不丢失');assert.equal(orientation.old.crop.x,.1);assert.equal(orientation.old.crop.y,-.15);
 assert(!('rotation' in orientation.old.crop));assert.equal(orientation.raw.crop.rotation,47);
 report.legacyIgnoredWithoutDataDeletion=true;report.all11FramesUniformNoRotation=true;
 await page.reload();
 await page.getByRole('button',{name:'换脸',exact:true}).click();
 const dlg=page.getByRole('dialog');
 await dlg.getByLabel('选择照片').setInputFiles({name:'portrait.png',mimeType:'image/png',buffer:Buffer.from(fixtures[0].split(',')[1],'base64')});
 await page.waitForFunction(()=>document.querySelector('.preview-panel canvas')?.dataset.face==='true');
 assert.equal(await dlg.locator('input[aria-label*="旋转"],input[aria-label*="角度"]').count(),0);
 const crop=dlg.getByLabel('拖动照片裁剪人脸');
 const position=async()=>({x:Number(await dlg.getByLabel('照片左右',{exact:true}).inputValue()),y:Number(await dlg.getByLabel('照片上下',{exact:true}).inputValue())});
 const box=await crop.boundingBox(),cx=box.x+box.width/2,cy=box.y+box.height/2;
 async function mouseDrag(dx,dy){
  await page.mouse.move(cx,cy);await page.mouse.down();
  await page.mouse.move(cx+dx,cy+dy,{steps:8});await page.mouse.up();
 }
 let before=await position();await mouseDrag(0,-60);let after=await position();assert(after.y<before.y);report.mouseUp=true;
 before=after;await mouseDrag(0,60);after=await position();assert(after.y>before.y);report.mouseDown=true;
 before=after;await mouseDrag(-60,0);after=await position();assert(after.x<before.x);report.mouseLeft=true;
 before=after;await mouseDrag(60,0);after=await position();assert(after.x>before.x);report.mouseRight=true;
 const cdp=await context.newCDPSession(page);
 async function touchDrag(dx,dy){
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx,y:cy,id:1}]});
  for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx+dx*i/8,y:cy+dy*i/8,id:1}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 }
 before=await position();await touchDrag(0,-60);after=await position();assert(after.y<before.y);
 before=after;await touchDrag(0,60);after=await position();assert(after.y>before.y);
 before=after;await touchDrag(-60,0);after=await position();assert(after.x<before.x);
 before=after;await touchDrag(60,0);after=await position();assert(after.x>before.x);
 report.touchAllDirections=true;
 for(let i=0;i<6;i++)await mouseDrag(0,-80);
 assert((await position()).y < -2);report.noPositionClamp=true;
 const blank=await crop.evaluate(c=>c.getContext('2d').getImageData(140,140,1,1).data[3]);
 assert.equal(blank,0);report.transparentSpaceAllowed=true;
 await dlg.getByRole('button',{name:'重置位置',exact:true}).click();
 assert.deepEqual(await position(),{x:0,y:0});
 await mouseDrag(23,-32);const panned=await position();
 await dlg.getByLabel('照片缩放',{exact:true}).fill('2.3');assert.deepEqual(await position(),panned);
 await dlg.getByLabel('照片缩放',{exact:true}).fill('0.6');assert.deepEqual(await position(),panned);
 await mouseDrag(10,10);assert.equal(await dlg.getByLabel('照片缩放',{exact:true}).inputValue(),'0.6');
 await dlg.getByRole('button',{name:'重置位置',exact:true}).click();
 assert.equal(await dlg.getByLabel('照片缩放',{exact:true}).inputValue(),'0.6');
 report.zoomAndPanIndependent=true;report.resetOnlyPosition=true;
 await mouseDrag(12,-17);
 const finalPosition=await position();
 const preview=await crop.evaluate(c=>{
  const d=c.getContext('2d').getImageData(0,0,280,280).data;
  return Array.from(d.slice((140*280+140)*4,(140*280+140)*4+4));
 });
 await dlg.getByLabel('头像名称',{exact:true}).fill('无旋转正面测试');
 await page.screenshot({path:'D:/naiwa/docs/no-rotation-editor.png',fullPage:true});
 await dlg.getByRole('button',{name:'保存头像并使用',exact:true}).click();await dlg.waitFor({state:'hidden'});
 const saved=await page.evaluate(async()=>{
  const {listFaces}=await import('/src/features/faces/storage.js');
  const {loadImage}=await import('/src/features/faces/image.js');
  const f=(await listFaces()).find(f=>f.name==='无旋转正面测试');
  const image=await loadImage(f.thumbnail);
  const c=document.createElement('canvas');c.width=280;c.height=280;c.getContext('2d').drawImage(image,0,0);
  return {face:f,pixel:Array.from(c.getContext('2d').getImageData(140,140,1,1).data)};
 });
 assert.deepEqual(saved.pixel,preview);assert.equal(saved.face.crop.y,finalPosition.y);
 assert(!('rotation' in saved.face.crop));assert(!('angle' in saved.face.placement));
 report.previewMatchesSaved=true;
 await page.reload();await page.waitForFunction(()=>document.querySelector('.playground canvas')?.dataset.face==='true');
 await page.getByRole('button',{name:'大笑',exact:true}).click();
 const anchors=[];
 for(let i=0;i<65;i++){
   anchors.push(await page.locator('.playground canvas').evaluate(c=>({action:c.dataset.animation,anchor:JSON.parse(c.dataset.anchor)})));
   await page.waitForTimeout(50);
 }
 assert(anchors.filter(a=>a.action==='laugh').length>3);
 assert(anchors.every(a=>a.anchor.w===a.anchor.h&&!('angle'in a.anchor)));
 assert(new Set(anchors.filter(a=>a.action==='laugh').map(a=>a.anchor.y)).size>=3);
 report.laughMovesWithoutRotationOrStretch=true;
 await page.waitForFunction(()=>document.querySelector('.playground canvas').dataset.animation==='idle');
 await page.getByRole('button',{name:'换脸',exact:true}).click();
 await dlg.getByLabel('选择照片').setInputFiles({name:'landscape.png',mimeType:'image/png',buffer:Buffer.from(fixtures[1].split(',')[1],'base64')});
 await page.waitForFunction(()=>document.querySelector('.preview-panel canvas')?.dataset.face==='true');
 await dlg.getByLabel('头像名称',{exact:true}).fill('横向原方向测试');
 await dlg.getByRole('button',{name:'保存头像并使用',exact:true}).click();await dlg.waitFor({state:'hidden'});
 const landscape=await page.evaluate(async()=>{
  const {listFaces}=await import('/src/features/faces/storage.js');
  const {loadImage}=await import('/src/features/faces/image.js');
  const f=(await listFaces()).find(f=>f.name==='横向原方向测试');const im=await loadImage(f.source);
  return {width:im.width,height:im.height};
 });
 assert.deepEqual(landscape,{width:400,height:180});report.landscapeDirectionPreserved=true;
 await page.getByRole('button',{name:/^头像库/}).click();
 await dlg.getByRole('button',{name:'使用 旧头像不丢失',exact:true}).click();
 await dlg.getByRole('button',{name:'编辑 旧头像不丢失',exact:true}).click();
 assert.equal(await dlg.getByLabel('照片上下',{exact:true}).inputValue(),'-0.15');
 await dlg.getByRole('button',{name:'保存头像并使用',exact:true}).click();await dlg.waitFor({state:'hidden'});
 await page.reload();await page.waitForFunction(()=>document.querySelector('.playground canvas')?.dataset.face==='true');
 report.librarySwitchEditAndRefresh=true;
 const exifBase64=readFileSync('D:/naiwa/docs/exif-orientation-6-test.jpg').toString('base64');
 const exif=await page.evaluate(async encoded=>{
   const {loadImage,importPhoto}=await import('/src/features/faces/image.js');
   const blob=await (await fetch('data:image/jpeg;base64,'+encoded)).blob();
   const source=await importPhoto(new File([blob],'exif.jpg',{type:'image/jpeg'}));
   const im=await loadImage(source),c=document.createElement('canvas');c.width=im.width;c.height=im.height;c.getContext('2d').drawImage(im,0,0);
   return {width:im.width,height:im.height,top:Array.from(c.getContext('2d').getImageData(40,15,1,1).data),bottom:Array.from(c.getContext('2d').getImageData(40,100,1,1).data)};
 },exifBase64);
 assert.equal(exif.width,80);assert.equal(exif.height,120);assert(exif.top[0]>200&&exif.bottom[2]>200);
 report.exifOrientationMatchesDecodedAlbumDirection=true;
 assert.deepEqual(errors,[]);report.browserErrors=errors;report.viewport='390×844';report.checkedAt=new Date().toISOString();
 writeFileSync('D:/naiwa/docs/no-rotation-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}catch(e){await page.screenshot({path:'D:/naiwa/docs/no-rotation-failure.png',fullPage:true});throw e;}
finally{await browser.close();}


