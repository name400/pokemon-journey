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
