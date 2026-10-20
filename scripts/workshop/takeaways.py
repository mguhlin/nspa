"""Fill the supplied NSPA takeaway template without rewriting its design parts."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from copy import deepcopy
from lxml import etree as ET
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'supplemental-resources/nspa_2026_session_takeaways.docx'
OUT=ROOT/'2026/handouts/session-takeaways.docx'
GROUPS=[('Assign authority and human checks', ['Sort tasks into ASSIST, CHECK, or HUMAN. Organizing files can be assisted. Verify quotations and rubric matches. People decide awards, exceptions, and appeals.', 'For each task, name a safeguard and the person who can correct or stop the work. Follow receive, minimize, prepare, verify, and decide.', 'Before upload, satisfy both gates: approved use and only the information the task needs. Check tool, access, retention, reuse, and response plans.']), ('Write requests and audit the evidence', ['Name the task, source, evidence requirement, and limit. Use one excerpt and the actual published criterion and anchors. Ask for quotations, source locations, gaps, and a neutral question.', 'In fictional A17, paragraph 2 supports 12 tutoring sessions and two recruited volunteers. It does not establish 120 students served, improved grades, or an unsupported leadership trait.', 'The teaching rubric supports a provisional 2/3 for a specific contribution without result evidence. Keep the quotation, source pointer, and open question in the handoff.']), ('Calibrate with the same anchors', ['Score equivalent evidence with the same rubric. Both tutoring excerpts describe the same contribution and support 2/3 under the fictional teaching anchor.', 'Do not substitute vocabulary, polish, or prestige for evidence. A score of 3 in this example needs a specific contribution and a supported result.', 'One comparison does not prove fairness. Test varied fictional cases, compare unsupported claims and omissions, discuss judgments, correct, and retest.']), ('Publish applicant boundaries and fair responses', ['Decide rules for proofreading, translation, and drafting from truthful notes. Invented achievements conflict with truthful claims. Specify disclosure before applications open.', 'A detector can flag human writing or miss AI-generated text. A score alone cannot establish authorship, a policy violation, or eligibility.', 'Pause automatic penalties, check evidence and the published rule, invite clarification when appropriate, and record human reasons and the reconsideration route.']), ('Draft three usable policy sentences', ['Applicants: Name allowed help, responsibility for the statement and claims, and when and how to disclose. Make unresolved choices explicit.', 'Reviewers: Name the approved task and service, the person who verifies quotations and sources, and when that check occurs.', 'Concerns: Explain evidence review, clarification, and reconsideration. Specify a contact, review steps, and response timeline. Adapt workshop samples locally.']), ('Plan and review a four-week pilot', ['Week 1: scope one task and owner. Week 2: test fictional cases and log errors. Week 3: compare, correct, and retest. Week 4: decide to proceed, revise, or stop.', 'Set success criteria before testing. Confirm authorization for the service and data, verification ownership, retention, and policy readiness before any real use.', 'Write one task, one specific human check, an owner, and a date. Name the evidence needed to continue and an error that would pause the pilot.'])]
NS={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
def q(n):return '{'+NS['w']+'}'+n
def text(p,s):
 ts=p.findall('.//w:t',NS)
 ts[0].text=s
 for t in ts[1:]:t.text=''
 return p
with ZipFile(SOURCE if SOURCE.exists() else OUT) as z:
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
