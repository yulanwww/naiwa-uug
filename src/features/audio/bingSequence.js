// One media-element lifetime, no duration guesses or audio timers.
// Generation guards prevent a rejected play from an older round releasing
// a newer waiting round. All event listeners are removed on dispose.
import { restartSlapSound } from './slapSound.js';
export function createBingSequence(audio,onSettled) {
  let status='idle',generation=0,disposed=false;
  function settle(next) {
    if(disposed)return;
    status=next;
    onSettled();
  }
  function ended(){if(audio.ended)settle('ended');}
  function failed(){
    if(disposed)return;
    try{audio.pause();}catch{}
    settle('failed');
  }
  audio.addEventListener('ended',ended);
  audio.addEventListener('error',failed);
  audio.addEventListener('abort',failed);
  return {
    start(){
      const round=++generation;
      status='pending';
      restartSlapSound(audio).then(ok=>{
        if(disposed||round!==generation)return;
        if(!ok)failed();
        else if(status==='pending')status='playing';
      });
    },
    isPending(){
      return !audio.ended&&!audio.error&&(status==='pending'||status==='playing');
    },
    dispose(){
      disposed=true;generation++;
      audio.removeEventListener('ended',ended);
      audio.removeEventListener('error',failed);
      audio.removeEventListener('abort',failed);
      audio.pause();
    },
  };
}
