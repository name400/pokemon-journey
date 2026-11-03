import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import ts from 'typescript';

// Read static facts from a pinned reference checkout. Never import, transpile,
// evaluate, or execute upstream TypeScript or its constructors/functions.
const version='1.12.2.3';
const upstreamCommit='29441f7aa7482d9e816b253d324293788936dc3e';
const project=fileURLToPath(new URL('../',import.meta.url));
const referenceArg=process.argv.indexOf('--reference');
const reference=path.resolve(referenceArg>=0?process.argv[referenceArg+1]:path.join(project,'work/pokerogue-reference'));
const actualCommit=execFileSync('git',['-C',reference,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(actualCommit!==upstreamCommit)throw Error(`Reference must be ${upstreamCommit}; found ${actualCommit}`);

const enums={};
const constants={};
const sourceFiles=new Map();
const unsupported=[];
const excluded={};
const warnings=[];
class NonStatic extends Error {}
async function source(file){if(!sourceFiles.has(file)){const text=await fs.readFile(path.join(reference,file),'utf8');const sf=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true);if(sf.parseDiagnostics.length)throw Error(`TypeScript parse error in ${file}`);sourceFiles.set(file,sf);}return sourceFiles.get(file)}
function unwrap(node){while(node&&(ts.isParenthesizedExpression(node)||ts.isAsExpression(node)||ts.isTypeAssertionExpression(node)||ts.isSatisfiesExpression(node)||ts.isNonNullExpression(node)))node=node.expression;return node;}
function keyOf(node,currentEnum){if(ts.isIdentifier(node)||ts.isStringLiteralLike(node)||ts.isNumericLiteral(node))return node.text;if(ts.isComputedPropertyName(node))return String(readStatic(node.expression,currentEnum));throw new NonStatic('Computed property is not a literal or enum');}
function readStatic(input,currentEnum){const node=unwrap(input);if(!node)throw new NonStatic('Missing initializer');
 if(ts.isStringLiteralLike(node))return node.text;
 if(ts.isNumericLiteral(node))return Number(node.text);
 if(node.kind===ts.SyntaxKind.TrueKeyword)return true;
 if(node.kind===ts.SyntaxKind.FalseKeyword)return false;
 if(node.kind===ts.SyntaxKind.NullKeyword)return null;
 if(ts.isIdentifier(node)){if(Object.hasOwn(constants,node.text))return constants[node.text];if(currentEnum&&Object.hasOwn(currentEnum,node.text))return currentEnum[node.text];throw new NonStatic(`Unknown constant ${node.text}`);}
 if(ts.isPropertyAccessExpression(node)&&ts.isIdentifier(node.expression)){const group=enums[node.expression.text];if(group&&Object.hasOwn(group,node.name.text))return group[node.name.text];throw new NonStatic(`Unknown enum member ${node.expression.text}.${node.name.text}`);}
 if(ts.isPrefixUnaryExpression(node)){const value=readStatic(node.operand,currentEnum);switch(node.operator){case ts.SyntaxKind.MinusToken:return -value;case ts.SyntaxKind.PlusToken:return +value;case ts.SyntaxKind.TildeToken:return ~value;case ts.SyntaxKind.ExclamationToken:return !value;default:throw new NonStatic('Unsupported unary operator');}}
 if(ts.isBinaryExpression(node)){const a=readStatic(node.left,currentEnum),b=readStatic(node.right,currentEnum);switch(node.operatorToken.kind){case ts.SyntaxKind.PlusToken:return a+b;case ts.SyntaxKind.MinusToken:return a-b;case ts.SyntaxKind.AsteriskToken:return a*b;case ts.SyntaxKind.SlashToken:return a/b;case ts.SyntaxKind.PercentToken:return a%b;case ts.SyntaxKind.AsteriskAsteriskToken:return a**b;case ts.SyntaxKind.LessThanLessThanToken:return a<<b;case ts.SyntaxKind.GreaterThanGreaterThanToken:return a>>b;case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken:return a>>>b;case ts.SyntaxKind.BarToken:return a|b;case ts.SyntaxKind.AmpersandToken:return a&b;case ts.SyntaxKind.CaretToken:return a^b;default:throw new NonStatic('Unsupported binary operator');}}
 if(ts.isArrayLiteralExpression(node))return node.elements.map(element=>{if(ts.isSpreadElement(element)||ts.isOmittedExpression(element))throw new NonStatic('Spread or omitted array element');return readStatic(element,currentEnum)});
 if(ts.isObjectLiteralExpression(node)){const result={};for(const prop of node.properties){if(!ts.isPropertyAssignment(prop))throw new NonStatic('Object method/spread/shorthand is excluded');result[keyOf(prop.name,currentEnum)]=readStatic(prop.initializer,currentEnum);}return result;}
 throw new NonStatic(`Excluded expression ${ts.SyntaxKind[node.kind]}`);
}
function walk(node,fn){fn(node);ts.forEachChild(node,child=>walk(child,fn));}
function location(sf,node){return {file:sf.fileName,line:sf.getLineAndCharacterOfPosition(node.getStart(sf)).line+1};}
function omit(sf,node,field,reason){unsupported.push({...location(sf,node),field,kind:ts.SyntaxKind[node.kind],reason});}
function exclude(field,sf,node){excluded[field]??={count:0,example:location(sf,node)};excluded[field].count++;}

// Constructor records are syntax descriptions only. They retain data arguments
// but never instantiate a class or invoke a condition/getter/call expression.
function readDeclarative(input,sf,field){const node=unwrap(input);
 if(ts.isArrowFunction(node)||ts.isFunctionExpression(node)){omit(sf,node,field,'Condition function is not executed or copied');return '__unparsedFunction';}
 if(ts.isNewExpression(node)){const className=ts.isIdentifier(node.expression)?node.expression.text:ts.isPropertyAccessExpression(node.expression)?node.expression.name.text:'__unknownClass';if(node.arguments?.length===1&&ts.isObjectLiteralExpression(unwrap(node.arguments[0])))return {__class:className,...readDeclarative(node.arguments[0],sf,field)};const args=(node.arguments||[]).map((arg,index)=>readDeclarative(arg,sf,`${field}.args[${index}]`));return {__class:className,args};}
 if(ts.isArrayLiteralExpression(node))return node.elements.map((element,index)=>readDeclarative(element,sf,`${field}[${index}]`));
 if(ts.isObjectLiteralExpression(node)){const out={};for(const prop of node.properties){let key;try{key=keyOf(prop.name)}catch{omit(sf,prop,field,'Unresolved object key');continue;}const next=`${field}.${key}`;if(ts.isPropertyAssignment(prop))out[key]=readDeclarative(prop.initializer,sf,next);else{omit(sf,prop,next,'Getter/method/shorthand is not executed');out[key]=ts.isGetAccessorDeclaration(prop)?'__unparsedGetter':'__unparsedFunction';}}return out;}
 try{return readStatic(node)}catch(e){if(!(e instanceof NonStatic))throw e;omit(sf,node,field,e.message);return ts.isCallExpression(node)?'__unparsedCall':'__unparsedExpression';}
}

const enumSources={SpeciesId:'src/enums/species-id.ts',AbilityId:'src/enums/ability-id.ts',MoveId:'src/enums/move-id.ts',PokemonType:'src/enums/pokemon-type.ts',SpeciesFormKey:'src/enums/species-form-key.ts',GrowthRate:'src/data/exp.ts',EggTier:'src/enums/egg-type.ts',EvolutionItem:'src/data/balance/pokemon-evolutions.ts',FormChangeItem:'src/enums/form-change-item.ts',TimeOfDay:'src/enums/time-of-day.ts',Gender:'src/data/gender.ts',WeatherType:'src/enums/weather-type.ts',Nature:'src/enums/nature.ts',BiomeId:'src/enums/biome-id.ts'};
for(const [name,file]of Object.entries(enumSources)){
 const sf=await source(file);let found,constant;
 walk(sf,node=>{if(ts.isEnumDeclaration(node)&&node.name.text===name)found=node;if(ts.isVariableDeclaration(node)&&ts.isIdentifier(node.name)&&node.name.text===name)constant=node;});
 if(!found){if(!constant)throw Error(`Missing enum/constant map ${name}`);enums[name]=readStatic(constant.initializer);continue;}
 const values={};enums[name]=values;let next=0;
 for(const member of found.members){const key=keyOf(member.name,values);const value=member.initializer?readStatic(member.initializer,values):next;if(!['number','string'].includes(typeof value))throw Error(`Invalid ${name}.${key}`);values[key]=value;next=typeof value==='number'?value+1:undefined;if(next===undefined&&!member.initializer)throw Error(`Implicit value after string enum ${name}`);}
}
const speciesNames=Object.fromEntries(Object.entries(enums.SpeciesId).map(([name,id])=>[id,name]));
const evolutionSource=await source('src/data/balance/pokemon-evolutions.ts');
walk(evolutionSource,node=>{if(ts.isVariableDeclaration(node)&&ts.isIdentifier(node.name)&&node.name.text==='EvoCondKey')enums.EvoCondKey=readStatic(node.initializer);});

const constantsSource=await source('src/constants.ts');
let defaultStarterIds;
walk(constantsSource,node=>{if(!ts.isVariableDeclaration(node)||!ts.isIdentifier(node.name))return;const name=node.name.text;if(['EVOLVE_MOVE','RELEARN_MOVE'].includes(name))constants[name]=readStatic(node.initializer);if(name==='defaultStarterSpecies')defaultStarterIds=readStatic(node.initializer);});
if(!Array.isArray(defaultStarterIds)||defaultStarterIds.length!==27)throw Error('Expected 27 baseline starter IDs');
if(constants.EVOLVE_MOVE!==0||constants.RELEARN_MOVE!==-1)throw Error('Unexpected level-move marker constants');
const gameDataSource=await source('src/system/game-data.ts');
const baselineIvValues=new Set();
walk(gameDataSource,node=>{if(!ts.isMethodDeclaration(node)||keyOf(node.name)!=='initDexData')return;walk(node,child=>{if(ts.isBinaryExpression(child)&&child.operatorToken.kind===ts.SyntaxKind.EqualsToken&&ts.isElementAccessExpression(child.left)&&ts.isPropertyAccessExpression(child.left.expression)&&child.left.expression.name.text==='ivs'){try{baselineIvValues.add(readStatic(child.right))}catch{}}});});
if(baselineIvValues.size!==1||!baselineIvValues.has(15))throw Error('Expected baseline starter IV 15');

const constructorFields=new Set(['id','generation','category','type1','type2','height','weight','ability1','ability2','abilityHidden','baseTotal','baseHp','baseAtk','baseDef','baseSpatk','baseSpdef','baseSpd','catchRate','baseFriendship','baseExp','growthRate','malePercent','genderDiffs','canChangeForm','subLegendary','legendary','mythical','formName','formKey','formSpriteKey','isStarterSelectable','isUnobtainable']);
const configFields=new Set(['starter','starterCost','eggTier','passives','levelMoves','tms','formLevelMoves','formTms']);
function objectProperties(node){node=unwrap(node);if(!ts.isObjectLiteralExpression(node))throw new NonStatic('Expected object literal');return node.properties;}
function readFields(node,allowed,sf,prefix,ignored=new Set()){const out={};for(const prop of objectProperties(node)){if(!ts.isPropertyAssignment(prop)){omit(sf,prop,prefix,'Excluded object method/spread');continue;}let key;try{key=keyOf(prop.name)}catch(e){omit(sf,prop,prefix,e.message);continue;}if(ignored.has(key))continue;if(!allowed.has(key)){exclude(`${prefix}.${key}`,sf,prop);continue;}try{out[key]=readStatic(prop.initializer)}catch(e){if(!(e instanceof NonStatic))throw e;omit(sf,prop,`${prefix}.${key}`,e.message);}}return out;}
function describe(fields){const baseStats={hp:fields.baseHp,atk:fields.baseAtk,def:fields.baseDef,spa:fields.baseSpatk,spd:fields.baseSpdef,spe:fields.baseSpd};if(Object.values(baseStats).some(n=>!Number.isFinite(n)))throw Error('Missing static base stat');const result={};for(const key of ['generation','category','formName','formKey','height','weight','baseTotal','catchRate','baseFriendship','baseExp','growthRate','malePercent','genderDiffs','canChangeForm','subLegendary','legendary','mythical','formSpriteKey','isStarterSelectable','isUnobtainable'])if(Object.hasOwn(fields,key))result[key]=fields[key];result.baseStats=baseStats;result.types=[fields.type1,fields.type2].filter(type=>type!==null&&type!==undefined);result.abilities={primary:fields.ability1,secondary:fields.ability2,hidden:fields.abilityHidden};if(Object.values(result.abilities).some(n=>!Number.isFinite(n)))throw Error('Missing static ability ID');return result;}
function constructorObject(node,expected){node=unwrap(node);if(!ts.isNewExpression(node)||!ts.isIdentifier(node.expression)||node.expression.text!==expected||node.arguments?.length!==1)throw new NonStatic(`Expected declarative new ${expected}({...})`);const object=unwrap(node.arguments[0]);if(!ts.isObjectLiteralExpression(object))throw new NonStatic('Constructor parameter is not an object literal');return object;}

const species={};
for(let gen=1;gen<=9;gen++){const sf=await source(`src/data/balance/species/generation-${String(gen).padStart(2,'0')}.ts`);walk(sf,node=>{
 if(!ts.isBinaryExpression(node)||node.operatorToken.kind!==ts.SyntaxKind.EqualsToken||!ts.isElementAccessExpression(node.left)||!ts.isIdentifier(node.left.expression)||!/^generation\w+SpeciesData$/.test(node.left.expression.text)||!ts.isObjectLiteralExpression(node.right))return;
 const props=node.right.properties;const speciesProp=props.find(p=>ts.isPropertyAssignment(p)&&keyOf(p.name)==='species');if(!speciesProp)return;
 const id=readStatic(node.left.argumentExpression);if(!Number.isInteger(id)||!speciesNames[id]||Object.hasOwn(species,id))throw Error(`Invalid or repeated source species ID ${id}`);
 let fields,forms=[];try{const object=constructorObject(speciesProp.initializer,'PokemonSpecies');fields=readFields(object,constructorFields,sf,'species',new Set(['forms']));const formProp=object.properties.find(p=>ts.isPropertyAssignment(p)&&keyOf(p.name)==='forms');if(formProp){const array=unwrap(formProp.initializer);if(!ts.isArrayLiteralExpression(array))omit(sf,formProp,`${id}.forms`,'Forms are not a static array');else for(let index=0;index<array.elements.length;index++){const element=array.elements[index];try{const formFields=readFields(constructorObject(element,'PokemonForm'),constructorFields,sf,'form');forms.push({formIndex:index,...describe(formFields)})}catch(e){if(!(e instanceof NonStatic))throw e;omit(sf,element,`${id}.forms[${index}]`,e.message);}}}}
 catch(e){if(!(e instanceof NonStatic))throw e;omit(sf,speciesProp,`${id}.species`,e.message);return;}
 if(fields.id!==id)throw Error(`Species key/id mismatch ${id}/${fields.id}`);
 const config=readFields(node.right,configFields,sf,`species.${id}`,new Set(['species','evolutions','formChanges']));const passiveMap=typeof config.passives==='number'?{'0':config.passives}:config.passives||{};
 const record={sourceId:id,enumName:speciesNames[id],...describe(fields),starterId:config.starter,isStarter:Object.hasOwn(config,'starterCost'),...Object.fromEntries(['starterCost','eggTier','levelMoves','tms','formLevelMoves','formTms'].filter(key=>Object.hasOwn(config,key)).map(key=>[key,config[key]])),passiveAbilityMode:typeof config.passives==='number'?'all-forms':'by-form',passiveAbilityIdsByForm:passiveMap,forms};
 if(Object.hasOwn(passiveMap,'0'))record.passiveAbilityId=passiveMap['0'];
 for(const form of forms){if(record.passiveAbilityMode==='all-forms')form.passiveAbilityId=config.passives;else if(Object.hasOwn(passiveMap,String(form.formIndex)))form.passiveAbilityId=passiveMap[String(form.formIndex)];}
 for(const field of ['evolutions','formChanges']){const prop=props.find(p=>ts.isPropertyAssignment(p)&&keyOf(p.name)===field);if(prop)record[field]=readDeclarative(prop.initializer,sf,`species.${id}.${field}`);}
 species[id]=record;
 });}

const eggSource=await source('src/data/balance/moves/egg-moves.ts');let eggMovesByStarter;
walk(eggSource,node=>{if(ts.isVariableDeclaration(node)&&ts.isIdentifier(node.name)&&node.name.text==='speciesEggMoves')eggMovesByStarter=readStatic(node.initializer);});
if(!eggMovesByStarter)throw Error('Missing static egg move table');
for(const record of Object.values(species)){const family=species[record.starterId];if(!family?.isStarter)throw Error(`Missing starter template for ${record.sourceId}: ${record.starterId}`);record.familyStarterCost=family.starterCost;record.selectableStarterId=record.isStarter?record.sourceId:record.starterId;record.eggMoves=eggMovesByStarter[record.sourceId]||[];if(Object.hasOwn(eggMovesByStarter,record.sourceId))record.eggMovesSourceId=record.sourceId;record.familyEggMoves=eggMovesByStarter[record.starterId]||[];if(Object.hasOwn(eggMovesByStarter,record.starterId))record.familyEggMovesSourceId=record.starterId;
 const sum=Object.values(record.baseStats).reduce((a,b)=>a+b,0);if(sum!==record.baseTotal)warnings.push({sourceId:record.sourceId,field:'baseTotal',declared:record.baseTotal,sum});for(const form of record.forms){const total=Object.values(form.baseStats).reduce((a,b)=>a+b,0);if(total!==form.baseTotal)warnings.push({sourceId:record.sourceId,formIndex:form.formIndex,field:'baseTotal',declared:form.baseTotal,sum:total});}}

let evolutionEdges=0;
const parents=new Map();
for(const record of Object.values(species))for(const evolution of record.evolutions||[]){if(Number.isInteger(evolution.speciesId)){if(!species[evolution.speciesId])throw Error(`Evolution target missing: ${record.sourceId}->${evolution.speciesId}`);parents.set(evolution.speciesId,new Set([...(parents.get(evolution.speciesId)||[]),record.sourceId]));evolutionEdges++;}}
for(const record of Object.values(species)){record.preEvolutionIds=[...(parents.get(record.sourceId)||[])].sort((a,b)=>a-b);if(record.preEvolutionIds.length===1)record.preEvolutionId=record.preEvolutionIds[0];}

const starterRows=Object.values(species).filter(s=>s.isStarter),formRows=Object.values(species).flatMap(s=>s.forms);
const data={metadata:{version,upstreamCommit,upstreamRepository:'https://github.com/pagefaultgames/pokerogue',sourceLicense:{code:'AGPL-3.0-only',copyright:'Pagefault Games and contributors; retain applicable upstream notices when reusing',notice:'Static game mechanics/balance data extracted from AGPL-marked source. Extraction does not imply a separate permissive data license or grant Pokémon artwork/trademark rights.',method:'Independent TypeScript AST literal/enum reader; no upstream TypeScript, constructors, functions or conditions were executed.'},defaultStarterIds,defaultStarterIvs:15,counts:{species:Object.keys(species).length,explicitForms:formRows.length,starterRows:starterRows.length,eggMoveRows:Object.keys(eggMovesByStarter).length,defaultStarters:defaultStarterIds.length,evolutionEdges,formChanges:Object.values(species).reduce((n,s)=>n+(s.formChanges?.length||0),0)},sources:[...sourceFiles.keys()].sort(),fieldSemantics:{ids:'All IDs are original upstream IDs; regional IDs are not PokeAPI IDs.',enums:'Name-to-original-value maps. PokemonType starts at Normal=0; UNKNOWN=-1.',forms:'forms[] preserves explicit source array indices and only explicitly declared flags. Empty array means use the base species record. Upstream PokemonForm constructor defaults isStarterSelectable to explicit value ?? !formKey; this exporter does not apply constructor defaults.',starterCost:'Present only on source starter rows. starterId is the raw declared family reference, not getStarter() method return. selectableStarterId is sourceId for selectable starters, otherwise declared starterId. Pikachu25 is separately selectable despite declared starterId172; do not collapse selected starter upgrade records. familyStarterCost is only a raw-reference convenience.',passives:'passiveAbilityMode distinguishes scalar all-forms from indexed by-form source data. passiveAbilityIdsByForm preserves original numeric formIndex keys (scalar at key 0); forms[].passiveAbilityId reflects this literal mode without executing upstream behavior.',moves:'levelMoves/TMs/form-specific lists remain raw source declarations; prevolution inheritance and learnset composition are not executed. EVOLVE_MOVE=0; RELEARN_MOVE=-1.',eggMoves:'Only the direct source starter table row; empty means no own row. familyEggMoves is a separate declared-family lookup and does not imply starter-select eligibility. Pikachu25 has no own egg moves in starter selection even though family Pichu172 has a row.'},omissions:{excludedFields:excluded,unsupportedFields:unsupported,notes:['Evolution/form-change constructors are descriptive records (__class + static fields/args), never instantiated. Condition functions/calls/getters are markers with source locations.','No upstream registry initialization, default-constructor behavior, conditions, or move-list inheritance is executed.','preEvolutionIds/optional preEvolutionId are derived from all literal evolution target IDs; branch conditions are not evaluated.','Minun312.tms uses an upstream filter callback, so it is omitted and recorded rather than executed.','Raw static facts do not implement modifier stacks, passive hooks, transformations, boss shields, or combat rules.']},warnings},enums,species};

const bulba=species[enums.SpeciesId.BULBASAUR];if(bulba.baseTotal!==318||bulba.starterCost!==3||bulba.passiveAbilityId!==enums.AbilityId.GRASSY_SURGE)throw Error('Bulbasaur reference assertion failed');
const charizard=species[enums.SpeciesId.CHARIZARD],gmax=charizard.forms.find(f=>f.formKey===enums.SpeciesFormKey.GIGANTAMAX);if(gmax?.baseTotal!==634||gmax.abilities.primary!==enums.AbilityId.BERSERK||gmax.baseStats.hp!==118)throw Error('G-Max Charizard reference assertion failed');
if(starterRows.length!==572||Object.keys(species).length!==1084||defaultStarterIds.some(id=>!species[id]?.isStarter))throw Error('Pinned species/starter counts changed');
if(starterRows.some(s=>!Number.isInteger(s.starterCost)||s.starterCost<1||s.starterCost>10))throw Error('Invalid starter cost range');
const moveIds=new Set(Object.values(enums.MoveId));
for(const record of Object.values(species)){for(const [level,moveId]of record.levelMoves||[])if(!Number.isInteger(level)||!moveIds.has(moveId))throw Error(`Invalid level move for ${record.sourceId}`);for(const moveId of [...(record.tms||[]),...(record.eggMoves||[])])if(!moveIds.has(moveId))throw Error(`Invalid move ID for ${record.sourceId}`);}
const target=path.join(project,'data/rogue-reference.json');await fs.writeFile(target,JSON.stringify(data)+'\n');
console.log(JSON.stringify({output:target,version,upstreamCommit,...data.metadata.counts,unsupportedFields:unsupported.length,excludedFields:excluded,warnings:warnings.length,examples:{bulbasaur:{sourceId:bulba.sourceId,cost:bulba.starterCost,baseTotal:bulba.baseTotal,passive:bulba.passiveAbilityId},charizardGmax:{baseTotal:gmax.baseTotal,baseStats:gmax.baseStats,primaryAbility:gmax.abilities.primary}}},null,2));
