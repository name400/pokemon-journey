// Three initial world locations; their exact positions in these draft 2D maps
// are approximations of documented Racine and scaffold locations.
// https://www.gamerguides.com/pokemon-legends-z-a/checklists/colorful-screw-locations/
export const COLORFUL_SCREW_SITES=Object.freeze([
 {id:'racine-garage',district:'lumiose-vert-sector6',interior:'racineGarage',x:9,y:13},
 {id:'magenta6-scaffold',district:'lumiose-magenta6-scaffold',interior:null,x:12,y:5},
 {id:'zone9-south-scaffold',district:'lumiose-zone9-scaffold',interior:null,x:10,y:7},
]);
export function colorfulSystemUnlocked(s){return s?.zaRedCanariPlush===true||/^[A-Y]$/.test(s?.zaRoyaleRank||'');}
export function colorfulScrewFound(s){const ids=new Set(COLORFUL_SCREW_SITES.map(p=>p.id));return [...new Set((Array.isArray(s?.zaColorfulScrewsFound)?s.zaColorfulScrewsFound:[]).filter(id=>ids.has(id)))];}
export function colorfulScrewAvailable(s){const spent=s?.zaColorfulScrewsSpent??0;if(!Number.isSafeInteger(spent)||spent<0)return 0;return Math.max(0,colorfulScrewFound(s).length-spent);}
export function colorfulScrewSite(s,x,y){if(s?.area!==3||s.expedition||s.unionHost||!colorfulSystemUnlocked(s))return null;const found=colorfulScrewFound(s);return COLORFUL_SCREW_SITES.find(p=>p.district===s.district&&(p.interior||null)===(s.interior||null)&&p.x===x&&p.y===y&&!found.includes(p.id))||null;}
export function isColorfulExchange(s,x,y){return s?.area===3&&!s.expedition&&!s.unionHost&&s.district==='lumiose-vert-sector6'&&!s.interior&&colorfulSystemUnlocked(s)&&x===15&&y===14;}
