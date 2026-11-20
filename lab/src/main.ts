import './style.css';
import data from './data/scenarios.json';
import {instructions} from './data/instructions';
import {glossary, resources} from './data/resources';
import {nistCategories, type Scenario} from './schema';
import {stages,parseRoute,missionHash,emptyRecord,DiscussionTimer,type Mode,type RecordState} from './engine';
const missions = data as Scenario[];
const app = document.querySelector<HTMLDivElement>('#app')!;
const dialog = document.querySelector<HTMLDialogElement>('#dialog')!;
const status = document.querySelector<HTMLDivElement>('#status')!;
const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const btn = (label: string, action: string, cls = '', attrs = '') => `<button type="button" data-action="${action}" class="${cls}" ${attrs}>${label}</button>`;
const image = (s: Scenario, cls='') => `<img class="${cls}" ${cls==='library-image'?'loading="lazy"':'fetchpriority="high"'} src="${import.meta.env.BASE_URL}images/scenarios/${s.game.image.filename}" alt="${esc(s.game.image.altText)}" srcset="${import.meta.env.BASE_URL}images/scenarios/${s.game.image.filename.replace('.webp','-800.webp')} 800w, ${import.meta.env.BASE_URL}images/scenarios/${s.game.image.filename} 1600w" sizes="(max-width:700px) 100vw, 44vw" style="object-position:${s.game.image.focalPoint}" width="1600" height="900" decoding="async">`;
const list = (items: string[]) => `<ul class="large-list">${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
let route = parseRoute(location.hash), mode: Mode = route.mode;
let shortcuts = true;
let presentation = mode === 'facilitator', page = 0, unknowns = false, twist = false, debrief = 0;
let clue: string | null = null, clueTeam: 'red'|'blue' = 'red', suggestion = 0;
let dialogType = '', instructionIndex = 0, nextInstructionMission = 6, instructionLaunch = false;
let browseFilter = '', browseSearch = '', focusReturn: HTMLElement | null = null;
const records = new Map<number,RecordState>(), visited = new Map<number,Set<number>>();
const completed = new Set<number>();
const record = () => {if(!records.has(route.id!)) records.set(route.id!,emptyRecord());return records.get(route.id!)!;};
const current = () => missions.find(s=>s.id===route.id)!;
const timer = new DiscussionTimer();let timerVisible=false;
const room = new URLSearchParams(location.hash.slice(1)).get('room') || crypto.randomUUID();
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(`trust-lab-${room}`) : null;
const announce = (text: string) => {status.textContent='';requestAnimationFrame(()=>status.textContent=text);};
function linkTo(id: number,stage = 0) {return missionHash(id,stage,mode)+`&room=${room}`;}
function navigate(id: number, stage=0) {location.hash=linkTo(id,stage);}
function sync() {channel?.postMessage({type:'state',id:route.id,stage:route.stage});}
channel?.addEventListener('message',event=>{
 const m=event.data;
 if(route.presenter) {if(m.type==='state' && Number.isInteger(m.id) && m.id>=1 && m.id<=30){route.id=m.id;route.stage=Math.max(0,Math.min(6,m.stage));renderPresenter();}}
 else if(m.type==='ready') sync();
 else if(m.type==='next') next();
 else if(m.type==='previous') previous();
});
function header() {
 return `<header class="site-header"><a class="brand" href="#" title="Return home"><span class="brand-mark" aria-hidden="true"><i></i><i></i></span><span>Trust Under Pressure<small>The Scholarship Decision Lab</small></span></a><nav aria-label="Main">${btn('How to play','instructions')}${!presentation?btn('Scenarios','browse'):''}${btn(presentation?'Exit presentation':'Presentation mode','presentation')}${btn('Menu','menu')}</nav></header>`;
}
function home() {
 return `<main id="main" class="home" tabindex="-1"><section class="home-hero"><div class="home-copy"><p class="mission-line">30 Challenges. Two Teams. One Mission.</p><h1>TRUST<br>UNDER<br>PRESSURE</h1><h2>The Scholarship Decision Lab</h2><p class="intro">Scholarship deadlines, data breaches, unfair decisions, and technology failures can change lives.</p><p class="home-question">Can your team identify the risks and protect the opportunity?</p><div class="home-actions">${btn('Start a mission','start','primary')}${btn('Explore 30 scenarios','browse','outline')}${btn('How to play','instructions','outline')}${btn('Facilitator mode','facilitator','outline')}</div><a class="deck-link" href="./decks/introduction.html">Introduce the game: five-slide webdeck</a></div><figure class="home-art"><img src="${import.meta.env.BASE_URL}images/home-hero.webp" width="1600" height="900" alt="Fictional applicant Sarah faces a scholarship portal outage at her desk." fetchpriority="high"><figcaption><span>One deadline. One interrupted connection.</span><strong>A real decision begins with a person.</strong><small>Fictional people and situations throughout the lab.</small></figcaption></figure></section><div class="mission-motto">Spot the Risk. Plan the Response. Protect the Opportunity.</div><section class="home-lower"><div class="team-intro red-intro"><strong>Red Team</strong><span>Spot the risks. Who could be harmed?</span></div><div class="team-intro blue-intro"><strong>Blue Team</strong><span>Plan the response. What happens first?</span></div></section><nav class="secondary-nav" aria-label="Explore the lab">${btn('Random mission','random')}${btn('Browse by topic','browse')}${btn('Glossary','glossary')}${btn('Resources','resources')}</nav><p class="privacy">Free to use. No accounts, tracking, or external AI processing. Your decisions stay in this tab until you copy or download them.</p></main>`;
}
function MissionProgress() {
 const seen=visited.get(route.id!) || new Set();
 return `<div class="mission-progress" role="region" aria-label="Mission progress"><span class="mission-count">Mission ${String(route.id).padStart(2,'0')} of 30</span><ol aria-label="Mission progress">${stages.map((s,i)=>`<li ${i===route.stage?'aria-current="step"':''} class="${i===route.stage?'active':seen.has(i)?'visited':''}"><span class="step-number">${i+1}</span><span>${s}</span></li>`).join('')}</ol></div>`;
}
function MissionBriefing(s:Scenario) {
 return `<section class="briefing"><div class="briefing-copy"><p class="section-label">Mission briefing / ${esc(s.collection)}</p><h1 id="stage-title">${esc(s.title)}</h1><p class="hook">${esc(s.game.openingHook)}</p><p class="stake">${esc(s.game.openingQuestion)}</p>${btn('Begin investigation','next','primary')}</div><figure>${image(s)}<figcaption>Fictional scenario</figcaption></figure></section>`;
}
function EvidenceBoard(s:Scenario) {
 return `<section class="round evidence"><p class="section-label">Know / Evidence before assumptions</p><h1 id="stage-title">What do we know?</h1><div class="panel"><h2>${unknowns?'What we don’t know':'Confirmed facts'}</h2>${list(unknowns?s.unknowns:s.facts)}</div><div class="round-actions">${btn(unknowns?'Show confirmed facts':'Show unknowns','unknowns','outline',`aria-expanded="${unknowns}"`)}<span>Separate the evidence from your assumptions.</span></div></section>`;
}
function TeamRound(s:Scenario, team:'red'|'blue') {
 const rec=record(), red=team==='red';
 const choiceCount=red?s.risks.length:s.game.presentationChoices.length;
 const options=red?s.risks.map((label,i)=>({id:String(i),label})):s.game.presentationChoices.map(c=>({id:c.id,label:c.shortLabel}));
 return `<section class="round team-round ${team}"><p class="section-label">${red?'Red Team / Spot the risks':'Blue Team / Plan the response'}</p><h1 id="stage-title">${red?'What could go wrong?':'What should happen first?'}</h1><p class="round-instruction">${red?'Select risks. You may choose several.':'Choose a first response. Explain your reasoning.'}</p><div class="choices ${red?'risk-choices':''}" role="group" aria-label="${red?'Potential risks':'Possible responses'}">${options.slice(page*2,page*2+2).map((c,n)=>{
 const selected=red?rec.risks.includes(Number(c.id)):rec.response===c.id;
 return btn(`<span class="choice-letter">${String.fromCharCode(65+page*2+n)}</span><span>${esc(c.label)}</span><span class="selection-mark" aria-hidden="true">${selected?'✓':'+'}</span>`,`${red?'risk':'response'}:${c.id}`,`choice ${selected?'selected':''}`,`aria-pressed="${selected}"`);
 }).join('')}</div><div class="choice-nav">${btn(`${page?'Earlier':'More'} ${red?'risks':'responses'}`,'choice-page','outline')}<span>Showing ${page*2+1}–${Math.min(page*2+2,choiceCount)} of ${choiceCount}</span>${btn('Read choice details','choice-details','quiet')}</div><div class="team-toolbar">${btn('Reveal clue','clues','outline')}${btn('Need a nudge?','nudge','outline')}${btn(red?'Submit findings':'Record our reasoning','reasoning','primary')}</div><p class="selection-summary">${red?`${rec.risks.length} risk${rec.risks.length===1?'':'s'} selected`:`Our response: ${esc(s.game.presentationChoices.find(c=>c.id===rec.response)?.shortLabel || 'Not selected yet')}`}</p></section>`;
}
function ComplicationReveal(s:Scenario) {
 return `<section class="round twist"><p class="section-label">Continue / Test your plan</p><h1 id="stage-title">New information</h1>${twist?`<div class="panel complication"><p class="hook">${esc(s.game.twist.revealText)}</p></div><h2 class="twist-question">${esc(s.game.twist.reconsiderQuestion)}</h2><div class="round-actions">${btn('Keep our plan','keep','primary')}${btn('Reconsider','reconsider','outline')}${btn('Reveal another clue','clues','outline')}</div><p class="selection-summary">${esc(record().reconsideration)}</p>`:`<div class="sealed"><span class="sealed-rule" aria-hidden="true"></span><p>One new fact could change the decision.</p>${btn('Show new information','twist','primary')}</div>`}</section>`;
}
const debriefTitles=['Red Team discovered','Blue Team recommends','Tradeoffs','Still unknown','Consider the responses'];
function DebriefPanel(s:Scenario) {
 const c=s.game.presentationChoices.find(c=>c.id===record().response);
 let content='';
 if(debrief===0) content=list(s.debrief.red);
 if(debrief===1) content=list(s.debrief.blue);
 if(debrief===2) content=`<p>${esc(s.debrief.tradeoffs)}</p><p class="annotation">Several plans may be defensible. Explain the evidence, authority, and safeguards behind yours.</p>`;
 if(debrief===3) content=list(s.debrief.stillUnknown);
 if(debrief===4) content=`<h3>${c?'Your choice: '+esc(c.shortLabel):'No response was selected'}</h3><p>${c?esc(c.feedback):'Work through the response options and compare the reasoning, without a score or penalty.'}</p>${btn('Compare all response analyses','analysis','outline')}`;
 return `<section class="round debrief"><p class="section-label">Debrief / ${debrief+1} of 5</p><h1 id="stage-title">${debriefTitles[debrief]}</h1><div class="panel ${debrief===0?'red-panel':debrief===1?'blue-panel':''}">${content}</div><div class="debrief-nav" aria-label="Debrief sections">${debriefTitles.map((x,i)=>btn(x,`debrief:${i}`,i===debrief?'active':'',`aria-pressed="${i===debrief}"`)).join('')}</div></section>`;
}
function MissionCompletion(s:Scenario) {
 completed.add(s.id);
 return `<section class="round complete"><p class="section-label">Mission complete / ${completed.size} explored in this tab</p><h1 id="stage-title">Protect the opportunity.</h1><div class="completion-content"><div><h2>What did we learn?</h2><p class="takeaway">${esc(s.game.completion.takeaway)}</p></div><div class="next-move"><h2>Before your next scholarship cycle</h2><p>${esc(s.game.completion.action)}</p></div></div><div class="team-toolbar">${btn('Your decision record','record','primary')}${btn('Next mission','next-mission','outline')}${btn('Try another response','try-again','outline')}${btn('Explore scenarios','browse','outline')}</div></section>`;
}
function ProjectorControls() {
 return `<footer class="projector-controls"><div>${btn('Previous','previous','outline',route.stage===0?'disabled':'')}${btn(route.stage===6?'Return home':route.stage===4?'Reveal debrief':route.stage===5?(debrief<4?'Next analysis':'Complete mission'):route.stage===2?'Blue Team response':'Next','next','primary')}</div><div class="utility-controls">${btn('Clues','clues')}${btn('New information','go-twist')}${btn('Debrief','go-debrief')}${btn('Timer','timer')}${btn('Reset','reset')}${btn(document.fullscreenElement?'Leave full screen':'Full screen','fullscreen')}</div></footer>`;
}
function timerPanel() {
 return `<aside class="timer-panel" aria-label="Optional discussion timer"><div class="timer-top"><strong>Discussion time</strong>${btn('Close timer','timer')}</div><div id="timer-readout" role="timer" aria-live="off">${formatTime(timer.remaining)}</div><label for="timer-duration">Choose duration</label><select id="timer-duration"><option value="0">No timer</option>${[60,90,120,180,300].map(n=>`<option value="${n}" ${timer.duration===n?'selected':''}>${n<120?n+' seconds':n/60+' minutes'}</option>`).join('')}</select><div>${btn(timer.running?'Pause':'Start','timer-toggle')}${btn('Reset','timer-reset')}${btn('+30 seconds','timer-extend')}</div><p>Discussion only. Time never submits a response or changes the round.</p></aside>`;
}
function formatTime(t:number) {return `${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`;}
function render(focus=true) {
 if(route.presenter){renderPresenter();return;}
 document.body.className=(presentation?'presentation ':'')+(route.id?'in-mission':'');
 let body=home();
 if(route.id){
  if(!visited.has(route.id))visited.set(route.id,new Set());visited.get(route.id)!.add(route.stage);
  const s=current();
  const content=[()=>MissionBriefing(s),()=>EvidenceBoard(s),()=>TeamRound(s,'red'),()=>TeamRound(s,'blue'),()=>ComplicationReveal(s),()=>DebriefPanel(s),()=>MissionCompletion(s)][route.stage]();
  body=`${MissionProgress()}<main id="main" class="mission" tabindex="-1">${content}</main>${ProjectorControls()}`;
 }
 app.innerHTML=header()+body+(timerVisible?timerPanel():'');
 if(focus) {const h=document.querySelector<HTMLElement>('#stage-title') || document.querySelector<HTMLElement>('#main');h?.setAttribute('tabindex','-1');h?.focus({preventScroll:true});window.scrollTo(0,0);}
 sync();
}
function next() {if(!route.id)return;if(route.stage===5 && debrief<4){debrief++;render();return;}if(route.stage===6){location.hash='';return;}navigate(route.id,route.stage+1);}
function previous(){if(!route.id)return;if(route.stage===5 && debrief>0){debrief--;render();return;}navigate(route.id,Math.max(0,route.stage-1));}
function openDialog(type:string,html:string){
 if(!dialog.open)focusReturn=document.activeElement as HTMLElement;
 dialogType=type;dialog.innerHTML=`<div class="dialog-top"><span>The Scholarship Decision Lab</span>${btn('Close','close','close')}</div>${html}`;
 if(!dialog.open)dialog.showModal();
 dialog.querySelector<HTMLElement>('#dialog-title')?.setAttribute('tabindex','-1');dialog.querySelector<HTMLElement>('#dialog-title')?.focus();
}
function closeDialog(){dialog.close();dialogType='';focusReturn?.focus({preventScroll:true});}
function showInstructions(){
 const x=instructions[instructionIndex];
 openDialog('instructions',`<p class="section-label">How to play / ${instructionIndex+1} of 5</p><h2 id="dialog-title">${esc(x.title)}</h2><p class="dialog-lead">${esc(x.body)}</p>${list(x.bullets)}<div class="dialog-actions">${btn(x.action,'instruction-next','primary')}${btn('Skip instructions','skip-instructions','outline')}${instructionIndex?btn('Previous','instruction-previous','quiet'):''}</div>`);
}
function startInstructions(id:number, launch=false){instructionIndex=0;nextInstructionMission=id;instructionLaunch=launch;showInstructions();}
function chooseMode(id=6){openDialog('mode',`<h2 id="dialog-title">How will you play?</h2><p class="dialog-lead">Both teams work toward the same goal. No accounts or live connections are needed.</p><div class="mode-list">${btn('<strong>Solo investigator</strong><span>Take both perspectives. About 6–10 minutes.</span>',`mode:solo:${id}`,'mode-option')}${btn('<strong>Team challenge</strong><span>Divide into Red and Blue Teams. Discuss together.</span>',`mode:team:${id}`,'mode-option')}${btn('<strong>Facilitator / projector</strong><span>Large text, staged reveals, and optional timing.</span>',`mode:facilitator:${id}`,'mode-option')}</div>`);}
function showBrowse(){
 const collections=[...new Set(missions.map(s=>s.collection))];
 openDialog('browse',`<h2 id="dialog-title">Choose your next decision.</h2><div class="browse-tools"><label>Search missions<input type="search" id="browse-search" value="${esc(browseSearch)}" placeholder="Try privacy, deadline, or AI"></label><label>Topic<select id="browse-filter"><option value="">All six collections</option>${collections.map(c=>`<option ${c===browseFilter?'selected':''}>${esc(c)}</option>`).join('')}</select></label></div><div id="browse-results"></div>`);renderBrowseResults();
}
function renderBrowseResults(){
 const visible=missions.filter(s=>(!browseFilter||s.collection===browseFilter)&&`${s.title} ${s.collection} ${s.risks.join(' ')}`.toLowerCase().includes(browseSearch.toLowerCase()));
 document.querySelector('#browse-results')!.innerHTML=`<p>${visible.length} mission${visible.length===1?'':'s'}</p><div class="mission-library">${visible.map(s=>`<button class="mission-card" data-action="launch:${s.id}">${image(s,'library-image')}<span class="mission-card-content"><small>Mission ${String(s.id).padStart(2,'0')} / ${esc(s.collection)}</small><strong>${esc(s.title)}</strong><span>${esc(s.game.openingHook)}</span>${completed.has(s.id)?'<small>Explored in this tab</small>':''}</span></button>`).join('')}</div>${visible.length?'':'<p>Try a different phrase or choose all collections.</p>'}`;
 document.querySelectorAll<HTMLImageElement>('.mission-card img').forEach(img=>img.loading='lazy');
}
function showClues(){
 if(!route.id){announce('Choose a mission first.');return;}
 if(route.stage===3)clueTeam='blue';else if(route.stage===2)clueTeam='red';
 const clues=current().game.clues.filter(c=>c.stage===clueTeam);
 openDialog('clues',`<h2 id="dialog-title">${clueTeam==='red'?'Red':'Blue'} Team clues</h2><p>Choose one clue. No penalty for investigating.</p><div class="clue-buttons">${clues.map((c,i)=>btn(`${clue===c.id?'Hide':'Reveal'} clue ${i+1}`,`clue:${c.id}`,'outline',`aria-expanded="${clue===c.id}" aria-controls="clue-${c.id}"`)).join('')}</div>${clues.map(c=>`<section id="clue-${c.id}" class="clue-card ${clueTeam}" ${clue===c.id?'':'hidden'}><h3>${esc(c.title)}</h3><p>${esc(c.content)}</p></section>`).join('')}<div class="dialog-actions">${btn('Hide all clues','hide-clues','quiet')}${btn(clueTeam==='red'?'Blue Team clues':'Red Team clues','clue-team','quiet')}</div>`);
}
function showReasoning(){const r=record();openDialog('reasoning',`<h2 id="dialog-title">Explain your decision.</h2><p class="dialog-lead">${esc(route.stage===2?current().game.redTeamInstructions:current().game.blueTeamInstructions)}</p><p>${r.risks.length} risks selected. Response: ${esc(current().game.presentationChoices.find(c=>c.id===r.response)?.shortLabel||'Not selected yet')}.</p><label for="reasoning">Why does this help? Who owns the next step?<textarea id="reasoning" maxlength="6000">${esc(r.reasoning)}</textarea></label><p class="local-note">Use fictional details only. This text stays in this tab’s memory.</p>${btn('Keep our reasoning','save-reasoning','primary')}`);}
function decisionText(){const s=current(),r=record();return `TRUST UNDER PRESSURE\nMission ${s.id}: ${s.title}\nMode: ${mode}\n\nRISKS IDENTIFIED\n${r.risks.map(i=>s.risks[i]).join('\n')||'Not recorded'}\n\nRESPONSE\n${s.game.presentationChoices.find(c=>c.id===r.response)?.shortLabel||'Not recorded'}\n\nREASONING\n${r.reasoning||'Not recorded'}\n\nRECONSIDERATION\n${r.reconsideration||'Not recorded'}\n\nWHAT WE LEARNED\n${r.reflection||'Not recorded'}\n\nOUR NEXT ACTION AND OWNER\n${r.action||s.game.completion.action}\n\nTAKEAWAY\n${s.game.completion.takeaway}\n\nNIST CSF 2.0 TEACHING CONNECTIONS\n${s.nist.map(n=>n+' '+nistCategories[n]).join('\n')}\n\nFictional learning activity. No score or certification.\n`;}
function showRecord(){const r=record();openDialog('record',`<h2 id="dialog-title">Your decision record</h2><label for="reflection">What changed in your thinking?<textarea id="reflection" maxlength="6000">${esc(r.reflection)}</textarea></label><label for="action-plan">Your next action and owner<textarea id="action-plan" maxlength="6000">${esc(r.action)}</textarea></label><p>Text stays in this tab’s memory. Download or copy it before closing the tab. Do not enter applicant or other private information.</p><div class="dialog-actions">${btn('Download decision record','download','primary')}${btn('Copy decision record','copy','outline')}${btn('Print worksheet','worksheet','outline')}</div>`);}
function saveRecordFields(){const r=record();const reflection=document.querySelector<HTMLTextAreaElement>('#reflection');const action=document.querySelector<HTMLTextAreaElement>('#action-plan');if(reflection)r.reflection=reflection.value;if(action)r.action=action.value;}
function download(text:string,filename:string){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function showGuide(){openDialog('guide',`<h2 id="dialog-title">Run a mission together.</h2><p class="dialog-lead">Allow about 10–15 minutes for a team mission. Invite disagreement about the reasoning, not a race for the right answer.</p><ol class="guide-steps"><li>Introduce the roles with <a href="./decks/introduction.html">the five-slide webdeck</a> or How to Play.</li><li>Briefing and evidence: about two minutes. Separate known facts from assumptions.</li><li>Red Team: about two minutes. Ask who could be harmed. Reveal clues only on request.</li><li>Blue Team: about three minutes. Choose a first action, an owner, and a fallback.</li><li>Twist: about two minutes. Keep or reconsider the plan.</li><li>Debrief and action: about three minutes. Compare tradeoffs and choose a 30-day improvement.</li></ol><p>Use voices, hands, chat, or paper for discussion. No live polling connection is required.</p><p><strong>Private notes need a separate unshared window or device.</strong> A duplicated screen cannot hide notes. Opening presenter view does not make your display private.</p><div class="dialog-actions">${btn('Open separate presenter window','presenter','primary')}${btn('Print blank worksheet','worksheet','outline')}</div><h3>Keyboard controls</h3><p>Right / Left: next / previous. C: clues. F: presentation mode. T: timer. Escape: close dialogs. Shortcuts pause while you type.</p>`);}
function showResources(){openDialog('resources',`<h2 id="dialog-title">From discussion to practice</h2><p>The debriefs connect to NIST CSF 2.0 categories. These are teaching connections, not official NIST or NSPA endorsements, a complete control assessment, or a certification. Privacy, fairness, and accessibility also need their own review.</p><div class="resource-list">${resources.map(r=>`<article><h3><a href="${r.url}" target="_blank" rel="noopener noreferrer">${r.title}</a></h3><p>${r.description}</p></article>`).join('')}</div><p><a href="./image-prompts.md" download>Download all 30 image prompts</a></p><p>Use your published policies and qualified local advice when an actual incident raises legal or notification questions.</p>${route.id?`<h3>This mission’s connections</h3><ul>${current().nist.map(n=>`<li>${n} / ${nistCategories[n]}</li>`).join('')}</ul>`:''}`);}
function openPresenter(){
 if(!route.id){chooseMode(6);return;}
 const url=new URL(location.href);url.hash=`mission=${route.id}&stage=${route.stage}&view=presenter&room=${room}`;
 const popup=window.open(url,'trust-lab-presenter','width=1100,height=850');
 if(popup)announce('Presenter window opened. Move it to an unshared display.');else announce('The presenter window was blocked. Allow popups for this site and try again.');
}
let presenterNotes=false, analysisIndex=0;
function renderPresenter(){
 document.body.className='presenter';const s=current()||missions[5];
 app.innerHTML=`<main id="main" class="presenter-main"><p class="section-label">Separate presenter view</p><h1>${esc(s.title)}</h1><p class="presenter-warning">Keep this window on an unshared display. A duplicated screen does not keep notes private.</p><div class="presenter-toolbar">${btn('Previous audience stage','presenter-previous','outline')}${btn('Next audience stage','presenter-next','primary')}${btn('Close presenter','close-presenter','outline')}</div><p>Audience stage: <strong>${stages[route.stage]}</strong>. Clues are revealed from the audience window.</p><h2>Discussion guidance</h2><p>Ask: Who might be missing from this conversation? What evidence could change the plan? Who has the authority to act?</p><p>Allow two minutes for risks, three for response, two for reconsideration, and three for debrief. Never treat a timer as a deadline for a learning decision.</p>${btn(presenterNotes?'Hide model notes':'Reveal model notes here','presenter-notes','outline')}${presenterNotes?`<div class="presenter-model"><h2>Risks likely to be missed</h2>${list(s.debrief.red)}<h2>Model protective response</h2>${list(s.debrief.blue)}<h2>Tradeoffs</h2><p>${esc(s.debrief.tradeoffs)}</p><h2>NIST CSF 2.0 connections</h2><ul>${s.nist.map(n=>`<li>${n} / ${nistCategories[n]}</li>`).join('')}</ul></div>`:''}</main>`;
}
async function action(a:string){
 const [name,value,id]=a.split(':');
 switch(name){
 case 'close':saveRecordFields();closeDialog();break;
 case 'start':chooseMode();break;
 case 'mode':mode=value as Mode;presentation=mode==='facilitator';closeDialog();startInstructions(Number(id),true);break;
 case 'facilitator':mode='facilitator';presentation=true;chooseMode();break;
 case 'instructions':startInstructions(route.id||6);break;
 case 'instruction-next':if(instructionIndex<4){instructionIndex++;showInstructions();}else{closeDialog();if(instructionLaunch||!route.id)navigate(nextInstructionMission);}break;
 case 'instruction-previous':instructionIndex=Math.max(0,instructionIndex-1);showInstructions();break;
 case 'skip-instructions':closeDialog();if(instructionLaunch||!route.id)navigate(nextInstructionMission);break;
 case 'browse':showBrowse();break;
 case 'launch':closeDialog();chooseMode(Number(value));break;
 case 'random':{const pool=missions.filter(s=>s.id!==route.id);navigate(pool[Math.floor(Math.random()*pool.length)].id);break;}
 case 'next-mission':navigate(route.id!%30+1);break;
 case 'next':next();break;
 case 'previous':previous();break;
 case 'unknowns':unknowns=!unknowns;render(false);announce(unknowns?'Unanswered questions revealed.':'Confirmed facts shown.');break;
 case 'choice-page':page=page===0?1:0;render(false);document.querySelector<HTMLElement>('.choice')?.focus();break;
 case 'risk':{const r=record();const n=Number(value);r.risks=r.risks.includes(n)?r.risks.filter(i=>i!==n):[...r.risks,n];render(false);document.querySelector<HTMLElement>(`[data-action="risk:${value}"]`)?.focus();announce(`${r.risks.length} risks selected.`);break;}
 case 'response':record().response=value;render(false);document.querySelector<HTMLElement>(`[data-action="response:${value}"]`)?.focus();announce('Response selected. Explain your reasoning before the debrief.');break;
 case 'choice-details':openDialog('choice-details',`<h2 id="dialog-title">${route.stage===2?'Discuss the risks':'Consider each response'}</h2>${route.stage===2?list(current().risks.slice(page*2,page*2+2)):current().game.presentationChoices.slice(page*2,page*2+2).map(c=>`<article class="choice-detail"><h3>${esc(c.shortLabel)}</h3><p>${esc(c.fullDescription)}</p></article>`).join('')}<div class="dialog-actions">${btn(page?'Earlier choice details':'More choice details','details-page','outline')}</div>`);break;
 case 'details-page':page=page?0:1;render(false);void action('choice-details');break;
 case 'reasoning':showReasoning();break;
 case 'save-reasoning':record().reasoning=document.querySelector<HTMLTextAreaElement>('#reasoning')!.value;closeDialog();announce('Reasoning kept in this tab.');break;
 case 'clues':clue=null;showClues();break;
 case 'clue':clue=clue===value?null:value;showClues();dialog.querySelector<HTMLElement>(`[data-action="clue:${value}"]`)?.focus();announce(clue?`Clue revealed: ${current().game.clues.find(c=>c.id===clue)?.title}`:'Clue hidden.');break;
 case 'hide-clues':clue=null;showClues();announce('All clues hidden.');break;
 case 'clue-team':clueTeam=clueTeam==='red'?'blue':'red';clue=null;showClues();break;
 case 'nudge':{const x=current().game.suggestions;openDialog('nudge',`<h2 id="dialog-title">Need a nudge?</h2><p class="nudge-text">${esc(x[suggestion++%x.length])}</p><p>A thinking prompt, not new scenario evidence.</p>${btn('Another thinking prompt','nudge','outline')}`);break;}
 case 'twist':twist=true;render(false);announce('New information revealed.');break;
 case 'keep':record().reconsideration='We kept our plan after considering the new information.';render(false);announce('Plan kept. You can record your reasons.');break;
 case 'reconsider':record().reconsideration='We reconsidered our response after the new information.';navigate(route.id!,3);break;
 case 'go-twist':if(route.id)navigate(route.id,4);break;
 case 'go-debrief':if(route.id)navigate(route.id,5);break;
 case 'debrief':debrief=Number(value);render();break;
 case 'analysis':{const choices=current().game.presentationChoices;const c=choices[analysisIndex%choices.length];openDialog('analysis',`<p class="section-label">Response analysis ${analysisIndex%choices.length+1} of ${choices.length}</p><h2 id="dialog-title">${esc(c.shortLabel)}</h2><p class="dialog-lead">${esc(c.feedback)}</p><div class="dialog-actions">${btn('Next response analysis','next-response-analysis','primary')}</div>`);break;}
 case 'next-response-analysis':analysisIndex++;void action('analysis');break;
 case 'try-again':navigate(route.id!,3);break;
 case 'record':showRecord();break;
 case 'download':saveRecordFields();download(decisionText(),`mission-${String(route.id).padStart(2,'0')}-decision.txt`);announce('Decision record downloaded.');break;
 case 'copy':saveRecordFields();try{await navigator.clipboard.writeText(decisionText());announce('Decision record copied.');}catch{openDialog('copy-fallback',`<h2 id="dialog-title">Copy your record</h2><p>Select the text below and use your device’s Copy command.</p><textarea readonly class="copy-record">${esc(decisionText())}</textarea>`);dialog.querySelector<HTMLTextAreaElement>('textarea')!.select();}break;
 case 'worksheet':window.open(`${import.meta.env.BASE_URL}worksheet.html`,'_blank','noopener');break;
 case 'reset':if(route.id)openDialog('reset',`<h2 id="dialog-title">Restart this mission?</h2><p>Clear this mission’s selections, reasoning, clues, and reflections in this tab. Download your record first if you want to keep it.</p>${btn('Restart mission','confirm-reset','primary')}${btn('Keep investigating','close','outline')}`);break;
 case 'confirm-reset':records.delete(route.id!);visited.delete(route.id!);completed.delete(route.id!);twist=false;unknowns=false;clue=null;page=0;debrief=0;timer.reset();closeDialog();if(route.stage===0)render();else navigate(route.id!);break;
 case 'timer':timerVisible=!timerVisible;render(false);break;
 case 'timer-toggle':timer.running?timer.pause():timer.start();render(false);break;
 case 'timer-reset':timer.reset();render(false);break;
 case 'timer-extend':timer.extend();render(false);break;
 case 'presentation':presentation=!presentation;render(false);announce(presentation?'Presentation mode enabled.':'Presentation mode disabled.');break;
 case 'fullscreen':try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{announce('Full screen is unavailable. Use the browser’s full-screen control.');}break;
 case 'glossary':openDialog('glossary',`<h2 id="dialog-title">Words for better decisions</h2><dl class="glossary">${glossary.map(([t,d])=>`<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join('')}</dl>`);break;
 case 'resources':showResources();break;
 case 'guide':showGuide();break;
 case 'presenter':openPresenter();break;
 case 'presenter-previous':channel?.postMessage({type:'previous'});break;
 case 'presenter-next':channel?.postMessage({type:'next'});break;
 case 'presenter-notes':presenterNotes=!presenterNotes;renderPresenter();break;
 case 'close-presenter':window.close();break;
 case 'shortcuts':shortcuts=!shortcuts;void action('menu');break;
 case 'menu':openDialog('menu',`<h2 id="dialog-title">Mission menu</h2><div class="menu-grid">${btn('How to play','instructions','outline')}${btn('Explore scenarios','browse','outline')}${btn('Facilitator guide','guide','outline')}${btn('Glossary','glossary','outline')}${btn('Resources and NIST','resources','outline')}${btn('Random mission','random','outline')}${btn(shortcuts?'Single-key shortcuts: on':'Single-key shortcuts: off','shortcuts','outline',`aria-pressed="${shortcuts}"`)}<a href="./decks/introduction.html">Introduction webdeck</a><a href="#" data-action="home">Return home</a></div><p>Keyboard: Right / Left for stages, C for clues, F for presentation, T for timer. Escape closes dialogs.</p>`);break;
 case 'home':closeDialog();location.hash='';break;
 }
}
document.querySelector('.skip')!.addEventListener('click',e=>{e.preventDefault();const main=document.querySelector<HTMLElement>('#main');main?.focus();main?.scrollIntoView();});
document.addEventListener('click',e=>{const target=(e.target as HTMLElement).closest<HTMLElement>('[data-action]');if(target && !target.hasAttribute('disabled')){e.preventDefault();void action(target.dataset.action!);}});
document.addEventListener('input',e=>{const el=e.target as HTMLInputElement;if(el.id==='browse-search'){browseSearch=el.value;renderBrowseResults();}if(el.id==='reflection'||el.id==='action-plan')saveRecordFields();if(el.id==='reasoning')record().reasoning=el.value;});
document.addEventListener('change',e=>{const el=e.target as HTMLSelectElement;if(el.id==='browse-filter'){browseFilter=el.value;renderBrowseResults();}if(el.id==='timer-duration'){const n=Number(el.value);if(n===0){timer.pause();timerVisible=false;}else timer.reset(n);render(false);}});
dialog.addEventListener('close',()=>{dialogType='';focusReturn?.focus({preventScroll:true});});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}});
document.addEventListener('keydown',e=>{
 if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.repeat)return;
 if((e.target as HTMLElement).closest('input,textarea,select,[contenteditable="true"]'))return;
 if(dialog.open)return;
 if(route.presenter){if(e.key==='ArrowRight'){e.preventDefault();channel?.postMessage({type:'next'});}if(e.key==='ArrowLeft'){e.preventDefault();channel?.postMessage({type:'previous'});}return;}
 if(e.key==='ArrowRight'&&route.id){e.preventDefault();next();}if(e.key==='ArrowLeft'&&route.id){e.preventDefault();previous();}
 if(shortcuts&&e.key.toLowerCase()==='c'&&route.id){e.preventDefault();void action('clues');}
 if(shortcuts&&e.key.toLowerCase()==='f'){e.preventDefault();void action('presentation');}
 if(shortcuts&&e.key.toLowerCase()==='t'){e.preventDefault();void action('timer');}
});
window.addEventListener('hashchange',()=>{
 const prev=route;route=parseRoute(location.hash);if(dialog.open)closeDialog();
 if(prev.id!==route.id){twist=false;unknowns=false;debrief=0;}else if(prev.stage!==route.stage && route.stage===5)debrief=0;
 page=0;clue=null;timer.pause();if(route.mode!==mode){mode=route.mode;presentation=mode==='facilitator';}render();
});
document.addEventListener('fullscreenchange',()=>render(false));
setInterval(()=>{const before=timer.remaining;timer.tick();const el=document.querySelector('#timer-readout');if(el)el.textContent=formatTime(timer.remaining);if(before>0&&timer.remaining===0){announce('Discussion time has ended. Continue when your team is ready.');if(timerVisible)render(false);}},250);
render(false);if(route.presenter)channel?.postMessage({type:'ready'});
