/** Static AST facts only. Never import/eval/transpile/call upstream functions. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import ts from 'typescript';

const project=fileURLToPath(new URL('../',import.meta.url));
const sha='29441f7aa7482d9e816b253d324293788936dc3e';
const referenceArg=process.argv.indexOf('--reference');
const reference=path.resolve(referenceArg<0?path.join(project,'work/pokerogue-reference'):process.argv[referenceArg+1]);
if(execFileSync('git',['-C',reference,'rev-parse','HEAD'],{encoding:'utf8'}).trim()!==sha)throw Error('Wrong pinned source commit');
const output=path.join(project,'data/rogue-trainer-member-rules.json');
const world=JSON.parse(fs.readFileSync(path.join(project,'data/rogue-world-reference.json')));
if(world.metadata.upstreamCommit!==sha)throw Error('World facts do not match source commit');
const sourcePath='src/data/trainers/trainer-config.ts';
const text=fs.readFileSync(path.join(reference,sourcePath),'utf8');
const sf=ts.createSourceFile(sourcePath,text,ts.ScriptTarget.Latest,true);
if(sf.parseDiagnostics.length)throw Error('Trainer source parse errors');
const enums=world.enums, symbols={},unknowns=[],deferred=[],opcodeCounts={},predicateCounts={};
const constants=new Map(),externalDeclarations={},ruleDeclarations=new Map(),helperMethods={};
const unwrap=input=>{let n=input;while(n&&(ts.isParenthesizedExpression(n)||ts.isAsExpression(n)||ts.isNonNullExpression(n)||ts.isTypeAssertionExpression(n)))n=n.expression;return n;};
const loc=n=>{const doc=n.getSourceFile();return {file:doc.fileName,line:doc.getLineAndCharacterOfPosition(n.getStart(doc)).line+1,endLine:doc.getLineAndCharacterOfPosition(n.end).line+1};};
const callLoc=n=>({...loc(n.expression.name),endLine:loc(n).endLine});
const bump=(map,key)=>{map[key]=(map[key]||0)+1;};
const nameOf=n=>{n=unwrap(n);if(ts.isIdentifier(n))return n.text;if(ts.isPropertyAccessExpression(n))return nameOf(n.expression)+'.'+n.name.text;return ts.SyntaxKind[n.kind];};
for(const s of sf.statements)if(ts.isVariableStatement(s))for(const d of s.declarationList.declarations)if(ts.isIdentifier(d.name)&&d.initializer){const n=unwrap(d.initializer);if(ts.isNumericLiteral(n)||ts.isStringLiteralLike(n))constants.set(d.name.text,ts.isNumericLiteral(n)?Number(n.text):n.text);}
for(const s of sf.statements)if(ts.isClassDeclaration(s)&&s.name?.text==='TrainerConfig')for(const m of s.members)if(ts.isMethodDeclaration(m)&&ts.isIdentifier(m.name))helperMethods[m.name.text]=loc(m);
// Imported rival pool identifiers are linked to declarations, not expanded or run.
const rivalPath='src/data/trainers/rival-party-config.ts';
const rivalText=fs.readFileSync(path.join(reference,rivalPath),'utf8');
const rivalSf=ts.createSourceFile(rivalPath,rivalText,ts.ScriptTarget.Latest,true);
const rivalDeclarations=new Map();
for(const s of rivalSf.statements){
 if(ts.isVariableStatement(s))for(const d of s.declarationList.declarations)if(ts.isIdentifier(d.name)){
  rivalDeclarations.set(d.name.text,d);externalDeclarations[d.name.text]=loc(d);
  const n=unwrap(d.initializer);if(n&&(ts.isNumericLiteral(n)||ts.isStringLiteralLike(n)))constants.set(d.name.text,ts.isNumericLiteral(n)?Number(n.text):n.text);
 }
 if(ts.isFunctionDeclaration(s)&&s.name&&s.body)ruleDeclarations.set(s.name.text,s);
}
function unknown(n,reason,extra={}){const marker={type:'unresolved',syntax:ts.SyntaxKind[n.kind],reason,source:loc(n),...extra};unknowns.push(marker);return marker;}
function propertyPath(n){n=unwrap(n);if(ts.isIdentifier(n))return [n.text];if(ts.isPropertyAccessExpression(n)){const p=propertyPath(n.expression);return p&&[...p,n.name.text];}return null;}
function value(input,context={pokemon:'p'}){
 const n=unwrap(input);if(!n)return {type:'undefined'};
 if(ts.isNumericLiteral(n))return Number(n.text);if(ts.isStringLiteralLike(n))return n.text;
 if(n.kind===ts.SyntaxKind.TrueKeyword)return true;if(n.kind===ts.SyntaxKind.FalseKeyword)return false;if(n.kind===ts.SyntaxKind.NullKeyword)return null;
 if(ts.isIdentifier(n)){
  if(n.text==='undefined')return {type:'undefined'};
  if(n.text===context.pokemon)return {type:'pokemonReference'};
  if(context.parameters?.has(n.text))return {type:'parameter',name:n.text};
  if(context.locals?.has(n.text))return {type:'local',name:n.text};
  if(constants.has(n.text))return constants.get(n.text);
  if(ruleDeclarations.has(n.text))return {type:'ruleReference',name:n.text,definition:loc(ruleDeclarations.get(n.text))};
  if(externalDeclarations[n.text])return {type:'externalReference',name:n.text,declaration:externalDeclarations[n.text],requiresRuntime:true};
  return unknown(n,'Identifier has no literal binding',{name:n.text});
 }
 if(ts.isPrefixUnaryExpression(n)){
  const v=value(n.operand,context);
  if(n.operator===ts.SyntaxKind.MinusToken&&typeof v==='number')return -v;
  if(n.operator===ts.SyntaxKind.ExclamationToken)return {type:'predicateValue',predicate:predicate(n,context)};
  return unknown(n,'Computation is not evaluated',{operator:ts.tokenToString(n.operator)});
 }
 if(ts.isPropertyAccessExpression(n)){
  if(ts.isIdentifier(n.expression)&&Object.hasOwn(enums,n.expression.text)&&Object.hasOwn(enums[n.expression.text],n.name.text)){
   const key=n.expression.text+'.'+n.name.text;symbols[key]=enums[n.expression.text][n.name.text];return symbols[key];
  }
  const p=propertyPath(n);
  if(p?.[0]===context.pokemon)return {type:'field',scope:'pokemon',path:p.slice(1)};
  if(p?.[0]===context.move)return {type:'field',scope:'move',path:p.slice(1)};
  if(p?.join('.').startsWith('globalScene.currentBattle.'))return {type:'field',scope:'battle',path:p.slice(2)};
  return unknown(n,'Runtime property is not evaluated',{reference:nameOf(n)});
 }
 if(ts.isArrayLiteralExpression(n))return n.elements.map(e=>ts.isSpreadElement(e)?unknown(e,'Array spread is not expanded'):value(e,context));
 if(ts.isConditionalExpression(n))return {type:'conditional',predicate:predicate(n.condition,context),then:value(n.whenTrue,context),else:value(n.whenFalse,context),source:loc(n)};
 if(ts.isNewExpression(n)&&nameOf(n.expression)==='PokemonMove')return {type:'pokemonMove',moveId:value(n.arguments?.[0],context),extraArguments:(n.arguments||[]).slice(1).map(a=>value(a,context)),source:loc(n)};
 if(ts.isCallExpression(n)&&['randSeedItem','randSeedInt','randSeedIntRange'].includes(nameOf(n.expression))){
  const expression={type:'seededCall',helper:nameOf(n.expression),arguments:n.arguments.map(a=>value(a,context)),requiresRuntime:true,source:loc(n)};deferred.push(expression);return expression;
 }
 if(ts.isArrowFunction(n)||ts.isFunctionExpression(n)){
  const move=ts.isIdentifier(n.parameters[0]?.name)?n.parameters[0].name.text:'m';
  if(!ts.isBlock(n.body))return {type:'movePredicate',predicate:predicate(n.body,{...context,move}),source:loc(n)};
  return unknown(n,'Block predicate function is not interpreted');
 }
 if(ts.isBinaryExpression(n))return unknown(n,'Calculation is preserved but not evaluated',{operator:ts.tokenToString(n.operatorToken.kind),left:value(n.left,context),right:value(n.right,context)});
 return unknown(n,'Expression kind not normalized',{reference:ts.isCallExpression(n)?nameOf(n.expression):undefined});
}
function predicate(input,context){
 const n=unwrap(input);
 if(ts.isBinaryExpression(n)){
  const names=new Map([[ts.SyntaxKind.EqualsEqualsEqualsToken,'eq'],[ts.SyntaxKind.EqualsEqualsToken,'eqLoose'],[ts.SyntaxKind.ExclamationEqualsEqualsToken,'ne'],[ts.SyntaxKind.ExclamationEqualsToken,'neLoose'],[ts.SyntaxKind.GreaterThanToken,'gt'],[ts.SyntaxKind.GreaterThanEqualsToken,'gte'],[ts.SyntaxKind.LessThanToken,'lt'],[ts.SyntaxKind.LessThanEqualsToken,'lte'],[ts.SyntaxKind.AmpersandAmpersandToken,'and'],[ts.SyntaxKind.BarBarToken,'or']]);
  const op=names.get(n.operatorToken.kind);
  if(op){bump(predicateCounts,op);return ['and','or'].includes(op)?{op,left:predicate(n.left,context),right:predicate(n.right,context),source:loc(n)}:{op,left:value(n.left,context),right:value(n.right,context),source:loc(n)};}
 }
 if(ts.isPrefixUnaryExpression(n)&&n.operator===ts.SyntaxKind.ExclamationToken){bump(predicateCounts,'not');return {op:'not',predicate:predicate(n.operand,context),source:loc(n)};}
 if(n.kind===ts.SyntaxKind.TrueKeyword||n.kind===ts.SyntaxKind.FalseKeyword)return {op:'literal',value:n.kind===ts.SyntaxKind.TrueKeyword,source:loc(n)};
 if(ts.isIdentifier(n)&&(context.parameters?.has(n.text)||context.locals?.has(n.text))){bump(predicateCounts,'truthy');return {op:'truthy',value:value(n,context),source:loc(n)};}
 return unknown(n,'Predicate is not a supported literal comparison');
}
const assignments={abilityIndex:'setAbilityIndex',formIndex:'setForm',teraType:'setTeraType',level:'setLevel',bossSegments:'setBossSegments',bossSegmentIndex:'setBossSegmentIndex',gender:'setGender',pokeball:'setPokeball',friendship:'setFriendship',shiny:'setShiny',variant:'setShinyVariant'};
const methods={setAbilityIndex:'setAbilityIndex',setForm:'setForm',setBoss:'setBoss',generateAndPopulateMoveset:'generateMoveset',generateName:'refreshName',addIfNotInMoveset:'ensureMove',replaceInMoveset:'replaceMove'};
function opcode(op,n,args){bump(opcodeCounts,op);return {op,...args,source:loc(n)};}
function expressionStatement(input,context){
 const n=unwrap(input);
 if(ts.isCallExpression(n)&&ts.isIdentifier(n.expression)&&ruleDeclarations.has(n.expression.text))return opcode('callRule',n,{rule:n.expression.text,arguments:n.arguments.map(a=>value(a,context)),definition:loc(ruleDeclarations.get(n.expression.text))});
 if(ts.isBinaryExpression(n)&&n.operatorToken.kind===ts.SyntaxKind.EqualsToken){
  const p=propertyPath(n.left),v=value(n.right,context);
  if(p?.[0]===context.pokemon&&p.length===2){
   if(p[1]==='moveset')return opcode('replaceMoveset',n,{moves:v});
   if(assignments[p[1]])return opcode(assignments[p[1]],n,{value:v});
  }
  if(ts.isElementAccessExpression(n.left)&&nameOf(n.left.expression)===context.pokemon+'.moveset')return opcode('setMove',n,{index:value(n.left.argumentExpression,context),move:v});
  return opcode('unresolved',n,{detail:unknown(n,'Assignment target is not normalized')});
 }
 if(ts.isCallExpression(n)&&ts.isPropertyAccessExpression(n.expression)&&ts.isIdentifier(n.expression.expression)&&n.expression.expression.text===context.pokemon){
  const op=methods[n.expression.name.text],args=n.arguments.map(a=>value(a,context));
  if(!op)return opcode('unresolved',n,{detail:unknown(n,'Pokemon method is not normalized',{method:n.expression.name.text})});
  if(op==='setBoss')return opcode(op,n,{enabled:args[0]??true,segments:args[1]??{type:'unspecifiedDefault'}});
  if(op==='ensureMove')return opcode(op,n,{moveId:args[0],preferredSlot:args[1],acceptableAlternative:args[2]??null});
  if(op==='replaceMove')return opcode(op,n,{targetMoveId:args[0],replacementMoveId:args[1]});
  if(['setAbilityIndex','setForm'].includes(op))return opcode(op,n,{value:args[0]});
  return opcode(op,n,{arguments:args});
 }
 return opcode('unresolved',n,{detail:unknown(n,'Statement expression is not normalized')});
}
function body(node,context){
 if(ts.isBlock(node))return node.statements.flatMap(s=>statement(s,context));
 return [expressionStatement(node,context)];
}
function statement(n,context){
 if(ts.isBlock(n))return body(n,context);
 if(ts.isExpressionStatement(n))return [expressionStatement(n.expression,context)];
 if(ts.isIfStatement(n))return [opcode('if',n,{predicate:predicate(n.expression,context),then:statement(n.thenStatement,context),else:n.elseStatement?statement(n.elseStatement,context):[]})];
 if(ts.isSwitchStatement(n))return [opcode('switch',n,{value:value(n.expression,context),cases:n.caseBlock.clauses.map((c,i)=>({
  match:ts.isCaseClause(c)?value(c.expression,context):{type:'default'},body:c.statements.flatMap(s=>statement(s,context)),
  breaks:terminal(c.statements.at(-1))==='break',returns:terminal(c.statements.at(-1))==='return',
  fallthrough:!terminal(c.statements.at(-1))&&i<n.caseBlock.clauses.length-1,source:loc(c)}))})];
 if(ts.isBreakStatement(n))return [opcode('break',n,{})];
 if(ts.isReturnStatement(n))return [opcode('return',n,{value:n.expression?value(n.expression,context):{type:'undefined'}})];
 if(ts.isVariableStatement(n))return [...n.declarationList.declarations].map(d=>{
  if(!ts.isIdentifier(d.name))return opcode('unresolved',d,{detail:unknown(d,'Destructured local is not normalized')});
  const v=d.initializer?value(d.initializer,context):{type:'undefined'};(context.locals||=new Set()).add(d.name.text);
  return opcode('let',d,{name:d.name.text,value:v});
 });
 return [opcode('unresolved',n,{detail:unknown(n,'Statement kind is not normalized')})];
}
function terminal(n){if(!n)return null;if(ts.isBlock(n))return terminal(n.statements.at(-1));if(ts.isBreakStatement(n))return 'break';if(ts.isReturnStatement(n))return 'return';return null;}
function methodChain(n){n=unwrap(n);const list=[];while(ts.isCallExpression(n)&&ts.isPropertyAccessExpression(n.expression)){list.unshift({name:n.expression.name.text,node:n});n=unwrap(n.expression.expression);}return list;}
function group(calls){return calls.some(c=>c.name==='initForGymLeader')?'gym':calls.some(c=>c.name==='initForEliteFour')?'eliteFour':calls.some(c=>c.name==='initForChampion')?'champion':'other';}
function walkOps(ops,callback){for(const o of ops){callback(o);if(o.op==='if'){walkOps(o.then,callback);walkOps(o.else,callback);}if(o.op==='switch')for(const c of o.cases)walkOps(c.body,callback);}}
const table=sf.statements.flatMap(s=>ts.isVariableStatement(s)?[...s.declarationList.declarations]:[]).find(d=>ts.isIdentifier(d.name)&&d.name.text==='trainerConfigs')?.initializer;
if(!table||!ts.isObjectLiteralExpression(table))throw Error('Missing static trainer table');
const trainers={},byEnumName={},counts={trainers:0,directMembers:0,getRandomMembers:0,rivalMembers:0,inlinePostProcesses:0,statementsNormalized:0,inheritedSignatureSetups:0,byGroup:{}};
for(const prop of table.properties){
 if(!ts.isPropertyAssignment(prop)||!ts.isComputedPropertyName(prop.name))throw Error('Unexpected trainer config entry');
 const trainerType=value(prop.name.expression),enumName=prop.name.expression.name.text,calls=methodChain(prop.initializer),category=group(calls),existing=world.trainerConfigs[trainerType];
 if(existing?.enumName!==enumName)throw Error('Existing source trainer join mismatch');
 const record={sourceType:trainerType,enumName,category,source:loc(prop),members:[],inheritedSignatureSetup:null};
 const inherited=calls.find(c=>['initForGymLeader','initForEliteFour','initForEvilTeamLeader'].includes(c.name));
 if(inherited){
  const prior=existing.sourceCalls.find(c=>c.method===inherited.name&&c.line===loc(inherited.node.expression.name).line),poolIndex=inherited.name==='initForEvilTeamLeader'?1:0;
  const pool=prior?.args[poolIndex];
  record.inheritedSignatureSetup={helper:inherited.name,speciesPools:pool??{type:'unresolvedExistingPool'},
   slotPolicy:{kind:'reverse-from-party-end',firstSlot:-1,step:-1},source:callLoc(inherited.node),sourceCallIndex:existing.sourceCalls.indexOf(prior),
   helperSource:helperMethods[inherited.name],
   factoryDefaults:{helper:'getRandomPartyMemberFunc',trainerSlot:enums.TrainerSlot.TRAINER,ignoreEvolution:false,postProcess:null},
   interpretation:Array.isArray(pool)?'Static pool declarations only; helper not invoked':'Source Proxy/runtime fallback is not invoked; do not invent signature species'};
  counts.inheritedSignatureSetups++;
 }
 for(const call of calls.filter(c=>c.name==='setPartyMemberFunc')){
  const n=call.node,slot=value(n.arguments[0]),factory=unwrap(n.arguments[1]);
  if(!ts.isCallExpression(factory))throw Error('Unexpected party member factory');
  const helper=nameOf(factory.expression),prior=existing.sourceCalls.find(c=>c.method==='setPartyMemberFunc'&&c.line===loc(n.expression.name).line);
  if(!prior)throw Error('Cannot join existing species pool at source line');
  const callback=factory.arguments[3],post=callback&&(ts.isArrowFunction(callback)||ts.isFunctionExpression(callback))?callback:null;
  const beforeUnknown=unknowns.length,beforeDeferred=deferred.length;
  const member={slot,source:callLoc(n),sourceCallIndex:existing.sourceCalls.indexOf(prior),factory:{helper,source:loc(factory),speciesPool:helper==='getRandomPartyMemberFunc'?prior.args[1]?.args?.[0]:null,
   sourceArguments:factory.arguments.slice(0,3).map(a=>value(a)),defaults:helper==='getRandomPartyMemberFunc'?{trainerSlot:enums.TrainerSlot.TRAINER,ignoreEvolution:false}:{referenceConfig:'RIVAL_6_POOL'},requiresRuntimeGeneration:true},postProcess:null};
  if(post){
   const parameter=post.parameters[0]?.name;
   if(!parameter||!ts.isIdentifier(parameter))throw Error('Unsupported callback parameter');
   const operations=body(post.body,{pokemon:parameter.text});
   member.postProcess={source:loc(post),parameter:parameter.text,operations,unresolvedMarkers:unknowns.length-beforeUnknown,
    deferredSeededChoices:deferred.length-beforeDeferred,execution:'not-executed'};
   counts.inlinePostProcesses++;counts.statementsNormalized+=operations.length;
  }else if(callback)member.postProcess={source:loc(callback),unresolved:unknown(callback,'Post-process is not an inline function'),execution:'not-executed'};
  record.members.push(member);counts.directMembers++;
  if(helper==='getRandomPartyMemberFunc')counts.getRandomMembers++;else if(helper==='getRandomRivalPartyMemberFunc')counts.rivalMembers++;
 }
 trainers[trainerType]=record;byEnumName[enumName]=trainerType;counts.trainers++;
 counts.byGroup[category]||={trainers:0,directMembers:0,postProcesses:0,inheritedSignatureSetups:0};
 const g=counts.byGroup[category];g.trainers++;g.directMembers+=record.members.length;g.postProcesses+=record.members.filter(m=>m.postProcess).length;if(record.inheritedSignatureSetup)g.inheritedSignatureSetups++;
}
// Known-source regression checks, without interpreting any extracted callback.
assert.equal(counts.trainers,272);assert.equal(counts.directMembers,561);assert.equal(counts.getRandomMembers,535);assert.equal(counts.rivalMembers,26);assert.equal(counts.inlinePostProcesses,332);
assert.equal(counts.byGroup.gym.trainers,74);assert.equal(counts.byGroup.eliteFour.trainers,42);assert.equal(counts.byGroup.champion.trainers,16);
for(const trainer of Object.values(trainers))for(const member of trainer.members){
 const original=world.trainerConfigs[trainer.sourceType].sourceCalls[member.sourceCallIndex];
 assert.equal(original.method,'setPartyMemberFunc');assert.equal(original.line,member.source.line);
}
const blue=trainers[byEnumName.BLUE].members.find(m=>m.slot===5).postProcess.operations;
assert.ok(blue.some(o=>o.op==='setForm'&&o.value===1));assert.ok(blue.some(o=>o.op==='setBoss'&&o.segments===2));assert.ok(blue.some(o=>o.op==='ensureMove'&&o.moveId===enums.MoveId.HURRICANE&&o.preferredSlot===0));
const leon=trainers[byEnumName.LEON].members.find(m=>m.slot===5).postProcess.operations;
assert.ok(leon.some(o=>o.op==='setForm'&&o.value===3));
const mustard=trainers[byEnumName.MUSTARD].members.find(m=>m.slot===5).postProcess.operations;
assert.ok(mustard.some(o=>o.op==='setForm'&&o.value.type==='seededCall'&&o.value.helper==='randSeedIntRange'));
let mustardMoveWrites=0;walkOps(mustard,o=>{if(o.op==='setMove')mustardMoveWrites++;});assert.equal(mustardMoveWrites,8);
const directOpcodeCounts={...opcodeCounts},directDeferredCount=deferred.length;
const rival={source:{file:rivalPath},scalarConstants:Object.fromEntries([...constants].filter(([k])=>/^SLOT_\d_FIGHT_\d_LEVEL$/.test(k))),
 functions:{},fights:{},factoryLinks:[],fixedLevelsByFight:world.rivals.fixedLevelsByFight,relatedTrainerCalls:[]};
for(const [name,fn]of ruleDeclarations){
 const parameter=fn.parameters[0]?.name;if(!parameter||!ts.isIdentifier(parameter))throw Error('Unexpected named rival parameter');
 const context={pokemon:parameter.text,parameters:new Set(fn.parameters.slice(1).map(p=>p.name.text)),locals:new Set()};
 rival.functions[name]={source:loc(fn),parameters:fn.parameters.map((p,i)=>({name:p.name.text,role:i===0?'pokemon':'value',
  default:p.initializer?value(p.initializer,context):{type:'required'}})),operations:body(fn.body,context),execution:'not-executed'};
}
let rivalInlineCallbacks=0,rivalNamedReferences=0;
for(let fight=1;fight<=6;fight++){
 const name=`RIVAL_${fight}_POOL`,decl=rivalDeclarations.get(name),array=unwrap(decl?.initializer);
 if(!array||!ts.isArrayLiteralExpression(array))throw Error('Missing rival fight pool');
 rival.fights[name]=array.elements.map((entry,index)=>{
  if(!ts.isObjectLiteralExpression(entry))throw Error('Unexpected rival slot config');
  const props=Object.fromEntries(entry.properties.filter(ts.isPropertyAssignment).map(p=>[p.name.getText(rivalSf),p.initializer]));
  const post=unwrap(props.postProcess),pool=unwrap(props.pool);
  const slot={slot:index,source:loc(entry),poolReference:ts.isIdentifier(pool)?pool.text:null,
   speciesPool:world.rivals.fights[name][index].pool,balanceTypes:props.balanceTypes?value(props.balanceTypes):false,
   balanceWeaknesses:props.balanceWeaknesses?value(props.balanceWeaknesses):false,postProcess:null};
  if(ts.isIdentifier(post)&&ruleDeclarations.has(post.text)){
   slot.postProcess={type:'ruleReference',name:post.text,source:loc(post),definition:loc(ruleDeclarations.get(post.text))};rivalNamedReferences++;
  }else if(ts.isArrowFunction(post)||ts.isFunctionExpression(post)){
   const p=post.parameters[0]?.name;if(!p||!ts.isIdentifier(p))throw Error('Invalid inline rival parameter');
   slot.postProcess={type:'inlineRule',source:loc(post),parameter:p.text,operations:body(post.body,{pokemon:p.text,locals:new Set()}),execution:'not-executed'};rivalInlineCallbacks++;
  }else slot.postProcess=unknown(post,'Rival slot postProcess is not normalized');
  return slot;
 });
}
for(const trainer of Object.values(trainers))for(const member of trainer.members)if(member.factory.helper==='getRandomRivalPartyMemberFunc'){
 const pool=member.factory.sourceArguments[0]?.name,slot=member.factory.sourceArguments[1],config=rival.fights[pool]?.[slot];
 if(!config)throw Error('Cannot link rival factory to fight slot');
 member.factory.speciesPool=config.speciesPool;
 member.factory.rivalSlot={fightPool:pool,slot,postProcessPath:['rival','fights',pool,slot,'postProcess']};
 member.postProcess={type:'rivalSlotReference',fightPool:pool,slot,source:config.postProcess.source,execution:'not-executed'};
 rival.factoryLinks.push({trainerType:trainer.sourceType,enumName:trainer.enumName,memberSlot:member.slot,fightPool:pool,slot,source:member.source});
}
for(const c of Object.values(world.trainerConfigs))if(/^RIVAL(?:_\d)?$/.test(c.enumName))for(const call of c.sourceCalls.filter(c=>['setInstantTera','setGenModifiersFunc'].includes(c.method)))
 rival.relatedTrainerCalls.push({trainer:c.enumName,method:call.method,source:{file:call.file,line:call.line},
  ...(call.method==='setInstantTera'?{arguments:call.args}:{omitted:true,reason:'Trainer-level held-item factory is outside member postProcess extraction; callback is not executed'})});
assert.equal(Object.keys(rival.functions).length,6);assert.equal(Object.keys(rival.fights).length,6);assert.equal(rival.factoryLinks.length,26);
const ray6=rival.functions.postProcessSlot6Fight6.operations;
assert.ok(ray6.some(o=>o.op==='callRule'&&o.rule==='postProcessSlot6Fight5'&&o.arguments[1]===200&&o.arguments[2]===false));
let megaRay=false;walkOps(ray6,o=>{if(o.op==='setForm'&&o.value===1)megaRay=true;});assert.ok(megaRay);
assert.equal(rival.functions.postProcessSlot6Fight5.parameters[1].default,129);
assert.equal(rival.functions.forceRivalStarterTraits.operations.some(o=>o.op==='setForm'),false);
const starter6=rival.fights.RIVAL_6_POOL[0].postProcess.operations[0];
assert.equal(starter6.op,'callRule');assert.deepEqual(starter6.arguments.slice(1),[3,true]);
const result={metadata:{schemaVersion:1,sourceVersion:world.metadata.version,upstreamCommit:sha,upstreamRepository:world.metadata.upstreamRepository,
 sourceLicense:{code:'AGPL-3.0-only',copyright:'Pagefault Games and contributors',notice:'Normalized static facts extracted from AGPL-marked source; no separate permissive data license is asserted. No upstream function bodies are copied, imported, evaluated, transpiled or executed.'},
 sourceFiles:[{file:sourcePath,sha256:createHash('sha256').update(text).digest('hex')},{file:rivalPath,sha256:createHash('sha256').update(rivalText).digest('hex')}],
 counts:{...counts,directOpcodeCounts,opcodeCounts,predicateCounts,directOperationNodes:Object.values(directOpcodeCounts).reduce((a,b)=>a+b,0),operationNodes:Object.values(opcodeCounts).reduce((a,b)=>a+b,0),
  unresolvedMarkers:unknowns.length,deferredSeededCalls:deferred.length,directDeferredSeededCalls:directDeferredCount,
  directLevelWrites:directOpcodeCounts.setLevel||0,rivalLevelWrites:opcodeCounts.setLevel||0,
  rivalFights:6,rivalSlots:26,rivalNamedFunctions:6,rivalInlineCallbacks,rivalNamedReferences,rivalFactoryLinks:rival.factoryLinks.length,
  inheritedUnresolvedSignaturePools:Object.values(trainers).filter(t=>t.inheritedSignatureSetup&&!Array.isArray(t.inheritedSignatureSetup.speciesPools)).length},
 opcodeOrder:'Execute operations in source order; if/switch are structured control flow. Do not collect all forms/moves/abilities into unordered patches.',
 helperContracts:{getRandomPartyMemberFunc:{source:{file:sourcePath,line:957},pool:'Nested pools preserve grouping; seeded selection repeats until numeric species. Evolution/level/strength are runtime generation, not callback execution.',postProcessArgument:3},
 getRandomRivalPartyMemberFunc:{source:{file:'src/ai/rival-team-gen.ts',line:274},arguments:['config','slot','referenceConfig=RIVAL_6_POOL'],semantics:'Reads pool/postProcess/balance flags from config[slot]. Type/weakness balancing and seeded continuity generation are not executed here.'},
 replaceMove:{source:{file:'src/field/pokemon.ts',line:2035},semantics:'Replace an existing target move unless the replacement is already present; respects moveset-randomizer challenge.'},
 ensureMove:{source:{file:'src/field/pokemon.ts',line:2060},semantics:'Insert replacement at preferredSlot only if neither exact move nor acceptableAlternative predicate exists; respects moveset-randomizer challenge.'},
 randSeedInt:{source:{file:'src/utils/common.ts',line:102},arguments:['range','min=0'],bounds:'min through min+range-1 inclusive; deferred, no RNG drawn'},
 randSeedIntRange:{source:{file:'src/utils/common.ts',line:115},arguments:['min','max'],bounds:'inclusive min and max; deferred, no RNG drawn'},
 randSeedItem:{source:{file:'src/utils/common.ts'},semantics:'Seeded choice is deferred; literal candidate alternatives are retained'}},
 fieldSemantics:{slot:'Literal source slot; negative slots count from party end. Source helper generation is not invoked.',abilityIndex:'Source Pokemon form ability slot index; this is not an AbilityId. Resolve against selected source form after earlier operations.',formIndex:'Source species form array index, not PokeAPI form ID.',enumValues:'Numeric values are pinned source IDs. usedEnumSymbols preserves original enum names.',sourceArguments:'Literal/normalized AST argument facts. Runtime/external references are explicit markers.',gym:'All74 gyms have zero direct setPartyMemberFunc overrides. Their signature setup is inherited and recorded separately.',finalMoves:'generateMoveset is deferred. The data specifies ordered corrections/ensures/replacements, not a pre-generated final team or final moveset.',
 callRule:'Declarative call to rival.functions[name], binding recorded parameters/defaults. This extractor does not execute it. return exits the current rule; break exits the current switch; let creates a scoped runtime value.',rivalStarter:'Fights5/6 call forceRivalStarterTraits with bars2/3 and useRivalSignature=true. These postprocessors do not explicitly force a starter form. Signature moveset generation is a separate runtime helper contract.'},
 limitations:['332 inline trainer postprocessors plus6 named rival functions and15 inline rival rules are normalized. Runtime generation and inherited Proxy fallbacks are not executed.','setGenModifiersFunc, random Tera modifier factories, trainer AI and held-item runtime functions are not evaluated or included as member callbacks. Rival related trainer-level omitted callbacks have explicit source locations.','No per-member level write appears in the332 trainer-config callbacks; rival fixed level writes are recorded separately, without applying any project level cap.','Static coverage is not runtime gameplay implementation coverage.'],
 validation:['Pinned commit verified','561 source member calls joined by trainer type and method line to existing world pool facts','332 inline callbacks normalized','74Gym/42EliteFour/16Champion included','Blue Mega Pidgeot/Hurricane, Leon G-Max Charizard and Mustard eight conditional move writes checked','All26 rival factories linked to6 fights and named/inline postprocessors','Final Mega Rayquaza form1/level200/unspecified generated segments and fight5 level129 defaults checked']},
 trainers,byEnumName,rival,usedEnumSymbols:symbols,unresolved:unknowns,deferredSeededCalls:deferred};
const serialized=JSON.stringify(result)+'\n';
if(process.argv.includes('--check')){assert.equal(fs.readFileSync(output,'utf8'),serialized,'Regenerate trainer member facts');console.log('Static source/data checks passed');}
else fs.writeFileSync(output,serialized);
console.log(JSON.stringify({output:path.relative(project,output),bytes:Buffer.byteLength(serialized),counts:result.metadata.counts,unresolved:unknowns.map(u=>({reason:u.reason,source:u.source,reference:u.reference}))},null,2));
