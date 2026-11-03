// Shared by field throws and adventure battles so both use the same rules.
export function adventureCaptureShakes(foe,random){
 const baseRate=foe.captureRate||45,rate=foe.isAlpha?Math.max(3,Math.floor(baseRate*.4)):baseRate,status=foe.status;
 const a=((3*foe.maxHp-2*foe.hp)*rate/(3*foe.maxHp))*(['잠듦','얼음'].includes(status)?2:['독','맹독','화상','마비'].includes(status)?1.5:1);
 const threshold=a>=255?65536:1048560/Math.sqrt(Math.sqrt(16711680/Math.max(.01,a)));
 let shakes=0;while(shakes<4&&Math.floor(random()*65536)<threshold)shakes++;
 return shakes;
}
