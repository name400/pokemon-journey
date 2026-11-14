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
