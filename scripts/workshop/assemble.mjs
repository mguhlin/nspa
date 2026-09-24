import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
import {finalizePresentation} from '/home/mg/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root=process.env.NSPA_ROOT || '/home/mg/Documents/vibecoding/mguhlin/nspa';
const data=JSON.parse(await fs.readFile(root+'/docs/workshop-slide-map.json','utf8'));
const sources=[['NIST Gen AI Profile (2024)','https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf'],['Turnitin AI detection FAQ (reviewed September 24, 2026)','https://guides.turnitin.com/hc/en-us/articles/28477544839821-Turnitin-s-AI-writing-detection-capabilities-FAQs'],['Liang et al. (2023)','https://arxiv.org/abs/2304.02819'],['Al Ali, Helcl & Libovicky (2026)','https://arxiv.org/abs/2602.05769']];
const presentation=Presentation.create({slideSize:{width:1536,height:864}});
for(let i=0;i<data.length;i++){
 const s=presentation.slides.add();const id=String(i+1).padStart(2,'0');
 s.images.add({blob:new Uint8Array(await fs.readFile(root+'/2026/images/nspa-trust-transparency-ai/'+id+'.png')),contentType:'image/png',alt:data[i].title+' — '+data[i].subtitle+'. '+data[i].blocks.map(x=>x.join(': ')).join('; '),fit:'contain',position:{left:0,top:0,width:1536,height:864}});
 let notes=data[i].notes;
 if(data[i].sources.length)notes+='\n\nSources:\n'+data[i].sources.map(n=>sources[n].join(' — ')).join('\n');
 s.speakerNotes.textFrame.setText(notes);
}
const candidatePath='/tmp/nspa-workshop/build/candidate.pptx';
await(await PresentationFile.exportPptx(presentation)).save(candidatePath);
const skill='/home/mg/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations';
const result=await finalizePresentation({workspaceDir:'/tmp/nspa-workshop',candidatePath,finalPath:'/tmp/nspa-workshop/output/nspa-trust-transparency-ai-branded.pptx',pythonExecutable:'/home/mg/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','14630400,8229600','--validate-bullet-geometry','--validate-heading-fit'],explicitTotalSlideCount:26,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],verifyArtifactToolImport:true,receiptPath:'/tmp/nspa-workshop/build/validation-branded.json'});
console.log(JSON.stringify(result));
