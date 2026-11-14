import test from 'node:test';
import assert from 'node:assert/strict';
import {fixedAlphaAlertKnown,fixedAlphaPlayerThreat,fixedAlphaPlayerNear} from '../lib/cloud-adventure/adventure-fixed-alpha-threat.mjs';
import {playerRecoverySafe} from '../lib/cloud-adventure/adventure-player-vitals.mjs';
import {predictCloudStep} from '../lib/cloud-adventure/adventure-prediction.mjs';
const base={area:3,district:'lumiose-zone17',x:16,y:6,zaZone17Upper:false};
test('fixed alpha threats honor floors, spent records, current occupancy and hidden versions',()=>{
 assert.equal(fixedAlphaPlayerThreat(base)?.id,'pyroar-alpha');assert.ok(fixedAlphaPlayerNear(base));
 assert.equal(fixedAlphaPlayerThreat({...base,zaZone17Upper:true,x:13,y:7})?.id,'mawile-alpha');
 assert.equal(fixedAlphaPlayerThreat({...base,zaZone17Spent:{'pyroar-alpha':true}}),null);
 assert.equal(fixedAlphaPlayerThreat({...base,x:17,y:6}),null);
 assert.equal(fixedAlphaPlayerThreat({...base,zaFixedAlphaAlertV1:{version:2}}),null);
 const opaque={...base,zaFixedAlphaAlertV1:'lumiose-zone17:pyroar-alpha',zaZone17Spent:{version:2}};assert.equal(fixedAlphaAlertKnown(opaque),false);assert.equal(fixedAlphaPlayerThreat(opaque),null);
 assert.equal(fixedAlphaPlayerThreat({...base,district:'lumiose-zone11',zaZone11Upper:true}),null);
 assert.equal(fixedAlphaPlayerThreat({...base,district:'lumiose-zone11',zaZone11Upper:false,x:15,y:5})?.id,'slowbro-alpha');
});
test('alert suspends recovery and blocks movement prediction near a visible alpha',()=>{
 const w={...base,zaFixedAlphaAlertV1:'lumiose-zone17:pyroar-alpha'};
 assert.equal(playerRecoverySafe(w),false);assert.equal(playerRecoverySafe({...w,zaZone17Spent:{'pyroar-alpha':true}}),true);
 assert.equal(predictCloudStep(w,'left'),null);
});

test('reviewed park, forest and substation alphas respect layers, time and unknown data',()=>{
 const park={area:3,district:'lumiose-zone12',x:7,y:7};
 assert.equal(fixedAlphaPlayerThreat(park)?.id,'abomasnow-alpha');
 assert.equal(fixedAlphaPlayerThreat({...park,zaZone12PondLower:true,x:7,y:11})?.id,'avalugg-alpha');
 assert.equal(fixedAlphaPlayerThreat({...park,zaZone12PondLower:'unknown'}),null);
 const forest={area:3,district:'lumiose-zone13',x:12,y:10,zaZone13Period:'day'};
 assert.equal(fixedAlphaPlayerThreat(forest)?.id,'weepinbell-alpha');
 assert.equal(fixedAlphaPlayerThreat({...forest,zaZone13Period:'night',x:10,y:5})?.id,'trevenant-alpha');
 assert.equal(fixedAlphaPlayerThreat({...forest,zaZone13Period:'twilight'}),null);
 const substation={area:3,district:'lumiose-zone14',x:10,y:7};
 assert.equal(fixedAlphaPlayerThreat(substation)?.id,'excadrill-alpha');
 assert.equal(fixedAlphaPlayerThreat({...substation,zaZone14Spent:{'excadrill-alpha':true}}),null);
 assert.equal(fixedAlphaAlertKnown({...substation,zaZone14Spent:{version:2}}),false);
});

