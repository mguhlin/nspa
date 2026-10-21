/** Author the editable prompting deck with Artifact Tool, then finalize privately. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'../..');
const runtime='/home/mg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
process.env.RUNTIME_NODE_MODULES=runtime;
const require=createRequire(path.join(runtime,'nspa-prompting-loader.cjs'));
const {Presentation,PresentationFile,FileBlob}=await import(pathToFileURL(require.resolve('@oai/artifact-tool')).href);
const SKILL='/home/mg/.codex/plugins/cache/openai-primary-runtime/presentations/26.1015.12040/skills/presentations';
const workspaceDir=process.env.NSPA_PROMPTING_BUILD||'/tmp/nspa-prompting-build';
const data=JSON.parse(await fs.readFile(path.join(root,'scripts/prompting/presentation-content.json'),'utf8'));
await fs.mkdir(path.join(workspaceDir,'renders'),{recursive:true});
await fs.mkdir(path.join(workspaceDir,'output'),{recursive:true});
const template=path.join(root,'supplemental-resources/2026_NSPA_PPT_Template.pptx');
const hasTemplate=await fs.access(template).then(()=>true,()=>false);
if(hasTemplate){
const reference=await PresentationFile.importPptx(await FileBlob.load(template));
for(let i=0;i<reference.slides.items.length;i++){
 const blob=await reference.export({slide:reference.slides.items[i],format:'png',scale:1});
 await fs.writeFile(path.join(workspaceDir,`template-${i+1}.png`),new Uint8Array(await blob.arrayBuffer()));
}
await fs.writeFile(path.join(workspaceDir,'template-inspection.ndjson'),(await reference.inspect({kind:'slide,textbox,shape,image,table,notes',maxChars:20000})).ndjson);
}
const pres=Presentation.create({slideSize:{width:1280,height:720}});
const colors={ink:'#2e4f66',teal:'#007681',aqua:'#e4f4f4',orange:'#ff7233'};
async function image(slide,file,x,y,w,h,alt){const b=await fs.readFile(file);slide.images.add({blob:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),contentType:'image/png',alt,fit:'contain',position:{left:x,top:y,width:w,height:h}});}
function text(slide,value,x,y,w,h,size=27,bold=false,color=colors.ink,name='Text'){
 const box=slide.shapes.add({geometry:'textbox',name,position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 box.text=value;box.text.style={typeface:'Poppins',fontSize:size,bold,color};
 return box;
}
const tableOwners=[];
for(const s of data.slides){
 const slide=pres.slides.add();const n=s.number;const cover=n===1;
 await image(slide,path.join(root,`2026/prompting/assets/${cover?'title':'content'}-background.png`),0,0,1280,720,'NSPA 2026 Continuity template background');
 text(slide,'NSPA 2026 · Scholarship review practice',64,cover?75:43,1100,30,18,true,colors.teal,'Session label');
 text(slide,s.title,64,cover?145:90,cover?930:1150,cover?155:100,cover?64:44,true,colors.ink,'Slide heading');
 let y=cover?325:190;
 text(slide,s.lead,64,y,1100,52,27,false);y+=65;
 if(s.table){
  tableOwners.push(n);const values=s.table;const rows=values.length;const maxChars=Math.max(...values.flat().map(t=>t.length));
  const rowHeight=n===24?96:n===8?65:rows>=6?54:maxChars>65?78:70;
  const height=Math.min(330,rows*rowHeight);
  const table=slide.tables.add({rows,columns:values[0].length,left:64,top:y,width:1152,height,values});
  table.styleOptions={headerRow:true,bandedRows:false};
  table.cells.block({row:0,column:0,rowCount:rows,columnCount:values[0].length}).assign({textStyle:{typeface:'Poppins',fontSize:n===24?25:24,color:colors.ink},margins:{left:14,right:14,top:9,bottom:9},anchor:'top'});
  for(let r=0;r<rows;r++){
   table.rows[r].height=height/rows;
   for(let c=0;c<values[0].length;c++){
    const cell=table.getCell(r,c);cell.fill=r===0?colors.teal:r%2===1?'#f0f8f8':'#ffffff';
    cell.text.style={typeface:'Poppins',fontSize:24,color:r===0?'#ffffff':colors.ink,bold:r===0};
   }
  }
  table.borders.assign({style:'solid',fill:'#b6d4d6',width:1});
  if(n===24){table.columns.get(0).width=210;table.columns.get(1).width=942;}
  else if(values[0].length===2){table.columns.get(0).width=n===19?200:240;table.columns.get(1).width=n===19?952:912;}
  else if(n===11){table.columns.get(0).width=310;table.columns.get(1).width=390;table.columns.get(2).width=452;}
  else {table.columns.get(0).width=210;table.columns.get(1).width=450;table.columns.get(2).width=492;}
  y+=height+18;
 }
 if(s.quote){
  const length=s.quote.length;const h=length>260?215:length>150?170:120;
  text(slide,s.quote,88,y,1080,h,30,false,colors.ink,'Source or prompt excerpt');y+=h+12;
 }
 if(s.items.length){
  const lineHeight=cover?48:49;
  for(const value of s.items){
   const width=n===26?820:1120;
   const lines=Math.max(1,Math.ceil(value.length/(width/14)));
   const h=lines*35+12;
   text(slide,value,64,y,width,h,cover?28:27,false,colors.ink,'Supporting text');y+=Math.max(lineHeight,h);
  }
 }
 if(n===26)await image(slide,path.join(root,'2026/images/nspa26-qr-code.png'),970,300,210,210,'QR code for NSPA workshop resource post');
 if(s.link){
  const href=new URL(s.link[0], 'https://mguhlin.github.io/nspa/2026/prompting/').href;
  const linkBox=text(slide,s.link[1],64,Math.min(Math.max(y+8,540),600),1120,38,23,true,colors.teal,'Resource link');
  linkBox.text=[[{run:s.link[1],link:{uri:href,isExternal:true},style:{typeface:'Poppins',fontSize:'23px',bold:true,color:colors.teal,underline:'sng'}}]];
  // Full, clickable URL in speaker notes and readable deck. PPTX keeps the prompt text editable.
  s.notes+='\n\nResource: '+href;
 }
 text(slide,cover?'01 / 26':`Miguel Guhlin     ${String(n).padStart(2,'0')} / 26`,cover?850:230,679,cover?300:500,27,16,false,cover?'#ffffff':colors.ink,'Footer');
 slide.speakerNotes.text=s.notes+'\n\n'+s.sources.map(k=>`Source: ${data.sources[k][0]}\n${data.sources[k][1]}`).join('\n\n');
 const png=await pres.export({slide,format:'png',scale:1});
 await fs.writeFile(path.join(workspaceDir,'renders',`${String(n).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
 console.log('Rendered slide',n);
}
const candidate=path.join(workspaceDir,'candidate.pptx');
await (await PresentationFile.exportPptx(pres)).save(candidate);
await fs.writeFile(path.join(workspaceDir,'inspection.ndjson'),(await pres.inspect({kind:'slide,textbox,table,image,notes',maxChars:300000})).ndjson);
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')).href);
const finalPath=path.join(workspaceDir,`output/ai-prompting-scholarship-review-${Date.now()}.pptx`);
const result=await finalizePresentation({workspaceDir,candidatePath:candidate,finalPath,pythonExecutable:'/home/mg/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python',integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit',...tableOwners.flatMap(n=>['--require-native-table-slide',String(n)])],requiredNativeTableOwnerSlides:tableOwners,fontPolicy:hasTemplate?{basis:'reference',families:['Poppins'],referencePath:template,referenceSha256:crypto.createHash('sha256').update(await fs.readFile(template)).digest('hex')}:{basis:'design',families:['Poppins']},verifyArtifactToolImport:true,receiptPath:path.join(workspaceDir,`validation-${Date.now()}.json`)});
console.log(JSON.stringify(result));
await fs.copyFile(finalPath,path.join(root,'2026/p/slides/ai-prompting-scholarship-review.pptx'));
