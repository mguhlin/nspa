import {test} from 'node:test';
import assert from 'node:assert/strict';
import scenarios from '../src/data/scenarios.json';
import {validateScenarios} from '../src/schema';
import {DiscussionTimer,parseRoute,missionHash} from '../src/engine';
import fs from 'node:fs';
test('all thirty authored missions meet the content contract and have real images',()=>{
 validateScenarios(scenarios);
 assert.equal(new Set(scenarios.map(s=>s.game.openingHook)).size,30);
 assert.equal(new Set(scenarios.map(s=>s.game.twist.revealText)).size,30);
 assert.equal(new Set(scenarios.map(s=>s.debrief.tradeoffs)).size,30);
 for(const s of scenarios){assert.equal(s.game.clues.length,6);assert.ok(fs.statSync(`public/images/scenarios/${s.game.image.filename}`).size>20000);}
});
test('validator rejects missing fields, model responses, clues, or NIST mappings',()=>{
 for(const mutate of [(s:any)=>delete s.game.completion,(s:any)=>s.game.clues.pop(),(s:any)=>s.nist=['INVALID'],(s:any)=>s.debrief.blue=[],(s:any)=>s.game.presentationChoices[0].feedback='']){
  const copy=structuredClone(scenarios);mutate(copy[0]);assert.throws(()=>validateScenarios(copy));
 }
 const copy=structuredClone(scenarios);copy[1].id=1;assert.throws(()=>validateScenarios(copy));
});
test('hash links survive root and repository-subpath hosting and sanitize malformed stages',()=>{
 for(let id=1;id<=30;id++)for(let stage=0;stage<7;stage++){const r=parseRoute(missionHash(id,stage,'facilitator'));assert.equal(r.id,id);assert.equal(r.stage,stage);assert.equal(r.mode,'facilitator');}
 assert.equal(parseRoute('#mission=999&stage=999').id,null);assert.equal(parseRoute('#mission=6&stage=-4').stage,0);assert.equal(parseRoute('#mission=6&stage=Infinity').stage,6);assert.equal(parseRoute('#mission=6&mode=bogus').mode,'solo');
});
test('discussion timer pauses, resumes, extends, and expires without a navigation side effect',()=>{
 const t=new DiscussionTimer();t.reset(60);t.start(0);assert.equal(t.tick(10000),50);t.pause(15000);assert.equal(t.remaining,45);t.tick(45000);assert.equal(t.remaining,45);t.extend(30);assert.equal(t.remaining,75);t.start(50000);assert.equal(t.tick(126000),0);assert.equal(t.running,false);t.reset();assert.equal(t.remaining,60);assert.equal(t.running,false);
});
