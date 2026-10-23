// Shared decoded buffer, half-volume bus, and independently disposable voices.
export function createEggCrackSound({AudioContextClass=globalThis.AudioContext??globalThis.webkitAudioContext,fetchAudio=globalThis.fetch,sourceUrl='/audio/egg-crack.mp3',polyphonic=true}={}){
  let context,gain,buffer,disposed=false;
  const sources=new Set(),abort=new AbortController();
  const ready=(async()=>{
    try{
      if(!AudioContextClass)return false;
      context=new AudioContextClass();gain=context.createGain();gain.gain.value=.5;gain.connect(context.destination);
      const response=await fetchAudio(sourceUrl,{signal:abort.signal});
      if(!response.ok)throw new Error('audio unavailable');
      const decoded=await context.decodeAudioData(await response.arrayBuffer());
      if(disposed)return false;
      buffer=decoded;return true;
    }catch{return false;}
  })();
  function release(node,stop=false){sources.delete(node);node.onended=null;if(stop)try{node.stop();}catch{}try{node.disconnect();}catch{}}
  function stopAll(){for(const node of [...sources])release(node,true);}
  return {
    ready,
    prepare(){if(disposed||!context)return;try{context.resume()?.catch(()=>{});}catch{}},
    impact(){
      if(disposed||!buffer||context?.state!=='running')return false;
      if(!polyphonic)stopAll();
      if(sources.size>=48)return false;
      let next;
      try{
        next=context.createBufferSource();next.buffer=buffer;next.playbackRate.value=1;next.loop=false;next.connect(gain);
        sources.add(next);next.onended=()=>release(next);next.start();return true;
      }catch{if(next)release(next,true);return false;}
    },
    dispose(){disposed=true;abort.abort();stopAll();try{gain?.disconnect();context?.close()?.catch(()=>{});}catch{}}
  };
}
