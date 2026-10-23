import React, { useCallback, useEffect, useRef, useState } from 'react';
import PetSprite from './components/PetSprite.jsx';
import Sheet from './components/Sheet.jsx';
import { createAffectionMinusSound } from './features/audio/affectionMinusSound.js';
import { createAffectionPlusSound } from './features/audio/affectionPlusSound.js';
import { createEggCrackSound } from './features/audio/eggCrackSound.js';
import { useAffection, pickReward } from './features/affection/useAffection.js';
import EggEffect, { loadEggAssets } from './features/eggs/EggEffect.jsx';
import { createBingSequence } from './features/audio/bingSequence.js';
import { startLaughSound } from './features/audio/laughSound.js';
import FaceEditor from './features/faces/FaceEditor.jsx';
import FaceLibrary from './features/faces/FaceLibrary.jsx';
import { acceptsFriendsPassphrase, getBuiltinCatalog, loadBuiltinFaces, matchBuiltinCopies } from './features/faces/builtinFaces.js';
import { deleteFace, listFaces, readActive, saveFace, writeActive, readFriendsUnlocked, writeFriendsUnlocked, readFriendsExpanded, writeFriendsExpanded } from './features/faces/storage.js';

export default function App() {
  const [motion,setMotion]=useState({phase:'idle',animation:'idle',playbackId:0,startedAt:null});
  const {phase,animation,playbackId,startedAt}=motion;
  const [metadata,setMetadata]=useState(null),[ready,setReady]=useState(false),[error,setError]=useState('');
  const [faces,setFaces]=useState([]),[active,setActive]=useState(null),[draft,setDraft]=useState(null);
  const [sheet,setSheet]=useState(null),[editing,setEditing]=useState(null);
  const [libraryReady,setLibraryReady]=useState(false),[storageBusy,setStorageBusy]=useState(false);
  const [hits,setHits]=useState(0);
  const [resetTarget,setResetTarget]=useState(null),resetPending=useRef(null),eggSound=useRef(null),plusSound=useRef(null),minusSound=useRef(null),pendingSettlement=useRef(null);
  useEffect(()=>{const sound=createEggCrackSound(),plus=createAffectionPlusSound(),minus=createAffectionMinusSound();eggSound.current=sound;plusSound.current=plus;minusSound.current=minus;return()=>{eggSound.current=null;plusSound.current=null;minusSound.current=null;pendingSettlement.current=null;sound.dispose();plus.dispose();minus.dispose();};},[]);
  const [mode,setMode]=useState('belly'),modeRef=useRef('belly');
  useEffect(()=>{loadEggAssets().catch(()=>{});},[]);
  const {scores,change:changeAffection,remove:removeAffection,reset:resetAffection,storageError}=useAffection();
  const avatarId=active?.id??'original',avatarName=active?.name??'原版奶娃';
  const [eggActions,setEggActions]=useState([]),[eggCounts,setEggCounts]=useState({}),[scoreFloats,setScoreFloats]=useState([]);
  const eggCountsRef=useRef({}),activeEggs=useRef(new Map()),eggSettlements=useRef([]),eggBurst=useRef(0),laughRound=useRef(null),serial=useRef(0);
  const settleAffection=useCallback((id,sign)=>{const delta=sign*pickReward();changeAffection(id,delta);const floating={id:++serial.current,avatarId:id,delta};setScoreFloats(previous=>[...previous,floating]);if(delta>0)plusSound.current?.play();else if(delta<0)minusSound.current?.play();},[changeAffection]);
  const [friendsUnlocked,setFriendsUnlocked]=useState(false),[builtinFaces,setBuiltinFaces]=useState([]),[friendsExpanded,setFriendsExpanded]=useState(false);
  const petRef=useRef(null),taps=useRef([]),tapTimer=useRef(null),slapAudio=useRef(null),laughAudio=useRef(null),interaction=useRef('idle'),bingSequence=useRef(null);
  // Both media elements previously used the native default volume of 1.
  // Set an absolute half-volume (not repeated multiplication in StrictMode).
  useEffect(()=>{slapAudio.current.volume=0.5;laughAudio.current.volume=0.5;},[]);
  useEffect(()=>{
    const controller=new AbortController();
    fetch('/naifrog/pet.json',{signal:controller.signal})
      .then(response=>{if(!response.ok)throw new Error('无法读取 pet.json');return response.json();})
      .then(pet=>{if(pet.spriteVersionNumber!==2)throw new Error('不支持的精灵图版本');setMetadata(pet);})
      .catch(reason=>{if(reason.name!=='AbortError')setError(reason.message);});
    return ()=>controller.abort();
  },[]);
  useEffect(()=>{
    let cancelled=false;
    Promise.all([listFaces(),readActive(),readFriendsUnlocked(),getBuiltinCatalog(),readFriendsExpanded()]).then(async([saved,id,unlocked,catalog,expanded])=>{
      const copies=await matchBuiltinCopies(saved,catalog);
      const builtins=unlocked?await loadBuiltinFaces():[];
      if(cancelled)return;
      setFaces(saved.filter(f=>!copies.has(f.id)).sort((a,b)=>b.updatedAt-a.updatedAt));
      setFriendsUnlocked(!!unlocked);setBuiltinFaces(builtins);setFriendsExpanded(unlocked?expanded!==false:false);
      const builtinId=copies.get(id)??id;
      setActive((unlocked?builtins.find(f=>f.id===builtinId):null)??saved.find(f=>f.id===id&&!copies.has(f.id))??null);
      setLibraryReady(true);
    }).catch(e=>{if(!cancelled){setError('无法读取头像库：'+e.message);setLibraryReady(true);}});
    return ()=>{cancelled=true;clearTimeout(tapTimer.current);};
  },[]);
  const recover=useCallback(ticket=>{
    pendingSettlement.current=ticket;interaction.current='recovering';
    setMotion(previous=>({...previous,phase:'recovering',animation:'idle',startedAt:null,recoveryId:ticket.id}));
  },[]);
  const standing=useCallback(id=>{
    const ticket=pendingSettlement.current;
    if(interaction.current!=='recovering'||!ticket||ticket.id!==id||ticket.settled)return;
    if(ticket.kind==='egg'&&activeEggs.current.size)return;
    ticket.settled=true;pendingSettlement.current=null;
    if(ticket.kind==='egg'){
      const queued=eggSettlements.current;eggSettlements.current=[];eggBurst.current=0;
      for(const debit of queued){if(!debit.settled){debit.settled=true;settleAffection(debit.avatarId,-1);}}
    }
    if(ticket.sign)settleAffection(ticket.avatarId,ticket.sign);
    interaction.current='idle';
    setMotion(previous=>({...previous,phase:'idle',recoveryId:null}));
  },[settleAffection]);
  const idle=useCallback(()=>{
    if(interaction.current!=='laughing')return;
    const round=laughRound.current;laughRound.current=null;
    taps.current=[];setHits(0);clearTimeout(tapTimer.current);
    if(round)recover({...round,sign:1});
  },[recover]);
  const loaded=useCallback(()=>setReady(true),[]);
  const fail=useCallback(message=>setError(message),[]);
  const beginLaugh=useCallback(()=>{
    if(interaction.current==='laughing')return;
    interaction.current='laughing';
    taps.current=[];setHits(0);clearTimeout(tapTimer.current);
    const startedAt=performance.now();
    startLaughSound(laughAudio.current);
    setMotion(previous=>({phase:'laughing',animation:'laugh',playbackId:previous.playbackId+1,startedAt}));
  },[]);
  useEffect(()=>{
    const sequence=createBingSequence(slapAudio.current,()=>{
      if(interaction.current==='waitingForBingEnd')beginLaugh();
    });
    bingSequence.current=sequence;
    const laugh= laughAudio.current;
    return ()=>{
      interaction.current='idle';
      bingSequence.current=null;
      sequence.dispose();laugh?.pause();clearTimeout(tapTimer.current);
    };
  },[beginLaugh]);
  const laugh=useCallback(()=>{
    if(!['idle','tapping'].includes(interaction.current))return;
    taps.current=[];setHits(0);clearTimeout(tapTimer.current);
    if(bingSequence.current?.isPending()){
      interaction.current='waitingForBingEnd';
      setMotion(previous=>({...previous,phase:'waitingForBingEnd'}));
    }else beginLaugh();
  },[beginLaugh]);
  const slap=useCallback(()=>{
    if(modeRef.current!=='belly'||resetPending.current)return;
    if(!['idle','tapping'].includes(interaction.current))return;
    const now=performance.now();
    taps.current=taps.current.filter(time=>now-time<1200);
    if(taps.current.length&&laughRound.current?.avatarId!==avatarId){taps.current=[];clearTimeout(tapTimer.current);}
    if(taps.current.length===0){plusSound.current?.prepare();laughRound.current={id:++serial.current,avatarId,settled:false};laughAudio.current?.pause();bingSequence.current?.start();}
    interaction.current='tapping';
    setMotion(previous=>({...previous,phase:'tapping'}));
    taps.current.push(now);
    setHits(taps.current.length);
    clearTimeout(tapTimer.current);
    if(taps.current.length>=3)laugh();
    else tapTimer.current=setTimeout(()=>{
      taps.current=[];setHits(0);
      if(interaction.current==='tapping'){
        interaction.current='idle';
        setMotion(previous=>({...previous,phase:'idle'}));
      }
    },1200);
  },[laugh,avatarId]);
  // Normal rapid taps remain independent; extreme bursts drain after 48 throws
  // so a never-ending stream cannot starve the standing/settlement checkpoint.
  const throwEgg=useCallback(target=>{
    const allowed=interaction.current==='idle'||interaction.current.startsWith('egg')
      ||(interaction.current==='recovering'&&pendingSettlement.current?.kind==='egg');
    if(modeRef.current!=='egg'||!ready||!allowed||resetPending.current)return;
    if(activeEggs.current.size>=24||eggBurst.current>=48)return;
    eggSound.current?.prepare();minusSound.current?.prepare();
    pendingSettlement.current=null;
    const action={id:++serial.current,avatarId,target,startedAt:performance.now(),impacted:false};
    activeEggs.current.set(action.id,action);eggBurst.current++;
    interaction.current='eggFlying';
    setEggActions(previous=>[...previous,action]);
    setMotion(previous=>({...previous,phase:'eggFlying',recoveryId:null}));
  },[ready,avatarId]);
  const eggImpact=useCallback(id=>{
    const action=activeEggs.current.get(id);
    if(!action||action.impacted)return;
    action.impacted=true;eggSound.current?.impact();interaction.current='eggHit';
    const count=(eggCountsRef.current[action.avatarId]??0)+1;
    const next={...eggCountsRef.current,[action.avatarId]:count%3};
    eggCountsRef.current=next;setEggCounts(next);
    if(count===3)eggSettlements.current.push({id:++serial.current,avatarId:action.avatarId,settled:false});
    setMotion(previous=>({...previous,phase:'eggHit',hitId:id}));
  },[]);
  const eggComplete=useCallback(id=>{
    if(!activeEggs.current.has(id))return;
    activeEggs.current.delete(id);setEggActions(previous=>previous.filter(action=>action.id!==id));
    if(!activeEggs.current.size)recover({id:++serial.current,kind:'egg',sign:0,settled:false});
  },[recover]);
  useEffect(()=>()=>{activeEggs.current.clear();eggSettlements.current=[];},[]);
  function switchMode(next){
    if(!['idle','tapping'].includes(interaction.current)||sheet||resetPending.current)return;
    if(modeRef.current===next)return;
    clearTimeout(tapTimer.current);taps.current=[];setHits(0);laughRound.current=null;
    interaction.current='idle';setMotion(previous=>({...previous,phase:'idle'}));
    modeRef.current=next;setMode(next);
  }
  function targetEgg(event){
    if(modeRef.current!=='egg'||!event.isPrimary||event.button!==0||sheet)return;
    event.preventDefault();
    const rect=event.currentTarget.getBoundingClientRect();
    throwEgg({x:Math.max(0,Math.min(192,(event.clientX-rect.left)*192/rect.width)),
      y:Math.max(0,Math.min(208,(event.clientY-rect.top)*208/rect.height))});
  }
  const onDraft=useCallback(face=>setDraft(face),[]);
  function closeEditor(){setSheet(null);setDraft(null);setEditing(null);}
  function openEditor(face=null){if(face?.builtIn||interaction.current!=='idle'||resetPending.current)return;setEditing(face);setDraft(face);setSheet('editor');}
  async function refreshFaces(){const saved=await listFaces(),catalog=await getBuiltinCatalog(),copies=await matchBuiltinCopies(saved,catalog);setFaces(saved.filter(f=>!copies.has(f.id)).sort((a,b)=>b.updatedAt-a.updatedAt));}
  async function save(face){
    if(interaction.current!=='idle'||resetPending.current)throw new Error('请等待本轮互动或确认结束');
    if(face.builtIn)throw new Error('内置头像不能修改');
    await saveFace(face);await writeActive(face.id);await refreshFaces();setActive(face);setError('');closeEditor();
  }
  async function select(face){if(interaction.current!=='idle'||resetPending.current)throw new Error('请等待本轮互动或确认结束');if(face.builtIn&&!friendsUnlocked)throw new Error('请先解锁隐藏头像');await writeActive(face.id);setActive(face);setError('');}
  async function unlockFriends(passphrase){if(!acceptsFriendsPassphrase(passphrase))throw new Error('口令不正确，再试一次');const builtins=await loadBuiltinFaces();await writeFriendsUnlocked();setBuiltinFaces(builtins);setFriendsUnlocked(true);setFriendsExpanded(true);}
  async function toggleFriends(){const next=!friendsExpanded;await writeFriendsExpanded(next);setFriendsExpanded(next);}
  async function restore(){
    if(interaction.current!=='idle'||resetPending.current)return;
    setActive(null);setDraft(null);
    try{await writeActive(null);setError('');}catch(e){setError('已恢复原版，但无法保存此选择：'+e.message);}
  }
  async function remove(face){
    if(interaction.current!=='idle'||resetPending.current)throw new Error('请等待本轮互动或确认结束');
    if(face.builtIn)throw new Error('内置头像不能删除');
    if(active?.id===face.id){await writeActive(null);setActive(null);}
    await deleteFace(face.id);removeAffection(face.id);const next={...eggCountsRef.current};delete next[face.id];eggCountsRef.current=next;setEggCounts(next);await refreshFaces();
  }
  async function restoreFromPage(){
    setStorageBusy(true);try{await restore();}finally{setStorageBusy(false);}
  }
  function requestReset(){
    if(interaction.current!=='idle'||sheet||resetPending.current||!libraryReady)return;
    const target={id:avatarId,name:avatarName};resetPending.current=target;setResetTarget(target);
  }
  function cancelReset(){resetPending.current=null;setResetTarget(null);}
  function confirmReset(){
    const target=resetPending.current;
    if(!target||interaction.current!=='idle')return;
    // Consume the confirmation synchronously before changing persistent data.
    resetPending.current=null;setResetTarget(null);resetAffection(target.id);setScoreFloats([]);
  }
  const displayFace=sheet==='editor'?draft:active;
  return <div className="page" data-phase={phase} data-mode={mode}>
    <audio ref={slapAudio} src="/audio/bingbingbing.mp3" preload="auto" loop={false} hidden />
    <audio ref={laughAudio} src="/audio/laugh.mp3" preload="auto" loop={false} hidden />
    <header className="header"><a className="wordmark" href="/" aria-label="naiwa 首页"><span className="brand-dot"/>naiwa<span className="wordmark-period">.</span></a><span className="local-badge"><i/> @北斗第四星_</span></header>
    <main>
      <section className="playground" aria-label="奶蛙互动区域">
        <div className="stage-heading"><span>奶娃</span><span title={displayFace?(displayFace.name?.trim()||'未命名头像'):'原版奶娃'}>{displayFace?(displayFace.name?.trim()||'未命名头像'):'原版奶娃'}</span></div>
        <div className="affection" role="status" aria-live="polite"><span className="affection-label">♥ {avatarName}的好感度：</span><output key={avatarId+':'+(scores[avatarId]??0n).toString()} className="affection-value">{(scores[avatarId]??0n).toString()}</output><button className="affection-reset" type="button" onClick={requestReset} disabled={phase!=='idle'||!libraryReady||!!sheet||!!resetTarget}>重置好感度</button></div>
        <div className="pet-area"><div className={"pet-platform "+(mode==='egg'?'egg-target-area':'')} onPointerDown={targetEgg}>
          {metadata&&<PetSprite ref={petRef} animation={animation} playbackId={playbackId} startedAt={startedAt} face={displayFace}
            onComplete={idle} recoveryId={phase==='recovering'?motion.recoveryId:null} onStable={standing} onReady={loaded} onError={fail} onSlap={slap} interactive={mode==='belly'&&!resetTarget&&(phase==='idle'||phase==='tapping')} hitId={motion.hitId??null}/>}
          <div className="ground"/>
          {eggActions.map(action=><EggEffect key={action.id} action={action} onImpact={eggImpact} onComplete={eggComplete} onError={fail}/>)}
          {scoreFloats.filter(item=>item.avatarId===avatarId).map((item,index)=><span key={item.id} className={'affection-float '+(item.delta>0?'positive':'negative')} style={{top:(30+(index%6)*7)+'%',left:(40+(index%3)*10)+'%'}} onAnimationEnd={()=>setScoreFloats(previous=>previous.filter(entry=>entry.id!==item.id))}>{item.delta>0?'+':'−'}{Math.abs(item.delta)} ♥</span>)}
        </div></div>
        <p className="pet-status" role="status" aria-live="polite">{!ready?'正在认识奶蛙…':mode==='egg'?'点击画面，向奶娃丢臭鸡蛋！':animation==='laugh'?'哈哈哈哈，笑到捧肚！':hits?'再拍一下 · '+hits+'/3':'三连拍奶蛙肚皮试试'}</p>
      </section>
      {mode==='egg'?<><p className="egg-credit">该功能来自 @翻斗兵神 强烈要求</p><p className="caption">每丢三颗臭鸡蛋，随机扣除一次好感度<br/>已投掷 {eggCounts[avatarId]??0} / 3</p></>:<p className="caption">三连拍拍肚，大笑完成后加好感度</p>}
      <nav className="controls" aria-label="奶蛙互动功能">
        <button className={mode==='belly'?'primary':''} aria-pressed={mode==='belly'} onClick={()=>switchMode('belly')} disabled={!ready||!!resetTarget||!(phase==='idle'||phase==='tapping')}>拍肚子</button>
        <button className={"egg-button "+(mode==='egg'?'mode-selected':'')} aria-pressed={mode==='egg'} onClick={()=>switchMode('egg')} disabled={!ready||!(phase==='idle'||phase==='tapping')}>丢臭鸡蛋</button>
        <button onClick={()=>setSheet('library')} disabled={!libraryReady||phase!=='idle'||!!resetTarget}>头像库{faces.length?' · '+faces.length:''}</button>
        <button className="restore" onClick={restoreFromPage} disabled={storageBusy||!libraryReady||phase!=='idle'||!!resetTarget}>恢复原版</button>
      </nav>
      {storageError&&<p className="error" role="alert">{storageError}</p>}
      {error&&<p className="error" role="alert">{error}</p>}
      <p className="privacy">个人照片仅保存在此浏览器，不会上传。</p>
    </main>
    <footer>原版素材 <a href="https://github.com/Nitrogen216/awesome_pets" target="_blank" rel="noreferrer">Nitrogen216 / awesome_pets ↗</a><br/>作者保留权利 · 仅限本地开发</footer>
    {resetTarget&&<Sheet title={'重置'+resetTarget.name+'的好感度？'} onClose={cancelReset}>
      <p className="reset-explanation">此操作只会将{resetTarget.name}的好感度归零，不会影响其他头像。</p>
      <div className="sheet-actions"><button type="button" onClick={cancelReset} autoFocus>取消</button><button type="button" className="primary" onClick={confirmReset}>确认重置</button></div>
    </Sheet>}
    {sheet==='editor'&&<FaceEditor key={editing?.id??'new'} initial={editing} onDraft={onDraft} onClose={closeEditor} onSave={save}/>}
    {sheet==='library'&&<FaceLibrary faces={faces} builtinFaces={builtinFaces} unlocked={friendsUnlocked} expanded={friendsExpanded} onToggle={toggleFriends} onUnlock={unlockFriends} activeId={active?.id} onClose={()=>setSheet(null)} onSelect={select} onEdit={openEditor} onDelete={remove} onAdd={()=>openEditor()} onRestore={restore}/>}
  </div>;
}











