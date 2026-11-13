// Serebii associates the alpha unlock with Trevelle's Bunnelby mission.
// Later story flags recover eligibility for saves predating quest tracking.
export function earlyAlphaUnlocked(s){return s?.zaBunnelbyQuest===3||s?.zaMission05Complete===true||s?.zaMission06Started===true;}
