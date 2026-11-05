// Keep the client allowlist in sync with the pinned source metadata and native species.
import fs from 'node:fs';
import {rogueSpecies} from '../lib/rogue-reference.mjs';
import {reviewedClassicDnaDonorForm} from '../lib/rogue-dna-fusion.mjs';
import refs from '../data/rogue-reference.json' with {type:'json'};
import rules from '../data/rules.json' with {type:'json'};
const records={},forms={};
for(const [id,source] of Object.entries(refs.species)){
 if(!Array.isArray(source.forms))continue;
 const mon=rogueSpecies.get(Number(id)),native=rules.species[mon?.pokemonId]?.key,base=source.forms[0];
 if(!mon||!native)continue;
 const formRows={};for(let index=1;index<source.forms.length;index++){const f=source.forms[index],id=mon.formList?.[index]?.pokemonId||mon.pokemonId;if(!reviewedClassicDnaDonorForm(Number(source.sourceId),index,f.formKey,id))continue;const sprite=f.formSpriteKey??f.formKey;if(typeof sprite!=='string'||!/^[a-z0-9-]*$/.test(sprite))continue;const parents=(mon.formChanges||[]).filter(c=>c.evoFormKey===f.formKey).map(c=>mon.formList.find(p=>p.formKey===(c.preFormKey||''))?.pokemonId),alternateIds=[...new Set([mon.pokemonId,...parents].filter(n=>n&&n!==id&&reviewedClassicDnaDonorForm(Number(source.sourceId),index,f.formKey,n)))];formRows[index]={id,key:f.formKey,atlas:`${source.sourceId}${sprite?`-${sprite}`:''}`,...(alternateIds.length?{alternateIds}:{})};}
 if(Object.keys(formRows).length){const base=source.forms[0],sprite=base.formSpriteKey??base.formKey;if(typeof sprite==='string'&&/^[a-z0-9-]*$/.test(sprite))formRows[0]={id:mon.pokemonId,key:base.formKey,atlas:`${source.sourceId}${sprite?`-${sprite}`:''}`};forms[id]=formRows;}
 // Additional-form species are admitted only for the verified unsuffixed base atlas.
 const baseForm=source.forms.length>0;if(baseForm&&(!source.genderDiffs||(base.formSpriteKey??base.formKey)!==''||mon.formList?.[0]?.pokemonId!==mon.pokemonId))continue;
 records[id]={id:mon.pokemonId,native,...(source.genderDiffs?{genderDiffs:true}:{}),...(baseForm?{baseForm:true}:{})};
}
for(const [filename,data] of [['rogue-fusion-palette-species.json',records],['rogue-fusion-palette-forms.json',forms]]){const path=new URL(`../data/${filename}`,import.meta.url),output=JSON.stringify(data)+'\n';if(process.argv.includes('--check')){if(fs.readFileSync(path,'utf8')!==output){console.error(`${filename} is out of date`);process.exitCode=1;}}else fs.writeFileSync(path,output);}
