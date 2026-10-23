import React, { useState } from 'react';
import Sheet from '../../components/Sheet.jsx';
export default function FaceLibrary({faces,builtinFaces=[],unlocked=false,expanded=false,onToggle,onUnlock,activeId,onClose,onSelect,onEdit,onDelete,onAdd,onRestore}) {
  const [pending,setPending]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const [showUnlock,setShowUnlock]=useState(false),[passphrase,setPassphrase]=useState('');
  async function run(task){setBusy(true);setError('');try{await task();}catch(e){setError(e.message);}finally{setBusy(false);}}
  function cards(rows,builtIn=false){
    return <div className="face-list" data-library={builtIn?'builtin':'personal'}>{rows.map(face=><article key={face.id} className={'face-card '+(activeId===face.id?'selected':'')}>
      <button className="face-select" aria-label={'使用 '+face.name} aria-pressed={activeId===face.id} disabled={busy} onClick={()=>run(()=>onSelect(face))}>
        <img src={face.thumbnail} alt=""/><span>{face.name}</span>{activeId===face.id&&<small>使用中</small>}
      </button>
      {builtIn?<small className="help">内置头像</small>:<div className="row"><button aria-label={'编辑 '+face.name} disabled={busy} onClick={()=>onEdit(face)}>编辑</button><button className="danger" aria-label={'删除 '+face.name} disabled={busy} onClick={()=>setPending(face.id)}>删除</button></div>}
      {!builtIn&&pending===face.id&&<div className="delete-confirm"><p>删除「{face.name}」？此操作无法撤销。</p><div className="row"><button onClick={()=>setPending(null)} disabled={busy}>取消删除</button><button className="danger" disabled={busy} onClick={()=>run(async()=>{await onDelete(face);setPending(null);})}>确认删除</button></div></div>}
    </article>)}</div>;
  }
  return <Sheet title="本地头像库" onClose={()=>!busy&&onClose()}>
    <p className="privacy">个人照片仅保存在此浏览器。清除网站数据会删除个人头像及解锁状态。</p>
    <div className="row"><button className="primary" onClick={onAdd} disabled={busy}>＋ 上传新头像</button><button onClick={()=>run(onRestore)} disabled={busy}>恢复原版</button></div>
    {!unlocked&&<div style={{marginTop:16}}>
      {!showUnlock?<button className="wide" disabled={busy} onClick={()=>{setShowUnlock(true);setError('');}}>解锁隐藏头像</button>:
      <form onSubmit={e=>{e.preventDefault();run(async()=>{await onUnlock(passphrase);setPassphrase('');setShowUnlock(false);});}}>
        <label className="name-label">解锁口令<input type="password" aria-label="解锁口令" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={passphrase} onChange={e=>setPassphrase(e.target.value)}/></label>
        <button className="wide primary" type="submit" disabled={busy}>{busy?'正在解锁…':'解锁'}</button>
      </form>}
    </div>}
    {unlocked&&<section aria-label="内置朋友头像" className="friends-group">
      <button type="button" className="friends-toggle" aria-expanded={expanded} aria-controls="uug-faces" disabled={busy} onClick={()=>run(onToggle)}>
        <span>uug</span><span aria-hidden="true">{expanded?'∧':'∨'}</span>
      </button>
      {expanded&&<div id="uug-faces">{cards(builtinFaces,true)}</div>}
    </section>}
    <section aria-label="个人上传头像"><h3 style={{fontSize:14,marginTop:24}}>个人头像</h3>
      {faces.length===0?<p className="empty">还没有个人头像，可以上传自己的照片。</p>:cards(faces)}
    </section>
    {error&&<p className="error" role="alert">{error}</p>}
  </Sheet>;
}

