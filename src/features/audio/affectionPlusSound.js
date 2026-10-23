import { createEggCrackSound } from './eggCrackSound.js';
export function createAffectionPlusSound(){
  const sound=createEggCrackSound({sourceUrl:'/audio/affection-plus.mp3',polyphonic:false});
  return {...sound,play:sound.impact};
}
