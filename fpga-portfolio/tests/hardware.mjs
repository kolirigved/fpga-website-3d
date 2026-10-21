import { chromium } from '@playwright/test';
import { PerspectiveCamera, Vector3 } from 'three';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const raw=readFileSync('public/models/nexys4-ddr.glb');
const gltf=JSON.parse(raw.subarray(20,20+raw.readUInt32LE(12)).toString());
const nodes=new Map(gltf.nodes.map(n=>[n.name,n]));
const camera=new PerspectiveCamera(38,1.44,.1,180);
const distance=Math.max(13.4/(1.44*.82),12.8/.76)/(2*Math.tan(38*Math.PI/360));
camera.position.set(0,distance,.01);camera.lookAt(0,0,0);camera.updateMatrixWorld();
function pixel(name){const node=nodes.get(name);assert(node,`Missing ${name}`);const p=new Vector3(...node.translation).project(camera);return [(p.x+1)*720,(1-p.y)*500];}
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
try {
  await page.goto('http://127.0.0.1:3000',{waitUntil:'networkidle'});
  await page.locator('[data-ready="true"]').waitFor();
  await page.getByRole('button',{name:'Top view',exact:true}).click();
  await page.locator('[data-camera="BOARD_TOP"][data-moving="false"]').waitFor();
  for(let i=0;i<16;i++){
    const [x,y]=pixel(`SW${i}_Slider`);await page.mouse.move(x,y);await page.waitForTimeout(35);
    assert.match(await page.locator('.hover-label').textContent(),new RegExp(`SW${i} ·`));
    await page.mouse.click(x,y);await page.waitForTimeout(70);
  }
  assert.match(await page.locator('.sr-only').textContent(),/0800FF80/);
  // Reset clears input bits, then SW0 selects Projects; BTN right selects Travelly.
  await page.mouse.click(...pixel('CPU_RESET_Plunger'));await page.waitForTimeout(850);
  assert.match(await page.locator('.sr-only').textContent(),/00000000/);
  await page.mouse.click(...pixel('SW0_Slider'));await page.mouse.click(...pixel('BTNR_Plunger'));
  assert.match(await page.locator('.scene-status').textContent(),/Travelly/);
  await page.mouse.click(...pixel('SW16_Slider'));
  assert.match(await page.locator('.scene-status').textContent(),/POWER OFF/);
  await page.screenshot({path:'previews/website-power-off.png',timeout:20000});
  assert.equal(await page.locator('dialog').count(),0);
  const fallback=await browser.newPage();
  await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type.includes('webgl'))return null;return original.call(this,type,...args);};});
  await fallback.goto('http://127.0.0.1:3000',{waitUntil:'networkidle'});
  await fallback.getByText('3D rendering is unavailable.').waitFor();
  console.log('PASS: all 16 physical switch hit targets and hover labels, physical reset, directional button, power switch, 8-digit state, and WebGL fallback.');
} finally {await browser.close();}
