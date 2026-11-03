// Extract static TM tier and deny-list facts from the pinned source tree.
// No upstream functions are imported or executed.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import ts from 'typescript';
import reference from '../data/rogue-reference.json' with {type:'json'};

const source=path.resolve(process.argv[2]||'work/pokerogue-reference');
const expected=reference.metadata.upstreamCommit;
const commit=execFileSync('git',['-C',source,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(commit!==expected)throw Error('원본 자료의 커밋이 고정된 참조 버전과 다릅니다.');
function declaration(file,name){
 const contents=fs.readFileSync(path.join(source,file),'utf8'),tree=ts.createSourceFile(file,contents,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);let result;
 function visit(node){if(ts.isVariableDeclaration(node)&&node.name.getText(tree)===name)result=node.initializer;ts.forEachChild(node,visit);}visit(tree);
 if(!result)throw Error(name+' 자료를 찾지 못했습니다.');return result;
}
function member(expression,owner){if(!ts.isPropertyAccessExpression(expression)||expression.expression.getText()!==owner)throw Error('지원하지 않는 원본 열거형 구조입니다.');return expression.name.text;}
const object=declaration('src/data/balance/tm-pool-tiers.ts','tmPoolTiers');if(!ts.isObjectLiteralExpression(object))throw Error('기술머신 등급 자료를 확인하세요.');
const tiers={};
for(const property of object.properties){if(!ts.isPropertyAssignment(property)||!ts.isComputedPropertyName(property.name))throw Error('지원하지 않는 기술머신 항목입니다.');const name=member(property.name.expression,'MoveId'),tier=member(property.initializer,'ModifierTier'),id=reference.enums.MoveId[name];if(!Number.isInteger(id)||!['COMMON','GREAT','ULTRA'].includes(tier))throw Error('기술머신 열거형을 확인하세요: '+name);tiers[id]=tier;}
const denied=declaration('src/data/balance/moves/forbidden-moves.ts','FORBIDDEN_TM_MOVES');if(!ts.isNewExpression(denied)||!ts.isArrayLiteralExpression(denied.arguments?.[0]))throw Error('기술머신 제한 목록을 확인하세요.');
const forbidden=denied.arguments[0].elements.map(item=>{const name=member(item,'MoveId'),id=reference.enums.MoveId[name];if(!Number.isInteger(id))throw Error('제한 기술을 확인하세요: '+name);return id;});
function signatures(name){
 const value=declaration('src/data/balance/moves/signature-moves.ts',name);if(!ts.isObjectLiteralExpression(value))throw Error('전용 기술 자료를 확인하세요.');const result={};
 for(const property of value.properties){if(!ts.isPropertyAssignment(property)||!ts.isComputedPropertyName(property.name))throw Error('전용 기술 종 항목을 확인하세요.');const species=member(property.name.expression,'SpeciesId'),id=reference.enums.SpeciesId[species],moves=ts.isArrayLiteralExpression(property.initializer)?property.initializer.elements:[property.initializer];if(!Number.isInteger(id))throw Error('전용 기술 종을 확인하세요: '+species);result[id]=moves.map(move=>{const key=member(move,'MoveId'),number=reference.enums.MoveId[key];if(!Number.isInteger(number))throw Error('전용 기술을 확인하세요: '+key);return number;});}return result;
}
const output={metadata:{upstreamCommit:commit,sourceVersion:reference.metadata.version,sourceFiles:['src/data/balance/tm-pool-tiers.ts','src/data/balance/moves/forbidden-moves.ts','src/data/balance/moves/signature-moves.ts'],license:'AGPL-3.0-only; static facts extracted without executing upstream code'},tiers,forbidden,signatures:signatures('FORCED_SIGNATURE_MOVES'),rivalSignatures:signatures('FORCED_RIVAL_SIGNATURE_MOVES')};
fs.writeFileSync(new URL('../data/rogue-trainer-tms.json',import.meta.url),JSON.stringify(output)+'\n');
