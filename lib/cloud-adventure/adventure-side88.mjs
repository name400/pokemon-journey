import {makeMon,moves} from '../game.mjs';
import {rougeTaxiUnlocked} from './adventure-fast-travel.mjs';

// Original first ride: Rouge Plaza -> Magenta Pokémon Center, followed by Tesse.
// https://www.serebii.net/legendsz-a/sidemissions/thenervousnovicecabbie.shtml
export function side88Available(s){return rougeTaxiUnlocked(s)&&s?.zaSide88Complete!==true;}
export function side88Origin(s,spot){return side88Available(s)&&!s.interior&&s.district==='lumiose-zone3'&&!s.zaZone3TowerUpper&&spot?.tile==='n'&&spot.x===0&&spot.y===5;}
export function side88Destination(s,spot){return !s.interior&&s.district==='lumiose-magenta-sector8-route'&&[1,2].includes(s.zaSide88Stage)&&spot?.tile==='n'&&spot.x===13&&spot.y===14;}
const names=new Map(Object.values(moves).map(m=>[m.key,m.name]));
const TEAM=[[587,53,['agility','airslash','voltswitch','quickattack']],[530,53,['agility','drillrun','metalclaw','xscissor']],[428,54,['agility','irontail','brutalswing','poweruppunch']]];
export function side88Team(){return TEAM.map(([species,level,keys],i)=>({...makeMon(species,level),boxId:`side88-tesse-${i}`,gender:'F',moves:keys.map(k=>{const name=names.get(k);if(!name)throw Error(`Tesse의 기술을 찾을 수 없습니다: ${k}`);return name;}),pp:{}}));}
