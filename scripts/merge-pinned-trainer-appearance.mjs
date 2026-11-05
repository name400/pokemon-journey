import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import provenance from '../data/rogue-reviewed-asset-provenance.json' with {type:'json'};
const root=new URL('../',import.meta.url),commit=provenance.sourceCommit;
const mappings={MYSTERIOUS_SISTERS:['mysterious_sisters',null,'mysterious_sisters'],ALIANA:['aliana'],CELOSIA:['celosia'],MACRO_GRUNT:['macro_grunt_m','macro_grunt_f'],VICTOR:['victor'],VICTORIA:['victoria'],VIVI:['vivi'],VICKY:['vicky'],VITO:['vito'],EXPERT_POKEMON_BREEDER:['expert_pokemon_breeder'],PLAYER_M_ALTERNATE:['player_m_alternate'],PLAYER_F_ALTERNATE:['player_f_alternate'],BIRD_KEEPER:[null,'bird_keeper_f']};
export function mergePinnedTrainerAppearance(manifest){
 for(const [name,keys] of Object.entries(mappings)){
  const record=manifest.byEnumName[name];if(!record)throw Error('Missing source trainer '+name);
  for(const [i,key]of keys.entries()){
   if(!key)continue;const sourcePath=`images/trainer/${key}.png`,source=provenance.assets.find(r=>r.path===sourcePath);if(!source)throw Error('Unverified trainer '+key);
   const bytes=fs.readFileSync(new URL(source.localPath,root)),sha256=createHash('sha256').update(bytes).digest('hex');if(sha256!==source.sha256)throw Error('Asset hash mismatch '+key);
   const spriteKey='pokerogue-'+key,src='/'+source.localPath.slice('public/'.length),sourceUrl=`https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/${commit}/${sourcePath}`;
   manifest.assets[spriteKey]={spriteKey,localUrl:src,sourceUrl,sourceDirectory:`https://github.com/pagefaultgames/pokerogue-assets/tree/${commit}/images/trainer`,artist:source.attribution?.[0]?.['SPDX-FileCopyrightText']||null,sha256,bytes:bytes.length,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),sourceCommit:commit,sourcePath,license:source.attribution?.[0]?.['SPDX-License-Identifier']||null,verification:{method:'pinned-source-byte-hash',status:200,contentType:'image/png'}};
   const value={spriteKey,src,sourceUrl,matchRule:'pinned-source-getSpriteKey'},kind=['default','female','double'][i];record.variants[kind]=value;
   if(i===0)Object.assign(record,{status:'matched',spriteKey,src,sourceUrl,matchRule:value.matchRule,canonicalIdentity:key,reason:null});
  }
  record.variantLimitations=(record.variantLimitations||[]).filter(text=>!(record.variants.female&&text.startsWith('Female'))&&!(record.variants.double&&text.startsWith('Double')));
 }
 manifest.unmatched=Object.values(manifest.byEnumName).filter(r=>r.status!=='matched').map(({sourceType,enumName,category,reason})=>({sourceType,enumName,category,reason}));
 Object.assign(manifest.metadata.counts,{mapped:Object.keys(manifest.byEnumName).length-manifest.unmatched.length,unmatched:manifest.unmatched.length,localAssets:Object.keys(manifest.assets).length,pinnedOriginalAssets:Object.values(manifest.assets).filter(a=>a.sourceCommit===commit).length});
 manifest.metadata.pinnedOriginals={sourceCommit:commit,mapping:'Original TrainerConfig.getSpriteKey, with enum identities and explicit _m/_f suffixes. See rogue-reviewed-asset-provenance.json.',license:'Per-file source annotations only; unannotated PNGs are not assumed public domain.'};
 return manifest;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const file=new URL('data/rogue-trainer-appearance.json',root),manifest=mergePinnedTrainerAppearance(JSON.parse(fs.readFileSync(file)));fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');
}
