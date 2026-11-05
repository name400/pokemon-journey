import fs from 'node:fs';
import {rogueSpecies} from '../lib/rogue-reference.mjs';
import {classicNativeForm} from '../lib/rogue-native-form.mjs';
import megas from '../data/rogue-reviewed-mega-atlases.json' with {type:'json'};
import transformations from '../data/rogue-reviewed-transformation-atlases.json' with {type:'json'};
const forms=[];
for(const species of rogueSpecies.values())for(const form of species.formList){
 if(!form.formIndex)continue;
 const matches=record=>record.sourceId===species.sourceId&&record.formIndex===form.formIndex&&record.formKey===form.formKey,mega=megas.find(matches),transformation=transformations.find(matches);
 forms.push({sourceId:species.sourceId,formIndex:form.formIndex,formKey:form.formKey,native:classicNativeForm(species,form)?.id||null,imageStatus:mega?'verified-local-mega':transformation?'verified-local-transformation':form.sourceImage?'existing-explicit-external-source':'numeric-or-native-fallback-unverified',atlas:mega?.atlas||transformation?.atlas||null});
}
const counts={};for(const form of forms)counts[form.imageStatus]=(counts[form.imageStatus]||0)+1;
const text=JSON.stringify({sourceCommit:'7c0881255af5cd51992e513ff93c2f71adbe40e0',scope:'Non-base source forms; image status is separate from game-mechanics support',counts,forms},null,2)+'\n',file=new URL('../data/rogue-form-artwork-audit.json',import.meta.url);
if(process.argv.includes('--check')){if(fs.readFileSync(file,'utf8')!==text)throw Error('Artwork inventory drift');}else fs.writeFileSync(file,text);
console.log(JSON.stringify(counts));
