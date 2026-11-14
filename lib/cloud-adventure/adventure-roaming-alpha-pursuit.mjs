import {ZONE2_FIELD_SPECIES,ZONE3_FIELD_SPECIES,lumioseZone2Map,lumioseZone3Map,zone2FieldMonsters,zone2BudewPosition,zone2KakunaPosition,zone3FieldMonsters} from './adventure-world.mjs';

// Return null for unsupported encounters, false when blocked, true after one
// tile. Existing populations and terrain restrictions remain authoritative.
export function stepRoamingAlphaPursuit(s,threat,period){
 const zone=s?.district==='lumiose-zone2'?2:s?.district==='lumiose-zone3'?3:0;
 if(!zone||!threat||!['day','night'].includes(period))return null;
 const zone3Base=ZONE3_FIELD_SPECIES.find(p=>p.id===threat.id&&p.speciesId===threat.species);
 const alphaLevel=s.zaWildVisibleAlphaLevels?.[`field3:${threat.id}:${threat.species}`];
 const zone3ContactAlpha=zone3Base?.reaction==='contact'&&Number.isInteger(alphaLevel)&&alphaLevel>=1&&alphaLevel<=100;
 if(zone===2&&!(threat.species===504&&['patrat','patrat2'].includes(threat.id))||zone===3&&!(threat.species===677&&threat.id==='espurr'||zone3ContactAlpha))return null;
 const field=zone===2?'zaZone2FieldPositions':'zaZone3FieldPositions',positions=s[field];
 if(positions!==undefined&&(!positions||typeof positions!=='object'||Array.isArray(positions)||Object.hasOwn(positions,'version')))return false;
 const saved=positions?.[threat.id],keys=zone===2?['x','y']:['x','y','alert'];
 if(saved!==undefined&&(!saved||typeof saved!=='object'||Array.isArray(saved)||Object.keys(saved).some(k=>!keys.includes(k))||!Number.isInteger(saved.x)||!Number.isInteger(saved.y)||saved.alert!==undefined&&(!Number.isInteger(saved.alert)||saved.alert<0)))return false;
 const map=zone===2?lumioseZone2Map(s):lumioseZone3Map(s),visible=zone===2?zone2FieldMonsters(s,period,map):zone3FieldMonsters(s,period),current=visible.find(p=>p.id===threat.id&&p.speciesId===threat.species);
 if(!current||current.x!==threat.x||current.y!==threat.y)return false;
 const base=zone===2?ZONE2_FIELD_SPECIES.find(p=>p.id===threat.id):null,d=(x,y)=>Math.abs(x-s.x)+Math.abs(y-s.y),other=zone===2?[...visible,zone2BudewPosition(s),zone2KakunaPosition(s)]:visible;
 const candidates=[[current.x+1,current.y],[current.x,current.y+1],[current.x-1,current.y],[current.x,current.y-1]].filter(([x,y])=>map[y]?.[x]==='g'&&d(x,y)>0&&d(x,y)<d(current.x,current.y)&&(zone===2?Math.abs(x-base.x)+Math.abs(y-base.y)<=3:zone3Base?.reaction==='contact'?Math.abs(x-zone3Base.x)+Math.abs(y-zone3Base.y)<=3:x>=13&&x<=16&&y>=4&&y<=8)&&!other.some(p=>p&&p.id!==current.id&&p.x===x&&p.y===y));
 if(!candidates.length)return false;
 const [x,y]=candidates[0];s[field]={...(positions||{}),[current.id]:{...(saved||{}),x,y}};return true;
}
