// Produce the small runtime projection from the pinned, attributed extraction.
import fs from 'node:fs';
const input=JSON.parse(fs.readFileSync(new URL('../data/rogue-trainer-member-rules.json',import.meta.url),'utf8'));
const used=new Set(['setAbilityIndex','setGender','setFriendship','setBoss','setTeraType','ensureMove','replaceMove','setMove','generateMoveset','replaceMoveset']);
const markers=new Set(['setForm','switch']);
function compact(value){
 if(Array.isArray(value))return value.map(compact);
 if(!value||typeof value!=='object')return value;
 return Object.fromEntries(Object.entries(value).filter(([key])=>key!=='source').map(([key,item])=>[key,compact(item)]));
}
function projectOperations(operations){return (operations||[]).flatMap(operation=>{if(operation.op==='if')return [{op:'if',predicate:compact(operation.predicate),then:projectOperations(operation.then),else:projectOperations(operation.else)}];if(operation.op==='setForm')return [{op:'setForm',value:compact(operation.value)}];if(markers.has(operation.op))return [{op:operation.op}];return used.has(operation.op)?[compact(operation)]:[];});}
const trainers={};
for(const [id,trainer] of Object.entries(input.trainers)){
 const members=(trainer.members||[]).map(member=>({slot:member.slot,postProcess:{operations:projectOperations(member.postProcess?.operations)}}));
 if(members.length)trainers[id]={members};
}
const output={metadata:{sourceVersion:input.metadata.sourceVersion,upstreamCommit:input.metadata.upstreamCommit,generatedFrom:'data/rogue-trainer-member-rules.json',note:'Runtime projection only; full attribution and unsupported operations remain in the source file.'},trainers};
fs.writeFileSync(new URL('../data/rogue-trainer-effects.json',import.meta.url),JSON.stringify(output)+'\n');
