// The original row 4 already contains takeoff, airborne and grounded landing.
// No CSS jump or full-character scaling is added. Two five-frame cycles share
// one elapsed-time clock, 300 ms/frame, 1500 ms/cycle, 3000 ms total.
export const ATLAS={width:1536,height:2288,cellWidth:192,cellHeight:208};
export const ANIMATIONS={
  idle:{row:0,frames:6,fps:6,label:'待机',loop:true},
  laugh:{row:4,frames:5,fps:5/1.5,label:'捧肚大笑',loop:false,cycleDurationMs:1500,cycles:2,durationMs:3000},
};
export function durationOf(animation) {
  return animation.durationMs??animation.frames*1000/animation.fps;
}
export function frameAt(animation,elapsedMs) {
  const elapsed=Math.max(0,elapsedMs);
  if(animation.cycleDurationMs){
    if(elapsed>=durationOf(animation))return animation.frames-1;
    return Math.min(animation.frames-1,Math.floor((elapsed%animation.cycleDurationMs)*animation.frames/animation.cycleDurationMs));
  }
  const step=Math.floor(elapsed*animation.fps/1000);
  return animation.loop?step%animation.frames:Math.min(step,animation.frames-1);
}
