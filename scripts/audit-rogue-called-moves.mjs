// Read-only comparison of the pinned source move registry and native call pool.
// Registry/banlist facts: AGPL-3.0-only, Pagefault Games and contributors.
// Usage: node scripts/audit-rogue-called-moves.mjs /path/to/pokerogue [report.json] [policy.json]
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import ts from 'typescript';
import {Dex} from '@pkmn/sim';
import {rogueReferenceData} from '../lib/rogue-reference.mjs';
import {classicMoveBalance,classicMoveBalanceV2,classicMoveFlags} from '../lib/rogue-move-balance.mjs';

const root=process.argv[2];
if(!root)throw Error('Pass the pinned PokéRogue source checkout path.');
const sourceCommit=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(sourceCommit!=='7c0881255af5cd51992e513ff93c2f71adbe40e0')throw Error('Unexpected source revision: review the registry audit before using a new revision.');
execFileSync('git',['-C',root,'diff','--quiet','HEAD','--','src/data/moves/move.ts','src/data/moves/invalid-moves.ts']);
const sourceFile=path.join(root,'src/data/moves/move.ts'),banFile=path.join(root,'src/data/moves/invalid-moves.ts');
const source=ts.createSourceFile(sourceFile,fs.readFileSync(sourceFile,'utf8'),ts.ScriptTarget.Latest,true),registered=new Map();
function registryWalk(node){
 if(ts.isNewExpression(node)&&node.arguments?.[0]&&ts.isPropertyAccessExpression(node.arguments[0])&&node.arguments[0].expression.getText(source)==='MoveId'){
  let chain=node;
  while(chain.parent&&(ts.isPropertyAccessExpression(chain.parent)&&chain.parent.expression===chain||ts.isCallExpression(chain.parent)&&chain.parent.expression===chain))chain=chain.parent;
  const text=chain.getText(source);
  registered.set(node.arguments[0].name.text,{unimplemented:/\.unimplemented\s*\(/.test(text),partial:/\.partial\s*\(/.test(text)});
 }
 ts.forEachChild(node,registryWalk);
}
registryWalk(source);
const banSource=ts.createSourceFile(banFile,fs.readFileSync(banFile,'utf8'),ts.ScriptTarget.Latest,true),variables=new Map();
function variablesWalk(node){if(ts.isVariableDeclaration(node)&&node.initializer)variables.set(node.name.getText(banSource),node.initializer);ts.forEachChild(node,variablesWalk);}
variablesWalk(banSource);
function refs(node){
 const names=[];
 function visit(child){
  if(ts.isPropertyAccessExpression(child)&&child.expression.getText(banSource)==='MoveId')names.push(child.name.text);
  else if(ts.isSpreadElement(child)&&ts.isIdentifier(child.expression))names.push(...refs(variables.get(child.expression.text)));
  else ts.forEachChild(child,visit);
 }
 if(node)visit(node);return names;
}
const banned=new Set(refs(variables.get('invalidMetronomeMoves')));
if(banned.size!==43)throw Error('Unexpected source Metronome banlist: review parser/source revision before using this audit.');
function nativeKey(name){return name.replace(/__(PHYSICAL|SPECIAL)$/,'').toLowerCase().replaceAll('_','').replace('tenmillionvoltthunderbolt','10000000voltthunderbolt');}
const moves=Object.entries(rogueReferenceData.enums.MoveId).filter(([,id])=>typeof id==='number'&&id>0).map(([name,id])=>{
 const key=nativeKey(name),native=Dex.moves.get(key),registration=registered.get(name);
 return {name,id,key,registered:!!registration,...registration,nativeExists:native.exists,nativeNum:native.num,nonstandard:native.isNonstandard||null,sourceMetronomeAllowed:!!registration&&!registration.unimplemented&&!banned.has(name),nativeMetronomeAllowed:!!native.flags.metronome&&(!native.isNonstandard||native.isNonstandard==='Unobtainable')};
});
if(moves.some(move=>!move.registered))throw Error('Source enum/registry mismatch: audit incomplete.');
const sourcePool=moves.filter(move=>move.sourceMetronomeAllowed),nativePool=Dex.moves.all().filter(move=>(!move.isNonstandard||move.isNonstandard==='Unobtainable')&&move.flags.metronome);
const sourceIds=new Set(sourcePool.map(move=>move.key)),nativeIds=new Set(nativePool.map(move=>move.id));
const sourceOnly=sourcePool.filter(move=>!nativeIds.has(move.key)),nativeOnly=nativePool.filter(move=>!sourceIds.has(move.id)).map(move=>({id:move.id,num:move.num}));
const counts={source:moves.length,nativeAvailable:moves.filter(move=>move.nativeExists).length,uniqueNative:new Set(moves.map(move=>move.key)).size,nameAliases:moves.filter(move=>move.name.toLowerCase().replaceAll('_','')!==move.key).length,numMismatches:moves.filter(move=>move.id!==move.nativeNum).length,nonstandard:moves.filter(move=>move.nonstandard).length,unimplemented:moves.filter(move=>move.unimplemented).length,partial:moves.filter(move=>move.partial).length,metronomeBanned:banned.size,sourceMetronomePool:sourcePool.length,nativeMetronomePool:nativePool.length,sourceOnly:sourceOnly.length,nativeOnly:nativeOnly.length,balanceV1:Object.keys(classicMoveBalance).length,balanceV2:Object.keys(classicMoveBalanceV2).length,flagOverrides:Object.keys(classicMoveFlags).length,overrideUnion:new Set([...Object.keys(classicMoveBalanceV2),...Object.keys(classicMoveFlags)]).size};
const result={sourceCommit,method:'AST registry/banlist facts and enum/native availability, without challenge filtering or source/native PRNG equivalence. Effects and active game acquisition are not inferred.',counts,sourceOnly,nativeOnly,moves};
if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(result,null,2)+'\n');
if(process.argv[4]){
 if(counts.source!==920||counts.unimplemented!==86||counts.sourceMetronomePool!==794||sourcePool.some(move=>!move.nativeExists)||sourceIds.size!==sourcePool.length)throw Error('Unexpected source call policy: review before exporting runtime facts.');
 const callers={};
 for(const [id,name,flag,inverted=false]of [['copycat','Copycat','failcopycat'],['sleeptalk','SleepTalk','nosleeptalk'],['assist','Assist','noassist'],['mirrormove','MirrorMove','mirror',true],['instruct','Instruct','failinstruct']]){
  const denied=new Set(refs(variables.get(`invalid${name}Moves`))),eligible=moves.filter(move=>!move.unimplemented&&!denied.has(move.name));
  if(!denied.size)throw Error(`Missing ${name} source banlist.`);
  callers[id]={banned:[...denied],nativeFlagExceptions:eligible.filter(move=>inverted?!Dex.moves.get(move.key).flags[flag]:Dex.moves.get(move.key).flags[flag]).map(move=>move.key),chargeExceptions:['sleeptalk','instruct'].includes(id)?eligible.filter(move=>Dex.moves.get(move.key).flags.charge).map(move=>move.key):[]};
 }
 const policy={sourceCommit,sourcePath:'src/data/moves/move.ts; src/data/moves/invalid-moves.ts',license:'AGPL-3.0-only; Pagefault Games and contributors',rule:'source-pool-v1',sourceMoveCount:counts.source,unimplemented:moves.filter(move=>move.unimplemented).map(move=>move.name),metronomeBanned:[...banned],metronomeMoves:[...sourcePool].sort((a,b)=>a.id-b.id).map(move=>move.key),callers};
 fs.writeFileSync(process.argv[4],JSON.stringify(policy,null,2)+'\n');
}
console.log(JSON.stringify(counts,null,2));
