// https://www.thonky.com/pokemon-legends-z-a/side-mission-114-a-feather-from-skarmory
// The waterfront request and rooftop feather positions are 2D approximations.
export function side114Available(s={}){return [1,2,3].includes(s.zaSide114Stage)||s.zaMission37Complete===true||s.zaMission38Started===true||s.zaMission38Complete===true||s.zaMission39Started===true;}
export function side114Spot(s,p){if(s?.interior)return null;if(s?.district==='lumiose-coulant-route'&&p?.x===11&&p.y===11&&p.tile===',')return 'couper';if(s?.district==='lumiose-zone17'&&s.zaZone17Upper===true&&p?.x===15&&p.y===9&&p.tile==='.'&&s.zaSide114Stage===1)return 'feather';return null;}
