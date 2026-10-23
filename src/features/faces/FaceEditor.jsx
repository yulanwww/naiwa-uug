import React, { useEffect, useRef, useState } from 'react';
import Sheet from '../../components/Sheet.jsx';
import PetSprite from '../../components/PetSprite.jsx';
import { FACE_ANCHORS } from '../../pet/anchors.js';
import { defaultCrop, defaultPlacement, MASK_RADIUS, importPhoto, loadImage, renderPatch } from './image.js';

import { normalizeFace } from './model.js';

function Range({label,value,min,max,step=1,onChange}) {
  return <label className="range-label"><span>{label}<output>{Number(value).toFixed(step<1?2:0)}</output></span><input type="range" aria-label={label} min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>;
}
export default function FaceEditor({initial,onClose,onSave,onDraft}) {
  const [draft,setDraft]=useState(()=>initial?normalizeFace(structuredClone(initial)):{
    id:crypto.randomUUID(),name:'',source:'',crop:defaultCrop(),placement:defaultPlacement(),anchors:{},
  });
  const [error,setError]=useState(''),[busy,setBusy]=useState(false);
  const [action,setAction]=useState('idle'),[frame,setFrame]=useState(0),[freeze,setFreeze]=useState(false);
  const [playing,setPlaying]=useState(0);
  const cropCanvas=useRef(null),drag=useRef(null);
  const [photo,setPhoto]=useState(null);
  const fileRef=useRef(null),alive=useRef(true),nameChanged=useRef(!!initial);
  useEffect(()=>{alive.current=true;return ()=>{alive.current=false;};},[]);
  useEffect(()=>{onDraft(draft.source?draft:null);},[draft,onDraft]);
  useEffect(()=>{
    let cancelled=false;
    setPhoto(null);
    if(draft.source) loadImage(draft.source).then(image=>{if(!cancelled)setPhoto(image);})
      .catch(e=>!cancelled&&setError(e.message));
    return ()=>{cancelled=true;};
  },[draft.source]);
  useEffect(()=>{
    const ctx=cropCanvas.current?.getContext('2d');
    if(!ctx || !photo) return;
    ctx.clearRect(0,0,280,280);
    // The exact same patch generator is used by the editor, frog and thumbnail.
    ctx.drawImage(renderPatch(photo,draft.crop),0,0);
    ctx.strokeStyle='#fff8dd';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(140,140,280*MASK_RADIUS,0,Math.PI*2);ctx.stroke();
  },[photo,draft.crop]);
  function startDrag(event) {
    if(!event.isPrimary || (event.pointerType==='mouse' && event.button!==0)) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current={id:event.pointerId,x:event.clientX,y:event.clientY};
  }
  function moveDrag(event) {
    const point=drag.current;
    if(!point || point.id!==event.pointerId) return;
    event.preventDefault();
    const rect=event.currentTarget.getBoundingClientRect();
    const dx=(event.clientX-point.x)/rect.width,dy=(event.clientY-point.y)/rect.height;
    point.x=event.clientX;point.y=event.clientY;
    setDraft(old=>({...old,crop:{...old.crop,x:old.crop.x+dx,y:old.crop.y+dy}}));
  }
  function endDrag(event) {if(drag.current?.id===event.pointerId)drag.current=null;}
  function crop(field,value){setDraft(d=>({...d,crop:{...d.crop,[field]:value}}));}
  function placement(field,value){setDraft(d=>({...d,placement:{...d.placement,[field]:value}}));}
  const anchorKey=action+':'+frame;
  const local=draft.anchors[anchorKey]??{x:0,y:0,scale:1};
  function anchor(field,value){setDraft(d=>({...d,anchors:{...d.anchors,[anchorKey]:{...local,[field]:value}}}));}
  async function upload(event) {
    const file=event.target.files[0];event.target.value='';if(!file) return;
    setBusy(true);setError('');
    try{
      const source=await importPhoto(file);
      if(alive.current) setDraft(d=>({...d,source,crop:defaultCrop(),name:nameChanged.current?d.name:Array.from(file.name.replace(/\.[^.]+$/,'')).slice(0,30).join('')}));
    }catch(e){if(alive.current)setError(e.message);}
    finally{if(alive.current)setBusy(false);}
  }
  async function save() {
    if(!draft.source || !photo) return;
    setBusy(true);setError('');
    try{
      const thumb=renderPatch(await loadImage(draft.source),draft.crop).toDataURL('image/png');
      await onSave({...draft,name:draft.name.trim()||'未命名头像',thumbnail:thumb,updatedAt:Date.now()});
    }catch(e){if(alive.current)setError('保存失败：'+e.message);}
    finally{if(alive.current)setBusy(false);}
  }
  return <Sheet title={initial?'编辑头像':'上传照片换脸'} onClose={()=>!busy&&onClose()}>
    <p className="privacy">照片仅在此浏览器处理与保存，不会上传。</p>
    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" aria-label="选择照片" onChange={upload} hidden />
    <button className="wide" type="button" disabled={busy} onClick={()=>fileRef.current.click()}>{draft.source?'更换照片':'上传照片（相册 / 文件）'}</button>
    <label className="name-label">头像名称<input aria-label="头像名称" aria-describedby="face-name-help" placeholder="例如：小王 😊" maxLength={60} value={draft.name} onChange={e=>{nameChanged.current=true;setDraft(d=>({...d,name:e.target.value}));}}/></label>
    <p id="face-name-help" className="help">保存后显示在右上角；留空使用「未命名头像」。</p>
    <p className="help">手机可选择照片图库，电脑可选择文件。支持 JPG、PNG、WebP；HEIC/HEIF 需浏览器支持解码，最大 20 MB。</p>
    {draft.source && <>

      <div className="editor-visuals">
        <div className="crop-panel"><canvas ref={cropCanvas} width={280} height={280} aria-label="拖动照片裁剪人脸" className="crop-canvas"
          onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} />
          <small>拖动照片，让人脸位于圆框内</small>
        </div>
        <div className="preview-panel"><PetSprite animation={action} playbackId={playing} face={draft} frozenFrame={freeze?frame:null} interactive={false} onComplete={()=>setAction('idle')} onError={setError}/><small>实时换脸预览</small></div>
      </div>
      <Range label="照片缩放" value={draft.crop.zoom} min={.3} max={5} step={.01} onChange={v=>crop('zoom',v)}/>
      <button type="button" className="subtle wide" onClick={()=>setDraft(d=>({...d,crop:{...d.crop,x:0,y:0}}))}>重置位置</button>
      <details><summary>照片位置（也可直接拖动）</summary>
        <label className="name-label">照片左右<input type="number" aria-label="照片左右" step="0.05" value={draft.crop.x} onChange={e=>crop('x',Number(e.target.value)||0)}/></label>
        <label className="name-label">照片上下<input type="number" aria-label="照片上下" step="0.05" value={draft.crop.y} onChange={e=>crop('y',Number(e.target.value)||0)}/></label>
      </details>
      <div className="row"><button type="button" onClick={()=>{setAction('idle');setFreeze(false);}}>预览待机</button><button type="button" onClick={()=>{setAction('laugh');setPlaying(v=>v+1);setFreeze(false);}}>预览大笑</button></div>
      <details><summary>脸部整体位置与大小</summary>
        <p className="help">只移动脸部遮罩，黄色头部轮廓保持原样。过大的调整可能超出头部。</p>
        <Range label="脸部左右" value={draft.placement.x} min={-8} max={8} step={.25} onChange={v=>placement('x',v)}/>
        <Range label="脸部上下" value={draft.placement.y} min={-8} max={8} step={.25} onChange={v=>placement('y',v)}/>
        <Range label="脸部大小" value={draft.placement.scale} min={.6} max={1.25} step={.01} onChange={v=>placement('scale',v)}/>
      </details>
      <details onToggle={e=>{if(!e.currentTarget.open)setFreeze(false);}}><summary>逐帧锚点微调</summary>
        <p className="help">选择动作和帧，勾选定格后调整。修改仅保存到此头像。</p>
        <div className="row"><label>动作<select aria-label="锚点动作" value={action} onChange={e=>{setAction(e.target.value);setFrame(0);setFreeze(true);}}><option value="idle">待机</option><option value="laugh">大笑</option></select></label>
        <label>帧<select aria-label="锚点帧" value={frame} onChange={e=>{setFrame(Number(e.target.value));setFreeze(true);}}>{FACE_ANCHORS[action].map((_,i)=><option key={i} value={i}>{i+1}</option>)}</select></label>
        <label className="check"><input type="checkbox" checked={freeze} onChange={e=>setFreeze(e.target.checked)}/>定格</label></div>
        <Range label="本帧左右" value={local.x} min={-10} max={10} step={.25} onChange={v=>anchor('x',v)}/>
        <Range label="本帧上下" value={local.y} min={-10} max={10} step={.25} onChange={v=>anchor('y',v)}/>
        <Range label="本帧大小" value={local.scale} min={.6} max={1.3} step={.01} onChange={v=>anchor('scale',v)}/>
      </details>
      <button type="button" className="subtle wide" onClick={()=>setDraft(d=>({...d,crop:defaultCrop(),placement:defaultPlacement(),anchors:{}}))}>重置裁剪与位置</button>
    </>}
    {error && <p role="alert" className="error">{error}</p>}
    <div className="sheet-actions"><button type="button" disabled={busy} onClick={onClose}>取消</button><button className="primary" type="button" disabled={!draft.source||!photo||busy} onClick={save}>{busy?'正在处理…':'保存头像并使用'}</button></div>
  </Sheet>;
}



