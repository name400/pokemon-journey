import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureEvolutionPresentation} from '../lib/cloud-adventure/adventure-evolution-presentation.mjs';

test('evolution presentation requires an accepted event for the same owned individual',()=>{
 const before={world:{activeId:'one'},box:[{boxId:'one',id:1,name:'이상해씨',shiny:true,item:'keep'}]};
 const after={revision:8,world:{events:[{kind:'evolve'}]},box:[{boxId:'one',id:2,name:'이상해풀',shiny:true,item:'keep'}]};
 const result=adventureEvolutionPresentation(before,after,7);
 assert.deepEqual([result.before.id,result.after.id,result.after.shiny,result.after.item],[1,2,true,'keep']);
 assert.equal(before.box[0].id,1,'Presentation does not change the previous save');
 assert.equal(adventureEvolutionPresentation(before,after,8),null,'A stale revision is not replayed');
 assert.equal(adventureEvolutionPresentation(before,{...after,world:{events:[]}},7),null,'Reloads without a new event do not replay');
 assert.equal(adventureEvolutionPresentation(before,{...after,box:[{boxId:'other',id:2}]},7),null,'Another individual is never substituted');
 assert.equal(adventureEvolutionPresentation(before,{...after,box:[{boxId:'one',id:1}]},7),null,'No species change means no evolution presentation');
 assert.equal(adventureEvolutionPresentation(before,{...after,box:[]},7),null,'Missing patches are not guessed');
});

test('the evolution result retains both real names and waits for confirmation',async()=>{
 const {build}=await import('esbuild');
 const {mkdir}=await import('node:fs/promises');
 const React=(await import('react')).default;
 const {renderToStaticMarkup}=await import('react-dom/server');
 await mkdir('.sites-runtime/tests',{recursive:true});
 await build({entryPoints:['components/cloud-adventure/adventure-evolution-result.tsx'],outfile:'.sites-runtime/tests/adventure-evolution-result.mjs',bundle:true,format:'esm',platform:'node',alias:{'@':process.cwd()},external:['react','react/jsx-runtime'],loader:{'.css':'empty'}});
 const {default:Result}=await import('../.sites-runtime/tests/adventure-evolution-result.mjs');
 const html=renderToStaticMarkup(React.createElement(Result,{result:{before:{id:1,name:'이상해씨'},after:{id:2,name:'이상해풀'}},onClose(){}}));
 assert.match(html,/이상해씨/);assert.doesNotMatch(html,/진화했다/);assert.match(html,/>확인<\/button>/);assert.match(html,/연출 건너뛰기/);
});
