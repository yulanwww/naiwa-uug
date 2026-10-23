import { useCallback, useEffect, useRef, useState } from 'react';
export const AFFECTION_KEY='affectionByAvatarId';
export const REWARDS=[26,32,606,5408];
export const pickReward=()=>REWARDS[Math.floor(Math.random()*REWARDS.length)];
function readScores(){
  try{
    const raw=JSON.parse(localStorage.getItem(AFFECTION_KEY)||'{}'),scores={};
    if(!raw||typeof raw!=='object'||Array.isArray(raw))return scores;
    for(const [id,value] of Object.entries(raw)){
      if(typeof value==='string'&&/^-?\d+$/.test(value))scores[id]=BigInt(value);
      else if(typeof value==='number'&&Number.isSafeInteger(value))scores[id]=BigInt(value);
    }
    return scores;
  }catch{return {};}
}
export function useAffection(){
  const [scores,setScores]=useState(readScores),latest=useRef(scores);
  const [storageError,setStorageError]=useState('');
  const persist=useCallback(next=>{
    latest.current=next;setScores(next);
    try{
      localStorage.setItem(AFFECTION_KEY,JSON.stringify(Object.fromEntries(Object.entries(next).map(([id,n])=>[id,n.toString()]))));
      setStorageError('');
    }catch{setStorageError('好感度已更新，但当前浏览器无法保存，刷新后可能丢失。');}
  },[]);
  const change=useCallback((id,delta)=>persist({...latest.current,[id]:(latest.current[id]??0n)+BigInt(delta)}),[persist]);
  const reset=useCallback(id=>persist({...latest.current,[id]:0n}),[persist]);
  const remove=useCallback(id=>{
    if(id==='original'||id.startsWith('builtin-'))return;
    const next={...latest.current};delete next[id];persist(next);
  },[persist]);
  useEffect(()=>{
    const sync=e=>{if(e.storageArea===localStorage&&(e.key===AFFECTION_KEY||e.key===null)){const next=readScores();latest.current=next;setScores(next);}};
    window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);
  },[]);
  return {scores,change,remove,reset,storageError};
}