test('late fixed alphas use the visible floor, weather cycle and construction location',()=>{
 const zone15={area:3,district:'lumiose-zone15',x:7,y:12,zaZone15Period:'day'};
 assert.equal(fixedAlphaPlayerThreat(zone15)?.id,'beedrill-alpha');
 assert.equal(fixedAlphaPlayerThreat({...zone15,zaZone15Period:'night'})?.id,'banette-alpha');
 assert.equal(fixedAlphaPlayerThreat({...zone15,zaZone15Upper:true}),null);
 assert.equal(fixedAlphaPlayerThreat({...zone15,zaZone15Period:'unknown'}),null);
 const plaza={area:3,district:'lumiose-zone16',x:17,y:2};
 assert.equal(fixedAlphaPlayerThreat(plaza)?.id,'ampharos-alpha');
 assert.equal(fixedAlphaPlayerThreat({...plaza,district:'lumiose-zone16-garden'})?.id,'ampharos-alpha');
 assert.equal(fixedAlphaPlayerThreat({...plaza,zaZone16Upper:true}),null);
 const alley={area:3,district:'lumiose-zone18',x:18,y:5,zaZone18Construction:true};
 assert.equal(fixedAlphaPlayerThreat(alley)?.id,'lopunny-alpha');
 assert.equal(fixedAlphaPlayerThreat({...alley,zaZone18Scaffold:true}),null);
 assert.equal(fixedAlphaPlayerThreat({...alley,zaZone18Upper:true}),null);
 assert.equal(fixedAlphaPlayerThreat({...alley,zaZone18Construction:'unknown'}),null);
 const park={area:3,district:'lumiose-zone19',x:10,y:8,zaZone19Period:'day'};
 assert.equal(fixedAlphaPlayerThreat(park),null);
 assert.equal(fixedAlphaPlayerThreat({...park,zaZone19Period:'night'})?.id,'clefairy-alpha');
 assert.equal(fixedAlphaAlertKnown({...park,zaZone19Spent:{version:2}}),false);
});

test('zone 20 tracks the visible alpha species and each slot independently',async()=>{
 const {unknownZone20AlphaNear}=await import('../lib/cloud-adventure/adventure-fixed-alpha-threat.mjs');
 const s={area:3,district:'lumiose-zone20',x:12,y:7,zaZone20AlphaSpecies:448,zaZone20AlphaSpecies2:26};
 assert.equal(fixedAlphaPlayerThreat(s)?.alertKey,'lumiose-zone20:alpha:448');
 assert.equal(fixedAlphaPlayerThreat({...s,zaZone20Spent:{alpha:true}})?.alertKey,'lumiose-zone20:alpha2:26');
 assert.equal(fixedAlphaPlayerThreat({...s,zaMission42Underground:true}),null);
 assert.equal(fixedAlphaPlayerThreat({...s,zaZone20Spent:{version:2}}),null);
 assert.equal(fixedAlphaPlayerThreat({...s,zaZone20AlphaSpecies:99999,zaZone20Spent:{alpha2:true}}),null);
 assert.equal(fixedAlphaPlayerThreat({...s,x:13,y:7,zaZone20Spent:{alpha2:true}}),null);
 assert.equal(unknownZone20AlphaNear({...s,x:10,y:7,zaZone20AlphaSpecies2:undefined}),true);
 assert.equal(unknownZone20AlphaNear({...s,x:10,y:7,zaZone20AlphaSpecies2:{version:2}}),false);
 assert.equal(unknownZone20AlphaNear({...s,x:9,y:7,zaZone20AlphaSpecies2:undefined}),false);
 assert.equal(predictCloudStep({...s,x:10,y:7,zaZone20AlphaSpecies2:undefined},'left'),null);
});

test('early cemetery and monument alphas respect unlocks and legacy spent flags',()=>{
 const cemetery={area:3,district:'lumiose-zone4',x:3,y:10};
 assert.equal(fixedAlphaPlayerThreat(cemetery),null);
 assert.equal(fixedAlphaPlayerThreat({...cemetery,zaMission05Complete:true})?.id,'spinarak-alpha');
 assert.equal(predictCloudStep({...cemetery,zaMission05Complete:true},'left'),null);
 assert.equal(fixedAlphaPlayerThreat({...cemetery,zaMission05Complete:true,zaZone4AlphaSpent:true}),null);
 assert.equal(fixedAlphaAlertKnown({...cemetery,zaZone4AlphaSpent:{version:2}}),false);
 const monument={area:3,district:'lumiose-zone7',x:10,y:8};
 assert.equal(fixedAlphaPlayerThreat(monument)?.id,'fletchinder-alpha');
 assert.equal(predictCloudStep(monument,'down'),null);
 assert.equal(fixedAlphaPlayerThreat({...monument,zaZone7AlphaSpent:true}),null);
 assert.equal(fixedAlphaPlayerThreat({...monument,x:11,y:8}),null);
 assert.equal(fixedAlphaAlertKnown({...monument,zaZone7Spent:{version:2}}),false);
});

