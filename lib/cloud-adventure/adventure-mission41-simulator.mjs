// Mission 41 rematches use the attacks of the earlier Rogue Mega encounters.
// The 3D boss patterns and charged attacks are adapted to ordinary turn-based moves.
// https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Legends:_Z-A/Part_28
// https://www.serebii.net/legendsz-a/roguerematch.shtml
// https://www.serebii.net/legendsz-a/mainmissions/aroguemegahawlucha.shtml
export const MISSION41_SIMULATORS=Object.freeze([
 {species:10279,name:'메가우츠보트',moves:['씨기관총','파워휩','오물폭탄']},
 {species:10300,name:'메가루차불',moves:['깨뜨리다','에어슬래시','플라잉프레스']},
 {species:10049,name:'메가마기라스',moves:['스톤샤워','모래지옥','스톤에지']},
]);

// Null means absent or unrecognized; callers must distinguish legacy from unknown.
export function mission41Choices(s){
 const done=s.zaMission41ChoicesV1;
 if(!Array.isArray(done)||done.length>3||done.length!==(s.zaMission41Sim??0)||new Set(done).size!==done.length||!done.every(i=>Number.isInteger(i)&&i>=0&&i<3))return null;
 return done;
}
