import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { ANIMATIONS, ATLAS, durationOf, frameAt } from '../pet/animations.js';
import { BELLY_ANCHORS, FACE_ANCHORS, getFaceAnchor } from '../pet/anchors.js';
import { addImpulse, drawBelly, stepSprings } from '../features/belly-slap/spring.js';
import { drawFace, loadImage, renderPatch } from '../features/faces/image.js';

const PetSprite=forwardRef(function PetSprite({
  animation='idle', playbackId=0, startedAt=null, onComplete, onReady, onError, onSlap,
  face=null, frozenFrame=null, interactive=true, className='', recoveryId=null, onStable, hitId=null,
},ref) {
  const canvasRef=useRef(null), springs=useRef([]), current=useRef(null);
  const patch=useRef(null), photo=useRef(null), pose=useRef({action:'idle',frame:0});
  current.current={animation,playbackId,startedAt,onComplete,onReady,onError,face,frozenFrame,interactive,recoveryId,onStable};
  useEffect(()=>{
    let cancelled=false;
    if(!face?.source) patch.current=null;
    if(!face?.source) return;
    async function prepare() {
      try {
        if(photo.current?.source!==face.source)
          photo.current={source:face.source,image:await loadImage(face.source)};
        const rendered=renderPatch(photo.current.image,face.crop);
        if(!cancelled) patch.current=rendered;
      } catch(error) { if(!cancelled) current.current.onError?.(error.message); }
    }
    prepare();
    return ()=>{cancelled=true;};
  },[face?.source,face?.crop]);

  useEffect(()=>{
    if(hitId==null)return;
    const reaction=canvasRef.current.animate([{transform:'translateX(0)'},{transform:'translateX(-4px)',offset:.2},{transform:'translateX(3px)',offset:.45},{transform:'translateX(-2px)',offset:.7},{transform:'translateX(0)'}],{duration:250,easing:'ease-out'});
    return()=>reaction.cancel();
  },[hitId]);
  useImperativeHandle(ref,()=>({
    slap() { if(current.current.animation==='idle'&&current.current.interactive){addImpulse(springs.current);onSlap?.();} },
  }),[onSlap]);
  useEffect(()=>{
    const canvas=canvasRef.current,ctx=canvas.getContext('2d');
    const cell=document.createElement('canvas');cell.width=192;cell.height=208;
    const cellCtx=cell.getContext('2d');
    // Keep a protected yellow silhouette rim, even when a user moves the face.
    const faceLayer=document.createElement('canvas');faceLayer.width=192;faceLayer.height=208;
    const faceCtx=faceLayer.getContext('2d');
    const inset=document.createElement('canvas');inset.width=192;inset.height=208;
    const insetCtx=inset.getContext('2d');
    const sprite=new Image();
    let disposed=false,raf,start=0,key='',last=0,completed=false,stableTicket=null,stableFrames=0,stableDelivered=false;
    ctx.scale(2,2);
    sprite.onload=()=>{
      if(disposed) return;
      if(sprite.naturalWidth!==ATLAS.width || sprite.naturalHeight!==ATLAS.height) {
        current.current.onError?.('原始精灵图尺寸不符合 v2 格式');return;
      }
      current.current.onReady?.();
      const draw=now=>{
        if(disposed) return;
        const state=current.current,action=ANIMATIONS[state.animation];
        const nextKey=state.animation+':'+state.playbackId;
        if(nextKey!==key){key=nextKey;start=state.startedAt??now;completed=false;if(state.animation==='laugh')springs.current=[];}
        const frame=state.frozenFrame==null ? frameAt(action,now-start) : Math.min(action.frames-1,state.frozenFrame);
        pose.current={action:state.animation,frame};
        const dt=last?(now-last)/1000:1/60;last=now;
        stepSprings(springs.current,dt);
        cellCtx.clearRect(0,0,192,208);
        cellCtx.drawImage(sprite,frame*192,action.row*208,192,208,0,0,192,208);
        ctx.clearRect(0,0,192,208);ctx.drawImage(cell,0,0);
        const belly=BELLY_ANCHORS[state.animation][frame];
        drawBelly(ctx,cell,belly,springs.current);
        const anchor=getFaceAnchor(state.animation,frame,state.face);
        if(state.face && patch.current) {
          faceCtx.clearRect(0,0,192,208);
          faceCtx.save();
          const head=FACE_ANCHORS[state.animation][frame];
          faceCtx.beginPath();
          faceCtx.ellipse(head.x,head.y,head.w*.62,head.h*.6,0,0,Math.PI*2);
          faceCtx.clip();
          // A feathered skin-colour underlay suppresses original eyes/mouth
          // at the photo edge. Colour is sampled from this original frame.
          const sample=cellCtx.getImageData(Math.round(head.x+head.w*.32),Math.round(head.y+head.h*.2),1,1).data;
          faceCtx.save();faceCtx.translate(head.x,head.y);
          faceCtx.scale(head.w/2,head.h/2);
          const skin=faceCtx.createRadialGradient(0,0,.65,0,0,1.2);
          skin.addColorStop(0,'rgba('+sample[0]+','+sample[1]+','+sample[2]+',1)');
          skin.addColorStop(.65,'rgba('+sample[0]+','+sample[1]+','+sample[2]+',.96)');
          skin.addColorStop(1,'rgba('+sample[0]+','+sample[1]+','+sample[2]+',0)');
          faceCtx.fillStyle=skin;faceCtx.fillRect(-1.3,-1.3,2.6,2.6);faceCtx.restore();
          faceCtx.globalCompositeOperation='destination-in';faceCtx.drawImage(cell,0,0);
          faceCtx.globalCompositeOperation='source-over';ctx.drawImage(faceLayer,0,0);
          faceCtx.clearRect(0,0,192,208);
          drawFace(faceCtx,patch.current,anchor);
          faceCtx.restore();
          // Erode the original alpha by 2.5 source pixels. The untouched yellow
          // outline stays visible; uploaded pixels never spill onto background.
          insetCtx.globalCompositeOperation='source-over';insetCtx.clearRect(0,0,192,208);insetCtx.drawImage(cell,0,0);
          insetCtx.globalCompositeOperation='destination-in';
          for(const [dx,dy] of [[-2.5,0],[2.5,0],[0,-2.5],[0,2.5],[-1.8,-1.8],[1.8,-1.8],[-1.8,1.8],[1.8,1.8]]) insetCtx.drawImage(cell,dx,dy);
          faceCtx.globalCompositeOperation='destination-in';faceCtx.drawImage(inset,0,0);
          faceCtx.globalCompositeOperation='source-over';ctx.drawImage(faceLayer,0,0);
        }
        canvas.dataset.frame=String(frame);
        canvas.dataset.elapsed=String(now-start);
        canvas.dataset.cycle=String(action.cycles?Math.min(action.cycles-1,Math.floor((now-start)/action.cycleDurationMs)):0);
        canvas.dataset.animation=state.animation;
        canvas.dataset.face=String(!!(state.face && patch.current));
        canvas.dataset.anchor=JSON.stringify(anchor);
        canvas.dataset.spring=String(springs.current.reduce((sum,s)=>sum+Math.abs(s.position),0));
        if(state.frozenFrame==null && !action.loop && !completed && now-start>=durationOf(action)) {
          completed=true;state.onComplete?.();
        }
        // Formal recovery completion: idle sprite actually drawn, no spring motion,
        // and no unfinished CSS hit reaction. Two consecutive rendered frames,
        // rather than a separate timeout, confirm the restored standing pose.
        if(state.recoveryId!==stableTicket){stableTicket=state.recoveryId;stableFrames=0;stableDelivered=false;}
        const stable=state.recoveryId!=null&&state.animation==='idle'&&springs.current.length===0
          &&canvas.getAnimations().every(a=>a.playState==='finished'||a.playState==='idle');
        stableFrames=stable?stableFrames+1:0;
        canvas.dataset.stable=String(stable);
        if(stableFrames>=2&&!stableDelivered){stableDelivered=true;state.onStable?.(state.recoveryId);}
        raf=requestAnimationFrame(draw);
      };
      raf=requestAnimationFrame(draw);
    };
    sprite.onerror=()=>!disposed && current.current.onError?.('奶蛙素材加载失败，请刷新重试');
    sprite.src='/naifrog/spritesheet.webp';
    return ()=>{disposed=true;cancelAnimationFrame(raf);ctx.setTransform(1,0,0,1,0,0);};
  },[]);
  function pointerDown(event) {
    if(!interactive || pose.current.action!=='idle') return;
    const rect=canvasRef.current.getBoundingClientRect();
    const x=(event.clientX-rect.left)*192/rect.width,y=(event.clientY-rect.top)*208/rect.height;
    const belly=BELLY_ANCHORS[pose.current.action][pose.current.frame];
    const u=(x-belly.x)/belly.rx,v=(y-belly.y)/belly.ry;
    if(u*u+v*v>1) return;
    event.preventDefault();addImpulse(springs.current,u,v);onSlap?.();
  }
  return <canvas ref={canvasRef} width={384} height={416} onPointerDown={pointerDown}
    className={'pet-sprite '+className} role="img" aria-label={'原版奶蛙：'+ANIMATIONS[animation].label}
    style={{touchAction:interactive?'none':'auto'}} />;
});
export default PetSprite;