test('random visible alpha identity follows the saved species, cycle and shiny lifetime',async()=>{
 const {randomAlphaPlayerThreat,randomAlphaPlayerNear,randomAlphaAlertKnown,randomAlphaAlertMatches}=await import('../lib/cloud-adventure/adventure-fixed-alpha-threat.mjs');
 const key='zone14:aron:304',s={area:3,district:'lumiose-zone14',x:10,y:3,zaWildVisibleAlphaLevels:{[key]:40},zaWildShinyRolls:{[key]:false},zaWildSpawnCycles:{14:{period:'day',interval:4}}};
 const p=randomAlphaPlayerThreat(s);assert.equal(p.id,'aron');assert.equal(p.alert.cycle,'day:4');assert.equal(randomAlphaPlayerNear(s,p),true);
 const seen={...s,zaRandomAlphaAlertV1:p.alert};assert.equal(randomAlphaAlertMatches(seen,p),true);assert.equal(playerRecoverySafe(seen),false);assert.equal(predictCloudStep(s,'left'),null);
 const refreshed={...seen,zaWildSpawnCycles:{14:{period:'night',interval:5}}};assert.equal(randomAlphaAlertMatches(refreshed,randomAlphaPlayerThreat(refreshed)),false);
 const shiny={...s,zaWildShinyRolls:{[key]:true}},one=randomAlphaPlayerThreat(shiny),later={...shiny,zaRandomAlphaAlertV1:one.alert,zaWildSpawnCycles:{14:{period:'night',interval:5}}};assert.equal(randomAlphaAlertMatches(later,randomAlphaPlayerThreat(later)),true);
 assert.equal(randomAlphaPlayerThreat({...s,zaZone14Spent:{aron:true}}),null);assert.equal(randomAlphaPlayerThreat({...s,x:11,y:3}),null);
 assert.equal(randomAlphaPlayerThreat({...s,zaWildVisibleAlphaLevels:{version:2}}),null);assert.equal(randomAlphaPlayerThreat({...s,zaWildShinyRolls:{version:2}}),null);
 assert.equal(randomAlphaAlertKnown({...s,zaRandomAlphaAlertV1:{version:2,opaque:true}}),false);
});

test('random alphas respect floor and time while excluding ordinary encounters',async()=>{
 const {randomAlphaPlayerThreat}=await import('../lib/cloud-adventure/adventure-fixed-alpha-threat.mjs');
 const key='zone18:swablu:333',s={area:3,district:'lumiose-zone18',x:8,y:7,zaZone18Upper:true,zaZone18Period:'day',zaWildVisibleAlphaLevels:{[key]:57},zaWildShinyRolls:{[key]:true}};
 assert.equal(randomAlphaPlayerThreat(s)?.id,'swablu');assert.equal(randomAlphaPlayerThreat({...s,zaZone18Period:'night'}),null);assert.equal(randomAlphaPlayerThreat({...s,zaZone18Upper:false}),null);
 assert.equal(randomAlphaPlayerThreat({...s,zaWildVisibleAlphaLevels:{}}),null);
});

test('early visible random alphas respect layer and avoid burrow species',async()=>{
 const {randomAlphaPlayerThreat}=await import('../lib/cloud-adventure/adventure-fixed-alpha-threat.mjs');
 const key='zone6:swablu:333',s={area:3,district:'lumiose-zone6',x:8,y:7,zaZone6Layer:'roof',zaZone6Period:'day',zaWildVisibleAlphaLevels:{[key]:40},zaWildShinyRolls:{[key]:true}};
 assert.equal(randomAlphaPlayerThreat(s)?.id,'swablu');assert.equal(randomAlphaPlayerThreat({...s,zaZone6Layer:'ground'}),null);assert.equal(randomAlphaPlayerThreat({...s,zaZone6Layer:'future'}),null);
 const cave={area:3,district:'lumiose-zone8',x:13,y:8,zaWildVisibleAlphaLevels:{'zone8:gible:443':40},zaWildShinyRolls:{'zone8:gible:443':true}};assert.equal(randomAlphaPlayerThreat(cave),null);
 const roof={area:3,district:'lumiose-zone5',x:5,y:3,zaZone5Upper:true,zaWildVisibleAlphaLevels:{'zone5:abra:63':25},zaWildShinyRolls:{'zone5:abra:63':true}};assert.equal(randomAlphaPlayerThreat(roof)?.id,'abra');assert.equal(randomAlphaPlayerThreat({...roof,zaZone5Upper:false}),null);
 const pit={area:3,district:'lumiose-zone10',x:10,y:8,zaZone10LowerBank:true,zaWildVisibleAlphaLevels:{'zone10:carvanha:318':42},zaWildShinyRolls:{'zone10:carvanha:318':true}};assert.equal(randomAlphaPlayerThreat(pit)?.id,'carvanha');assert.equal(randomAlphaPlayerThreat({...pit,zaZone10Upper:true}),null);
});

