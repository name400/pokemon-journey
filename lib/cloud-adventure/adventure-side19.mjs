// Battle court coordinates are 2D drafts; the original mission is in Vert Sector 3.
// https://www.serebii.net/legendsz-a/sidemissions/poisonous,paralyzingstrategies.shtml
export function side19Available(s={}){return s.zaSide19Started===true||s.zaLidaStage>=2||s.zaMission08Complete===true||['V','F','E','D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side19Spot(s,p){if(s?.district!=='lumiose-vert-sector3'||s.interior||p?.tile!=='^'||p.y!==0)return null;return p.x===5?'venin':p.x===7?'lyse':null;}
export function side19ValidRewards(p){return !!p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).length===5&&Object.keys(p).every(k=>['paralyzeheal','fullheal','potions','balls','coins'].includes(k))&&[['paralyzeheal',1],['fullheal',1],['potions',5],['balls',3],['coins',1200]].every(([k,max])=>Number.isSafeInteger(p[k])&&p[k]>=0&&p[k]<=max)&&(p.coins===0||p.coins===1200);}
