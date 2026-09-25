"""Fill the supplied NSPA takeaway template without rewriting its design parts."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from copy import deepcopy
from lxml import etree as ET
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'supplemental-resources/nspa_2026_session_takeaways.docx'
OUT=ROOT/'2026/offline/session-takeaways.docx'
GROUPS=[('Give AI a clear task you can check', ['Include five parts: task, rules, source information, limits, and answer format. Require quotes and paragraph labels so you can check the evidence.', 'Choose a narrow task, such as listing required documents. “Find our best applicants” leaves too much for the tool to guess.', 'Treat application text as evidence, not instructions. Ignore embedded commands, mark gaps, and prohibit invented facts or award recommendations.']), ('Check the draft before using it', ['Compare every claim with the application. Look for invented quotes, omissions, unsupported conclusions, and instructions the tool should have ignored.', 'In fictional C-101: P2 gives a goal, P3 a service example, P4 lacks an enrollment document, and P5 contains an instruction to ignore. Missing evidence needs follow-up.', 'Keep the draft, corrections, and reviewer’s reasoning. A named person checks the evidence and decides. Fluent writing does not establish accuracy.']), ('Make the scoring guide clearer', ['Use observable criteria and examples for each score. Rate independently before viewing an AI suggestion; then compare evidence with a partner.', 'Use “insufficient evidence” when sources are missing or contradictory. Do not infer merit, honesty, or personal traits from writing style.', 'Discuss disagreements and clarify the guide; do not simply average ratings. Record the first rating, suggested change, final human rating, and reason.']), ('Protect information throughout the workflow', ['Practice with fictional applications. Before using real data, confirm the approved tool, permitted information, access, retention, and responsible reviewer.', 'Map approved input → AI draft → evidence check → human decision → record. Add pause points where information or decisions could be mishandled.', 'Remove information the task does not need. Deleting a name alone does not guarantee that an application cannot identify someone.']), ('Respond fairly to applicant AI use', ['A detector flag is not proof of misconduct, and its score is not the probability someone cheated. Errors vary by tool, language, population, and test conditions.', 'Publish rules in advance: allowed editing, translation, and brainstorming; when to disclose help; and prohibitions on invented experiences and false records.', 'Name the rule and evidence. Invite an explanation without assuming wrongdoing. Offer an accessible response route, human review, and an appeal.']), ('Choose one next step for the next 30 days', ['Mark capacities Ready to learn, In progress, or Ready to go. Pick one task, owner, date, evidence of progress, and stop condition.', 'Week 1: agree on checks. Week 2: test fictional cases. Weeks 3–4: review errors, omissions, disagreement, and checking time; adjust, stop, or seek approval.', 'Keep your prompt, workflow, and policy drafts. These are teaching tools, not official NSPA policy. Miguel Guhlin • October 21, 2026 • mguhlin.github.io/nspa/2026/'])]
NS={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
def q(n):return '{'+NS['w']+'}'+n
def text(p,s):
 ts=p.findall('.//w:t',NS)
 ts[0].text=s
 for t in ts[1:]:t.text=''
 return p
with ZipFile(SOURCE) as z:
 root=ET.fromstring(z.read('word/document.xml'));body=root.find('w:body',NS);original=list(body);ps=body.findall('w:p',NS)
 for el in list(body):
  if el.tag!=q('sectPr'):body.remove(el)
 def add(p):body.insert(len(body)-1,p)
 for page in range(2):
  spacer=deepcopy(ps[0])
  if page:
   pp=spacer.find('w:pPr',NS);ET.SubElement(pp,q('pageBreakBefore'))
  add(spacer)
  add(text(deepcopy(ps[1]),'Trust, Transparency, and AI'))
  add(text(deepcopy(ps[2]),'Session takeaways' if page==0 else 'Session takeaways continued'))
  gap=deepcopy(ps[3]); pp=gap.find('w:pPr',NS); ET.SubElement(pp,q('spacing'),{q('line'):'120',q('lineRule'):'exact'});add(gap)
  for heading,points in GROUPS[page*3:page*3+3]:
   p=text(deepcopy(ps[4]),heading);ET.SubElement(p.find('w:pPr',NS),q('keepNext'));add(p)
   for point in points:add(text(deepcopy(ps[5]),point))
   spacer=deepcopy(ps[8]); pp=spacer.find('w:pPr',NS); spacing=pp.find('w:spacing',NS)
   if spacing is not None:pp.remove(spacing)
   ET.SubElement(pp,q('spacing'),{q('line'):'120',q('lineRule'):'exact',q('after'):'0',q('before'):'0'});add(spacer)
 OUT.parent.mkdir(parents=True,exist_ok=True)
 with ZipFile(OUT,'w',ZIP_DEFLATED) as o:
  for item in z.infolist():o.writestr(item,ET.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True) if item.filename=='word/document.xml' else z.read(item.filename))
print(OUT)
