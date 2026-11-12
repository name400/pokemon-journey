import {makeMon} from '../game.mjs';
import {configure,rules,statKeys} from '../pokemon-config.mjs';
// The original opens this request after the rogue Mega incidents are revealed.
// Later progress is accepted for saves created before this quest was added.
export function side27Available(s){return Number(s?.zaMission10Stage)>=10||s?.zaMission10Complete===true||s?.zaMission11Complete===true||s?.zaMission37Complete===true||s?.zaMission38Complete===true||['E','D','C','B','A','S'].includes(s?.zaRoyaleRank);}
// Initial stock opens with the shop; the later stones are available after the main story.
export const EVOLUTION_STONES=Object.freeze({firestone:'불꽃의돌',waterstone:'물의돌',thunderstone:'천둥의돌',leafstone:'리프의돌',sunstone:'태양의돌',moonstone:'달의돌',shinystone:'빛의돌',duskstone:'어둠의돌',dawnstone:'각성의돌',icestone:'얼음의돌'});
export function stoneShopStock(s){if(!side27Available(s))return [];const postgame=s?.zaMission37Complete===true||s?.zaMission38Complete===true;return Object.entries(EVOLUTION_STONES).filter(([item])=>postgame||['firestone','waterstone','thunderstone','leafstone'].includes(item));}
export const FOSSILS=Object.freeze({jaw:{item:'jawfossil',name:'턱화석',species:696,price:20000},sail:{item:'sailfossil',name:'지느러미화석',species:698,price:20000},amber:{item:'oldamber',name:'비밀의호박',species:142,price:30000}});
export function side27Reg(s,p){return s?.district==='lumiose-floral'&&s.interior==='lumioseLab2'&&p?.tile==='n'&&p.x===7&&p.y===7;}
export function side27Shop(s,p){return s?.district==='lumiose-vernal'&&!s.interior&&!s.zaVernalSlowbroBank&&!s.zaVernalEastRoof&&p?.tile==='t'&&p.x===9&&p.y===3;}

// Fossils use one base-rate shiny roll even when the Shiny Charm is owned.
// https://rotomlabs.net/legends-z-a/shiny-rates
export function reviveFossilPokemon(species,random=Math.random){
 const roll=()=>{const n=random();if(!Number.isFinite(n)||n<0||n>=1)throw Error('화석 복원 난수를 확인하세요.');return n;};
 const ivs=Object.fromEntries(statKeys.map(k=>[k,Math.floor(roll()*32)]));
 const natures=Object.keys(rules.natures),nature=natures[Math.floor(roll()*natures.length)],shiny=roll()<1/4096;
 return configure({...makeMon(species,20),ivs,nature,shiny});
}
