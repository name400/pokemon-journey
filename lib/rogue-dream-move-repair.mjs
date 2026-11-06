import {Dex} from '@pkmn/sim';
import {moves} from './game.mjs';
import {validatedClassicDnaFusion} from './rogue-dna-fusion.mjs';

// A later save no longer proves where the aliases came from. Only offer a
// user-confirmed repair, and only without a battle snapshot to synchronize.
export function classicMoveAliasPreview(run,boxId){
 if(!run||!['reward','advance','interlude','route'].includes(run.screen)||run.combat!=null||run.pendingCapture||run.pendingEvolution||run.pendingMoves?.length||run.pendingGrowth?.length||run.npcDialogueQueue?.length||!Array.isArray(run.party)||new Set(run.party.map(p=>p?.boxId)).size!==run.party.length)return null;
 const challenges=run.challenges??run.challengeRestrictions;if(challenges!=null&&(!Array.isArray(challenges)||challenges.some(c=>c?.id===11&&c.value)))return null;
 const prior=run.dreamMoveAliasBackups;if(prior!==undefined&&(!Array.isArray(prior)||prior.length>=6||prior.some(x=>!x||typeof x.boxId!=='string'||!Array.isArray(x.moves))))return null;
 const mon=run.party.find(p=>p?.boxId===boxId);if(!mon||typeof boxId!=='string'||!boxId||prior?.some(x=>x.boxId===boxId)||(mon.fusionSpecies||mon.rogueFusion||mon.rogueFusionRule)&&!validatedClassicDnaFusion(mon)||mon.rogueMovesetRandomizer||mon.rogueMovesetSeed||!Array.isArray(mon.moves)||mon.moves.length<2||mon.moves.length>4||mon.moves.some(name=>typeof name!=='string'||!name))return null;
 const resolved=mon.moves.map(name=>Dex.moves.get(moves[name]?.key||name));if(resolved.some(move=>!move.exists))return null;
 if(mon.rogueSketchRule||mon.rogueTrainerSketch||Object.hasOwn(mon,'rogueSketchPP')){
  if(mon.rogueSketchRule!=='source-v1'||mon.rogueTrainerSketch||mon.fusionSpecies||mon.rogueFusion||!Array.isArray(mon.rogueSketchPP)||mon.rogueSketchPP.length!==mon.moves.length||mon.rogueSketchPP.some(pp=>!Number.isSafeInteger(pp)||pp<0||pp>99))return null;
  const pairs=[];for(let i=0;i<resolved.length;i++)for(let j=i+1;j<resolved.length;j++)if(resolved[i].id===resolved[j].id){if(resolved[i].id==='sketch'||resolved[i].name!==resolved[j].name||mon.moves[i]===mon.moves[j])return null;pairs.push([i,j]);}
  if(pairs.length!==1)return null;return {kind:'sketch',moves:[...mon.moves],sketchPP:[...mon.rogueSketchPP],slots:pairs[0].map(index=>({index,name:mon.moves[index],pp:mon.rogueSketchPP[index]}))};
 }
 if(new Set(mon.moves).size!==mon.moves.length||resolved.some(move=>move.id==='sketch'))return null;
 const seen=new Map(),pairs=[];
 for(let i=0;i<resolved.length;i++){const move=resolved[i],previous=seen.get(move.id);if(previous){if(previous.name!==move.name||previous.paired)return null;previous.paired=true;pairs.push({keep:mon.moves[previous.index],remove:mon.moves[i]});}else seen.set(move.id,{name:move.name,index:i,paired:false});}
 return pairs.length?{moves:[...mon.moves],pairs}:null;
}

