// Single-generation fixed battle pools from the pinned upstream challenge rules.
import {rogueSeededRandom} from './rogue-seeded-rng.mjs';
import {shiftSourceSeed} from './rogue-mysterious-challengers.mjs';

const grunts=[['ROCKET_GRUNT'],['ROCKET_GRUNT'],['MAGMA_GRUNT','AQUA_GRUNT'],['GALACTIC_GRUNT'],['PLASMA_GRUNT'],['FLARE_GRUNT'],['AETHER_GRUNT','SKULL_GRUNT'],['MACRO_GRUNT'],['STAR_GRUNT']];
const admins=[['PETREL'],['PETREL'],[['TABITHA','COURTNEY'],['MATT','SHELLY']],['JUPITER','MARS','SATURN'],['COLRESS'],['BRYONY','ALIANA','CELOSIA','MABLE'],['FABA','PLUMERIA'],['OLEANA'],['GIACOMO','MELA','ATTICUS','ORTEGA','ERI']];
const admins2=admins.map((p,i)=>i===0||i===1?['PROTON']:i===4?['ZINZOLIN']:p);
const admins3=admins.map((p,i)=>i===0||i===1?['ARCHER','ARIANA']:i===5?['XEROSIC']:p);
const bosses=[['ROCKET_BOSS_GIOVANNI_1'],['ROCKET_BOSS_GIOVANNI_1'],['MAXIE','ARCHIE'],['CYRUS'],['GHETSIS'],['LYSANDRE'],['LUSAMINE','GUZMA'],['ROSE'],['PENNY']];
const rematches=[['ROCKET_BOSS_GIOVANNI_2'],['ROCKET_BOSS_GIOVANNI_2'],['MAXIE_2','ARCHIE_2'],['CYRUS_2'],['GHETSIS_2'],['LYSANDRE_2'],['LUSAMINE_2','GUZMA_2'],['ROSE_2'],['PENNY_2']];
const elite={182:['LORELEI','WILL','SIDNEY','AARON','SHAUNTAL','MALVA',['HALA','MOLAYNE'],['MARNIE_ELITE','BEDE_ELITE'],'RIKA'],184:['BRUNO','KOGA','PHOEBE','BERTHA','MARSHAL','SIEBOLD','OLIVIA','NESSA_ELITE','POPPY'],186:['AGATHA','BRUNO','GLACIA','FLINT','GRIMSLEY','WIKSTROM','ACEROLA',['BEA_ELITE','ALLISTER_ELITE'],'LARRY_ELITE'],188:['LANCE','KAREN','DRAKE','LUCIAN','CAITLIN','DRASNA','KAHILI','RAIHAN_ELITE','HASSEL'],190:['BLUE',['RED','LANCE_CHAMPION'],['STEVEN','WALLACE'],'CYNTHIA',['ALDER','IRIS'],'DIANTHA',['KUKUI','HAU'],['LEON','MUSTARD'],['GEETA','NEMONA']]};
const evil={35:grunts,62:grunts,64:grunts,66:admins,112:grunts,114:admins2,115:bosses,164:admins3,165:rematches};
const pick=(list,rng)=>list.length===1?list[0]:list[Math.floor(rng()*list.length)];
export function classicGenerationChallenge(run){return run.challengeEligibilityRule==='source-subset-v1'?run.challenges?.find(c=>c.id===0)?.value:undefined;}
export function classicGenerationTrainer(run,rng){
 const generation=classicGenerationChallenge(run),index=generation-1;
 if(!Number.isInteger(generation)||generation<1||generation>9)return null;
 if(evil[run.wave]){const local=rogueSeededRandom(shiftSourceSeed(String(run.seed),35<<8),{utf16:true});let selected=pick(evil[run.wave][index],local);if(Array.isArray(selected))selected=pick(selected,local);return selected;}
 if(elite[run.wave]){const options=elite[run.wave].map(value=>Array.isArray(value)?pick(value,rng):value);return options[index];}
 return null;
}
export function classicGenerationBossRewardTiers(run){return classicGenerationChallenge(run)&&run.wave===115?[3,3,2,2,2]:classicGenerationChallenge(run)&&run.wave===165?[3,3,2,2,2,2]:null;}
