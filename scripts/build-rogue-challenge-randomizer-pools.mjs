// Extract factual implemented-entry flags from the user-pinned source checkout.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {Dex} from '@pkmn/sim';
const root=process.argv[2]||'/workspace/pokerogue-reference';
function enums(file){const source=ts.createSourceFile(file,fs.readFileSync(path.join(root,file),'utf8'),ts.ScriptTarget.Latest,true),out={};let next=0;for(const node of source.statements)if(ts.isEnumDeclaration(node))for(const member of node.members){if(member.initializer)next=Number(member.initializer.getText(source));if(!Number.isInteger(next))throw Error('Non-numeric enum');out[member.name.getText(source)]=next++;}return out;}
function entries(file,kind,enumName){const text=fs.readFileSync(path.join(root,file),'utf8'),source=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true),values=enums('src/enums/'+(kind==='moves'?'move-id':'ability-id')+'.ts'),out=[];function visit(node){if(ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)&&node.expression.name.text==='push'&&node.expression.expression.getText(source).includes(kind==='moves'?'allMoves':'allAbilities')){for(const argument of node.arguments){const code=argument.getText(source),name=new RegExp('new \\w+\\('+enumName+'\\.([A-Z0-9_]+)').exec(code)?.[1];if(!name)throw Error('Unrecognized source entry');out.push({id:values[name],name,implemented:!code.includes('.unimplemented(')});}}ts.forEachChild(node,visit);}visit(source);if(out.length<300)throw Error('Incomplete extraction');return out;}
const moves=entries('src/data/moves/move.ts','moves','MoveId'),abilities=entries('src/data/abilities/init-abilities.ts','abilities','AbilityId');
const noMoves=new Set(['NONE','SPLASH','HOLD_HANDS','STRUGGLE']),noAbilities=new Set(['NONE','COMMANDER','DISGUISE','FORECAST','GULP_MISSILE','HUNGER_SWITCH','ICE_FACE','MULTITYPE','POWER_CONSTRUCT','RKS_SYSTEM','SCHOOLING','SHIELDS_DOWN','STANCE_CHANGE','TERA_SHIFT','ZEN_MODE','ZERO_TO_HERO','DEFEATIST','KLUTZ','NORMALIZE','SLOW_START','STALL','TRUANT','WIMP_OUT']);
function pool(rows,denied,kind){return rows.filter(r=>r.implemented&&!denied.has(r.name)).map(({id,name})=>{const native=Dex[kind].get(name.toLowerCase().replaceAll('_',''));return {id,name,key:native.exists?native.id:null};});}
const data={sourceCommit:'7c0881255af5cd51992e513ff93c2f71adbe40e0',moves:pool(moves,noMoves,'moves'),abilities:pool(abilities,noAbilities,'abilities')};
fs.writeFileSync('data/rogue-challenge-randomizer-pools.json',JSON.stringify(data,null,2)+'\n');
for(const kind of ['moves','abilities'])console.log(kind,JSON.stringify({source:data[kind].length,native:data[kind].filter(r=>r.key).length,missing:data[kind].filter(r=>!r.key)}));
