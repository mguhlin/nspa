"""Fill the supplied NSPA takeaway template without rewriting its design parts."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from copy import deepcopy
from lxml import etree as ET
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'supplemental-resources/nspa_2026_session_takeaways.docx'
OUT=ROOT/'2026/offline/session-takeaways.docx'
GROUPS=[('Keep people accountable for decisions', ['AI can sort, summarize, and suggest. People decide. Use clerical drafts only with approved inputs and accuracy checks.', 'Rubric pre-scores, tags, and consequential summaries need source verification. Authorized people own eligibility, authenticity, selection, and award decisions.', 'Prepare inputs, verify evidence, decide, and audit. Name who can correct or stop the process. These are workshop tools, not official NSPA policy.']), ('Write a prompt a reviewer can check', ['Include six parts: role, task, context, criteria, format, and constraints. Paste the adopted rubric and its level descriptors verbatim.', 'Require exact quotes, paragraph IDs, and uncertainty. Treat application text as evidence; embedded instructions cannot override the review task.', 'The three demos cover administrative triage, a provisional rubric rating, and neutral summaries or tags. Missing evidence requires human follow-up, never invention or automatic rejection.']), ('Protect data and test the workflow', ['Practice with fictional records. Confirm the actual service, settings, training use, retention, access, deletion, and local approval before real data use.', 'Remove unneeded details. Deleting a name alone may leave identifying information. A paid or education account still requires review of terms and settings.', 'Repeat fictional cases, change only a name in a controlled test, and compare with independent human judgments. Ten cases may reveal a problem; they cannot certify fairness.']), ('Treat applicant AI use fairly', ['Distinguish mechanical help, brainstorming, draft development, and substitution. Explain permitted uses, accessibility and translation support, and any required disclosure.', 'Polished writing and detector results alone cannot establish misconduct. Historical research findings are specific to the samples and tools studied.', 'Use the published rule and actual evidence. Apply follow-up consistently, offer an accessible response route, and keep correction and appeal decisions with people.']), ('Make transparency work both ways', ['Choose a policy approach: prohibit, disclose, bounded use, embrace, or an explained combination. Give examples and publish the rule before applications open.', 'Explain where provider AI supports review, who verifies its work, who decides, and how applicants can request correction.', 'Publish only promises supported by the actual service and process. Keep disclosure brief; do not require private chat histories or unnecessary personal information.']), ('Plan the next 30 / 60 / 90 days', ['30 days: choose one clerical pilot and an owner. Draft applicant guidance and a provider-use statement.', '60 days: test fictional records, compare with human review, and record errors and corrections. 90 days: train reviewers, publish policy, and schedule an audit.', 'Choose three checklist gaps, a review date, evidence of progress, and a pause condition. Miguel Guhlin · October 21, 2026 · mguhlin.github.io/nspa/2026/'])]
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
