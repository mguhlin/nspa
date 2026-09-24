"""Add native clickable hotspots over the resource buttons on raster slides.

The slide artwork stays a single image; hyperlinks are ordinary PowerPoint
shape actions. Coordinates use the same slide map as the image renderer.
"""
import json, sys, zipfile
from pathlib import Path
from xml.etree import ElementTree as ET
P='http://schemas.openxmlformats.org/presentationml/2006/main'
A='http://schemas.openxmlformats.org/drawingml/2006/main'
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PKG='http://schemas.openxmlformats.org/package/2006/relationships'
for prefix,uri in [('p',P),('a',A),('r',R)]:ET.register_namespace(prefix,uri)
def sub(parent,ns,tag,attrs=None):return ET.SubElement(parent,f'{{{ns}}}{tag}',attrs or {})
def add_links(source,destination,map_path):
 slides=json.loads(Path(map_path).read_text())
 with zipfile.ZipFile(source) as z:files={n:z.read(n) for n in z.namelist()}
 count=0
 for n,data in enumerate(slides,1):
  name=f'ppt/slides/slide{n}.xml';relname=f'ppt/slides/_rels/slide{n}.xml.rels'
  tree=ET.fromstring(files[name]);rels=ET.fromstring(files[relname]);spTree=tree.find(f'.//{{{P}}}spTree')
  highest=max(int(e.get('id')) for e in tree.findall(f'.//{{{P}}}cNvPr'))
  for j,link in enumerate(data.get('links',[]),1):
   rid=f'rIdResource{j}';sub(rels,PKG,'Relationship',{'Id':rid,'Type':R+'/hyperlink','Target':link['url'],'TargetMode':'External'})
   shape=sub(spTree,P,'sp');nv=sub(shape,P,'nvSpPr')
   props=sub(nv,P,'cNvPr',{'id':str(highest+j),'name':link['label'],'descr':'Open '+link['url']})
   sub(props,A,'hlinkClick',{f'{{{R}}}id':rid,'tooltip':link['label']})
   sub(nv,P,'cNvSpPr');sub(nv,P,'nvPr')
   sp=sub(shape,P,'spPr');xf=sub(sp,A,'xfrm')
   sub(xf,A,'off',{'x':str(round(link['left']*7937.5)),'y':str(round(link['top']*7937.5))})
   sub(xf,A,'ext',{'cx':str(round(link['width']*7937.5)),'cy':str(round(link['height']*7937.5))})
   sub(sub(sp,A,'prstGeom',{'prst':'rect'}),A,'avLst')
   color=sub(sub(sp,A,'solidFill'),A,'srgbClr',{'val':'007681'});sub(color,A,'alpha',{'val':'0'})
   sub(sub(sp,A,'ln'),A,'noFill');count+=1
  files[name]=ET.tostring(tree,encoding='utf-8',xml_declaration=True)
  files[relname]=ET.tostring(rels,encoding='utf-8',xml_declaration=True)
 with zipfile.ZipFile(destination,'w',zipfile.ZIP_DEFLATED) as z:
  for name,blob in files.items():z.writestr(name,blob)
 print(f'Added {count} native resource hyperlinks')
if __name__=='__main__':add_links(*sys.argv[1:])
