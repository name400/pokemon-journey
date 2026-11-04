// Keep the client allowlist in sync with the pinned source metadata and native species.
import fs from 'node:fs';
import {rogueSpecies} from '../lib/rogue-reference.mjs';
import refs from '../data/rogue-reference.json' with {type:'json'};
import rules from '../data/rules.json' with {type:'json'};
const records={};
for(const [id,source] of Object.entries(refs.species)){
 if(!Array.isArray(source.forms))continue;
 const mon=rogueSpecies.get(Number(id)),native=rules.species[mon?.pokemonId]?.key,base=source.forms[0];
 if(!mon||!native)continue;
 // Additional-form species are admitted only for the verified unsuffixed base atlas.
 const baseForm=source.forms.length>0;if(baseForm&&(!source.genderDiffs||(base.formSpriteKey??base.formKey)!==''||mon.formList?.[0]?.pokemonId!==mon.pokemonId))continue;
 records[id]={id:mon.pokemonId,native,...(source.genderDiffs?{genderDiffs:true}:{}),...(baseForm?{baseForm:true}:{})};
}
const path=new URL('../data/rogue-fusion-palette-species.json',import.meta.url),output=JSON.stringify(records)+'\n';
if(process.argv.includes('--check')){if(fs.readFileSync(path,'utf8')!==output){console.error('Fusion palette species data is out of date');process.exitCode=1;}}else fs.writeFileSync(path,output);