export function confirmClassicMoveAliasRepair(run,boxId,expectedMoves,{removeIndex,expectedSketchPP}={}){
 const preview=classicMoveAliasPreview(run,boxId);if(!preview||!Array.isArray(expectedMoves)||expectedMoves.length!==preview.moves.length||expectedMoves.some((m,i)=>m!==preview.moves[i]))throw Error('기술 목록이 변경되었습니다. 다시 확인하세요.');
 if(preview.kind==='sketch'&&(!preview.slots.some(s=>s.index===removeIndex)||!Array.isArray(expectedSketchPP)||expectedSketchPP.length!==preview.sketchPP.length||expectedSketchPP.some((pp,i)=>pp!==preview.sketchPP[i])))throw Error('기술과 PP를 다시 확인하세요.');
 const mon=run.party.find(p=>p.boxId===boxId),resolved=mon.moves.map(name=>Dex.moves.get(moves[name]?.key||name)),seen=new Set();
 const backup={boxId,moves:[...mon.moves],moveIds:resolved.map(move=>move.id),reason:'user-confirmed',...(mon.pp!==undefined?{pp:structuredClone(mon.pp)}:{}),...(mon.roguePPUps!==undefined?{roguePPUps:structuredClone(mon.roguePPUps)}:{}),...(preview.kind==='sketch'?{rogueSketchPP:[...mon.rogueSketchPP],removedIndex:removeIndex}:{})};
 if(preview.kind==='sketch'){mon.moves=mon.moves.filter((_,i)=>i!==removeIndex);mon.rogueSketchPP=mon.rogueSketchPP.filter((_,i)=>i!==removeIndex);}else mon.moves=mon.moves.filter((_,i)=>{const id=resolved[i].id;if(seen.has(id))return false;seen.add(id);return true;});run.dreamMoveAliasBackups=[...(run.dreamMoveAliasBackups||[]),backup];
}

// Only repair the immediately completed legacy Dream transformation. A battle,
// pending decision, Sketch slot, fusion or uncertain move spelling must wait.
// Original move names and PP metadata remain in this run as a recovery record.
export function repairClassicDreamMoveAliases(run){
 if(!run||run.screen!=='reward'||run.mystery?.type!=='weird-dream'||run.mystery?.stage!=='resolved'||run.mystery?.job!=='transform'||run.encounter?.kind!=='mystery'||run.encounter?.key!=='weird-dream'||run.combat!=null||run.dreamMoveIdentityRule!=null||run.pendingCapture||run.pendingEvolution||run.pendingMoves?.length||run.pendingGrowth?.length||!Array.isArray(run.party))return false;
 const challenges=run.challenges??run.challengeRestrictions;if(challenges!=null&&(!Array.isArray(challenges)||challenges.some(c=>c?.id===11&&c.value)))return false;
 const prior=run.dreamMoveAliasBackups;if(prior!==undefined&&(!Array.isArray(prior)||prior.length>6||prior.some(x=>!x||typeof x.boxId!=='string'||!Array.isArray(x.moves))))return false;
 const occupied=new Set((prior||[]).map(x=>x.boxId));if(new Set(run.party.map(p=>p?.boxId)).size!==run.party.length)return false;
 const changes=[];
 for(const [index,mon] of run.party.entries()){
  if(!mon||typeof mon.boxId!=='string'||!mon.boxId||occupied.has(mon.boxId)||mon.fusionSpecies||mon.rogueFusion||mon.rogueSketchRule||mon.rogueTrainerSketch||mon.rogueMovesetRandomizer||mon.rogueMovesetSeed||Object.hasOwn(mon,'rogueSketchPP')||!Array.isArray(mon.moves)||mon.moves.length<2||mon.moves.length>4||mon.moves.some(name=>typeof name!=='string'||!name)||new Set(mon.moves).size!==mon.moves.length)continue;
  const resolved=mon.moves.map(name=>Dex.moves.get(moves[name]?.key||name));if(resolved.some(move=>!move.exists||move.id==='sketch'))continue;
  const seen=new Map(),kept=[],ids=[];let ambiguous=false;
  for(let i=0;i<mon.moves.length;i++){const move=resolved[i],previous=seen.get(move.id);if(previous){if(previous.name!==move.name||previous.count!==1){ambiguous=true;break;}previous.count++;continue;}seen.set(move.id,{name:move.name,count:1});kept.push(mon.moves[i]);ids.push(move.id);}
  if(ambiguous||kept.length===mon.moves.length||kept.length<1)continue;
  changes.push({index,mon,moves:kept,backup:{boxId:mon.boxId,moves:[...mon.moves],moveIds:resolved.map(move=>move.id),...(mon.pp!==undefined?{pp:structuredClone(mon.pp)}:{}),...(mon.roguePPUps!==undefined?{roguePPUps:structuredClone(mon.roguePPUps)}:{})}});
 }
 if(!changes.length||(prior?.length||0)+changes.length>6)return false;
 run.party=run.party.map((mon,index)=>{const change=changes.find(c=>c.index===index);return change?{...mon,moves:change.moves}:mon;});
 run.dreamMoveAliasBackups=[...(prior||[]),...changes.map(c=>c.backup)];return true;
}
