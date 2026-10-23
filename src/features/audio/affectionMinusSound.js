import { createEggCrackSound } from './eggCrackSound.js';
export function createAffectionMinusSound(){
  const sound=createEggCrackSound({sourceUrl:'/audio/affection-minus.mp3'});
  return {...sound,play:sound.impact};
}
