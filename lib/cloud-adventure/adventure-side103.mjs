// https://www.serebii.net/legendsz-a/sidemissions/facingthefurfrouleague.shtml
// Restaurant/café coordinates are provisional placements in existing 2D maps.
export const SIDE103_OPPONENTS=Object.freeze({
 brill:{name:'Brill',bit:1,district:'lumiose-vert-sector6',interior:'leNah',x:16,y:6,tile:'.',run:'zaLeNahRun',trim:'star',moves:['Surf','Tail Whip','Bite','Growl']},
 diamant:{name:'Diamant',bit:2,district:'lumiose-rouge-sector3',interior:'leYeah',x:16,y:6,tile:'.',run:'zaLeYeahRun',trim:'diamond',moves:['Protect','Dig','Iron Tail','Rock Smash']},
 marta:{name:'Marta',bit:4,district:'lumiose-rouge-sector2',interior:'leWow',x:16,y:6,tile:'.',run:'zaLeWowRun',trim:'matron',moves:['Thunder Wave','Substitute','U-turn','Double-Edge']},
 mie:{name:'Mie',bit:8,district:'lumiose-rouge-north',interior:'sushi',x:5,y:6,tile:'.',run:'zaSushiRun',trim:'kabuki',moves:['Work Up','Snarl','Hyper Voice','Roar']},
 champion:{name:'Soignée',bit:0,district:'lumiose-vernal',interior:null,x:14,y:6,tile:',',trim:null,moves:[]},
});
export function side103Available(s={}){return [1,2,3].includes(s.zaSide103Stage)||(s.zaSide62Stage===3&&(Number(s.zaMission35Stage)>=7||s.zaMission35Complete===true||s.zaMission37Complete===true||s.zaMission38Complete===true||['A','S'].includes(s.zaRoyaleRank)));}
export function side103Wins(s){return Number.isSafeInteger(s?.zaSide103WinsV1)&&s.zaSide103WinsV1>=0&&s.zaSide103WinsV1<=15?s.zaSide103WinsV1:null;}
export function side103Spot(s,p){if(![1,2].includes(s?.zaSide103Stage)||side103Wins(s)===null)return null;for(const [id,v] of Object.entries(SIDE103_OPPONENTS)){if(s.district===v.district&&(s.interior||null)===v.interior&&p?.x===v.x&&p.y===v.y&&p.tile===v.tile&&(!v.run||!s[v.run])&&(id!=='champion'||side103Wins(s)===15&&!s.zaVernalEastRoof&&!s.zaVernalSlowbroBank))return id;}return null;}
export function side103Team(ids,mons){return Array.isArray(ids)&&ids.length>0&&ids.every(id=>{const m=mons.get(id);return m?.id===676&&m.speciesId===676&&!m.fusionSpecies&&!m.rogueFusion;});}
export const SIDE103_CHAMPION_MOVES=Object.freeze([
 ['Thunder Wave','Charm','Rock Smash','Bite'],['Iron Tail','Roar','Endure','Work Up'],['Protect','Headbutt','Tackle','Charm'],['Cotton Guard','Dark Pulse','Snarl','Thunder Wave'],['Work Up','Take Down','Wild Charge','Double-Edge'],['Giga Impact','Zen Headbutt','Iron Tail','U-turn'],
]);
