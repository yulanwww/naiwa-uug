import { normalizeFace } from './model.js';
import { loadImage, renderPatch } from './image.js';
// A playful UI gate only: the public files and client code are not encrypted.
export const acceptsFriendsPassphrase=value=>value==='uugnb';
let catalogPromise,imagesPromise;
export function getBuiltinCatalog(){
  if(!catalogPromise)catalogPromise=fetch('/avatars/manifest.json').then(r=>{
    if(!r.ok)throw new Error('内置头像配置加载失败');return r.json();
  }).then(data=>data.avatars.slice().sort((a,b)=>a.order-b.order).map(a=>({...normalizeFace(a),builtIn:true})))
    .catch(e=>{catalogPromise=null;throw e;});
  return catalogPromise;
}
export function loadBuiltinFaces(){
  if(!imagesPromise)imagesPromise=getBuiltinCatalog().then(rows=>Promise.all(rows.map(async face=>{
    const image=await loadImage(face.source);
    return {...face,thumbnail:renderPatch(image,face.crop).toDataURL('image/png')};
  }))).catch(e=>{imagesPromise=null;throw e;});
  return imagesPromise;
}
function adjustmentKey(face){
  const f=normalizeFace(face);
  return JSON.stringify({crop:f.crop,placement:f.placement,anchors:Object.fromEntries(Object.entries(f.anchors).sort(([a],[b])=>a.localeCompare(b)))});
}
export async function matchBuiltinCopies(personal,catalog){
  const result=new Map();
  for(const face of personal){
    const original=catalog.find(b=>b.originalId===face.id);
    if(original){result.set(face.id,original.id);continue;}
    // Also recognize exact image + adjustment copies with a new local ID.
    if(!face.source?.startsWith('data:image/')||!globalThis.crypto?.subtle)continue;
    const binary=atob(face.source.slice(face.source.indexOf(',')+1));
    const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
    const same=catalog.find(b=>b.sha256===hash&&adjustmentKey(face)===adjustmentKey(b));
    if(same)result.set(face.id,same.id);
  }
  return result;
}

