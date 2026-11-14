// Size brackets: https://www.serebii.net/legendsz-a/pokemonsize.shtml
// Temporary catch-only scope: these families are needed by side missions 63 and 113.
const MEASURED_FAMILIES=new Set([672,673,712,713]);
export function adventurePokemonSize(mon){
 if(mon?.adventureAlpha===true)return 'XL';
 const v=mon?.adventureScaleV1;
 if(!v||typeof v!=='object'||Array.isArray(v)||v.version!==1||!Number.isInteger(v.scale)||v.scale<0||v.scale>255||Object.keys(v).length!==2)return null;
 return v.scale<16?'XS':v.scale<48?'S':v.scale<208?'M':v.scale<240?'L':'XL';
}
export function assignAdventureCapturedSize(mon,rng=Math.random){
 if(!mon||mon.adventureAlpha===true||!MEASURED_FAMILIES.has(mon.speciesId)||Object.hasOwn(mon,'adventureScaleV1'))return mon;
 // Pokébip reports the usual two-roll triangular distribution for Z-A.
 // Exact spawn timing and the original generation process remain unverified.
 const a=rng(),b=rng();if(!Number.isFinite(a)||a<0||a>=1||!Number.isFinite(b)||b<0||b>=1)throw Error('포켓몬의 크기를 결정할 수 없습니다.');
 return {...mon,adventureScaleV1:{version:1,scale:Math.floor(a*128)+Math.floor(b*129)}};
}

// Only these two visible slots currently persist their pre-capture size.
const VISIBLE_SIZE_SPECIES=Object.freeze({'zone12:gogoat:673':673,'zone12:bergmite:712':712});
function visibleSizeLedger(world){const v=world?.zaWildSizeRollsV1;return !!v&&typeof v==='object'&&!Array.isArray(v)&&v.version===1&&Object.keys(v).length===2&&v.entries&&typeof v.entries==='object'&&!Array.isArray(v.entries);}
export function visibleAdventureSize(world,key){
 if(!Object.hasOwn(VISIBLE_SIZE_SPECIES,key)||!visibleSizeLedger(world))return null;
 const v=world.zaWildSizeRollsV1.entries[key];return adventurePokemonSize({adventureScaleV1:v})?v:null;
}
export function assignVisibleAdventureSize(world,key,rng=Math.random){
 if(!Object.hasOwn(VISIBLE_SIZE_SPECIES,key)||world.zaWildSizeRollsV1!==undefined&&!visibleSizeLedger(world))return false;
 const ledger=world.zaWildSizeRollsV1??{version:1,entries:{}};
 // Unknown future entries must survive even when this slot respawns.
 if(Object.hasOwn(ledger.entries,key))return false;
 const m=assignAdventureCapturedSize({speciesId:VISIBLE_SIZE_SPECIES[key]},rng);
 world.zaWildSizeRollsV1={version:1,entries:{...ledger.entries,[key]:m.adventureScaleV1}};return true;
}
export function clearVisibleAdventureSize(world,key){
 if(!visibleSizeLedger(world)||!visibleAdventureSize(world,key))return;
 const entries={...world.zaWildSizeRollsV1.entries};delete entries[key];world.zaWildSizeRollsV1={version:1,entries};
}
export function attachVisibleAdventureSize(world,mon,key){
 if(!mon||mon.adventureAlpha===true||mon.speciesId!==VISIBLE_SIZE_SPECIES[key]||Object.hasOwn(mon,'adventureScaleV1'))return mon;
 const v=visibleAdventureSize(world,key);if(v)mon.adventureScaleV1={...v};return mon;
}
