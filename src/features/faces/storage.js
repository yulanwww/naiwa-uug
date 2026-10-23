import { normalizeFace } from './model.js';
import { loadImage, renderPatch } from './image.js';
const DB_NAME='naiwa-faces';
let database;
export function openDatabase() {
  if(database) return database;
  database=new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,1);
    request.onupgradeneeded=()=>{
      request.result.createObjectStore('faces',{keyPath:'id'});
      request.result.createObjectStore('settings');
    };
    request.onsuccess=()=>{
      request.result.onversionchange=()=>{request.result.close();database=null;};
      resolve(request.result);
    };
    request.onerror=()=>{database=null;reject(request.error);};
    request.onblocked=()=>{database=null;reject(new Error('请关闭其他奶蛙页面后重试'));};
  });
  return database;
}
async function transaction(store,mode,operation) {
  const db=await openDatabase();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,mode);
    let result;
    const request=operation(tx.objectStore(store));
    if(request) request.onsuccess=()=>{result=request.result;};
    tx.oncomplete=()=>resolve(result);
    tx.onerror=()=>reject(tx.error??new Error('头像库操作失败'));
    tx.onabort=()=>reject(tx.error??new Error('头像库操作取消'));
  });
}
export async function listFaces() {
  const rows=await transaction('faces','readonly',s=>s.getAll());
  return Promise.all(rows.map(async row=>{
    const face=normalizeFace(row);
    // Recreate thumbnails in memory; old rotated thumbnails must not mislead.
    // Reading never rewrites/deletes the original record or its source photo.
    try { face.thumbnail=renderPatch(await loadImage(face.source),face.crop).toDataURL('image/png'); }
    catch { face.thumbnail='data:,'; }
    return face;
  }));
}
export const saveFace=face=>transaction('faces','readwrite',s=>s.put(normalizeFace(face)));
export const deleteFace=id=>transaction('faces','readwrite',s=>s.delete(id));
export const readActive=()=>transaction('settings','readonly',s=>s.get('active'));
export const writeActive=id=>transaction('settings','readwrite',s=>s.put(id,'active'));


export const readFriendsUnlocked=()=>transaction('settings','readonly',s=>s.get('friendsUnlocked'));
export const writeFriendsUnlocked=()=>transaction('settings','readwrite',s=>{s.put(true,'friendsUnlocked');return s.put(true,'friendsExpanded');});

export const readFriendsExpanded=()=>transaction('settings','readonly',s=>s.get('friendsExpanded'));
export const writeFriendsExpanded=value=>transaction('settings','readwrite',s=>s.put(value,'friendsExpanded'));
