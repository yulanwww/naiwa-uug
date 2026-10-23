import React, { useEffect, useRef } from 'react';
export default function Sheet({title,onClose,children}) {
  const dialog=useRef(null);
  useEffect(()=>{
    const node=dialog.current;
    const focused=document.activeElement;
    node.showModal();
    const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
    return ()=>{node.close();document.body.style.overflow=overflow;focused?.focus();};
  },[]);
  return <dialog ref={dialog} className="sheet" onCancel={event=>{event.preventDefault();onClose();}}
    onClick={event=>{if(event.target===event.currentTarget) {const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) onClose();}}}
    aria-label={title}>
    <div className="sheet-heading"><h2>{title}</h2><button type="button" onClick={onClose} aria-label="关闭">×</button></div>
    {children}
  </dialog>;
}
