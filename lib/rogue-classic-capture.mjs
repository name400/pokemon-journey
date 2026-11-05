// PokéRogue's pinned Gen-6 shake formula and permanent-dex critical capture.
import {classicBallType} from './rogue-ball-types.mjs';
import {sourceSpeciesFor,rogueReferenceData} from './rogue-reference.mjs';
// Pinned special-species-groups.ts NON_LEGEND_ULTRA_BEASTS. Necrozma,
// Cosmog and their legendary relatives are deliberately not Ultra Beasts.
const ultraBeasts=new Set(['NIHILEGO','BUZZWOLE','PHEROMOSA','XURKITREE','CELESTEELA','KARTANA','GUZZLORD','POIPOLE','NAGANADEL','STAKATAKA','BLACEPHALON'].map(name=>rogueReferenceData.enums.SpeciesId[name]));
export const classicIsUltraBeast=mon=>ultraBeasts.has(sourceSpeciesFor(mon)?.sourceId);
export function classicCaptureOdds(mon,ballId,{caughtSpecies=0,catchingCharms=0}={}){
 const ball=classicBallType(ballId);if(!ball)throw Error('볼 종류를 확인하세요.');const multiplier=ballId==='beastball'&&classicIsUltraBeast(mon)?5:ball.multiplier;
 const status=['slp','frz','잠듦','얼음'].includes(mon.status)?2.5:['psn','tox','par','brn','독','맹독','마비','화상'].includes(mon.status)?1.5:1;
 const value=Math.round((3*mon.maxHp-2*mon.hp)*mon.captureRate*multiplier/(3*mon.maxHp)*status*(mon.shiny?2:1));
 const dex=caughtSpecies>800?2.5:caughtSpecies>600?2:caughtSpecies>400?1.5:caughtSpecies>200?1:caughtSpecies>100?.5:0;
 const threshold=value>0?Math.round(65536/(255/value)**.1875):0;
 return {multiplier,value,threshold,criticalChance:Math.floor((1+catchingCharms)*dex*Math.min(255,Math.max(0,value))/6)};
}
export function attemptClassicCapture(mon,ballId,options={},rng=Math.random){
 const odds=classicCaptureOdds(mon,ballId,options),critical=Math.floor(rng()*256)<odds.criticalChance;
 if(odds.multiplier<0||odds.value>=255)return {...odds,caught:true,critical,shakes:critical?1:3};
 let checks=0,required=critical?1:3;while(checks<required&&Math.floor(rng()*65536)<odds.threshold)checks++;
 // A critical throw visibly shakes once before its single catch check,
 // including when that check fails.
 return {...odds,caught:checks===required,critical,shakes:critical?1:checks};
}
