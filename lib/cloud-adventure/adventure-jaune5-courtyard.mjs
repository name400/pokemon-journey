// The two ground items are documented in the large courtyard; exact 2D tiles are drafts.
// https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/jaune-sector-5.html
export const JAUNE5_COURT_ITEMS=Object.freeze([
 {id:'western-big-pearl',x:7,y:8,item:'bigpearl',name:'큰진주'},
 {id:'southern-rare-candy',x:10,y:12,item:'rarecandy',name:'이상한사탕'},
 {id:'roof-northern-rare-candy',district:'lumiose-jaune5-upper',x:11,y:3,item:'rarecandy',name:'이상한사탕'},
]);
export function jaune5CourtItem(s,spot){
 if(!['lumiose-jaune-sector5','lumiose-jaune5-upper'].includes(s?.district)||s.interior||spot?.tile!=='#')return null;
 const saved=s.zaJaune5CourtItems;if(saved!=null&&!Array.isArray(saved))return null;
 return JAUNE5_COURT_ITEMS.find(p=>(p.district||'lumiose-jaune-sector5')===s.district&&p.x===spot.x&&p.y===spot.y&&!saved?.includes(p.id))||null;
}
