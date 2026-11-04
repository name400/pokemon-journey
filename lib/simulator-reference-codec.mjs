import {Battle,Dex,Pokemon,Side,State} from '@pkmn/sim';

// @pkmn/sim encodes references with constructor.name, but production bundlers
// rename those classes. Its decoder expects these literal public type tags.
// Keep the wire format independent of bundler names, including DataMove/Move.
const kinds=new Map([[Battle,'Battle'],[Side,'Side'],[Pokemon,'Pokemon'],[Dex.Condition,'Condition'],[Dex.Ability,'Ability'],[Dex.Item,'Item'],[Dex.Move,'Move'],[Dex.Species,'Species']]);
const positions='abcdefghijklmnopqrstuvwx';
export function canonicalSimulatorReference(ref){
 if(typeof ref!=='string')return ref;
 if(/^\[[\w$]+:p[1-4][a-x]\]$/.test(ref))return ref.replace(/^\[[\w$]+:/,'[Pokemon:');
 if(/^\[[\w$]+:p[1-4]\]$/.test(ref))return ref.replace(/^\[[\w$]+:/,'[Side:');
 return ref.replace(/^\[DataMove:/,'[Move:');
}
const nativeFromRef=State.fromRef;
State.fromRef=function(ref,battle){return nativeFromRef.call(this,canonicalSimulatorReference(ref),battle);};
State.toRef=function(obj){
 const kind=kinds.get(obj.constructor)||(obj.battle?.field===obj?'Field':null);
 if(!kind)throw Error('지원하지 않는 전투 참조입니다.');
 if(kind==='Battle'||kind==='Field')return '['+kind+']';
 const id=obj instanceof Pokemon?obj.side.id+positions[obj.position]:obj.id;
 return '['+kind+(id?':'+id:'')+']';
};
