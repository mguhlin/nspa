import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync('src/data/scenarios.json','utf8'));
const evidence='/tmp/nspa-lab-qa';fs.mkdirSync(evidence,{recursive:true});
const go=(id=6,stage=0,mode='solo')=>`/#mission=${id}&stage=${stage}&mode=${mode}`;
test('all 30 missions traverse all rounds; clues and answers are concealed and decisions are meaningful',async({page})=>{
 test.setTimeout(180000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const s of data){
  await page.goto(go(s.id));await expect(page.locator('#stage-title')).toHaveText(s.title);
  await expect(page.locator('.briefing img')).toBeVisible();
  expect(await page.locator('.briefing img').evaluate((e:HTMLImageElement)=>e.complete&&e.naturalWidth>0)).toBeTruthy();
  await page.getByRole('button',{name:'Begin investigation'}).click();await expect(page.locator('.panel')).toContainText(s.facts[0]);await expect(page.getByText(s.unknowns[0],{exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Show unknowns',exact:true}).click();await expect(page.locator('.panel')).toContainText(s.unknowns[0]);
  await page.keyboard.press('ArrowRight');await expect(page.locator('#stage-title')).toHaveText('What could go wrong?');
  await page.locator('[data-action="risk:0"]').click();await expect(page.locator('[data-action="risk:0"]')).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Reveal clue',exact:true}).click();
  for(const c of s.game.clues.filter((c:any)=>c.stage==='red'))await expect(page.getByText(c.content,{exact:true})).toBeHidden();
  await page.getByRole('button',{name:'Reveal clue 1',exact:true}).click();await expect(page.locator('.clue-card:visible')).toHaveCount(1);
  await page.getByRole('button',{name:'Reveal clue 3',exact:true}).click();await expect(page.locator('.clue-card:visible')).toHaveCount(1);await expect(page.locator('#clue-red-1')).toBeHidden();
  await page.getByRole('button',{name:'Hide all clues'}).click();await expect(page.locator('.clue-card:visible')).toHaveCount(0);await page.keyboard.press('Escape');
  await page.keyboard.press('ArrowRight');await expect(page.locator('#stage-title')).toHaveText('What should happen first?');
  await page.locator('[data-action="response:a"]').click();await expect(page.locator('[data-action="response:a"]')).toHaveAttribute('aria-pressed','true');
  for(const c of s.game.presentationChoices)await expect(page.getByText(c.feedback,{exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'More responses'}).click();await page.locator('[data-action="response:c"]').click();await expect(page.locator('.selection-summary')).toContainText(s.game.presentationChoices[2].shortLabel);
  await page.keyboard.press('ArrowRight');await expect(page.getByText(s.game.twist.revealText,{exact:true})).toHaveCount(0);await page.getByRole('button',{name:'Show new information'}).click();await expect(page.locator('.complication')).toContainText(s.game.twist.revealText);
  await page.getByRole('button',{name:'Keep our plan'}).click();await page.getByRole('button',{name:'Reveal debrief',exact:true}).click();
  await expect(page.locator('.panel')).toContainText(s.debrief.red[0]);
  for(let i=0;i<4;i++)await page.getByRole('button',{name:'Next analysis',exact:true}).click();
  await expect(page.locator('.panel')).toContainText(s.game.presentationChoices[2].feedback);
  await page.getByRole('button',{name:'Complete mission',exact:true}).click();await expect(page.locator('.takeaway')).toHaveText(s.game.completion.takeaway);
 }
 expect(errors).toEqual([]);
});
test('instructions, mode selection, browse filters, random mission, and independent clues',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Start a mission',exact:true}).click();await page.getByRole('button',{name:/Solo investigator/}).click();
 for(const label of ['Got it — next','Continue','Next','Start my mission','Let’s begin'])await page.getByRole('button',{name:label,exact:true}).click();await expect(page.locator('#stage-title')).toHaveText('Thirty Minutes Left');
 await page.getByRole('button',{name:'Scenarios',exact:true}).click();await page.getByLabel('Search missions').fill('duplicate applicant');await expect(page.locator('.mission-card')).toHaveCount(1);await page.locator('.mission-card').click();await page.getByRole('button',{name:/Team challenge/}).click();await page.getByRole('button',{name:'Skip instructions'}).click();await expect(page.locator('#stage-title')).toHaveText('The Duplicate Applicant');
 await page.getByRole('button',{name:'Menu',exact:true}).click();await page.getByRole('button',{name:'Random mission',exact:true}).click();await expect(page.locator('#stage-title')).toBeVisible();await expect(page.locator('dialog')).not.toBeVisible();
 await page.goto(go(6,3));await page.keyboard.press('c');await page.getByRole('button',{name:'Reveal clue 2'}).click();await expect(page.locator('#clue-blue-2')).toBeVisible();await expect(page.locator('#clue-blue-1')).toBeHidden();
});
test('timer controls, local reasoning, reset, and downloadable decision record',async({page})=>{
 await page.goto(go(6,3));await page.locator('[data-action="response:a"]').click();await page.getByRole('button',{name:'Record our reasoning'}).click();await page.getByLabel('Why does this help? Who owns the next step?').fill('Our continuity lead will verify the secure fallback.');await page.keyboard.press('ArrowRight');expect(page.url()).toContain('stage=3');await page.getByRole('button',{name:'Keep our reasoning'}).click();
 await page.getByRole('button',{name:'Timer',exact:true}).click();await page.getByLabel('Choose duration').selectOption('60');await page.locator('[data-action="timer-toggle"]').click();await page.waitForTimeout(1100);await page.locator('[data-action="timer-toggle"]').click();const paused=await page.locator('#timer-readout').innerText();await page.waitForTimeout(1100);await expect(page.locator('#timer-readout')).toHaveText(paused);await page.locator('[data-action="timer-extend"]').click();await page.locator('[data-action="timer-reset"]').click();await expect(page.locator('#timer-readout')).toHaveText('1:00');await page.clock.install();await page.locator('[data-action="timer-toggle"]').click();await page.clock.fastForward(61000);await expect(page.locator('#timer-readout')).toHaveText('0:00');expect(page.url()).toContain('stage=3');await page.getByRole('button',{name:'Close timer'}).click();
 await page.getByRole('button',{name:'Debrief',exact:true}).click();for(let i=0;i<4;i++)await page.getByRole('button',{name:'Next analysis'}).click();await page.getByRole('button',{name:'Complete mission'}).click();await page.getByRole('button',{name:'Your decision record'}).click();await page.getByLabel('What changed in your thinking?').fill('Email creates another exposure.');await page.getByLabel('Your next action and owner').fill('Test the outage plan with the continuity lead.');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download decision record'}).click();const d=await download;const path=await d.path();expect(fs.readFileSync(path!,'utf8')).toContain('Our continuity lead will verify');expect(fs.readFileSync(path!,'utf8')).toContain('Email creates another exposure.');await page.keyboard.press('Escape');await page.getByRole('button',{name:'Reset',exact:true}).click();await page.getByRole('button',{name:'Restart mission'}).click();await expect(page.locator('#stage-title')).toHaveText('Thirty Minutes Left');await page.keyboard.press('ArrowRight');await expect(page.locator('#stage-title')).toHaveText('What do we know?');await page.keyboard.press('ArrowRight');await expect(page.locator('[data-action="risk:0"]')).toHaveAttribute('aria-pressed','false');
});
test('projector layouts, visible clues, mobile reflow, privacy, and accessible states',async({page})=>{
 test.setTimeout(180000);
 const remote:string[]=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1')&&!r.url().startsWith('data:'))remote.push(r.url());});
 for(const [width,height] of [[1920,1080],[1600,900],[1366,768],[1280,720]]){
  await page.setViewportSize({width,height});
  for(let stage=0;stage<7;stage++){
   await page.goto(go(6,stage,'facilitator'));if(stage===4 && await page.locator('[data-action="twist"]').count())await page.getByRole('button',{name:'Show new information'}).click();
   const bounds=await page.locator('.projector-controls').boundingBox();expect(bounds!.y+bounds!.height,`${width} stage ${stage} controls fit`).toBeLessThanOrEqual(height+2);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
   await page.screenshot({animations:'disabled',path:`${evidence}/${width}-stage-${stage}.png`});
   if(stage===2){await page.getByRole('button',{name:'Reveal clue',exact:true}).click();await page.getByRole('button',{name:'Reveal clue 3'}).click();await expect(page.locator('.clue-card:visible')).toBeVisible();await page.screenshot({animations:'disabled',path:`${evidence}/${width}-clue.png`});await page.keyboard.press('Escape');}
  }
 }
 await page.setViewportSize({width:1920,height:1080});await page.goto(go(6,2,'facilitator'));
 expect(await page.locator('#stage-title').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(68);
 expect(await page.locator('.choice').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(38);
 for(const [width,height] of [[390,844],[360,800],[800,1000]]){
  await page.setViewportSize({width,height});for(let stage=0;stage<7;stage++){await page.goto(go(6,stage));expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();}await page.screenshot({animations:'disabled',path:`${evidence}/mobile-${width}.png`});
 }
 await page.setViewportSize({width:1280,height:720});await page.goto('/');await page.screenshot({animations:'disabled',path:`evidence/home.png`.replace('evidence',evidence)});expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 for(const stage of [0,1,2,3,4,5,6]){await page.goto(go(6,stage));expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);}
 await page.goto(go(6,2));await page.keyboard.press('c');await page.getByRole('button',{name:'Reveal clue 1'}).click();expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);expect(remote).toEqual([]);
});
test('separate presenter notes are deliberate and synchronize audience stages',async({page})=>{
 await page.goto(go());await page.getByRole('button',{name:'Menu',exact:true}).click();await page.getByRole('button',{name:'Facilitator guide'}).click();const popup=page.waitForEvent('popup');await page.getByRole('button',{name:'Open separate presenter window'}).click();const presenter=await popup;await presenter.waitForLoadState();await expect(presenter.locator('h1')).toHaveText('Thirty Minutes Left');await expect(presenter.locator('.presenter-model')).toHaveCount(0);await presenter.getByRole('button',{name:'Reveal model notes here'}).click();await expect(presenter.locator('.presenter-model')).toBeVisible();await expect(page.locator('.presenter-model')).toHaveCount(0);await page.keyboard.press('Escape');await presenter.getByRole('button',{name:'Next audience stage'}).click();await expect(page.locator('#stage-title')).toHaveText('What do we know?');await presenter.close();
});
test('every mission fits the smallest projector without hiding choices or debrief text',async({page})=>{
 test.setTimeout(180000);await page.setViewportSize({width:1280,height:720});
 const failures:string[]=[];
 for(const s of data){
  for(const stage of [0,1,2,3,4,5,6]){
   await page.goto(go(s.id,stage,'facilitator'));if(stage===4 && await page.locator('[data-action="twist"]').count())await page.getByRole('button',{name:'Show new information'}).click();
   const fits=async(label:string)=>{const b=await page.locator('.projector-controls').boundingBox();if(b!.y+b!.height>722){failures.push(`${s.id} ${label}: ${Math.ceil(b!.y+b!.height)}`);await page.screenshot({animations:'disabled',path:`${evidence}/overflow-${s.id}-${label}.png`,fullPage:true});}};
   await fits(String(stage));
   if(stage===2||stage===3){await page.locator('[data-action="choice-page"]').click();await fits(stage+'-more');}
   if(stage===5)for(let i=1;i<5;i++){await page.getByRole('button',{name:'Next analysis'}).click();await fits('debrief-'+i);}
  }
 }
 expect(failures).toEqual([]);
});

test('skip link preserves the mission and single-key shortcuts can be disabled',async({page})=>{
 await page.goto(go(6,2));await page.keyboard.press('Tab');await expect(page.locator('.skip')).toBeFocused();await page.keyboard.press('Enter');expect(page.url()).toContain('mission=6');await expect(page.locator('#main')).toBeFocused();
 await page.getByRole('button',{name:'Menu',exact:true}).click();await page.getByRole('button',{name:'Single-key shortcuts: on',exact:true}).click();await page.keyboard.press('Escape');await page.keyboard.press('c');await expect(page.locator('dialog')).not.toBeVisible();await page.getByRole('button',{name:'Reveal clue',exact:true}).click();await expect(page.locator('dialog')).toBeVisible();
});
test('longer response details and model analyses reveal in readable steps',async({page})=>{
 await page.goto(go(6,3,'facilitator'));await page.getByRole('button',{name:'Read choice details'}).click();await expect(page.locator('.choice-detail')).toHaveCount(2);await expect(page.locator('dialog')).not.toContainText(data[5].game.presentationChoices[2].fullDescription);await page.getByRole('button',{name:'More choice details'}).click();await expect(page.locator('dialog')).toContainText(data[5].game.presentationChoices[2].fullDescription);await page.keyboard.press('Escape');await page.getByRole('button',{name:'Debrief',exact:true}).click();for(let i=0;i<4;i++)await page.getByRole('button',{name:'Next analysis'}).click();await page.getByRole('button',{name:'Compare all response analyses'}).click();await expect(page.locator('dialog')).toContainText(data[5].game.presentationChoices[0].feedback);await expect(page.locator('dialog')).not.toContainText(data[5].game.presentationChoices[1].feedback);await page.getByRole('button',{name:'Next response analysis'}).click();await expect(page.locator('dialog')).toContainText(data[5].game.presentationChoices[1].feedback);
});
