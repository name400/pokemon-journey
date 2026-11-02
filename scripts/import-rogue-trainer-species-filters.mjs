import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import ts from 'typescript';

// Static syntax-to-predicate-data reader, never imports/evaluates upstream code.
const version='1.12.2.3',upstreamCommit='29441f7aa7482d9e816b253d324293788936dc3e';
const project=fileURLToPath(new URL('../',import.meta.url));
const arg=process.argv.indexOf('--reference'),reference=path.resolve(arg<0?path.join(project,'work/pokerogue-reference'):process.argv[arg+1]);
if(execFileSync('git',['-C',reference,'rev-parse','HEAD'],{encoding:'utf8'}).trim()!==upstreamCommit)throw Error('Wrong reference commit');
const world=JSON.parse(await fs.readFile(path.join(project,'data/rogue-world-reference.json'),'utf8'));
const speciesReference=JSON.parse(await fs.readFile(path.join(project,'data/rogue-reference.json'),'utf8'));
if(world.metadata.upstreamCommit!==upstreamCommit||speciesReference.metadata.upstreamCommit!==upstreamCommit)throw Error('Reference data commit mismatch');
const enums=structuredClone(world.enums),contexts=new Map(),omissions=[],trainers={},directSetters=[];
const unwrap=input=>{let n=input;while(n&&(ts.isParenthesizedExpression(n)||ts.isAsExpression(n)||ts.isSatisfiesExpression(n)||ts.isTypeAssertionExpression(n)||ts.isNonNullExpression(n)))n=n.expression;return n;};
const nameOf=input=>{const n=unwrap(input);if(!n)return null;if(n.kind===ts.SyntaxKind.ThisKeyword)return 'this';if(ts.isIdentifier(n))return n.text;if(ts.isPropertyAccessExpression(n))return nameOf(n.expression)+'.'+n.name.text;return null;};
const here=(ctx,n)=>({file:ctx.file,line:ctx.sf.getLineAndCharacterOfPosition(n.getStart(ctx.sf)).line+1});
async function load(file){const text=await fs.readFile(path.join(reference,file),'utf8'),sf=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true);if(sf.parseDiagnostics.length)throw Error('Parse error: '+file);const ctx={file,sf,constants:new Map()};for(const s of sf.statements)if(ts.isVariableStatement(s))for(const d of s.declarationList.declarations)if(ts.isIdentifier(d.name))ctx.constants.set(d.name.text,d.initializer);contexts.set(file,ctx);return ctx;}
function unknown(ctx,n,field,reason){omissions.push({...here(ctx,n),field,kind:ts.SyntaxKind[n.kind],reason});return {op:'unknown',omissionIndex:omissions.length-1};}
const configCtx=await load('src/data/trainers/trainer-config.ts');
const speciesCtx=await load('src/data/pokemon-species.ts');
const registryCtx=await load('src/data/species-data-registry.ts');
const sceneCtx=await load('src/battle-scene.ts');
for(const n of speciesCtx.sf.statements)if(ts.isEnumDeclaration(n)&&n.name.text==='Region'){const map={};let next=0;for(const m of n.members){if(m.initializer)throw Error('Unexpected Region initializer');map[m.name.getText()]=next++;}enums.Region=map;}
function literal(input,ctx){const n=unwrap(input);if(!n||ts.isIdentifier(n)&&n.text==='undefined')return {kind:'literal',undefined:true};if(ts.isNumericLiteral(n))return {kind:'literal',value:Number(n.text)};if(ts.isStringLiteralLike(n))return {kind:'literal',value:n.text};if(n.kind===ts.SyntaxKind.TrueKeyword)return {kind:'literal',value:true};if(n.kind===ts.SyntaxKind.FalseKeyword)return {kind:'literal',value:false};if(n.kind===ts.SyntaxKind.NullKeyword)return {kind:'literal',value:null};if(ts.isArrayLiteralExpression(n))return {kind:'literal',value:n.elements.map(e=>literal(e,ctx).value)};if(ts.isPropertyAccessExpression(n)){const owner=nameOf(n.expression);if(enums[owner]&&Object.hasOwn(enums[owner],n.name.text))return {kind:'literal',value:enums[owner][n.name.text]};}if(ts.isIdentifier(n)&&ctx.constants.has(n.text))return literal(ctx.constants.get(n.text),ctx);throw Error('Not a supported static literal: '+n.getText());}
const fields={speciesId:'sourceId',baseTotal:'baseTotal',generation:'generation',legendary:'legendary',subLegendary:'subLegendary',mythical:'mythical',type1:'type1',type2:'type2'};
function operand(input,ctx,env){const n=unwrap(input);if(ts.isPropertyAccessExpression(n)&&nameOf(n.expression)===env.species&&fields[n.name.text])return {kind:'field',field:fields[n.name.text]};if(ts.isIdentifier(n)&&env.parameters?.has(n.text))return {kind:'parameter',name:n.text};return literal(n,ctx);}
const speciesMethods=new Map();
function indexMethods(n){if(ts.isMethodDeclaration(n)&&n.body&&!speciesMethods.has(n.name.getText()))speciesMethods.set(n.name.getText(),n);ts.forEachChild(n,indexMethods);}indexMethods(speciesCtx.sf);
const forbiddenMethod=speciesMethods.get('isTrainerForbidden'),catchableMethod=speciesMethods.get('isCatchable'),regionMethod=speciesMethods.get('getRegion');
const forbiddenReturn=forbiddenMethod.body.statements.find(ts.isReturnStatement).expression;
if(!ts.isCallExpression(forbiddenReturn)||!ts.isPropertyAccessExpression(forbiddenReturn.expression)||forbiddenReturn.expression.name.text!=='includes')throw Error('Unexpected trainer-forbidden syntax');
const trainerForbiddenIds=literal(forbiddenReturn.expression.expression,speciesCtx).value;
const blockedDecl=catchableMethod.body.statements.filter(ts.isVariableStatement).flatMap(s=>[...s.declarationList.declarations]).find(d=>d.name.getText()==='blockedSpecies');
const catchableExcludedIds=literal(blockedDecl.initializer,speciesCtx).value;
const catchableReturn=unwrap(catchableMethod.body.statements.find(ts.isReturnStatement).expression);
if(!ts.isPrefixUnaryExpression(catchableReturn)||catchableReturn.operator!==ts.SyntaxKind.ExclamationToken||!ts.isCallExpression(catchableReturn.operand)||nameOf(catchableReturn.operand.expression)!=='blockedSpecies.includes'||nameOf(catchableReturn.operand.arguments[0])!=='this.speciesId')throw Error('Unexpected catchable exclusion predicate');
const regionReturn=regionMethod.body.statements.find(ts.isReturnStatement).expression,regionCall=unwrap(regionReturn),regionDivision=unwrap(regionCall.arguments?.[0]);
if(!ts.isCallExpression(regionCall)||nameOf(regionCall.expression)!=='Math.floor'||!ts.isBinaryExpression(regionDivision)||regionDivision.operatorToken.kind!==ts.SyntaxKind.SlashToken||nameOf(regionDivision.left)!=='this.speciesId')throw Error('Unsupported source region calculation');
const regionDivisor=literal(regionDivision.right,speciesCtx).value;
const primitivePredicates={isTrainerForbidden:{op:'in',field:'sourceId',values:trainerForbiddenIds,source:here(speciesCtx,forbiddenMethod)},isCatchable:{op:'not',arg:{op:'in',field:'sourceId',values:catchableExcludedIds},source:here(speciesCtx,catchableMethod)},isRegional:{op:'compare',test:'gt',left:{kind:'floor-div-field',field:'sourceId',divisor:regionDivisor},right:{kind:'literal',value:enums.Region.NORMAL},source:here(speciesCtx,speciesMethods.get('isRegional'))}};
const comparisons=new Map([[ts.SyntaxKind.EqualsEqualsToken,'eq-loose'],[ts.SyntaxKind.ExclamationEqualsToken,'ne-loose'],[ts.SyntaxKind.EqualsEqualsEqualsToken,'eq'],[ts.SyntaxKind.ExclamationEqualsEqualsToken,'ne'],[ts.SyntaxKind.GreaterThanToken,'gt'],[ts.SyntaxKind.GreaterThanEqualsToken,'gte'],[ts.SyntaxKind.LessThanToken,'lt'],[ts.SyntaxKind.LessThanEqualsToken,'lte']]);
const requiredMoves={hasLevelMove:new Set(),hasTm:new Set()};
function predicate(input,ctx,env,field){
 let n=unwrap(input);
 if(ts.isArrowFunction(n)||ts.isFunctionExpression(n)){const body=ts.isBlock(n.body)?n.body.statements.length===1&&ts.isReturnStatement(n.body.statements[0])?n.body.statements[0].expression:null:n.body;if(!body)return unknown(ctx,n,field,'Only direct-return predicate callbacks are supported');return predicate(body,ctx,{...env,species:n.parameters[0]?.name.getText()},field);}
 if(ts.isBinaryExpression(n)){
  const op=n.operatorToken.kind;
  if(op===ts.SyntaxKind.AmpersandAmpersandToken||op===ts.SyntaxKind.BarBarToken)return {op:op===ts.SyntaxKind.AmpersandAmpersandToken?'and':'or',args:[predicate(n.left,ctx,env,field+'.left'),predicate(n.right,ctx,env,field+'.right')]};
  if(comparisons.has(op)){try{return {op:'compare',test:comparisons.get(op),left:operand(n.left,ctx,env),right:operand(n.right,ctx,env)};}catch{return unknown(ctx,n,field,'Unresolved static comparison operand');}}
 }
 if(ts.isPrefixUnaryExpression(n)&&n.operator===ts.SyntaxKind.ExclamationToken){const inner=unwrap(n.operand);if(ts.isPrefixUnaryExpression(inner)&&inner.operator===ts.SyntaxKind.ExclamationToken)return predicate(inner.operand,ctx,env,field);return {op:'not',arg:predicate(n.operand,ctx,env,field+'.not')};}
 if(ts.isCallExpression(n)&&ts.isPropertyAccessExpression(n.expression)){
  const method=n.expression.name.text,receiver=unwrap(n.expression.expression),owner=nameOf(receiver);
  if(owner===env.species){
   if(method==='isOfType'){const type=operand(n.arguments[0],ctx,env);return {op:'hasType',typeId:type.kind==='literal'?type.value:type};}
   if(primitivePredicates[method])return structuredClone(primitivePredicates[method]);
   if(method==='canLearnTm'){const moveId=literal(n.arguments[0],ctx).value;requiredMoves.hasTm.add(moveId);return {op:'hasTm',moveId,form:'base',includePrevolutions:true,source:here(speciesCtx,speciesMethods.get('canLearnTm'))};}
  }
  if(method==='includes'&&ts.isArrayLiteralExpression(receiver)){
   try{const fieldValue=operand(n.arguments[0],ctx,env);if(fieldValue.kind!=='field')return unknown(ctx,n,field,'Includes target must be a species field');return {op:'in',field:fieldValue.field,values:literal(receiver,ctx).value};}catch{return unknown(ctx,n,field,'Unresolved literal membership list');}
  }
  if(method==='find'&&ts.isCallExpression(receiver)&&ts.isPropertyAccessExpression(receiver.expression)&&nameOf(receiver.expression.expression)===env.species&&receiver.expression.name.text==='getLevelMoves'&&receiver.arguments.length===0){
   const cb=unwrap(n.arguments[0]),body=ts.isArrowFunction(cb)?unwrap(cb.body):null;
   if(body&&ts.isBinaryExpression(body)&&body.operatorToken.kind===ts.SyntaxKind.EqualsEqualsEqualsToken&&ts.isElementAccessExpression(unwrap(body.left))){const element=unwrap(body.left);if(nameOf(element.expression)===cb.parameters[0].name.getText()&&literal(element.argumentExpression,ctx).value===1){const moveId=literal(body.right,ctx).value;requiredMoves.hasLevelMove.add(moveId);return {op:'hasLevelMove',moveId,form:'base',includePrevolutions:false,levelRange:'all-declared-levels-including-zero-and-negative',source:here(speciesCtx,speciesMethods.get('getLevelMoves'))};}}
   return unknown(ctx,n,field,'Unsupported getLevelMoves().find predicate');
  }
 }
 try{const v=operand(n,ctx,env);if(v.kind==='field')return {op:'flag',field:v.field};if(v.kind==='parameter')return {op:'parameter',name:v.name};return {op:'const',value:v.undefined?false:!!v.value};}catch{return unknown(ctx,n,field,'Unsupported predicate expression');}
}
const configClass=configCtx.sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='TrainerConfig'),methods=new Map(configClass.members.filter(ts.isMethodDeclaration).map(m=>[m.name.getText(),m]));
const constructor=configClass.members.find(ts.isConstructorDeclaration),baseAssignment=constructor.body.statements.find(s=>ts.isExpressionStatement(s)&&ts.isBinaryExpression(s.expression)&&nameOf(s.expression.left)==='this.speciesFilter');
if(!baseAssignment)throw Error('Missing base filter');
const basePredicateTemplate=predicate(baseAssignment.expression.right,configCtx,{parameters:new Set(['allowLegendaries'])},'constructor.speciesFilter');
const setter=methods.get('setSpeciesFilter'),setterAssignment=setter.body.statements.find(s=>ts.isExpressionStatement(s)&&ts.isBinaryExpression(s.expression)&&nameOf(s.expression.left)==='this.speciesFilter')?.expression.right;
if(!ts.isConditionalExpression(setterAssignment)||nameOf(setterAssignment.condition)!=='allowLegendaries'||nameOf(setterAssignment.whenTrue)!=='speciesFilter')throw Error('Unexpected setSpeciesFilter replacement semantics');
const elseArrow=unwrap(setterAssignment.whenFalse);
if(!ts.isArrowFunction(elseArrow)||!ts.isBinaryExpression(elseArrow.body)||elseArrow.body.operatorToken.kind!==ts.SyntaxKind.AmpersandAmpersandToken||nameOf(elseArrow.body.left.expression)!=='speciesFilter'||nameOf(elseArrow.body.right.expression)!=='baseFilter')throw Error('Unexpected setSpeciesFilter AND order');
function containsSetter(n){let result=false;function walk(x){if(ts.isCallExpression(x)&&ts.isPropertyAccessExpression(x.expression)&&x.expression.name.text==='setSpeciesFilter')result=true;ts.forEachChild(x,walk);}walk(n);return result;}
function compileStatements(statements,method,parameters){const effects=[];for(const stmt of statements){
 if(ts.isIfStatement(stmt)&&containsSetter(stmt))effects.push({kind:'conditional',condition:predicate(stmt.expression,configCtx,{parameters},'helper.'+method+'.condition'),then:compileStatements(ts.isBlock(stmt.thenStatement)?stmt.thenStatement.statements:[stmt.thenStatement],method,parameters),else:stmt.elseStatement?compileStatements(ts.isBlock(stmt.elseStatement)?stmt.elseStatement.statements:[stmt.elseStatement],method,parameters):[],source:here(configCtx,stmt)});
 else if(ts.isExpressionStatement(stmt)&&ts.isCallExpression(stmt.expression)&&ts.isPropertyAccessExpression(stmt.expression.expression)&&nameOf(stmt.expression.expression.expression)==='this'&&stmt.expression.expression.name.text==='setSpeciesFilter'){const call=stmt.expression;effects.push({kind:'set-filter',predicate:predicate(call.arguments[0],configCtx,{parameters},'helper.'+method+'.predicate'),replace:literal(call.arguments[1],configCtx).value===true,source:here(configCtx,call.expression.name)});}
 }return effects;}
