"""Infographic layouts and numeric displays for the workshop's existing content."""
from html import escape as E
from content import ROOT
ART={2:'takeaways',4:'readiness',5:'prompt-parts',6:'comparison',9:'review-flow',11:'evidence-check',14:'human-decision',16:'checkpoints',19:'policy'}
CSS='''
.action{top:670px;min-height:48px;padding-top:10px;font-size:25px}
.resource-links{position:absolute;left:90px;top:735px;display:flex;gap:20px;z-index:5}
.resource-link{display:flex;align-items:center;justify-content:space-between;width:432px;height:34px;padding:4px 14px;background:#007681;color:white;text-decoration:none;font:bold 20px Arial;border-radius:4px}
.content.illustrated{top:180px;height:480px;display:block}
.diagram-art{display:block;margin:0 auto;width:1140px;height:325px;object-fit:contain}
.diagram-labels{display:grid;gap:22px;width:1140px;margin:0 auto;grid-template-columns:repeat(3,1fr)}
.diagram-label{padding:10px 14px 8px;border-top:6px solid #007681;background:#e4f4f4}
.diagram-label:nth-child(2){border-color:#d28b00;background:#fff3cd}
.diagram-label:nth-child(3){border-color:#db5420;background:#fff0e8}
.diagram-label h2{margin:0 0 7px;font-size:28px;line-height:1.1;color:#2e4f66}
.diagram-label p{margin:0;font-size:24px;line-height:1.23}
.slide-5 .diagram-art{width:1310px;height:325px;object-fit:cover}.slide-5 .diagram-labels{width:1310px;grid-template-columns:repeat(5,1fr);gap:14px}.slide-5 .diagram-label{padding:10px}.slide-5 .diagram-label h2{font-size:27px}.slide-5 .diagram-label p{font-size:24px}
.slide-6 .diagram-labels{grid-template-columns:repeat(2,1fr);gap:65px}.slide-6 .diagram-label:last-child{background:#e4f4f4;border-color:#007681}
.slide-4 .diagram-label:last-child{background:#007681;border-color:#007681;color:white}.slide-4 .diagram-label:last-child h2{color:white}
.content.duration-chart{display:block;top:235px;height:390px}.duration-axis{display:flex;justify-content:space-between;font-size:23px;margin-bottom:12px}.duration-bar{display:flex;height:126px;gap:0}.duration-segment{display:flex;align-items:center;justify-content:center;gap:18px;background:#007681;color:white}.duration-segment:nth-child(2){background:#ffcd34;color:#2e4f66}.duration-segment:nth-child(3){background:#ff7233;color:#203c50}.duration-segment strong{font-size:72px}.duration-segment span{font-size:28px;font-weight:bold}.duration-captions{display:grid;grid-template-columns:2fr 2fr 1fr;margin-top:22px;gap:24px}.duration-captions p{font-size:28px;line-height:1.3;margin:0}.duration-captions h2{font-size:30px;margin:0 0 12px}
.content.evidence-board{display:block;top:220px;height:420px}.evidence-row{display:grid;grid-template-columns:225px 1fr 275px;margin-bottom:18px;min-height:117px;border-left:8px solid #007681;background:#e4f4f4;align-items:center;gap:24px;padding:16px 24px}.evidence-row:nth-child(2){background:#fff3cd;border-color:#d28b00}.evidence-row:nth-child(3){background:#fff0e8;border-color:#db5420}.evidence-row h2{font-size:32px;margin:0}.evidence-row p{font-size:27px;line-height:1.3;margin:0}.evidence-result{font-size:26px;font-weight:bold;border-left:2px solid #2e4f6633;padding-left:24px}
.content.score-table{display:block;top:220px;height:420px}.score-table table{width:100%;border-collapse:separate;border-spacing:6px;font-size:27px;line-height:1.2}.score-table th{padding:14px;text-align:left;background:#2e4f66;color:white;font-size:27px}.score-table td{padding:21px;background:#e4f4f4;width:24%}.score-table td:nth-child(2){background:#fff0e8}.score-table td:nth-child(3){background:#fff3cd}.score-table td:first-child{background:#f0f6f6;font-weight:bold;width:28%}.score-table th span{font-size:37px}.score-table .table-caption{font-size:24px;margin:14px 7px 0}
.content.numeric-chart{display:flex;gap:52px;top:225px;height:410px}.dot-chart{display:grid;grid-template-columns:repeat(10,1fr);gap:7px;width:720px;flex-shrink:0}.dot-chart span{height:30px;background:#9cdee0;border-radius:3px}.dot-chart span:first-child{background:#d44b17;border:3px solid #2e4f66}.numeric-copy h2{font-size:88px;line-height:1;margin:0;color:#b63e10}.numeric-copy h3{font-size:34px;line-height:1.2;margin:14px 0;color:#2e4f66}.numeric-copy p{font-size:26px;line-height:1.35;margin:14px 0}.numeric-copy .equation{font-size:32px;color:#007681;font-weight:bold}
.slide-22 .process .panel{background:#e4f4f4;border-bottom:10px solid #007681}.slide-22 .process .panel:nth-child(2){background:#fff3cd;border-color:#d28b00}.slide-22 .process .panel:nth-child(3){background:#fff0e8;border-color:#db5420}
.slide-23 .timeline .panel:nth-child(2){background:#fff3cd;border-color:#d28b00}.slide-23 .timeline .panel:nth-child(3){background:#fff0e8;border-color:#db5420}
'''
def render(n,s):
 if n in ART:
  image=f'file://{ROOT}/2026/images/infographics/{ART[n]}.png'
  labels=''.join(f'<div class="diagram-label"><h2>{E(h)}</h2><p>{E(p)}</p></div>' for h,p in s['blocks'])
  return 'illustrated',f'<img class="diagram-art" src="{image}" alt="Illustration of the labeled stages below"><div class="diagram-labels">{labels}</div>'
 if n==7:
  return 'duration-chart','<div class="duration-axis"><span>START</span><span>5 MINUTES TOTAL</span></div><div class="duration-bar">'+''.join(f'<div class="duration-segment" style="flex:{v}"><strong>{v}</strong><span>min</span></div>' for v in [2,2,1])+'</div><div class="duration-captions">'+''.join(f'<div><h2>{h}</h2><p>{p}</p></div>' for h,p in [('Choose a task',s['blocks'][0][1]),('Write your request',s['blocks'][1][1]),('Swap',s['blocks'][2][1])])+'</div>'
 if n==10:
  return 'evidence-board',''.join(f'<div class="evidence-row"><h2>{E(h)}</h2><p>{E(p)}</p><div class="evidence-result">{result}</div></div>' for (h,p),result in zip(s['blocks'],['Verify the source','Ask for follow-up','Keep the original rules']))
 if n==12:
  rows=[['Clear goal','No goal','Goal stated','Goal + next step'],['Contribution','None stated','Contribution named','Specific actions'],['Learning or change','None stated','Change claimed','Change + experience']]
  return 'score-table','<table><thead><tr><th>Criterion</th><th><span>0</span> No stated evidence</th><th><span>1</span> Basic evidence</th><th><span>2</span> Specific evidence</th></tr></thead><tbody>'+''.join('<tr>'+''.join(f'<td>{E(t)}</td>' for t in row)+'</tr>' for row in rows)+'</tbody></table><p class="table-caption">Use each row separately. These are practice anchors, not an award ranking.</p>'
 if n==18:
  return 'numeric-chart','<div><div class="dot-chart">'+''.join('<span></span>' for _ in range(100))+'</div><p style="font-size:24px;margin:14px 0">Each block = 10 human-written essays</p></div><div class="numeric-copy"><h2>10 people</h2><h3>wrongly flagged in this example</h3><p class="equation">1,000 × 1% = 10</p><p>Orange: 10 wrongly flagged<br>Aqua: 990 not flagged</p><p><strong>Hypothetical 1% error rate.</strong><br>Not a measured detector result.</p></div>'
 return None
