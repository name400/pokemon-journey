// https://www.serebii.net/legendsz-a/sidemissions/clauncherlaunchingwatergun.shtml
export function side82Available(s={}){return [1,2,3].includes(s.zaSide82Stage)||Number(s.zaMission26Stage)>=3||s.zaMission26Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['B','A','S'].includes(s.zaRoyaleRank);}
export function side82Spot(s,p){if(s?.district!=='lumiose-screw-jaune8'||s.interior)return null;if(p?.tile==='^'&&p.x===15&&p.y===3)return 'nett';if(p?.tile==='r'&&p.x===18&&p.y===3&&s.zaSide82Stage===1)return 'sludge';return null;}
