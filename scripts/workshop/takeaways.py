"""Fill the supplied NSPA takeaway template without rewriting its design parts."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from copy import deepcopy
from lxml import etree as ET
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'supplemental-resources/nspa_2026_session_takeaways.docx'
OUT=ROOT/'2026/handouts/session-takeaways.docx'
GROUPS=[('Keep people responsible for decisions', ['Use assistance for file naming and completeness checks. Check rubric evidence and consequential summaries carefully. Keep awards, exceptions, and appeals with people.', 'Follow the six-step path: receive, minimize, organize, map evidence, verify, and make a human decision.', 'Before the task, approve use and data. During it, verify quotes and correct errors. After it, record the evidence and human reasons. These are workshop examples, not official NSPA policy.']), ('Build a prompt that can be checked', ['Name one task, approved inputs, the actual rubric, boundaries, and an output format that shows evidence and uncertainty.', 'Require exact quotations and source pointers. Use only supplied evidence. Do not guess missing facts, infer personal traits, or recommend an award.', 'The three demos cover a document inventory, a provisional 2/3 tutoring example, and a reviewer handoff. Missing records require human follow-up. A draft rubric match is not a final score.']), ('Protect information and test for fairness', ['Minimize inputs to an application code, relevant excerpt, and source pointer. Removing a name alone does not guarantee anonymity.', 'Before upload, confirm tool and task approval, staff access, storage and reuse, and the incident response plan. Even minimized information needs an approved system.', 'Test varied fictional cases. Compare omissions and uneven treatment. Have reviewers discuss differences, correct the workflow, and retest before real use.']), ('Respond fairly to applicant AI use', ['Publish which assistance is allowed. Brainstorming, outlining, and proofreading differ from invented achievements, hardship, experiences, or references.', 'Assess actual contributions, supporting evidence, and reflection. Polished grammar and detector scores do not prove authorship or misconduct.', 'Pause automatic penalties. Check records and published rules. Invite clarification when appropriate. Document the human decision and how it can be reconsidered.']), ('Write clear rules for both sides', ['Applicant guidance should explain allowed AI help, truthful work, disclosure, and the review process before applications open.', 'Staff rules should name approved tools and tasks, the published rubric, source verification, and required documentation.', 'Illustrative wording: You may use AI to brainstorm or proofread. Claims must be truthful. Follow disclosure instructions. A detector score alone will not decide eligibility. Adapt the actual rule locally.']), ('Prepare for the next review cycle', ['Clarify applicant and staff rules. Pilot one limited task with fictional cases. Check errors before considering actual applicant information.', 'Name who verifies the work and who makes final decisions. Keep reasons and a reconsideration path. Review the pilot before continuing.', 'Choose one workflow, one human safeguard, and one policy statement. Add an owner, a review date, evidence of improvement, and a pause condition.'])]
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
  if not page:add(spacer)
  title=text(deepcopy(ps[1]),'Trust, Transparency, and AI')
  if page:ET.SubElement(title.find('w:pPr',NS),q('pageBreakBefore'))
  add(title)
  add(text(deepcopy(ps[2]),'Session takeaways' if page==0 else 'Session takeaways continued'))
  gap=deepcopy(ps[3]); pp=gap.find('w:pPr',NS); ET.SubElement(pp,q('spacing'),{q('line'):'120',q('lineRule'):'exact'});add(gap)
  for heading,points in GROUPS[page*3:page*3+3]:
   p=text(deepcopy(ps[4]),heading);ET.SubElement(p.find('w:pPr',NS),q('keepNext'));add(p)
   for point in points:add(text(deepcopy(ps[5]),point))
   spacer=deepcopy(ps[8]); pp=spacer.find('w:pPr',NS); spacing=pp.find('w:spacing',NS)
   if spacing is not None:pp.remove(spacing)
   ET.SubElement(pp,q('spacing'),{q('line'):'120',q('lineRule'):'exact',q('after'):'0',q('before'):'0'})
   if heading!=GROUPS[page*3+2][0]:add(spacer)
 # Keep attribution outside the numbered takeaways and their bullet lists.
 byline=deepcopy(ps[8]);pp=byline.find('w:pPr',NS)
 for tag in ['spacing','jc']:
  for element in pp.findall(q(tag)):pp.remove(element)
 ET.SubElement(pp,q('jc'),{q('val'):'center'})
 ET.SubElement(pp,q('spacing'),{q('before'):'120',q('after'):'0'})
 run=deepcopy(ps[5].find('w:r',NS));rp=run.find('w:rPr',NS)
 for tag in ['sz','szCs']:
  element=rp.find(q(tag))
  if element is not None:rp.remove(element)
  ET.SubElement(rp,q(tag),{q('val'):'20'})
 for t in run.findall('w:t',NS):t.text='Miguel Guhlin · October 21, 2026 · mguhlin.github.io/nspa/2026/'
 byline.append(run);add(byline)
 OUT.parent.mkdir(parents=True,exist_ok=True)
 with ZipFile(OUT,'w',ZIP_DEFLATED) as o:
  for item in z.infolist():o.writestr(item,ET.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True) if item.filename=='word/document.xml' else z.read(item.filename))
print(OUT)
