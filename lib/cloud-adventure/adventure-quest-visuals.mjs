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
  'lumiose-jaune-sector6':[{x:15,y:11,tile:'^',color:'#ad7098'},...(side56Available(s)&&![2,4].includes(s.zaSide56Stage)?[{x:15,y:12,tile:'j',color:'#b07a69'}]:[]),...(s.zaSide47Stage===1||s.zaSide62Stage===1?[{x:16,y:11,tile:'^',kind:'dummy'}]:[])],
  'lumiose-rouge-sector5':[{x:15,y:10,tile:'^',color:'#b88967',kind:[2,3].includes(s.zaSide48Stage)?'person':'webbed'}],
 };
 return (spots[s.district]||[]).filter(p=>s.map?.[p.y]?.[p.x]===p.tile);
}
