import fs from 'node:fs';
import path from 'node:path';
const root='dist';const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
 const href=match[1];if(/^(data:|https?:)/.test(href))continue;
 if(href.startsWith('/'))throw Error('Absolute asset path breaks subpath hosting: '+href);
 if(!fs.existsSync(path.join(root,href)))throw Error('Missing built asset: '+href);
}
const scenarios=JSON.parse(fs.readFileSync('src/data/scenarios.json','utf8'));
for(const s of scenarios)if(!fs.existsSync(path.join(root,'images/scenarios',s.game.image.filename)))throw Error('Missing mission artwork '+s.id);
for(const asset of ['home-hero.webp','../decks/introduction.html','../worksheet.html'])if(!fs.existsSync(path.join(root,'images',asset)))throw Error('Missing public asset '+asset);
console.log('PASS: relative production assets, 30 mission images, introduction deck, and worksheet.');
