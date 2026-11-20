export const stages = ['Briefing','Evidence','Red Team','Blue Team','Twist','Debrief','Complete'] as const;
export type Mode = 'solo' | 'team' | 'facilitator';
export interface RecordState { risks: number[]; response: string; reasoning: string; reconsideration: string; reflection: string; action: string }
export const emptyRecord = (): RecordState => ({risks:[],response:'',reasoning:'',reconsideration:'',reflection:'',action:''});
export function parseRoute(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const id = Number(params.get('mission'));
  const stage = Math.max(0, Math.min(6, Number(params.get('stage')) || 0));
  const mode = ['solo','team','facilitator'].includes(params.get('mode') || '') ? params.get('mode') as Mode : 'solo';
  return {id: Number.isInteger(id) && id >= 1 && id <= 30 ? id : null, stage: Math.floor(stage), mode, presenter: params.get('view') === 'presenter'};
}
export function missionHash(id: number, stage: number, mode: Mode) { return `#mission=${id}&stage=${stage}&mode=${mode}`; }
export class DiscussionTimer {
  duration = 90; remaining = 90; running = false; private end = 0;
  start(now = Date.now()) { if (this.remaining <= 0) return; this.end = now + this.remaining * 1000; this.running = true; }
  tick(now = Date.now()) { if (this.running) {this.remaining = Math.max(0, Math.ceil((this.end - now) / 1000)); if (!this.remaining) this.running = false;} return this.remaining; }
  pause(now = Date.now()) {this.tick(now); this.running = false;}
  reset(seconds = this.duration) {this.duration = seconds; this.remaining = seconds; this.running = false;}
  extend(seconds = 30) {this.remaining += seconds; if (this.running) this.end += seconds * 1000;}
}
