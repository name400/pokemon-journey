import fs from 'node:fs';
import ts from 'typescript';
import world from '../data/rogue-world-reference.json' with {type:'json'};
const [singlePath,doublePath]=process.argv.slice(2);
if(!singlePath||!doublePath)throw Error('Pass the extracted source dialogue.ts and double-battle-dialogue.ts paths.');
function declaration(path,name){
 const file=ts.createSourceFile(path,fs.readFileSync(path,'utf8'),ts.ScriptTarget.Latest,true);
 let value;const visit=node=>{if(ts.isVariableDeclaration(node)&&node.name.getText(file)===name)value=node.initializer;ts.forEachChild(node,visit);};visit(file);
 if(!value||!ts.isObjectLiteralExpression(value))throw Error('Missing literal source declaration: '+name);return value;
}
function phases(node){
 if(!ts.isObjectLiteralExpression(node))throw Error('Expected a message object');
 return Object.fromEntries(node.properties.map(property=>{
  if(!ts.isPropertyAssignment(property))throw Error('Unsupported message property');
  const key=property.name.text,value=property.initializer;
  if(!['encounter','victory','defeat'].includes(key))throw Error('Unknown phase: '+key);
  const list=ts.isArrayLiteralExpression(value)?value.elements:[value];
  return [key,Array.from(list,message=>{if(!ts.isStringLiteral(message))throw Error('Message must be a literal reference');return message.text;})];
 }));
}
const trainers={},doubles={};
for(const property of declaration(singlePath,'trainerTypeDialogue').properties){
 if(!ts.isPropertyAssignment(property)||!ts.isComputedPropertyName(property.name)||!ts.isPropertyAccessExpression(property.name.expression))throw Error('Unexpected trainer key');
 const name=property.name.expression.name.text,id=world.enums.TrainerType[name];
 if(!Number.isInteger(id))throw Error('Unknown trainer enum: '+name);
 const value=property.initializer;
 trainers[id]=ts.isArrayLiteralExpression(value)?Array.from(value.elements,phases):[phases(value)];
}
for(const property of declaration(doublePath,'doubleBattleDialogue').properties){
 if(!ts.isPropertyAssignment(property))throw Error('Unsupported double dialogue property');
 doubles[property.name.text]=phases(property.initializer);
}
const result={source:{zipSha256:'96051486E0198CDC6F7C63436D87531D4802AE1C147715EDEED77734303B76A9',localeCommit:'616cf3eb6b1b15e48784ff138ca7748ea63ed258'},trainers,doubles};
fs.writeFileSync(new URL('../data/rogue-trainer-dialogue-index.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log('Indexed source trainers:',Object.keys(trainers).length,'double dialogues:',Object.keys(doubles).length);
