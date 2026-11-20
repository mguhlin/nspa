export interface Clue {
  id: string; stage: 'red' | 'blue'; category: 'notice' | 'investigate' | 'think-deeper'; title: string; content: string;
}
export interface Choice { id: string; shortLabel: string; fullDescription: string; feedback: string }
export interface Scenario {
  id: number; collection: string; framework: string; title: string;
  facts: string[]; unknowns: string[]; risks: string[]; nist: string[];
  debrief: {red: string[]; blue: string[]; tradeoffs: string; stillUnknown: string[]};
  game: {
    missionTitle: string; openingHook: string; presentationBeats: string[]; openingQuestion: string;
    redTeamInstructions: string; blueTeamInstructions: string; suggestions: string[]; clues: Clue[];
    presentationChoices: Choice[];
    twist: {headline: string; revealText: string; reconsiderQuestion: string};
    completion: {takeaway: string; action: string};
    image: {filename: string; prompt: string; altText: string; focalPoint: string};
  };
}
export const nistCategories: Record<string, string> = {
  'GV.OC': 'Govern: Organizational Context', 'GV.RM': 'Govern: Risk Management Strategy',
  'GV.RR': 'Govern: Roles, Responsibilities, and Authorities', 'GV.PO': 'Govern: Policy',
  'GV.OV': 'Govern: Oversight', 'GV.SC': 'Govern: Cybersecurity Supply Chain Risk Management',
  'ID.AM': 'Identify: Asset Management', 'ID.RA': 'Identify: Risk Assessment', 'ID.IM': 'Identify: Improvement',
  'PR.AA': 'Protect: Identity Management, Authentication, and Access Control',
  'PR.AT': 'Protect: Awareness and Training', 'PR.DS': 'Protect: Data Security',
  'PR.PS': 'Protect: Platform Security', 'PR.IR': 'Protect: Technology Infrastructure Resilience',
  'DE.CM': 'Detect: Continuous Monitoring', 'DE.AE': 'Detect: Adverse Event Analysis',
  'RS.MA': 'Respond: Incident Management', 'RS.CO': 'Respond: Incident Response Reporting and Communication',
  'RS.MI': 'Respond: Incident Mitigation', 'RC.RP': 'Recover: Incident Recovery Plan Execution',
};
export function validateScenarios(data: unknown): asserts data is Scenario[] {
  const errors: string[] = [];
  const str = (v: unknown) => typeof v === 'string' && v.trim().length > 2;
  const list = (v: unknown, min = 1) => Array.isArray(v) && v.length >= min && v.every(str);
  if (!Array.isArray(data)) throw new Error('Scenario data must be an array');
  if (data.length !== 30) errors.push('Exactly 30 missions required');
  const ids = new Set<number>();
  for (const s of data) {
    const fail = (message: string) => errors.push(`Mission ${s?.id ?? '?'}: ${message}`);
    if (!s || typeof s !== 'object') { fail('invalid object'); continue; }
    if (!Number.isInteger(s.id) || s.id < 1 || s.id > 30 || ids.has(s.id)) fail('invalid or duplicate id');
    ids.add(s.id);
    for (const key of ['title', 'collection', 'framework']) if (!str(s[key])) fail(`missing ${key}`);
    for (const key of ['facts', 'unknowns', 'risks']) if (!list(s[key], 3)) fail(`need three ${key}`);
    if (!list(s.nist) || s.nist.some((n: string) => !nistCategories[n])) fail('invalid NIST CSF categories');
    const g = s.game;
    if (!g) { fail('missing game'); continue; }
    for (const key of ['missionTitle', 'openingHook', 'openingQuestion', 'redTeamInstructions', 'blueTeamInstructions']) if (!str(g[key])) fail(`missing game.${key}`);
    if (!list(g.presentationBeats, 3) || !list(g.suggestions, 2)) fail('missing beats or suggestions');
    for (const stage of ['red', 'blue']) {
      const clues = g.clues?.filter((c: Clue) => c.stage === stage);
      if (!clues || clues.length < 3 || !['notice','investigate','think-deeper'].every(cat => clues.some((c: Clue) => c.category === cat))) fail(`need three categorized ${stage} clues`);
    }
    if (!Array.isArray(g.clues) || g.clues.some((c: Clue) => !str(c.id) || !str(c.title) || !str(c.content)) || new Set(g.clues.map((c: Clue) => c.id)).size !== g.clues.length) fail('invalid clues');
    if (!Array.isArray(g.presentationChoices) || g.presentationChoices.length < 3 || g.presentationChoices.length > 4 || g.presentationChoices.some((c: Choice) => !c.id || ![c.shortLabel,c.fullDescription,c.feedback].every(str))) fail('need 3–4 complete response choices');
    if (!g.twist || ![g.twist.headline,g.twist.revealText,g.twist.reconsiderQuestion].every(str)) fail('incomplete twist');
    if (!g.completion || ![g.completion.takeaway,g.completion.action].every(str) || !g.completion.action.includes('30 days')) fail('missing concrete 30-day action');
    if (!g.image || ![g.image.filename,g.image.prompt,g.image.altText,g.image.focalPoint].every(str)) fail('incomplete image');
    if (!s.debrief || !list(s.debrief.red,3) || !list(s.debrief.blue,3) || !str(s.debrief.tradeoffs) || !list(s.debrief.stillUnknown)) fail('incomplete debrief');
  }
  if (new Set(data.map(s => s.collection)).size !== 6) errors.push('Six collections required');
  if (errors.length) throw new Error(errors.join('\n'));
}
