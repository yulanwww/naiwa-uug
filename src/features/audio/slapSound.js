// Called synchronously from the first existing combo tap, inside a user gesture.
// Report playback failures to the sequence controller; never block animation.
export function restartSlapSound(audio) {
  if(!audio)return Promise.resolve(false);
  try {
    audio.pause();
    try {audio.currentTime=0;} catch {}
    return Promise.resolve(audio.play()).then(()=>true,()=>false);
  } catch {return Promise.resolve(false);}
}
