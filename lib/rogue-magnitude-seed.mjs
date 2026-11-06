// Phaser RandomDataGenerator's seeded fraction algorithm, adapted from
// Phaser 4.2.1 (MIT), copyright Richard Davey / Phaser Studio Inc.
// See licenses/PHASER-RANDOM-MIT.txt. PokéRogue offsets the run seed by
// wave and by turn << 6, then draws once without advancing battle RNG.
function shiftSeed(seed,offset){let out='';for(let i=0;i<seed.length;i++)out+=String.fromCharCode(seed.charCodeAt(i)+offset);return out;}
function seededFraction(seed){
 let n=0xefc8249d,c=1,s0=0,s1=0,s2=0;
 const hash=data=>{let h;for(let i=0;i<data.length;i++){n+=data.charCodeAt(i);h=0.02519603282416938*n;n=h>>>0;h-=n;h*=n;n=h>>>0;h-=n;n+=h*0x100000000;}return (n>>>0)*2.3283064365386963e-10;};
 s0=hash(' ');s1=hash(' ');s2=hash(' ');s0-=hash(seed);s0+=Number(s0<0);s1-=hash(seed);s1+=Number(s1<0);s2-=hash(seed);s2+=Number(s2<0);
 const rnd=()=>{const t=2091639*s0+c*2.3283064365386963e-10;c=t|0;s0=s1;s1=s2;s2=t-c;return s2;};
 return rnd()+(rnd()*0x200000|0)*1.1102230246251565e-16;
}
export function classicMagnitudeRoll(seed,wave,turn){
 if(typeof seed!=='string'||!seed||!Number.isSafeInteger(wave)||wave<1||!Number.isSafeInteger(turn)||turn<1)return null;
 return Math.floor(seededFraction(shiftSeed(shiftSeed(seed,wave),turn<<6))*100);
}
export function classicMagnitudeResult(seed,wave,turn){
 const roll=classicMagnitudeRoll(seed,wave,turn);if(roll===null)return null;
 const thresholds=[5,15,35,65,85,95],powers=[10,30,50,70,90,110,150];let i=0;while(i<thresholds.length&&roll>=thresholds[i])i++;return {roll,magnitude:i+4,power:powers[i]};
}
