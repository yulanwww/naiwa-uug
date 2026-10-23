import assert from 'node:assert/strict';
import {createEggCrackSound} from '../src/features/audio/eggCrackSound.js';
const sources=[];let gain;
class Context{
 state='suspended';destination={};
 createGain(){return gain={gain:{value:1},connect(){},disconnect(){}};}
 decodeAudioData(){return Promise.resolve({duration:1.0202083333});}
 resume(){this.state='running';return Promise.resolve();}
 close(){this.state='closed';return Promise.resolve();}
 createBufferSource(){const node={playbackRate:{value:1},loop:false,startCount:0,stopCount:0,connect(){},disconnect(){},start(){this.startCount++;},stop(){this.stopCount++;}};sources.push(node);return node;}
}
const options={AudioContextClass:Context,fetchAudio:async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(0)})};
const sound=createEggCrackSound(options);assert.equal(await sound.ready,true);assert.equal(sound.impact(),false);sound.prepare();assert.equal(sound.impact(),true);assert.equal(sound.impact(),true);assert.equal(sources[0].stopCount,0);assert.equal(sources[1].stopCount,0);assert.equal(gain.gain.value,.5);
sources[0].onended();sound.dispose();assert.equal(sources[0].stopCount,0);assert.equal(sources[1].stopCount,1);assert.equal(sound.impact(),false);
const exclusive=createEggCrackSound({...options,polyphonic:false});await exclusive.ready;exclusive.prepare();exclusive.impact();exclusive.impact();assert.equal(sources[2].stopCount,1);exclusive.dispose();
const bounded=createEggCrackSound(options);await bounded.ready;bounded.prepare();for(let i=0;i<48;i++)assert.equal(bounded.impact(),true);assert.equal(bounded.impact(),false);bounded.dispose();
const broken=createEggCrackSound({AudioContextClass:Context,fetchAudio:async()=>{throw new Error('offline');}});assert.equal(await broken.ready,false);broken.prepare();assert.equal(broken.impact(),false);broken.dispose();
console.log('PASS: overlapping voices, ended cleanup, bounded voices, half gain, plus exclusive mode, failure/dispose safe');
