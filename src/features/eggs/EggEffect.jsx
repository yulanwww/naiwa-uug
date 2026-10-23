import React, { useEffect, useRef } from 'react';
export const EGG_FLIGHT_MS=420;
export const EGG_TOTAL_MS=1120;
// Cutouts from the supplied sheet's first two rows; the alpha channel is retained.
export const EGG_STAGES=[
  [40,170,330,290],[420,180,330,270],[770,180,330,300],
  [1090,60,440,460],[0,535,405,395],[410,535,355,395],
  [770,535,395,395],[1160,550,375,385]
];
export const EGG_PIVOTS=[[200,310],[580,315],[920,320],[1300,320],[180,765],[580,755],[980,755],[1390,765]];
let cached;
export function loadEggAssets(){
  if(!cached)cached=new Promise((resolve,reject)=>{
    const image=new Image();image.onload=()=>resolve(image);
    image.onerror=()=>{cached=null;reject(new Error('鸡蛋素材加载失败，请刷新后重试'));};
    image.src='/effects/egg-stages.png';
  });
  return cached;
}
export default function EggEffect({action,onImpact,onComplete,onError}){
  const canvas=useRef(null),callbacks=useRef({onImpact,onComplete,onError});
  callbacks.current={onImpact,onComplete,onError};
  useEffect(()=>{
    const el=canvas.current,ctx=el.getContext('2d');ctx.setTransform(2,0,0,2,0,0);
    let disposed=false,raf,impacted=false,finished=false;
    const complete=()=>{if(!finished){finished=true;callbacks.current.onComplete(action.id);}};
    loadEggAssets().then(image=>{
      if(disposed)return;
      // Start the visual clock only when the real texture is ready.
      const start=performance.now(),target=action.target;
      const drawStage=(stage,x,y,size,alpha=1,angle=0)=>{
        const [sx,sy,sw,sh]=EGG_STAGES[stage];
        const scale=size/Math.max(sw,sh);
        ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(angle);
        const [px,py]=EGG_PIVOTS[stage];
        ctx.drawImage(image,sx,sy,sw,sh,-(px-sx)*scale,-(py-sy)*scale,sw*scale,sh*scale);ctx.restore();
      };
      const draw=now=>{
        if(disposed)return;
        const elapsed=Math.max(0,now-start);
        ctx.clearRect(0,0,192,208);
        el.dataset.target=JSON.stringify(target);el.dataset.elapsed=String(elapsed);
        if(elapsed<EGG_FLIGHT_MS){
          const t=elapsed/EGG_FLIGHT_MS,s=1-t;
          const x=s*s*178+2*s*t*((178+target.x)/2-28)+t*t*target.x;
          const y=s*s*202+2*s*t*(Math.min(202,target.y)-60)+t*t*target.y;
          el.dataset.stage='flight';el.dataset.position=JSON.stringify({x,y});
          drawStage(0,x,y,22,.98,-.5+t*1.1);
        }else{
          if(!impacted){impacted=true;callbacks.current.onImpact(action.id);}
          const hit=elapsed-EGG_FLIGHT_MS;
          const stage=hit<75?1:hit<145?2:hit<245?3:hit<345?4:hit<445?5:hit<535?6:7;
          const size=hit<75?24:hit<145?29:hit<245?43:51;
          const alpha=hit<400?1:Math.max(0,1-(hit-400)/300);
          el.dataset.stage=String(stage);el.dataset.position=JSON.stringify(target);
          drawStage(stage,target.x,target.y,size,alpha);
        }
        if(elapsed>=EGG_TOTAL_MS){ctx.clearRect(0,0,192,208);complete();return;}
        raf=requestAnimationFrame(draw);
      };
      raf=requestAnimationFrame(draw);
    }).catch(error=>{if(!disposed){callbacks.current.onError?.(error.message);complete();}});
    return()=>{disposed=true;cancelAnimationFrame(raf);ctx.clearRect(0,0,192,208);};
  },[action.id]);
  return <canvas ref={canvas} data-egg-id={action.id} width={384} height={416} className="egg-effect" aria-hidden="true"/>;
}
