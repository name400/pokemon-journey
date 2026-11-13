import {Dex} from '@pkmn/sim';
import {rules} from '../pokemon-config.mjs';
import pokedex from '../../data/pokedex.json' with {type:'json'};

export const RARE_ADVENTURE_BALLS=['fastball','levelball','lureball','heavyball','loveball','friendball','moonball'];
const dexSpecies=mon=>Dex.species.get(rules.species[mon?.id]?.key||'');
const speciesById=new Map(pokedex.map(p=>[p.id,p.speciesId]));
// Old saves can lack speciesId, while form IDs are not always species IDs.
const speciesId=mon=>{const direct=mon?.speciesId;if(Number.isSafeInteger(direct)&&direct>0)return direct;const id=mon?.id,found=speciesById.get(id);return Number.isSafeInteger(found)&&found>0?found:null;};
// Level/Love require a deployed Pokémon in Z-A. Water position is carried by
// the encounter when the field system knows it; unknown positions get no bonus.
export function rareBallContext(mon,lead){
 const target=dexSpecies(mon),active=lead?.hp>0?lead:null;
 return {baseSpeed:target.exists?target.baseStats.spe:mon?.baseSpeed,weightKg:target.exists?target.weightkg:null,moonEvolution:target.exists&&(target.evos||[]).some(name=>Dex.species.get(name).evoItem==='Moon Stone'),inWater:mon?.adventureInWater===true,lead:active?{level:active.level,gender:active.gender,speciesId:speciesId(active)}:null};
}
export function rareBallModifier(id,mon,context={}){
 const {lead}=context;
 if(id==='fastball')return (context.baseSpeed??0)>=100?4:1;
 if(id==='levelball'&&lead&&mon.level>0){const ratio=lead.level/mon.level;return ratio>=4?8:ratio>=2?4:ratio>1?2:1;}
 if(id==='lureball')return context.inWater===true?3.5:1;
 if(id==='loveball'&&lead&&['M','F'].includes(lead.gender)&&['M','F'].includes(mon.gender)&&speciesId(mon)!==null&&lead.speciesId===speciesId(mon)&&lead.gender!==mon.gender)return 8;
 if(id==='moonball')return context.moonEvolution===true?4:1;
 return 1;
}
export function heavyBallRate(base,weight){if(!Number.isFinite(weight))return base;return Math.max(1,Math.min(255,base+(weight<100?-20:weight<200?0:weight<300?20:30)));}
export function adventureAfterCapture(mon,ball,afterCapture){const caught=afterCapture(mon,ball);return ball==='friendball'?{...caught,friendship:150}:caught;}
