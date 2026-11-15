import {mission26CasesComplete} from './adventure-mission26-cases.mjs';

// The confrontation begins outside Hotel Z. The marker is a 2D approximation.
// https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Legends:_Z-A/Part_21
export function mission26OutsideAvailable(s){return s?.district==='lumiose'&&!s.interior&&s.zaMission26OutdoorReady===true&&s.zaMission26Stage===3&&mission26CasesComplete(s)&&(s.zaMission26Complete===undefined||s.zaMission26Complete===false)&&(s.zaMission26SBCStage===undefined||[0,1,2].includes(s.zaMission26SBCStage));}
export function mission26OutsideSpot(s,spot){return mission26OutsideAvailable(s)&&spot?.tile==='v'&&spot.x===11&&spot.y===7;}

// Original team composition and moves: https://www.serebii.net/pokearth/lumiosecity/vertdistrict.shtml
// Z-A's real-time plus moves are represented as their normal turn-based moves.
export const MISSION26_SBC=[
 {name:'Livia',team:[[303,52],[707,52]],moves:[['Taunt','Iron Head','Crunch','Draining Kiss'],['Dazzling Gleam','Play Rough','Flash Cannon','Metal Sound']]},
 {name:'Gérald',team:[[148,52],[372,52]],moves:[['Thunder Wave','Dragon Rush','Brutal Swing','Breaking Swipe'],['Focus Energy','Zen Headbutt','Dragon Claw','Crunch']]},
 {name:'Lebanne',team:[[715,53],[697,53],[445,53],[691,54]],moves:[['Hurricane','Super Fang','Dragon Pulse','Air Slash'],['Earthquake','Breaking Swipe','Rock Slide','Crunch'],['Earthquake','Swords Dance','Dragon Claw','Iron Head'],['Sludge Bomb','Dragon Pulse','Hydro Pump','Protect']],aceItem:'dragalgite'},
];
