export { defaultCrop, defaultPlacement } from './model.js';
export const PATCH_SIZE=280;
export const MASK_RADIUS=.46;
export function loadImage(source) {
  return new Promise((resolve,reject)=>{
    // Browser decoding honors EXIF Orientation; no subsequent orientation changes.
    const image=new Image();
    image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('无法解码照片，请换一张 JPG、PNG 或 WebP'));
    image.src=source;
  });
}
export async function importPhoto(file) {
  const mime=(file.type??'').toLowerCase();
  const extension=(file.name?.split('.').pop()??'').toLowerCase();
  const allowed=['image/jpeg','image/png','image/webp','image/heic','image/heif','image/heic-sequence','image/heif-sequence'];
  const knownExtension=['jpg','jpeg','png','webp','heic','heif'].includes(extension);
  if(!allowed.includes(mime) && !((!mime||mime==='application/octet-stream')&&knownExtension))
    throw new Error('请选择 JPG、PNG、WebP、HEIC 或 HEIF 照片');
  if(!file.size) throw new Error('照片文件为空，请重新选择');
  if(file.size>20*1024*1024) throw new Error('照片请小于 20 MB');
  const bytes=new Uint8Array(await file.slice(0,64).arrayBuffer());
  const text=new TextDecoder('latin1').decode(bytes);
  const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  const png=[137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n);
  const webp=text.startsWith('RIFF')&&text.slice(8,12)==='WEBP';
  const heif=text.slice(4,8)==='ftyp'&&/heic|heix|hevc|hevx|heim|heis|mif1|msf1/.test(text.slice(8));
  const requestedHeif=/heic|heif/.test(mime)||['heic','heif'].includes(extension)||heif;
  if(!jpeg&&!png&&!webp&&!heif) {
    if(requestedHeif) throw new Error('无法读取这张 HEIC/HEIF 照片，请从相册导出为 JPG/PNG 后重试');
    throw new Error('照片内容不是可识别的图片，请重新选择 JPG、PNG 或 WebP');
  }
  const url=URL.createObjectURL(file);
  try {
    let image;
    try { image=await loadImage(url); }
    catch {
      if(requestedHeif) throw new Error('当前浏览器无法解码这张 HEIC/HEIF 照片。请在相册中导出为 JPG/PNG 后重新选择；照片不会上传。');
      throw new Error('照片已损坏或当前浏览器无法解码，请换一张 JPG、PNG 或 WebP');
    }
    if(image.naturalWidth*image.naturalHeight>60000000) throw new Error('照片尺寸超过 6000 万像素，请先缩小');
    const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
    const canvas=document.createElement('canvas');
    canvas.width=Math.round(image.naturalWidth*scale);canvas.height=Math.round(image.naturalHeight*scale);
    // Browser Image decoding already honors EXIF. Only uniform resizing follows.
    canvas.getContext('2d').drawImage(image,0,0,image.naturalWidth*scale,image.naturalHeight*scale);
    // Large photos get a compressed, alpha-capable browser-local WebP copy.
    // toDataURL falls back to PNG if WebP encoding is unavailable.
    return scale<1||file.size>1024*1024?canvas.toDataURL('image/webp',.86):canvas.toDataURL('image/png');
  } finally { URL.revokeObjectURL(url); }
}
// Crop coordinates are normalized to the fixed square. Only translation and
// one scalar scale are permitted. Legacy angle properties are never read.
export function drawCrop(ctx,image,crop,size) {
  const scale=Math.max(size/image.width,size/image.height)*crop.zoom;
  const width=image.width*scale,height=image.height*scale;
  ctx.drawImage(image,size/2+crop.x*size-width/2,size/2+crop.y*size-height/2,width,height);
}
export function renderPatch(image,crop,size=PATCH_SIZE) {
  const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
  const ctx=canvas.getContext('2d');
  drawCrop(ctx,image,crop,size);
  ctx.globalCompositeOperation='destination-in';
  const radius=size*MASK_RADIUS;
  const gradient=ctx.createRadialGradient(size/2,size/2,radius*.78,size/2,size/2,radius);
  gradient.addColorStop(0,'rgba(0,0,0,1)');gradient.addColorStop(.55,'rgba(0,0,0,.96)');gradient.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,size,size);
  return canvas;
}
export function drawFace(ctx,patch,anchor) {
  // A square patch always stays square; the photograph inside keeps its ratio.
  const size=anchor.w;
  ctx.drawImage(patch,anchor.x-size/2,anchor.y-size/2,size,size);
}

