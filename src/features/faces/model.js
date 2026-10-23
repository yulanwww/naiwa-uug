// Read legacy records without applying their angle fields. Never mutate them.
const finite=(value,fallback)=>Number.isFinite(value)?value:fallback;
export const defaultCrop=()=>({x:0,y:0,zoom:1});
export const defaultPlacement=()=>({x:0,y:0,scale:1});
export function normalizeFace(face) {
  return {
    ...face,
    name:typeof face.name==='string'&&face.name.trim()?face.name.trim():'未命名头像',
    crop:{x:finite(face.crop?.x,0),y:finite(face.crop?.y,0),zoom:Math.max(.01,finite(face.crop?.zoom,1))},
    placement:{x:finite(face.placement?.x,0),y:finite(face.placement?.y,0),scale:Math.max(.01,finite(face.placement?.scale,1))},
    anchors:Object.fromEntries(Object.entries(face.anchors??{}).map(([key,value])=>[key,{
      x:finite(value?.x,0),y:finite(value?.y,0),scale:Math.max(.01,finite(value?.scale,1)),
    }])),
  };
}

