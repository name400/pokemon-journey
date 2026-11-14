import {side10Available} from './adventure-side10.mjs';
// 2D locations are provisional. https://www.thonky.com/pokemon-legends-z-a/side-mission-016-the-budew-show
export function side16Available(s={}){return [1,2,3].includes(s.zaSide16Stage)||side10Available(s);}
export function side16Spot(s,p){if(s?.interior||p?.tile!=='^')return null;if(s.district==='lumiose-aymlis-park'&&!s.zaMission11ParkLower&&p.x===16&&p.y===3)return 'center';if(s.district==='lumiose-bleu-sector8'&&p.x===5&&p.y===5)return 'show';return null;}
