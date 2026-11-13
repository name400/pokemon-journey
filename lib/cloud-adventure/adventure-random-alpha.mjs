import {zone1RandomAlphaLevel} from './adventure-zone1.mjs';
import {zone2Research} from './adventure-zone2.mjs';
import {zone3Research} from './adventure-zone3.mjs';
import {zone4Research} from './adventure-zone4.mjs';

// Serebii's zone spawn tables; Binacle's location-dependent ranges are
// approximated by 17–19 until individual spawn locations are represented.
const LEVELS={
 2:{14:[19,20],504:[17,19],688:[17,19],129:[17,19],406:[17,18],120:[17,19]},
 3:{25:[18,20],667:[18,20],669:[17,19],672:[18,20],674:[19,20],677:[19,20]},
 4:{23:[20,22],92:[21,22],167:[19,20],504:[20,21],665:[21,22],679:[22,23]},
};
const SURVEYS={2:zone2Research,3:zone3Research,4:zone4Research};
export function randomWildAlphaLevel(s,zone,speciesId,rng=Math.random){
 if(zone===1)return zone1RandomAlphaLevel(s,speciesId,rng);
 const range=LEVELS[zone]?.[speciesId];
 if(!range||!(s?.zaMission05Complete===true||s?.zaMission06Started===true))return null;
 const research=SURVEYS[zone](s);
 if(research.count!==research.total||rng()>=0.05)return null;
 return range[0]+Math.floor(Math.max(0,Math.min(.999999999999,rng()))*(range[1]-range[0]+1));
}
