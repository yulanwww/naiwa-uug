// Coordinates in the original 192×208 cell, hand marked from the unchanged atlas.
// Face ellipses stay inside the yellow head silhouette. No facial detection/API.
export const FACE_ANCHORS = {
  idle: [
    { x:85, y:29, w:38, h:43 },
    { x:85, y:29, w:38, h:43 },
    { x:85, y:29, w:38, h:43 },
    { x:85, y:29, w:38, h:43 },
    { x:85, y:29, w:38, h:43 },
    { x:85, y:29, w:38, h:43 },
  ],
  laugh: [
    { x:83, y:88, w:34, h:38 },
    { x:89, y:47, w:36, h:41 },
    { x:98, y:27, w:37, h:42 },
    { x:84, y:65, w:34, h:39 },
    { x:82, y:87, w:35, h:40 },
  ],
};
export function getFaceAnchor(action, frame, face) {
  const base=FACE_ANCHORS[action][frame];
  const local=face?.anchors?.[action+':'+frame]??{};
  const global=face?.placement??{};
  const size=base.w*(local.scale??1)*(global.scale??1);
  return {
    x:base.x+(local.x??0)+(global.x??0),
    y:base.y+(local.y??0)+(global.y??0),
    w:size,h:size,
  };
}
export const BELLY_ANCHORS = {
  idle: Array.from({length:6}, () => ({x:87,y:109,rx:38,ry:38})),
  laugh: [
    {x:86,y:147,rx:23,ry:15}, {x:91,y:113,rx:25,ry:17},
    {x:100,y:94,rx:26,ry:17}, {x:85,y:130,rx:23,ry:16},
    {x:84,y:145,rx:23,ry:16},
  ],
};

