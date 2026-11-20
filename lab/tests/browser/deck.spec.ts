import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
const evidence='/tmp/nspa-lab-qa';fs.mkdirSync(evidence,{recursive:true});
test('five-slide introduction embeds photos and supports v5 navigation, notes, phone reflow, print, and presenter view',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1280,height:720});await page.goto('/decks/introduction.html');await expect(page.locator('.slide')).toHaveCount(5);await expect(page.locator('#exitDeck')).toBeHidden();
 for(let i=0;i<5;i++){
  await page.evaluate(i=>(window as any).__deck.show(i),i);await expect(page.locator('.slide.current')).toBeVisible();
  const bounds=await page.locator('.slide.current .text-column').boundingBox();expect(bounds!.y+bounds!.height).toBeLessThan(665);
  expect(await page.locator('.slide.current img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0&&img.src.startsWith('data:image/webp'))).toBeTruthy();
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()).violations).toEqual([]);await page.screenshot({animations:'disabled',path:`${evidence}/deck-${i+1}.png`});
 }
 await page.keyboard.press('Home');await page.keyboard.press('ArrowRight');await expect(page.locator('#exitDeck')).toBeVisible();await page.keyboard.press('s');await expect(page.locator('#notesPanel')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('#notesPanel')).not.toHaveClass(/open/);await expect(page.locator('#notesPanel')).toBeHidden();
 const event=page.waitForEvent('popup');await page.keyboard.press('v');const presenter=await event;await presenter.waitForLoadState();await expect(presenter.locator('#pvNotes')).toBeVisible();const size=await presenter.locator('#pvNotes').evaluate(e=>parseFloat(getComputedStyle(e).fontSize));await presenter.getByRole('button',{name:'Larger notes text'}).click();expect(await presenter.locator('#pvNotes').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThan(size);await presenter.locator('#pvNext').click();await expect(page).toHaveURL(/#3$/);await presenter.screenshot({path:`${evidence}/deck-presenter.png`});await presenter.close();
 await page.emulateMedia({media:'print'});expect(await page.locator('.slide:visible').count()).toBe(5);await page.pdf({path:`${evidence}/introduction.pdf`,printBackground:true,preferCSSPageSize:true});await page.emulateMedia({media:'screen'});
 await page.setViewportSize({width:390,height:844});for(let i=0;i<5;i++){await page.evaluate(i=>(window as any).__deck.show(i),i);await expect(page.locator('.deck')).toHaveClass(/reflow/);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.screenshot({animations:'disabled',path:`${evidence}/deck-phone-${i+1}.png`,fullPage:true});}expect(errors).toEqual([]);
});
