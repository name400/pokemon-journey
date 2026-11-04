import {rogueSpecies,sourceSpeciesFor} from './rogue-reference.mjs';

const stats=['hp','atk','def','spa','spd','spe'];
// Compare against the root species, as the source scanner does, without
// creating or altering a dex record for a merely observed wild Pokémon.
export function classicIvScannerReadings(system,foes){return foes.flatMap(mon=>{let species=sourceSpeciesFor(mon);if(!species||!mon?.ivs)return [];const seen=new Set();while(species&&!seen.has(species.sourceId)){seen.add(species.sourceId);const parent=species.preEvolutionId??species.preEvolutionIds?.[0];if(!parent||!rogueSpecies.has(parent))break;species=rogueSpecies.get(parent);}const best=system?.dex?.[species.sourceId]?.ivs||{};if(!stats.every(stat=>Number.isInteger(mon.ivs[stat])&&mon.ivs[stat]>=0&&mon.ivs[stat]<=31))return [];return [{boxId:mon.boxId,name:mon.name,stats:stats.map(stat=>({stat,value:mon.ivs[stat],improved:mon.ivs[stat]>(Number.isInteger(best[stat])?best[stat]:0),perfect:mon.ivs[stat]===31&&mon.ivs[stat]>(Number.isInteger(best[stat])?best[stat]:0)}))}];});}
