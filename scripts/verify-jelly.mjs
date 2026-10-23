import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire('C:/Users/Starrism/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try{
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await page.goto('http://127.0.0.1:5173/');
const result=await page.evaluate(async()=>{
 const {addImpulse,stepSprings,drawBelly,deformationAt}=await import('/src/features/belly-slap/spring.js');
 const {BELLY_ANCHORS}=await import('/src/pet/anchors.js');
 const sprite=new Image();sprite.src='/naifrog/spritesheet.webp';await sprite.decode();
 const source=document.createElement('canvas');source.width=192;source.height=208;
 source.getContext('2d').drawImage(sprite,0,0,192,208,0,0,192,208);
 const canvas=document.createElement('canvas');canvas.width=384;canvas.height=416;
 const ctx=canvas.getContext('2d');ctx.scale(2,2);
 const belly=BELLY_ANCHORS.idle[0],springs=[],frames=[],stats=[],timings=[];
 const original=source.getContext('2d').getImageData(0,0,192,208).data;
 const draw=()=>{
   ctx.clearRect(0,0,192,208);ctx.drawImage(source,0,0);
   const start=performance.now();drawBelly(ctx,source,belly,springs);timings.push(performance.now()-start);
 };
 function cream(data){
   let minY=999,maxY=-1,minX=999,maxX=-1,count=0;
   for(let y=65*2;y<156*2;y++)for(let x=48*2;x<134*2;x++){
     const i=(y*384+x)*4,r=data[i],g=data[i+1],b=data[i+2];
     if(r>180&&g>150&&b>110&&b/g>.66){
       count++;if(Math.abs(x-87*2)<3){minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
       if(Math.abs(y-109*2)<3){minX=Math.min(minX,x);maxX=Math.max(maxX,x);}
     }
   }
   return {top:minY/2,bottom:maxY/2,left:minX/2,right:maxX/2,count};
 }
 draw();const rest=cream(ctx.getImageData(0,0,384,416).data);
 frames.push(canvas.toDataURL());
 addImpulse(springs);
 for(let i=1;i<=60;i++){
   stepSprings(springs,1/50);draw();
   frames.push(canvas.toDataURL());
   const data=ctx.getImageData(0,0,384,416).data;
   let alphaHoles=0;
   for(let y=78*2;y<142*2;y++)for(let x=68*2;x<118*2;x++)if(data[(y*384+x)*4+3]<250)alphaHoles++;
   stats.push({time:i/50,position:springs[0]?.position??0,cream:cream(data),alphaHoles});
 }
 const first=[];addImpulse(first,-.65,0);stepSprings(first,.05);
 const second=[];addImpulse(second,.65,0);stepSprings(second,.05);
 const localLeft=deformationAt(70,105,belly,first);
 const localRight=deformationAt(70,105,belly,second);
 return {frames,stats,rest,maxRenderMs:Math.max(...timings),averageRenderMs:timings.reduce((a,b)=>a+b,0)/timings.length,hitCentersDiffer:Math.hypot(localLeft.x-localRight.x,localLeft.y-localRight.y)};
});
for(let i=0;i<result.frames.length;i++)writeFileSync('D:/naiwa/docs/jelly-frame-'+String(i).padStart(2,'0')+'.png',Buffer.from(result.frames[i].split(',')[1],'base64'));
delete result.frames;
writeFileSync('D:/naiwa/docs/jelly-mesh-verification.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({rest:result.rest,extremes:result.stats.filter((_,i)=>[2,4,10,15,25,45,59].includes(i)),maxRenderMs:result.maxRenderMs,averageRenderMs:result.averageRenderMs,hitCentersDiffer:result.hitCentersDiffer},null,2));
assert(result.stats.some(s=>s.cream.bottom<result.rest.bottom-2),'Cream contour must visibly dent');
assert(result.stats.some(s=>s.cream.bottom>result.rest.bottom+1),'Cream contour must visibly overshoot');
assert(result.stats.every(s=>s.alphaHoles===0),'No transparent triangle seams in opaque belly');
assert(result.hitCentersDiffer>1,'Different taps must change deformation center');
assert(result.stats.at(-1).position===0||Math.abs(result.stats.at(-1).position)<.01,'Spring must recover');
}finally{await browser.close();}

