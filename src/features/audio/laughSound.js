// The app enters this only after bing has ended or failed. Never stop a
// healthy bing here; both jumps share this one laugh playback.
export function startLaughSound(laughAudio) {
  if(!laughAudio)return;
  try {
    laughAudio.pause();
    try{laughAudio.currentTime=0;}catch{}
    laughAudio.play()?.catch(()=>{});
  }catch{}
}
