import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import ts from 'typescript';

// Independent syntax-to-data extractor. No upstream module, constructor,
// callback, helper, Phaser API, transpiled source or eval is executed.
const version='1.12.2.3',upstreamCommit='29441f7aa7482d9e816b253d324293788936dc3e';
const project=fileURLToPath(new URL('../',import.meta.url));
const at=process.argv.indexOf('--reference');
const reference=path.resolve(at<0?path.join(project,'work/pokerogue-reference'):process.argv[at+1]);
if(execFileSync('git',['-C',reference,'rev-parse','HEAD'],{encoding:'utf8'}).trim()!==upstreamCommit)throw Error('Wrong reference commit');
const world=JSON.parse(await fs.readFile(path.join(project,'data/rogue-world-reference.json'),'utf8'));
if(world.metadata.upstreamCommit!==upstreamCommit)throw Error('World enum reference commit mismatch');
const enums=world.enums,omissions=[],templates={},selectors={},methodEffects={},trainers={};
const contexts=new Map();
async function load(file){const text=await fs.readFile(path.join(reference,file),'utf8'),sf=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true);if(sf.parseDiagnostics.length)throw Error('Syntax error: '+file);const ctx={file,sf};contexts.set(file,ctx);return ctx;}
const unwrap=input=>{let n=input;while(n&&(ts.isParenthesizedExpression(n)||ts.isAsExpression(n)||ts.isSatisfiesExpression(n)||ts.isNonNullExpression(n)||ts.isTypeAssertionExpression(n)))n=n.expression;return n;};
const location=(ctx,n)=>({file:ctx.file,line:ctx.sf.getLineAndCharacterOfPosition(n.getStart(ctx.sf)).line+1});
const nameOf=input=>{const n=unwrap(input);if(!n)return null;if(n.kind===ts.SyntaxKind.ThisKeyword)return 'this';if(ts.isIdentifier(n))return n.text;if(ts.isPropertyAccessExpression(n))return nameOf(n.expression)+'.'+n.name.text;return null;};
function omission(ctx,n,field,reason){const record={...location(ctx,n),field,kind:ts.SyntaxKind[n.kind],reason};omissions.push(record);return {kind:'omitted',omissionIndex:omissions.length-1};}
function literal(input){const n=unwrap(input);if(!n||n.kind===ts.SyntaxKind.UndefinedKeyword||ts.isIdentifier(n)&&n.text==='undefined')return undefined;if(ts.isNumericLiteral(n))return Number(n.text);if(ts.isStringLiteralLike(n))return n.text;if(n.kind===ts.SyntaxKind.TrueKeyword)return true;if(n.kind===ts.SyntaxKind.FalseKeyword)return false;if(ts.isPropertyAccessExpression(n)){const receiver=nameOf(n.expression);if(enums[receiver]&&Object.hasOwn(enums[receiver],n.name.text))return enums[receiver][n.name.text];}if(ts.isPrefixUnaryExpression(n)&&n.operator===ts.SyntaxKind.MinusToken){const v=literal(n.operand);if(typeof v==='number')return -v;}throw Error('Unsupported static literal: '+n.getText());}
function variable(ctx,name){for(const stmt of ctx.sf.statements)if(ts.isVariableStatement(stmt))for(const decl of stmt.declarationList.declarations)if(ts.isIdentifier(decl.name)&&decl.name.text===name)return decl.initializer;throw Error('Missing variable: '+name);}
function declarations(ctx){return new Map(ctx.sf.statements.filter(ts.isFunctionDeclaration).map(n=>[n.name?.text,n]));}
const templateCtx=await load('src/data/trainers/trainer-party-template.ts');
const configCtx=await load('src/data/trainers/trainer-config.ts');
const trainerCtx=await load('src/field/trainer.ts');
const classes=new Map(templateCtx.sf.statements.filter(ts.isClassDeclaration).map(n=>[n.name.text,n]));
const baseClass=classes.get('TrainerPartyTemplate'),compoundClass=classes.get('TrainerPartyCompoundTemplate');
const ctor=baseClass.members.find(ts.isConstructorDeclaration),compoundCtor=compoundClass.members.find(ts.isConstructorDeclaration);
const parameterDefaults=Object.fromEntries(ctor.parameters.filter(p=>p.initializer).map(p=>[p.name.getText(),literal(p.initializer)]));
const compoundSuper=compoundCtor.body.statements.find(s=>ts.isExpressionStatement(s)&&ts.isCallExpression(s.expression)&&s.expression.expression.kind===ts.SyntaxKind.SuperKeyword).expression;
const compoundRootStrength=literal(compoundSuper.arguments[1]);
function readTemplate(input,ctx,key){
 const n=unwrap(input);
 if(ts.isPropertyAccessExpression(n)&&nameOf(n.expression)==='trainerPartyTemplates')return n.name.text;
 if(!ts.isNewExpression(n))throw Error('Non-constructor template '+n.getText());
 const type=nameOf(n.expression),args=[...(n.arguments||[])];let record;
 if(type==='TrainerPartyTemplate'){
  const size=literal(args[0]),strength=literal(args[1]),sameSpecies=literal(args[2])??parameterDefaults.sameSpecies,balanced=literal(args[3])??parameterDefaults.balanced,evoThresholdKind=literal(args[4])??parameterDefaults.evoLevelThresholdKind;
  if(!Number.isInteger(size)||size<1||size>6||!Number.isInteger(strength)||typeof sameSpecies!=='boolean'||typeof balanced!=='boolean'||!Number.isInteger(evoThresholdKind))throw Error('Invalid template '+key);
  record={kind:'single',size,strength,sameSpecies,balanced,rootEvoThresholdKind:evoThresholdKind,groups:[{from:0,to:size-1,strength,sameSpecies,balanced,evoThresholdKind}],slots:Array.from({length:size},(_,index)=>({index,strength,sameSpecies,balanced,evoThresholdKind,groupIndex:0,groupStart:0}))};
 }else if(type==='TrainerPartyCompoundTemplate'){
  const children=args.map((a,i)=>readTemplate(a,ctx,key+'/part'+i));let offset=0;const groups=[],slots=[];
  for(const child of children){const part=templates[child];if(!part)throw Error('Missing child template '+child);const groupOffset=groups.length;for(const g of part.groups)groups.push({...g,from:g.from+offset,to:g.to+offset});for(const s of part.slots)slots.push({...s,index:s.index+offset,groupIndex:s.groupIndex+groupOffset,groupStart:s.groupStart+offset});offset+=part.size;}
  record={kind:'compound',size:offset,strength:compoundRootStrength,sameSpecies:parameterDefaults.sameSpecies,balanced:parameterDefaults.balanced,rootEvoThresholdKind:parameterDefaults.evoLevelThresholdKind,children,groups,slots};
 }else throw Error('Unknown template class '+type);
 templates[key]={...record,source:location(ctx,n)};return key;
}
const templateObject=unwrap(variable(templateCtx,'trainerPartyTemplates'));
for(const property of templateObject.properties){if(!ts.isPropertyAssignment(property))throw Error('Nonliteral named template');readTemplate(property.initializer,templateCtx,property.name.getText());}
const helperFunctions=declarations(templateCtx);
function thresholdSelector(statements,ctx,key){
 const branches=[];let finalChoice=null;
 for(const stmt of statements){
  if(ts.isVariableStatement(stmt))continue;
  if(ts.isIfStatement(stmt)){
   const condition=unwrap(stmt.expression),body=ts.isBlock(stmt.thenStatement)?stmt.thenStatement.statements:[stmt.thenStatement];
   if(!ts.isBinaryExpression(condition)||condition.operatorToken.kind!==ts.SyntaxKind.LessThanEqualsToken||stmt.elseStatement||body.length!==1||!ts.isReturnStatement(body[0]))return omission(ctx,stmt,key,'Expected wave <= static threshold followed by a template return');
   const left=nameOf(condition.left);if(!['waveIndex','currentBattle.waveIndex'].includes(left))return omission(ctx,stmt,key,'Condition is not the supported wave index');
   branches.push({maxWave:literal(condition.right),choice:readTemplate(body[0].expression,ctx,key+'/branch'+branches.length),source:location(ctx,stmt)});continue;
  }
  if(ts.isReturnStatement(stmt)){finalChoice=readTemplate(stmt.expression,ctx,key+'/default');continue;}
  return omission(ctx,stmt,key,'Unsupported statement in threshold helper');
 }
 if(!finalChoice)return omission(ctx,statements[0],key,'Missing final template return');
 if(branches.some((b,i)=>!Number.isInteger(b.maxWave)||i>0&&b.maxWave<branches[i-1].maxWave))throw Error('Unsorted thresholds');
 return {kind:'thresholds',branches,otherwise:finalChoice};
}
const grunt=helperFunctions.get('getEvilGruntPartyTemplate');
selectors.getEvilGruntPartyTemplate={...thresholdSelector(grunt.body.statements,templateCtx,'selectors.getEvilGruntPartyTemplate'),source:location(templateCtx,grunt)};
const gym=helperFunctions.get('getGymLeaderPartyTemplate');
const gymSwitch=gym.body.statements.find(ts.isSwitchStatement);
if(nameOf(gymSwitch.expression)!=='gameMode.modeId')throw Error('Unexpected gym mode switch');
const classicClause=gymSwitch.caseBlock.clauses.find(c=>ts.isCaseClause(c)&&nameOf(c.expression)==='GameModes.CLASSIC');
selectors.getGymLeaderPartyTemplate={...thresholdSelector(classicClause.statements,templateCtx,'selectors.getGymLeaderPartyTemplate'),source:location(templateCtx,gym),excludedModes:['daily','challenge','endless','spliced-endless']};
const waveHelper=helperFunctions.get('getWavePartyTemplate');
const indexDecl=waveHelper.body.statements.filter(ts.isVariableStatement).flatMap(s=>[...s.declarationList.declarations]).find(d=>ts.isIdentifier(d.name)&&d.name.text==='templateIndex');
const ceil=unwrap(indexDecl.initializer),divide=unwrap(ceil.arguments?.[0]);
if(!ts.isCallExpression(ceil)||nameOf(ceil.expression)!=='Math.ceil'||!ts.isBinaryExpression(divide)||divide.operatorToken.kind!==ts.SyntaxKind.SlashToken)throw Error('Unsupported wave index formula');
const subtract=unwrap(divide.left);
if(!ts.isBinaryExpression(subtract)||subtract.operatorToken.kind!==ts.SyntaxKind.MinusToken||nameOf(subtract.left)!=='wave')throw Error('Unsupported wave subtract formula');
const returnNode=waveHelper.body.statements.find(ts.isReturnStatement),element=unwrap(returnNode.expression),clamp=unwrap(element.argumentExpression);
if(!ts.isElementAccessExpression(element)||nameOf(element.expression)!=='templates'||!ts.isCallExpression(clamp)||nameOf(clamp.expression)!=='Phaser.Math.Clamp'||nameOf(clamp.arguments[0])!=='templateIndex'||literal(clamp.arguments[1])!==0||clamp.arguments[2].getText(templateCtx.sf)!=='templates.length - 1')throw Error('Unsupported wave clamp syntax');
const waveFormula={kind:'clamped-ceil-wave-index',subtract:literal(subtract.right),divisor:literal(divide.right),minimumIndex:0,maximumIndex:'choices.length-1',source:location(templateCtx,waveHelper)};
selectors.getWavePartyTemplate=waveFormula;
let directCallbacks=0,resolvedCallbacks=0;
function callbackSelector(input,ctx,key,countDirect=false){
 if(countDirect)directCallbacks++;
 let n=unwrap(input);
 if(ts.isArrowFunction(n)||ts.isFunctionExpression(n)){
  if(ts.isBlock(n.body)){const statements=n.body.statements;if(statements.length!==1||!ts.isReturnStatement(statements[0]))return omission(ctx,n,key,'Only a direct helper return callback is supported');n=unwrap(statements[0].expression);}else n=unwrap(n.body);
 }
 let helper,args=[];
 if(ts.isIdentifier(n))helper=n.text;
 else if(ts.isCallExpression(n)){helper=nameOf(n.expression);args=[...n.arguments];}
 else return omission(ctx,n,key,'Callback is not a supported helper reference/call');
 let result;
 if(helper==='getWavePartyTemplate'){
  const choices=args.map((a,i)=>readTemplate(a,ctx,key+'/choice'+i));
  if(!choices.length)return omission(ctx,n,key,'Wave selector has no templates');
  result={kind:'wave-index',helper,choices,formula:'getWavePartyTemplate'};
 }else if(helper==='getEvilGruntPartyTemplate'||helper==='getGymLeaderPartyTemplate'){
  if(args.length)return omission(ctx,n,key,'Unexpected arguments to threshold helper');
  result={kind:'helper-thresholds',helper};
 }else return omission(ctx,n,key,'Unknown party template callback helper '+helper);
 if(countDirect)resolvedCallbacks++;return {...result,source:location(ctx,input)};
}
const configClass=configCtx.sf.statements.find(s=>ts.isClassDeclaration(s)&&s.name.text==='TrainerConfig');
const configCtor=configClass.members.find(ts.isConstructorDeclaration);
const defaultAssignment=configCtor.body.statements.find(s=>ts.isExpressionStatement(s)&&ts.isBinaryExpression(s.expression)&&nameOf(s.expression.left)==='this.partyTemplates');
if(!defaultAssignment||!ts.isArrayLiteralExpression(defaultAssignment.expression.right))throw Error('Missing literal constructor template default');
const constructorChoices=defaultAssignment.expression.right.elements.map((n,i)=>readTemplate(n,configCtx,'constructorDefault/'+i));
function directTemplateAction(expression,ctx,key,count=false){
 const n=unwrap(expression);if(!ts.isCallExpression(n)||!ts.isPropertyAccessExpression(n.expression))return null;
 const method=n.expression.name.text;
 if(method==='setPartyTemplates')return {method,choices:n.arguments.map((a,i)=>readTemplate(a,ctx,key+'/choice'+i)),source:location(ctx,n.expression.name)};
 if(method==='setPartyTemplateFunc')return {method,selector:callbackSelector(n.arguments[0],ctx,key,count),source:location(ctx,n.expression.name)};
 return null;
}
for(const method of configClass.members){
 if(!ts.isMethodDeclaration(method)||!method.body)continue;
 const actions=[];
 for(const stmt of method.body.statements)if(ts.isExpressionStatement(stmt)&&ts.isCallExpression(stmt.expression)&&ts.isPropertyAccessExpression(stmt.expression.expression)&&nameOf(stmt.expression.expression.expression)==='this'){
  const action=directTemplateAction(stmt.expression,configCtx,'methodEffects.'+method.name.getText());if(action)actions.push(action);
 }
 if(actions.length)methodEffects[method.name.getText()]={actions,source:location(configCtx,method)};
}
function rangesFor(selector,configChoices){
 const atWave=wave=>{
  if(!selector)return configChoices;
  if(selector.kind==='omitted')return null;
  if(selector.kind==='wave-index')return [selector.choices[Math.min(selector.choices.length-1,Math.max(0,Math.ceil((wave-waveFormula.subtract)/waveFormula.divisor)))]];
  const helper=selectors[selector.helper];if(!helper||helper.kind==='omitted')return null;
  return [helper.branches.find(b=>wave<=b.maxWave)?.choice??helper.otherwise];
 };
 const ranges=[];
 // This enumerates our normalized factual IR, not the original callback AST.
 for(let wave=1;wave<=200;wave++){const choices=atWave(wave),prior=ranges.at(-1);if(prior&&JSON.stringify(prior.choices)===JSON.stringify(choices))prior.to=wave;else ranges.push({from:wave,to:wave,choices});}
 return ranges;
}
const configs=unwrap(variable(configCtx,'trainerConfigs'));
for(const prop of configs.properties){
 if(!ts.isPropertyAssignment(prop)||!ts.isComputedPropertyName(prop.name))throw Error('Unexpected trainer config key');
 const sourceTrainerId=literal(prop.name.expression),enumName=nameOf(prop.name.expression)?.split('.').at(-1);let current=unwrap(prop.initializer);const calls=[];
 while(ts.isCallExpression(current)&&ts.isPropertyAccessExpression(current.expression)){calls.unshift({method:current.expression.name.text,node:current});current=unwrap(current.expression.expression);}
 if(!ts.isNewExpression(current)||nameOf(current.expression)!=='TrainerConfig')throw Error('Unexpected config root '+enumName);
 let configChoices=[...constructorChoices],selector=null;const applied=[];
 for(const call of calls){
  const action=directTemplateAction(call.node,configCtx,'trainers.'+enumName+'.'+call.method,true);
  const effects=action?[action]:(methodEffects[call.method]?.actions||[]);
  for(const effect of effects){if(effect.method==='setPartyTemplates')configChoices=[...effect.choices];else selector=effect.selector;applied.push({...effect,viaMethod:call.method,callSource:location(configCtx,call.node.expression.name)});}
 }
 const ranges=rangesFor(selector,configChoices);
 trainers[sourceTrainerId]={sourceTrainerId,enumName,selection:selector?'wave-function':'uniform-config-choice',selector,configChoices,ranges,status:ranges.some(r=>r.choices===null)?'omitted':'resolved',source:location(configCtx,prop.name),templateCalls:applied};
}
// Remove internal constructor parts from top-level API by retaining them under
// deterministic IDs; all children still have normalized slot/group metadata.
for(const [key,t]of Object.entries(templates))if(t.size!==t.slots.length||t.slots.some((s,i)=>s.index!==i)||t.size<1||t.size>6)throw Error('Invalid flattened template '+key);
for(const trainer of Object.values(trainers)){
 if(trainer.ranges[0].from!==1||trainer.ranges.at(-1).to!==200||trainer.ranges.some((r,i)=>i&&r.from!==trainer.ranges[i-1].to+1))throw Error('Incomplete wave domain '+trainer.enumName);
 for(const range of trainer.ranges)for(const key of range.choices||[])if(!templates[key])throw Error('Missing selected template '+key);
}
const sample=(name,wave)=>{const trainer=Object.values(trainers).find(t=>t.enumName===name);return trainer.ranges.find(r=>r.from<=wave&&wave<=r.to).choices.map(k=>({template:k,size:templates[k].size}));};
if(directCallbacks!==44)throw Error(`Expected 44 direct callback declarations, got ${directCallbacks}`);
if(Object.keys(trainers).length!==272)throw Error('Unexpected trainer count');
if(sample('ACE_TRAINER',20)[0].size!==3||sample('ACE_TRAINER',21)[0].size!==4||sample('BROCK',20)[0].size!==2||sample('BROCK',21)[0].size!==3||sample('BROCK',31)[0].size!==4||sample('BROCK',61)[0].size!==5||sample('BROCK',91)[0].size!==6)throw Error('Template boundary validation failed');
const samples={ace:[20,21,50,51,80,81,110,111].map(wave=>({wave,choices:sample('ACE_TRAINER',wave)})),brock:[20,21,30,31,60,61,90,91].map(wave=>({wave,choices:sample('BROCK',wave)}))};
const data={metadata:{version,upstreamCommit,upstreamRepository:'https://github.com/pagefaultgames/pokerogue',sourceLicense:{code:'AGPL-3.0-only',copyright:'Pagefault Games and contributors',notice:'Static party composition and threshold facts extracted from pinned AGPL-marked source; no independent permissive license or Pokémon asset rights asserted.'},method:'Independent TypeScript AST pattern reader. Original functions, callbacks, constructors, imports, expressions and Phaser APIs are not executed. Wave ranges enumerate only our independently normalized IR.',domain:{mode:'classic',waveFrom:1,waveTo:200,excluded:['daily','challenge','endless','spliced-endless','runtime overrides','challenge modifications']},sources:[...contexts.keys()],enumProvenance:'Numeric enums come from the separately AST-extracted rogue-world-reference.json at the same fixed upstream commit.',counts:{trainerTypes:Object.keys(trainers).length,directTemplateCallbacks:directCallbacks,resolvedDirectCallbacks:resolvedCallbacks,namedTemplates:templateObject.properties.length,allTemplateNodes:Object.keys(templates).length,normalizedRanges:Object.values(trainers).reduce((n,t)=>n+t.ranges.length,0),resolvedTrainers:Object.values(trainers).filter(t=>t.status==='resolved').length,omissions:omissions.length},semantics:{choices:'Preserve order and duplicate entries. uniform-config-choice means choose a config template index uniformly at trainer construction, then retain that index. No RNG draw is executed by this importer.',functionPrecedence:'partyTemplateFunc takes precedence over configChoices; later setPartyTemplates does not clear an existing function.',compound:'slots expose getStrength/getEvoThresholdKind/isSameSpecies/isBalanced per index. rootEvoThresholdKind separately exposes the superclass field used by the generic NPC path; compound root remains NORMAL.',groups:'groupStart preserves sameSpecies group offsets. Slots in one group share its flags and threshold. Compound children are concatenated in source order.',gym:'Classic source has five ranges: <=20, <=30, <=60, <=90, otherwise. Do not fabricate a sixth classic gym stage.',doubleBattles:'This table describes source party templates before battle-variant processing. Trainer.getPartyLevels raises a size-1 double template to size2; named double roster overrides remain separate.',scope:'Template selection/composition only. Does not implement roster callbacks, evolution, movesets, items, battles or trainer AI.'},constructorDefault:{choices:constructorChoices,source:location(configCtx,defaultAssignment)},omissions,samples},enums:{PartyMemberStrength:enums.PartyMemberStrength,EvoLevelThresholdKind:enums.EvoLevelThresholdKind,TrainerType:enums.TrainerType},selectors,methodEffects,templates,trainers};
const output=path.join(project,'data/rogue-trainer-template-rules.json');await fs.writeFile(output,JSON.stringify(data)+'\n');
console.log(JSON.stringify({output,...data.metadata.counts,samples},null,2));
