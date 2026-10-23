import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
const require=createRequire('C:/Users/Starrism/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try{
const page=await browser.newPage({viewport:{width:1200,height:1000}});
await page.goto('http://127.0.0.1:5173/');
const result=await page.evaluate(async()=>{
  const {default:React}=await import('/node_modules/.vite/deps/react.js');
  const {default:ReactDOM}=await import('/node_modules/.vite/deps/react-dom_client.js'); const {createRoot}=ReactDOM;
  const {default:PetSprite}=await import('/src/components/PetSprite.jsx');
  const {FACE_ANCHORS}=await import('/src/pet/anchors.js');
  const fixture=document.createElement('canvas');fixture.width=256;fixture.height=256;
  const p=fixture.getContext('2d');p.fillStyle='#c89e7e';p.fillRect(0,0,256,256);
  p.fillStyle='#3a392b';p.fillRect(44,86,44,9);p.fillRect(162,86,44,9);
  p.strokeStyle='#8a493b';p.lineWidth=6;p.beginPath();p.moveTo(90,177);p.quadraticCurveTo(128,204,170,177);p.stroke();
  const face={source:fixture.toDataURL(),crop:{x:0,y:0,zoom:1,rotation:0},placement:{x:0,y:0,scale:1,angle:0},anchors:{}};
  const root=document.createElement('div');root.id='anchor-qa';root.style.cssText='position:absolute;inset:0;background:#e9edd7;z-index:99999;display:grid;grid-template-columns:repeat(6,192px);align-content:start;padding:12px;gap:4px;';
  document.body.append(root);
  const children=[];
  for(const action of ['idle','laugh'])for(let frame=0;frame<FACE_ANCHORS[action].length;frame++){
    children.push(React.createElement('div',{key:action+frame},React.createElement('p',null,action+' '+frame),React.createElement(PetSprite,{animation:action,face,frozenFrame:frame,interactive:false})));
  }
  createRoot(root).render(React.createElement(React.Fragment,null,...children));
  return true;
});
await page.waitForFunction(()=>document.querySelectorAll('#anchor-qa canvas[data-face="true"]').length===11);
await page.locator('#anchor-qa').screenshot({path:'D:/naiwa/docs/phase2-face-anchor-contact.png'});
console.log(result);
}finally{await browser.close();}

