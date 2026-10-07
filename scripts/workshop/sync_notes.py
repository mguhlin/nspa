"""Update editable PowerPoint notes from the same source as the speaking guide."""
from copy import deepcopy
from io import BytesIO
from zipfile import ZipFile
from lxml import etree
from content import ROOT, SOURCES
from slides import SLIDES

path = ROOT / '2026/p/slides/nspa-trust-transparency-ai.pptx'
namespace = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
             'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}
with ZipFile(path) as source:
    parts = {info.filename: source.read(info.filename) for info in source.infolist()}
    metadata = source.infolist()
original_slides = {name: data for name, data in parts.items() if name.startswith('ppt/slides/')}
for number, slide in enumerate(SLIDES, 1):
    name = f'ppt/notesSlides/notesSlide{number}.xml'
    root = etree.fromstring(parts[name])
    body = root.xpath('.//p:sp[p:nvSpPr/p:nvPr/p:ph[@type="body"]]/p:txBody', namespaces=namespace)[0]
    template = deepcopy(body.find('a:p', namespace))
    for paragraph in body.findall('a:p', namespace):
        body.remove(paragraph)
    notes = slide['notes']
    if slide['sources']:
        notes += '\n\nSources:\n' + '\n'.join(' — '.join(SOURCES[i]) for i in slide['sources'])
    for line in notes.split('\n'):
        paragraph = deepcopy(template)
        runs = paragraph.findall('a:r', namespace)
        for run in runs[1:]:
            paragraph.remove(run)
        runs[0].find('a:t', namespace).text = line
        body.append(paragraph)
    parts[name] = etree.tostring(root, xml_declaration=True, encoding='UTF-8', standalone=True)
assert all(parts[name] == data for name, data in original_slides.items())
buffer = BytesIO()
with ZipFile(buffer, 'w') as target:
    for info in metadata:
        target.writestr(info, parts[info.filename])
path.write_bytes(buffer.getvalue())
print(f'Synchronized all {len(SLIDES)} PowerPoint speaker notes; slide content preserved.')
