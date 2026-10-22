import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl']});
const page = await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR:',e.message);});page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE:',m.text());});
try {
  await page.goto('http://127.0.0.1:3000',{waitUntil:'networkidle'});
  console.log('Loaded HTML'); await page.locator('[data-ready="true"]').waitFor(); console.log('GLB ready');
  await page.waitForTimeout(1300);
  assert.equal(await page.locator('dialog').count(),0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight===innerHeight),true);
  console.log('Capturing overview'); await page.screenshot({path:'previews/website-overview.png',timeout:20000}); console.log('Overview captured');
  await page.getByRole('button',{name:'Controls +',exact:true}).click();
  await page.getByRole('switch',{name:'SW0 Projects',exact:true}).click();
  await page.getByRole('button',{name:'Item →',exact:true}).click();
  assert.match(await page.locator('.scene-status').textContent(),/Travelly/);
  await page.getByRole('switch',{name:'SW15 Input 15',exact:true}).click();
  assert.match(await page.locator('.sr-only').textContent(),/01028001/);
  await page.getByRole('button',{name:'Power off',exact:true}).click();
  assert.match(await page.locator('.scene-status').textContent(),/POWER OFF/);
  await page.getByRole('button',{name:'Power on',exact:true}).click();
  await page.getByRole('button',{name:'Close controls',exact:true}).click();
  await page.getByRole('button',{name:'Inspect I/O',exact:true}).click();
  await page.locator('[data-camera="BOARD_CLOSEUP"][data-moving="false"]').waitFor();
  await page.screenshot({path:'previews/website-io-closeup.png'});
  await page.keyboard.press('Escape');
  await page.locator('[data-camera="BOARD_OVERVIEW"][data-moving="false"]').waitFor();
  assert.match(await page.locator('.scene-status').textContent(),/Travelly/);
  await page.getByRole('button',{name:'Top view',exact:true}).click();
  await page.locator('[data-camera="BOARD_TOP"][data-moving="false"]').waitFor();
  await page.screenshot({path:'previews/website-top.png'});
  await page.keyboard.press('r');await page.waitForTimeout(850);
  assert.match(await page.locator('.sr-only').textContent(),/00000000/);
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.keyboard.press('Escape');await page.waitForTimeout(700);
  await page.screenshot({path:'previews/website-mobile.png'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight===innerHeight&&document.documentElement.scrollWidth===innerWidth),true);
  await page.getByRole('button',{name:'Controls +',exact:true}).click();
  await page.getByRole('switch',{name:'SW4 Skills',exact:true}).click();
  assert.match(await page.locator('.scene-status').textContent(),/SKILLS/);
  await page.getByRole('button',{name:'Close controls',exact:true}).click();
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('[data-camera="BOARD_OVERVIEW"][data-moving="false"]').waitFor();
  await page.waitForTimeout(250);
  let oledHit=null;
  for (const y of [570,600,630,660,690,720]) {
    for (const x of [940,980,1020,1060,1100,1140,1180]) {
      await page.mouse.move(x,y); await page.waitForTimeout(90);
      if (await page.locator('.hover-label').textContent()==='Portfolio OLED · click to focus') { oledHit={x,y}; break; }
    }
    if (oledHit) break;
  }
  assert.ok(oledHit,'OLED screen should be hoverable in overview');
  assert.equal(await page.locator('.hover-label').textContent(),'Portfolio OLED · click to focus');
  await page.mouse.click(oledHit.x,oledHit.y);
  await page.locator('[data-camera="DISPLAY_FOCUS"][data-moving="false"]').waitFor();
  await page.screenshot({path:'previews/website-oled-focus.png'});
  await page.keyboard.press('Escape');
  await page.locator('[data-camera="BOARD_OVERVIEW"][data-moving="false"]').waitFor();
  assert.deepEqual(errors,[]);
  console.log('PASS: no scrolling or reader modal, module/item/register control, power, camera focus/return, OLED focus/return, reset, mobile, reduced motion; no JS errors.');
} catch(error) {console.log(await page.locator('body').innerText());await page.screenshot({path:'previews/browser-failure.png'});throw error;} finally {await browser.close();}