test('zone 20 ordinary slots participate only when their alpha identity is known',async()=>{
 const {randomAlphaPlayerThreat,randomAlphaPlayerNear}=await import('../lib/cloud-adventure/adventure-fixed-alpha-threat.mjs');
 const key='zone20:bulbasaur:1',s={area:3,district:'lumiose-zone20',x:8,y:10,zaMission42Underground:false,zaZone20AlphaSpecies:448,zaZone20AlphaSpecies2:26,zaWildVisibleAlphaLevels:{[key]:63},zaWildShinyRolls:{[key]:true}};
 assert.equal(randomAlphaPlayerThreat(s)?.id,'bulbasaur');assert.equal(randomAlphaPlayerNear(s),true);
 assert.equal(randomAlphaPlayerThreat({...s,zaMission42Underground:true}),null);
 assert.equal(randomAlphaPlayerThreat({...s,zaZone20Spent:{bulbasaur:true}}),null);
 assert.equal(randomAlphaPlayerThreat({...s,zaWildVisibleAlphaLevels:{version:2}}),null);
 assert.equal(randomAlphaPlayerThreat({...s,x:7,y:10}),null);
});

test('roaming random alphas follow saved positions and preserve their identity',async()=>{
 const {randomAlphaPlayerThreat,randomAlphaAlertMatches}=await import('../lib/cloud-adventure/adventure-fixed-alpha-threat.mjs');
 const key='field3:pancham:674',s={area:3,district:'lumiose-zone3',x:6,y:6,zaMission05Complete:true,zaWildVisibleAlphaLevels:{[key]:19},zaWildShinyRolls:{[key]:true}};
 const p=randomAlphaPlayerThreat(s,'day');assert.equal(p?.id,'pancham');assert.equal(p.alert.cycle,'shiny');assert.equal(randomAlphaAlertMatches({...s,zaRandomAlphaAlertV1:p.alert},p),true);
 assert.equal(randomAlphaPlayerThreat({...s,zaZone3FieldSpent:{pancham:true}},'day'),null);
 assert.equal(randomAlphaPlayerThreat({...s,zaZone3FieldPositions:{version:2}},'day'),null);
 const b='field2:budew:406',lake={area:3,district:'lumiose-zone2',x:8,y:14,zaWildVisibleAlphaLevels:{[b]:17},zaWildShinyRolls:{[b]:true}};
 assert.equal(randomAlphaPlayerThreat(lake,'day')?.id,'budew');assert.equal(randomAlphaPlayerThreat({...lake,zaZone2Budew:{escaped:true}},'day'),null);
 const rat='field2:patrat:504',moving={...lake,x:9,y:8,zaZone2FieldPositions:{patrat:{x:10,y:8}},zaWildVisibleAlphaLevels:{[rat]:18},zaWildShinyRolls:{[rat]:true}};const movingThreat=randomAlphaPlayerThreat(moving,'day');assert.equal(movingThreat?.x,10);assert.equal(movingThreat?.y,8);assert.equal(randomAlphaAlertMatches({...moving,zaRandomAlphaAlertV1:movingThreat.alert},randomAlphaPlayerThreat({...moving,zaZone2FieldPositions:{patrat:{x:11,y:8}}},'day')),true);
 const fish='field2:magikarp:129';assert.equal(randomAlphaPlayerThreat({...lake,zaWildVisibleAlphaLevels:{[fish]:20},zaWildShinyRolls:{[fish]:true}},'day'),null);
 const day='field3:flabebe:669',flower={...s,zaWildVisibleAlphaLevels:{[day]:20},zaWildShinyRolls:{[day]:true}};assert.equal(randomAlphaPlayerThreat(flower,'night'),null);assert.equal(randomAlphaPlayerThreat(flower,'day')?.id,'flabebe');
});

test('zone 19 ordinary random alpha Furfrou is distinct from the sleeping fixed alpha',async()=>{
 const {randomAlphaPlayerThreat,randomAlphaAlertMatches}=await import('../lib/cloud-adventure/adventure-fixed-alpha-threat.mjs');
 const key='zone19:furfrou:676',s={area:3,district:'lumiose-zone19',x:4,y:8,zaZone19Period:'day',zaWildVisibleAlphaLevels:{[key]:60},zaWildShinyRolls:{[key]:true}};
 const p=randomAlphaPlayerThreat(s);assert.equal(p?.id,'furfrou');assert.equal(p?.alert.cycle,'shiny');assert.equal(randomAlphaAlertMatches({...s,zaRandomAlphaAlertV1:p.alert},p),true);
 assert.equal(randomAlphaPlayerThreat({...s,zaZone19Spent:{furfrou:true}}),null);
 assert.equal(randomAlphaPlayerThreat({...s,zaWildVisibleAlphaLevels:{version:2}}),null);
 assert.notEqual(fixedAlphaPlayerThreat({...s,x:10,y:8})?.id,'furfrou-alpha');
});
