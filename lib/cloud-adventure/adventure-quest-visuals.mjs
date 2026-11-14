import {side85Available,side85Spot,side85LitwickPoint} from './adventure-side85.mjs';
import {side65Available,side65Spot,side65DedennePoint} from './adventure-side65.mjs';
import {side86Visual} from './adventure-side86.mjs';
import {side56Available} from './adventure-side56.mjs';
import {side52Available} from './adventure-side52.mjs';
// Visual-only figures at the existing draft interaction tiles; these never change collision.
export function adventureQuestVisuals(s={}){
 if(s.interior)return [];
 const spots={
  'lumiose-zone12':side52Available(s)&&s.zaZone12PondLower!==true?[{x:16,y:14,tile:'^',color:'#aa8b77',kind:[2,3].includes(s.zaSide52Stage)?'person':'frozen'}]:[],
  'lumiose-centrico-route':[{x:8,y:0,tile:'^',color:'#9b799d'}],
  'lumiose-magenta-street':[{x:7,y:5,tile:'^',color:'#aa8065'},{x:15,y:5,tile:'^',color:'#668bb1'},{x:17,y:5,tile:'^',color:'#a97289'}],
  'lumiose-bleu-sector7':s.zaBleu7Upper||[2,3].includes(s.zaSide45Stage)?[]:[{x:14,y:14,tile:'j',color:'#ac8b56'}],
  'lumiose-saison-canalside':[{x:13,y:11,tile:'^',color:'#6e8ca7'}],
  'lumiose-jaune-sector6':[{x:15,y:11,tile:'^',color:'#ad7098'},...(side56Available(s)&&![2,4].includes(s.zaSide56Stage)?[{x:15,y:12,tile:'j',color:'#b07a69'}]:[]),...(s.zaSide47Stage===1||s.zaSide62Stage===1||s.zaSide87Stage===1?[{x:16,y:11,tile:'^',kind:'dummy'}]:[])],
  'lumiose-rouge-sector5':[{x:15,y:10,tile:'^',color:'#b88967',kind:[2,3].includes(s.zaSide48Stage)?'person':'webbed'}],
 };
 const hole=side86Visual(s),pokemon=[];
 const addPokemon=(position,species,spot,expected)=>{if(!position)return;const [x,y]=position,tile=s.map?.[y]?.[x];if(spot(s,{x,y,tile})===expected)pokemon.push({x,y,tile,kind:'pokemon',species});};
 if(s.district==='lumiose-magenta-sector9'&&side85Available(s))addPokemon(side85LitwickPoint(s),607,side85Spot,'litwick');
 if(s.district==='lumiose-rouge7-roof'&&side65Available(s))addPokemon(side65DedennePoint(s),702,side65Spot,'dedenne');
 return [...(spots[s.district]||[]).filter(p=>s.map?.[p.y]?.[p.x]===p.tile),...(hole?[hole]:[]),...pokemon];
}
