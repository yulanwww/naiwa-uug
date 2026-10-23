import {createRequire} from 'node:module';
import {writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {addImpulse,stepSprings} from '../src/features/belly-slap/spring.js';
const springs=[];addImpulse(springs);let negative=false,positive=false;
for(let i=0;i<480;i++){stepSprings(springs,1/240);if(springs[0]?.position<-.1)negative=true;if(springs[0]?.position>.1)positive=true;}
assert(negative&&positive,'Spring must dent and overshoot');
const stack=[];addImpulse(stack);stepSprings(stack,1/60);
const before=stack[0].velocity;addImpulse(stack);assert(stack[0].velocity<before,'Repeated slap must add momentum');
const require=createRequire('C:/Users/Starrism/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try{
const page=await browser.newPage();await page.goto('http://127.0.0.1:5173/');
const result=await page.evaluate(async()=>{
 const {default:React}=await import('/node_modules/.vite/deps/react.js');
 const {default:ReactDOM}=await import('/node_modules/.vite/deps/react-dom_client.js');
 const {default:Pet}=await import('/src/components/PetSprite.jsx');
 const root=document.createElement('div');root.id='render-qa';document.body.append(root);
 const ref=React.createRef();
 ReactDOM.createRoot(root).render(React.createElement(Pet,{ref,animation:'idle',frozenFrame:0}));
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 while(!root.querySelector('canvas')?.dataset.frame)await wait(20);
 const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d');
 const original=ctx.getImageData(0,0,384,416).data;
 ref.current.slap();await wait(40);
 const dented=ctx.getImageData(0,0,384,416).data;
 let changed=0,headChanges=0,limbChanges=0;
 for(let y=0;y<416;y++)for(let x=0;x<384;x++){
  const p=(y*384+x)*4;
  let diff=0;for(let ch=0;ch<4;ch++)diff+=Math.abs(original[p+ch]-dented[p+ch]);
  if(diff>3){
    changed++;
    if(y<128)headChanges++;
    if(y>320 || (y>=140&&y<=310&&(x<96||x>264)))limbChanges++;
  }
 }
 const {importPhoto}=await import('/src/features/faces/image.js');
 const formats=[];
 const fixture=document.createElement('canvas');fixture.width=100;fixture.height=100;
 fixture.getContext('2d').fillRect(0,0,100,100);
 for(const type of ['image/jpeg','image/png','image/webp']){
   const blob=await new Promise(r=>fixture.toBlob(r,type));
   const normalized=await importPhoto(new File([blob],'test', {type}));
   if(!normalized.startsWith('data:image/png'))throw new Error('Photo format failed: '+type);
   formats.push(type);
 }
 return {changedPixels:changed,headChanges,limbChanges,formats};
});
assert(result.changedPixels>150);assert.equal(result.headChanges,0);assert.equal(result.limbChanges,0);
const sprite=readFileSync('D:/naiwa/public/naifrog/spritesheet.webp');
const spriteHash=createHash('sha1').update(Buffer.from('blob '+sprite.length+'\0')).update(sprite).digest('hex');
assert.equal(spriteHash,'5e5c811297cc30380e91daafbac399871a0a05d2');
const report={...result,springDentAndOvershoot:true,accumulatedMomentum:true,originalSpriteGitHash:spriteHash};
writeFileSync('D:/naiwa/docs/phase2-render-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}

