// Damped impulse springs drive actual sprite vertex positions, never shadows.
// Unit position ~= a strong tap; all coordinates below are original source px.
const smooth=(a,b,t)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
export function addImpulse(springs,u=0,v=0) {
  const near=springs.find(s=>Math.hypot(s.u-u,s.v-v)<.3);
  if(near) {
    near.velocity=Math.max(-52,near.velocity-32);
    near.age=0;
  } else springs.push({u,v,position:0,velocity:-34,age:0});
  if(springs.length>6)springs.shift();
}
export function stepSprings(springs,dt) {
  let left=Math.min(dt,.05);
  while(left>0){
    const h=Math.min(left,1/240);
    for(const s of springs){
      s.velocity+=(-340*s.position-11.5*s.velocity)*h;
      s.position+=s.velocity*h;s.age+=h;
      // Bounded impulses prevent inversion after many taps; next frame always
      // starts from the untouched source, so no deformation can accumulate.
      if(Math.abs(s.position)>1.65){s.position=Math.sign(s.position)*1.65;s.velocity*=.65;}
    }
    left-=h;
  }
  for(let i=springs.length-1;i>=0;i--)
    if(Math.abs(springs[i].position)<.004&&Math.abs(springs[i].velocity)<.07)springs.splice(i,1);
}
export function deformationAt(x,y,belly,springs) {
  // Support extends OUTSIDE the cream patch: its actual colour boundary moves.
  // Smoothly fixed yellow torso margins protect head, attached hands and feet.
  const leftFence=50+10*smooth(94,112,y);
  const support=smooth(leftFence,leftFence+9,x)*(1-smooth(120,131,x))
    *smooth(62,76,y)*(1-smooth(148,160,y));
  if(support<=0)return {x,y};
  let dx=0,dy=0;
  for(const s of springs){
    const hitX=belly.x+s.u*belly.rx,hitY=belly.y+s.v*belly.ry;
    const ox=x-hitX,oy=y-hitY;
    const distance=Math.hypot(ox,oy),r2=distance*distance/(44*44);
    const local=Math.exp(-r2*1.05);
    const core=Math.exp(-r2*2.1);
    // Radial compression stretches the cream/yellow edge, while a fast upward
    // indentation at the contact gives weight; the sign reverses on rebound.
    dx+=s.position*(ox*.38*local)*support;
    dy+=s.position*(oy*.34*local+12*core)*support;
    // A travelling displacement of the ORIGINAL pixels spreads the impulse.
    const waveRadius=12+s.age*95;
    const wave=Math.exp(-Math.pow((distance-waveRadius)/15,2))*s.position*2.2*support;
    if(distance>1){dx+=wave*ox/distance;dy+=wave*oy/distance;}
  }
  const length=Math.hypot(dx,dy);
  const limit=15;
  const gain=length>0?limit*Math.tanh(length/limit)/length:1;
  return {x:x+dx*gain,y:y+dy*gain};
}
function triangle(ctx,source,a,b,c,p,q,r) {
  const det=(b.x-a.x)*(c.y-a.y)-(c.x-a.x)*(b.y-a.y);
  const A=((q.x-p.x)*(c.y-a.y)-(r.x-p.x)*(b.y-a.y))/det;
  const C=((r.x-p.x)*(b.x-a.x)-(q.x-p.x)*(c.x-a.x))/det;
  const B=((q.y-p.y)*(c.y-a.y)-(r.y-p.y)*(b.y-a.y))/det;
  const D=((r.y-p.y)*(b.x-a.x)-(q.y-p.y)*(c.x-a.x))/det;
  // Subpixel overlap closes triangle antialias seams in the opaque torso.
  const cx=(p.x+q.x+r.x)/3,cy=(p.y+q.y+r.y)/3;
  const expand=t=>{const length=Math.hypot(t.x-cx,t.y-cy);return {x:t.x+(t.x-cx)*1.8/length,y:t.y+(t.y-cy)*1.8/length};};
  const points=[p,q,r].map(expand);
  ctx.save();ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
  ctx.lineTo(points[1].x,points[1].y);ctx.lineTo(points[2].x,points[2].y);ctx.closePath();ctx.clip();
  ctx.transform(A,B,C,D,p.x-A*a.x-C*a.y,p.y-B*a.x-D*a.y);
  ctx.drawImage(source,0,0);ctx.restore();
}
export function drawBelly(ctx,source,belly,springs) {
  if(!springs.length)return;
  // 4 source-pixel spacing, 26×26 vertices. Entire cream patch plus a narrow
  // band of the surrounding ORIGINAL torso; no replacement-colour ellipse.
  const left=40,top=60,step=4,cols=25,rows=25;
  const points=[];
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
    const x=left+i*step,y=top+j*step;
    points.push({source:{x,y},target:deformationAt(x,y,belly,springs)});
  }
  ctx.save();ctx.beginPath();ctx.rect(left,top,cols*step,rows*step);ctx.clip();
  ctx.clearRect(left,top,cols*step,rows*step);
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
    const a=points[j*(cols+1)+i],b=points[j*(cols+1)+i+1];
    const c=points[(j+1)*(cols+1)+i],d=points[(j+1)*(cols+1)+i+1];
    const fixed=[a,b,c,d].every(p=>p.source.x===p.target.x&&p.source.y===p.target.y);
    if(fixed)ctx.drawImage(source,a.source.x,a.source.y,step,step,a.source.x,a.source.y,step,step);
    else{
      triangle(ctx,source,a.source,b.source,c.source,a.target,b.target,c.target);
      triangle(ctx,source,b.source,d.source,c.source,b.target,d.target,c.target);
    }
  }
  ctx.restore();
  // Exact original pixels for protected parts, including AA overlap margins.
  ctx.clearRect(0,0,192,64);ctx.drawImage(source,0,0,192,64,0,0,192,64);
  ctx.clearRect(0,64,48,96);ctx.drawImage(source,0,64,48,96,0,64,48,96);
  ctx.clearRect(132,64,60,96);ctx.drawImage(source,132,64,60,96,132,64,60,96);
}



