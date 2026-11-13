import {zone1RandomAlphaLevel} from './adventure-zone1.mjs';
import {zone2Research} from './adventure-zone2.mjs';
import {zone3Research} from './adventure-zone3.mjs';
import {zone4Research} from './adventure-zone4.mjs';
import {LATER_ZONE_SPECIES} from './adventure-zone-research.mjs';
import {adventureDexEntries} from './adventure-dex.mjs';

// Serebii's zone spawn tables; Binacle's location-dependent ranges are
// approximated by 17–19 until individual spawn locations are represented.
const LEVELS={
 2:{14:[19,20],504:[17,19],688:[17,19],129:[17,19],406:[17,18],120:[17,19]},
 3:{25:[18,20],667:[18,20],669:[17,19],672:[18,20],674:[19,20],677:[19,20]},
 4:{23:[20,22],92:[21,22],167:[19,20],504:[20,21],665:[21,22],679:[22,23]},
 5:{16:[23,25],69:[23,25],504:[23,25],543:[26,27],659:[23,25],661:[23,25]},
 6:{228:[29,30],307:[31,32],427:[29,30]},
 7:{14:[30,31],315:[31,33],353:[31,33],449:[31,33],531:[31,33],582:[30,32],670:[31,33]},
 8:{66:[35,37],322:[34,35],551:[34,35],552:[40,41]},
 9:{64:[39,41],302:[39,41],303:[38,40],662:[38,41],677:[38,40],703:[39,41]},
 10:{79:[41,43],69:[40,42],24:[42,44],505:[41,43]},
 11:{79:[40,41],618:[41,42],676:[40,42]},
 12:{225:[42,45],459:[42,43],361:[42,44],673:[42,44],582:[45,46]},
 13:{123:[47,49],127:[46,48],214:[46,48],708:[46,47],70:[46,47],666:[46,47]},
 14:{304:[38,40],305:[48,49],529:[38,40],530:[48,49],95:[47,49],587:[46,47],694:[47,48]},
 15:{15:[51,52],544:[50,51],545:[52,53],93:[50,51],710:[52,53],353:[50,51]},
 16:{180:[50,51],870:[51,52],308:[50,52],689:[51,53],121:[51,53],671:[52,53]},
 17:{650:[30,35],660:[54,56],707:[54,56],668:[54,57],227:[55,56],608:[55,56]},
 18:{371:[54,55]},
 19:{676:[58,61],531:[60,61],115:[60,61],133:[58,59],780:[59,61],173:[59,60],35:[58,60]},
 20:{306:[63,64],560:[63,65],569:[62,64],1:[62,63],152:[63,64],407:[62,63],282:[62,63],4:[62,63],498:[63,64],450:[63,64],448:[63,64],7:[62,63],158:[63,64],687:[63,64],691:[62,63]},
};
const SURVEYS={2:zone2Research,3:zone3Research,4:zone4Research};
export function randomWildAlphaLevel(s,zone,speciesId,rng=Math.random){
 if(zone===1)return zone1RandomAlphaLevel(s,speciesId,rng);
 const range=LEVELS[zone]?.[speciesId];
 if(!range||!(s?.zaMission05Complete===true||s?.zaMission06Started===true))return null;
 const complete=zone<=4?(()=>{const research=SURVEYS[zone](s);return research.count===research.total;})():(()=>{const seen=new Set(adventureDexEntries(s));return LATER_ZONE_SPECIES[zone].every(id=>seen.has(id));})();
 if(!complete||rng()>=0.05)return null;
 return range[0]+Math.floor(Math.max(0,Math.min(.999999999999,rng()))*(range[1]-range[0]+1));
}
