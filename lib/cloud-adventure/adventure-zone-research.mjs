import {adventureDexEntries} from './adventure-dex.mjs';

// Ordinary wild species, excluding optional alphas. Counts are cross-checked
// against the Mable research milestones. Registering the species anywhere is
// sufficient; the existing dex is a historical registration record.
// https://www.serebii.net/legendsz-a/mablesresearch.shtml
// https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-5-guide-all-pokemon-and-alphas
// Nintendo Life's corresponding numbered zone guides list the other species.
export const LATER_ZONE_SPECIES=Object.freeze({
 5:[543,69,659,16,63,17,309],
 6:[427,129,688,228,307,180,333],
 7:[582,449,315,14,670,531,353],
 8:[322,66,529,551,552,443],
 9:[302,64,703,662,303,677],
 10:[79,69,318,602,120,505,24],
 11:[618,692,676,130,79,686],
 12:[673,361,66,67,459,582,712,225],
 13:[666,127,70,214,708,123],
 14:[304,305,529,587,530,95,694],
 15:[710,15,544,545,93,353,246],
 16:[870,308,180,656,689,121,671],
 17:[660,650,668,227,707,608],
 18:[371,333,334,714,715,653],
 19:[115,676,133,531,780,173,35],
 20:[282,448,407,687,691,1,4,7,152,498,158,306,569,560,450],
});
export function laterZoneResearch(s){
 const seen=new Set(adventureDexEntries(s));return Object.entries(LATER_ZONE_SPECIES).map(([zone,ids])=>{const count=ids.filter(id=>seen.has(id)).length;return {zone:Number(zone),count,total:ids.length,points:count===ids.length?1000:0};});
}
