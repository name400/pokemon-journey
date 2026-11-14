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
