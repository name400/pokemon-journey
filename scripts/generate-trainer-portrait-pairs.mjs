import fs from 'node:fs';
import world from '../data/rogue-world-reference.json' with {type:'json'};
import portraits from '../data/rogue-trainer-appearance.json' with {type:'json'};
import names from '../data/rogue-ui-names.json' with {type:'json'};
const pairs={};
for(const [id,config]of Object.entries(world.trainerConfigs)){
 const calls=config.sourceCalls,hasDouble=calls.some(c=>c.method==='setHasDouble'),doubleOnly=calls.some(c=>c.method==='setDoubleOnly');if(!hasDouble&&!doubleOnly)continue;
 const appearance=portraits.byEnumName[config.enumName],partnerId=calls.find(c=>c.method==='setDoubleTrainerType')?.args[0],partner=partnerId&&portraits.byEnumName[world.trainerConfigs[partnerId]?.enumName];
 pairs[id]={name:names.trainersByType[id]?.label||config.enumName,doubleOnly,partnerId:partnerId||null,partnerName:partnerId?names.trainersByType[partnerId]?.label||world.trainerConfigs[partnerId]?.enumName:null,partnerSrc:partner?.src||null,hasGenders:calls.some(c=>c.method==='setHasGenders'),femaleSrc:appearance?.variants?.female?.src||null};
}
const output=JSON.stringify({sourceCommit:world.metadata.upstreamCommit,semantics:'Source getSpriteKey(false,false) plus getSpriteKey(true,true), except doubleOnly already contains the pair. Existing saved explicit primary portrait remains unchanged.',pairs},null,2)+'\n',file='data/rogue-trainer-portrait-pairs.json';if(process.argv.includes('--check')){if(fs.readFileSync(file,'utf8')!==output)throw Error('Trainer portrait metadata drift');}else fs.writeFileSync(file,output);
