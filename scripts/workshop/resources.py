"""One navigation map for slides, speaker notes, transcript, and speaking guide."""
BASE='https://mguhlin.github.io/nspa/2026/'
RESOURCES={
 'hub':('Workshop materials',''),
 'workbook':('Practice workbook (PDF)','handouts/participant-workbook.pdf'),
 'matrix':('Capacity checklist','capacity-matrix.html'),
 'prompt':('Prompt practice lab','practice.html#prompt'),
 'packet':('Fictional application packet','practice.html#packet'),
 'demo1':('Demo 1: worked example','practice.html#demo-completeness'),
 'rubric':('Scoring practice lab','practice.html#rubric'),
 'demo2':('Demo 2: worked example','practice.html#demo-scoring'),
 'workflow':('Workflow reference (PDF)','handouts/protected-workflow.pdf'),
 'policy':('Policy practice lab','practice.html#policy'),
 'policyref':('Fair response reference (PDF)','handouts/fair-ai-policy.pdf'),
 'action':('My action plan','capacity-matrix.html#plan-title'),
 'sources':('Sources & context','#sources'),
}
BY_SLIDE={
 2:['workbook','hub'],3:['packet'],4:['matrix'],5:['prompt'],6:['prompt'],7:['prompt','workbook'],
 8:['packet'],9:['packet','demo1'],10:['demo1'],11:['packet','demo1'],12:['rubric'],13:['rubric','workbook'],
 14:['rubric','demo2'],15:['workflow'],16:['workflow','workbook'],17:['policyref','sources'],18:['sources'],
 19:['policy','policyref'],20:['policy','workbook'],21:['matrix'],22:['matrix','action'],23:['action'],
 24:['action','workbook'],25:['hub','matrix'],26:['sources']}
def links_for_slide(n):
 return [dict(label=RESOURCES[k][0],url=BASE+RESOURCES[k][1],left=90+j*452,top=735,width=432,height=34) for j,k in enumerate(BY_SLIDE.get(n,[]))]