const helperEffects={};for(const [name,method]of methods)if(name.startsWith('initFor'))helperEffects[name]={parameters:method.parameters.map(p=>p.name.getText()),effects:compileStatements(method.body.statements,name,new Set(method.parameters.map(p=>p.name.getText()))),source:here(configCtx,method)};
function bind(node,bindings){if(!node||typeof node!=='object')return node;if(node.kind==='parameter')return structuredClone(bindings[node.name]??{kind:'literal',undefined:true});if(node.op==='parameter'){const v=bindings[node.name];return {op:'const',value:v&&!v.undefined?!!v.value:false};}if(Array.isArray(node))return node.map(n=>bind(n,bindings));const out=Object.fromEntries(Object.entries(node).map(([k,v])=>[k,bind(v,bindings)]));if(out.op==='hasType'&&out.typeId?.kind==='literal')out.typeId=out.typeId.value;return out;}
function staticCondition(node){if(node.op==='const')return node.value;if(node.op==='not'){const value=staticCondition(node.arg);return value===null?null:!value;}if(node.op==='compare'&&node.left.kind==='literal'&&node.right.kind==='literal'){const a=node.left.undefined?undefined:node.left.value,b=node.right.undefined?undefined:node.right.value;switch(node.test){case 'eq-loose':return a==b;case 'ne-loose':return a!=b;case 'eq':return a===b;case 'ne':return a!==b;case 'gt':return a>b;case 'gte':return a>=b;case 'lt':return a<b;case 'lte':return a<=b;}}return null;}
function hasUnknown(node){return node&&typeof node==='object'&&(node.op==='unknown'||node.kind==='unresolved-argument'||Object.values(node).some(v=>Array.isArray(v)?v.some(hasUnknown):hasUnknown(v)));}
const configObject=(()=>{for(const s of configCtx.sf.statements)if(ts.isVariableStatement(s))for(const d of s.declarationList.declarations)if(d.name.getText()==='trainerConfigs')return unwrap(d.initializer);throw Error('Missing trainer table');})();
for(const prop of configObject.properties){
 if(!ts.isPropertyAssignment(prop)||!ts.isComputedPropertyName(prop.name))throw Error('Nonliteral trainer key');
 const sourceTrainerId=literal(prop.name.expression,configCtx).value,enumName=nameOf(prop.name.expression).split('.').at(-1);let current=unwrap(prop.initializer);const chain=[];
 while(ts.isCallExpression(current)&&ts.isPropertyAccessExpression(current.expression)){chain.unshift({method:current.expression.name.text,node:current});current=unwrap(current.expression.expression);}
 if(!ts.isNewExpression(current)||nameOf(current.expression)!=='TrainerConfig')throw Error('Unexpected config constructor');
 const allowValue=literal(current.arguments?.[1],configCtx),constructorAllowLegendaries=allowValue.value===true;
 let effective=bind(basePredicateTemplate,{allowLegendaries:allowValue}),hasExplicitSpeciesPool=false;
 const history=[{method:'constructor',composition:'initialize',predicate:effective,source:here(configCtx,baseAssignment),callSource:here(configCtx,current)}];
 function applyEffect(effect,viaMethod,callSource,bindings={}){
  if(effect.kind==='conditional'){
   const condition=bind(effect.condition,bindings),decision=staticCondition(condition);
   if(decision===null){effective=unknown(configCtx,prop.name,'trainers.'+enumName,'Helper condition could not be resolved from literal arguments');history.push({method:viaMethod,composition:'unresolved-condition',condition,source:effect.source});return;}
   history.push({method:viaMethod,composition:'static-branch',condition,selected:decision?'then':'else',source:effect.source,callSource});
   for(const next of decision?effect.then:effect.else)applyEffect(next,viaMethod,callSource,bindings);return;
  }
  const addition=bind(effect.predicate,bindings);effective=effect.replace?addition:{op:'and',args:[addition,effective]};history.push({method:viaMethod,composition:effect.replace?'replace-all-prior-filter':'and-new-then-previous',replacesLegendAndForbiddenGuards:effect.replace,predicate:addition,source:effect.source,callSource});
 }
 for(const call of chain){
  const callSource=here(configCtx,call.node.expression.name);
  if(call.method==='setSpeciesFilter'){
   const predicateTree=predicate(call.node.arguments[0],configCtx,{parameters:new Set()},'trainers.'+enumName+'.setSpeciesFilter'),replace=literal(call.node.arguments[1],configCtx).value===true;
   const effect={kind:'set-filter',predicate:predicateTree,replace,source:callSource};directSetters.push({sourceTrainerId,enumName,...effect});applyEffect(effect,call.method,callSource);
  }else if(helperEffects[call.method]){
   const helper=helperEffects[call.method],bindings={};
   for(const effect of helper.effects){const needed=new Set();function visit(v){if(v&&typeof v==='object'){if(v.kind==='parameter'||v.op==='parameter')needed.add(v.name);for(const a of Object.values(v))if(Array.isArray(a))a.forEach(visit);else visit(a);}}visit(effect);for(const name of needed){const index=helper.parameters.indexOf(name);try{bindings[name]=literal(call.node.arguments[index],configCtx);}catch{bindings[name]={kind:'unresolved-argument',name};}}applyEffect(effect,call.method,callSource,bindings);}
   if(!helper.effects.length)history.push({method:call.method,composition:'no-filter-change',source:helper.source,callSource});
   if(call.method==='initForEvilTeamAdmin')hasExplicitSpeciesPool=true;
  }
  if(call.method==='setSpeciesPools')hasExplicitSpeciesPool=true;
 }
 const samplingPredicate={op:'and',args:[structuredClone(primitivePredicates.isCatchable),effective]};
 trainers[sourceTrainerId]={sourceTrainerId,enumName,constructorAllowLegendaries,hasExplicitSpeciesPool,predicate:effective,samplingPredicate,status:hasUnknown(effective)?'omitted':'resolved',history,source:here(configCtx,prop.name)};
}
if(directSetters.length!==22||Object.keys(trainers).length!==272)throw Error('Unexpected source filter/trainer counts');
for(const trainer of Object.values(trainers))if(!trainer.predicate||!trainer.samplingPredicate)throw Error('Missing filter; no permissive fallback is allowed');
const inverseMoves=Object.fromEntries(Object.entries(enums.MoveId).map(([k,v])=>[v,k]));
const requiredMoveQueries=Object.fromEntries(Object.entries(requiredMoves).map(([kind,ids])=>[kind,[...ids].sort((a,b)=>a-b).map(moveId=>({moveId,enumName:inverseMoves[moveId]}))]));
let registryGetTmsSource=null;function findRegistryMethod(n){if(ts.isMethodDeclaration(n)&&n.name.getText()==='getTms')registryGetTmsSource=here(registryCtx,n);ts.forEachChild(n,findRegistryMethod);}findRegistryMethod(registryCtx.sf);if(!registryGetTmsSource)throw Error('Missing TM inheritance source');
const priorOmissions=Array.isArray(speciesReference.metadata.omissions)?speciesReference.metadata.omissions:speciesReference.metadata.omissions.unsupportedFields||[];
const dataGaps=priorOmissions.filter(o=>/\.tms\b|\.formTms\b|\.levelMoves\b|\.formLevelMoves\b/.test(o.field||o.path||'')).map(o=>({...o,impact:'hasTm/hasLevelMove predicates depend on this data; unknown data must remain unknown, never widen to all species.'}));
const data={metadata:{version,upstreamCommit,upstreamRepository:'https://github.com/pagefaultgames/pokerogue',sourceLicense:{code:'AGPL-3.0-only',copyright:'Pagefault Games and contributors',notice:'Static predicate/mechanics facts from fixed AGPL-marked source. No independent permissive license or Pokémon asset rights asserted.'},method:'Independent TypeScript AST syntax reader and constant binding of our normalized IR. Upstream callbacks, methods, imports, constructors, Phaser and eval are never executed.',domain:{mode:'classic',excluded:['daily','challenge modifiers','runtime overrides','custom TrainerConfig clones and mystery encounter overrides']},sources:[...contexts.keys()],enumProvenance:'Enum values use same-commit AST-extracted rogue-world-reference.json, plus Region parsed directly from pokemon-species.ts.',counts:{trainerTypes:Object.keys(trainers).length,directSetSpeciesFilter:directSetters.length,resolvedTrainers:Object.values(trainers).filter(t=>t.status==='resolved').length,trainerForbiddenSpecies:trainerForbiddenIds.length,notCatchableSpecies:catchableExcludedIds.length,omissions:omissions.length,dataGaps:dataGaps.length},operatorSchema:{and:'args, preserve short-circuit source order',or:'args',not:'arg',const:'value:boolean',flag:'field; omitted species boolean fields default false',compare:'test eq/ne/eq-loose/ne-loose/gt/gte/lt/lte, left/right operands',in:'field, values; exact source IDs',hasType:'typeId; species.type1===typeId OR non-null type2===typeId',hasLevelMove:'moveId; all levels from base+base-form level moves, no prevo inheritance',hasTm:'moveId; base+base-form TMs plus recursive base prevo TMs',unknown:'omissionIndex; must block/mark generation unavailable, never become true'},operandSchema:{literal:'value or undefined:true',field:'sourceId/baseTotal/generation/legendary/subLegendary/mythical/type1/type2',floorDivField:'kind:floor-div-field,field,divisor'},samplingSemantics:{globalGeneric:'First isCatchable AND effective predicate on every species. Then map each accepted species to its oldest prevo and deduplicate roots unless filterAllEvolutions=true. Sample roots uniformly. Do not re-filter the mapped root by specialty type.',explicitSpeciesPools:'Trainer.genNewPartyMemberSpecies uses config.speciesPools directly and bypasses this generic predicate.',partyMemberCallbacks:'Explicit positive/negative slot callbacks bypass generic filtering. Their own factory/filter semantics are separate.',replacement:'setSpeciesFilter(predicate,true) replaces the entire prior filter, including legendary AND trainer-forbidden guards. An omitted/false second argument ANDs new predicate first, prior filter second.',champion:'initForChampion does not change speciesFilter; explicit roster callbacks may still use legendary species.',catchableName:'isCatchable here is the source global NPC-random candidate gate, not permission to throw a ball at every wild encounter.'},primitiveSemantics:{isOfType:here(speciesCtx,speciesMethods.get('isOfType')),canLearnTm:here(speciesCtx,speciesMethods.get('canLearnTm')),getLevelMoves:here(speciesCtx,speciesMethods.get('getLevelMoves')),getTms:registryGetTmsSource,notes:['getTms recursively inherits prevo TMs; getLevelMoves does not inherit prevo level moves.','Unspecified form resolves to forms[0].formKey, or empty string if no forms.','Level move find predicates test move ID at any declared level, including level0/-1, without comparing NPC current level.','Regional means floor(sourceSpeciesId/2000)>Region.NORMAL, not generation>1.']},requiredMoveQueries,dataGaps,omissions},enums:{TrainerType:enums.TrainerType,PokemonType:enums.PokemonType,Region:enums.Region,MoveId:Object.fromEntries(Object.values(requiredMoveQueries).flat().map(m=>[m.enumName,m.moveId]))},primitivePredicates,basePredicateTemplate,setterSemantics:{source:here(configCtx,setter),trueBranch:'replace',falseBranch:'AND(new,previous)'},helperEffects,directSetters,trainers};
const output=path.join(project,'data/rogue-trainer-species-filters.json');await fs.writeFile(output,JSON.stringify(data)+'\n');
console.log(JSON.stringify({output,...data.metadata.counts,requiredMoveQueries,dataGaps},null,2));
