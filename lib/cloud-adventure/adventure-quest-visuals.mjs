// Visual-only figures at the existing draft interaction tiles; these never change collision.
export function adventureQuestVisuals(s={}){
 if(s.interior)return [];
 const spots={
  'lumiose-magenta-street':[{x:7,y:5,tile:'^',color:'#aa8065'},{x:15,y:5,tile:'^',color:'#668bb1'},{x:17,y:5,tile:'^',color:'#a97289'}],
  'lumiose-bleu-sector7':s.zaBleu7Upper||[2,3].includes(s.zaSide45Stage)?[]:[{x:14,y:14,tile:'j',color:'#ac8b56'}],
  'lumiose-saison-canalside':[{x:13,y:11,tile:'^',color:'#6e8ca7'}],
  'lumiose-jaune-sector6':[{x:15,y:11,tile:'^',color:'#ad7098'},...(s.zaSide47Stage===1?[{x:16,y:11,tile:'^',kind:'dummy'}]:[])],
  'lumiose-rouge-sector5':[{x:15,y:10,tile:'^',color:'#b88967',kind:[2,3].includes(s.zaSide48Stage)?'person':'webbed'}],
 };
 return (spots[s.district]||[]).filter(p=>s.map?.[p.y]?.[p.x]===p.tile);
}
