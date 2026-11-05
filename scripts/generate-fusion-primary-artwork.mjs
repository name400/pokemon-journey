import fs from 'node:fs';
import records from '../data/rogue-reviewed-form-atlases.json' with {type:'json'};
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {applyClassicSourceForm} from '../lib/rogue-transformations.mjs';
import {previewClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
const allowed={},cases=[],blocked=[];
const imageMon=mon=>Object.fromEntries(['id','rogueSourceId','rogueFormIndex','rogueFormKey','rogueBattleSpecies','battleAppearance','gender','mega','primal','ultra','gigantamax','dynamaxed','eternamax'].filter(key=>mon[key]!==undefined).map(key=>[key,mon[key]]));
for(const r of records.filter(r=>r.native.length)){
 try{
  const primary=applyClassicSourceForm(makeReferenceMon(r.sourceId,50,{boxId:'primary',moves:['Tackle'],gender:r.genderDiffs?'F':undefined}),{tools:{},challenges:[]},r.formKey),donor=makeReferenceMon(151,50,{boxId:'donor',moves:['Tackle']}),{fused}=previewClassicDnaFusion(primary,donor,{random:()=>0});
  const key=`${r.sourceId}:${r.formIndex}`;allowed[key]={id:fused.id,key:r.formKey,native:fused.rogueBattleSpecies};cases.push({key,atlas:r.genderDiffs?r.femaleAtlas:r.atlas,mon:{...imageMon(fused),rogueFusionRule:fused.rogueFusionRule,fusionSpecies:fused.fusionSpecies,rogueFusion:{donor:imageMon(fused.rogueFusion.donor)}}});
 }catch(error){if(error.message!=='Unsupported DNA fusion preview')throw error;blocked.push(`${r.sourceId}:${r.formIndex}`);}
}
const outputs=[['data/rogue-fusion-primary-artwork.json',{method:'Image permissions from actual applyClassicSourceForm -> previewClassicDnaFusion; does not grant gameplay permissions',allowed,blocked}],['tests/browser/reviewed-assets/primary-fusion-cases.json',cases]];
for(const [file,value] of outputs){const text=JSON.stringify(value,null,2)+'\n';if(process.argv.includes('--check')){if(fs.readFileSync(file,'utf8')!==text)throw Error(file+' is out of date');}else fs.writeFileSync(file,text);}
console.log(JSON.stringify({allowed:cases.length,blocked:blocked.length}));
