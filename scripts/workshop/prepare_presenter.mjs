/** Author notes with Artifact Tool, then transplant only note bodies.
 * Every non-notes package part stays byte-identical to the supplied deck.
 * Usage: node prepare_presenter.mjs source.pptx notes.json output.pptx scratch-dir
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const runtime = process.env.NSPA_RUNTIME_NODE_MODULES || '/home/mg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const require = createRequire(path.join(runtime, 'nspa-loader.cjs'));
const { FileBlob, PresentationFile } = await import(pathToFileURL(require.resolve('@oai/artifact-tool')).href);
const JSZip = require('jszip');
const { xml2js, js2xml } = require('xml-js');
const [sourcePath, notesPath, outputPath, scratch] = process.argv.slice(2);
if (!scratch) throw new Error('source, notes JSON, output, scratch directory required');
await fs.mkdir(scratch, { recursive: true });
const records = JSON.parse(await fs.readFile(notesPath, 'utf8'));
const presentation = await PresentationFile.importPptx(await FileBlob.load(sourcePath));
if (presentation.slides.items.length !== records.length) throw new Error('Slide count mismatch');
for (let i = 0; i < records.length; i++) presentation.slides.getItem(i).speakerNotes.text = records[i].notes;
const draft = path.join(scratch, 'artifact-notes.pptx');
await (await PresentationFile.exportPptx(presentation)).save(draft);
const original = await JSZip.loadAsync(await fs.readFile(sourcePath));
const authored = await JSZip.loadAsync(await fs.readFile(draft));
const array = value => !value ? [] : Array.isArray(value) ? value : [value];
function body(notes) {
  return array(notes['p:notes']['p:cSld']['p:spTree']['p:sp']).find(sp => sp['p:nvSpPr']?.['p:nvPr']?.['p:ph']?._attributes?.type === 'body');
}
for (const r of records) {
  const part = `ppt/notesSlides/notesSlide${r.number}.xml`;
  const before = xml2js(await original.file(part).async('string'), { compact: true });
  const after = xml2js(await authored.file(part).async('string'), { compact: true });
  const oldBody = body(before), newBody = body(after);
  if (!oldBody || !newBody) throw new Error(`Missing notes body on slide ${r.number}`);
  oldBody['p:txBody'] = newBody['p:txBody'];
  original.file(part, js2xml(before, { compact: true }));
}
await fs.writeFile(outputPath, await original.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
console.log(`Updated ${records.length} speaker-note bodies; all visual package parts retained.`);
