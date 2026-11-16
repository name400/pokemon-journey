// Keep the old Centrico interaction for existing saves. The tower contact on
// the compressed 2D map is approximate, not a surveyed original coordinate.
export function mission38WishSpot(s,spot){
 if(!s||s.interior||!spot)return false;
 if(s.district==='lumiose-centrico-route'&&spot.tile==='q')return true;
 return s.district==='lumiose-zone20'&&spot.tile==='n'&&spot.x===11&&spot.y===6&&!s.zaMission42Underground&&!(s.zaMission42Stage>=1&&!s.zaMission42Complete);
}
