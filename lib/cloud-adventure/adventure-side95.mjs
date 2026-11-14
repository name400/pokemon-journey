import {Dex} from '@pkmn/sim';
import {rules} from '../pokemon-config.mjs';
// https://www.thonky.com/pokemon-legends-z-a/side-mission-095-a-haunting-experience
// The existing lift roof approximates the fountain roof; the NPC tile is a 2D draft.
export function side95Available(s={}){return [1,2,3].includes(s.zaSide95Stage)||Number(s.zaMission35Stage)>=1||s.zaMission35Complete===true||s.zaMission37Complete===true||s.zaMission38Complete===true||['A','S'].includes(s.zaRoyaleRank);}
export function side95Spot(s,p){return s?.district==='lumiose-screw-jaune6'&&!s.interior&&p?.tile==='#'&&p.x===2&&p.y===9;}
export function side95GhostTeam(ids,mons){return Array.isArray(ids)&&ids.length>0&&ids.every(id=>{const mon=mons.get(id),key=rules.species[mon?.id]?.key,p=key&&Dex.species.get(key);return !!p?.exists&&p.types.includes('Ghost');});}
