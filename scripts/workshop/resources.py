"""One navigation map for slides, speaker notes, transcript, and speaking guide."""
BASE='https://mguhlin.github.io/nspa/2026/'
RESOURCES={
 'hub':('Workshop materials',''),
 'conversation':('Conversation companion','conversation.html'),
 'trust':('Trust conversation','conversation.html#trust'),
 'tension':('Prepared draft and source','conversation.html#tension'),
 'case':('Shared case and rubric','conversation.html#case'),
 'reflection':('My reflection','conversation.html#reflection'),
 'checkpoints':('Workflow conversation','conversation.html#workflow'),
 'fair':('Fair-response conversation','conversation.html#fair'),
 'change':('My one-change plan','conversation.html#change'),
 'library':('Full resource library','../#library'),
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
BY_SLIDE={2:['trust','workbook'],3:['conversation'],4:['tension'],5:['case'],6:['case'],7:['reflection'],8:['checkpoints','workflow'],9:['checkpoints'],10:['fair','policyref'],11:['fair'],12:['change','hub'],13:['prompt'],14:['rubric','demo2'],15:['workflow'],16:['policyref','sources'],17:['hub','library'],18:['sources']}
def links_for_slide(n):
 return [dict(label=RESOURCES[k][0],url=BASE+RESOURCES[k][1],left=90+j*452,top=735,width=432,height=34) for j,k in enumerate(BY_SLIDE.get(n,[]))]
