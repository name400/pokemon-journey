// Additional established rooftop routes and the third side-mission 9 course.
// Coordinates reflect this project's approximate 2D maps, not original-game measurements.
export function extraGlideVisible(s){
 return !!s&&!s.interior&&Number.isSafeInteger(s.zaMission15Stage)&&s.zaMission15Stage>=2&&(
  ['lumiose-magenta7-north-roof','lumiose-magenta7-south-roof','lumiose-screw-magenta8','lumiose-magenta8-east-roof'].includes(s.district)
  ||(s.district==='lumiose-side09-course'&&s.zaSide09Stage===3)
 );
}
export function extraGlideReady(s){
 if(!extraGlideVisible(s))return false;
 switch(s.district){
  case 'lumiose-magenta7-north-roof':return s.x===17&&s.y===10;
  case 'lumiose-magenta7-south-roof':return (s.x===11&&s.y===3&&s.zaMagenta7NorthOpen===true)||(s.x===3&&s.y===8);
  case 'lumiose-screw-magenta8':return s.x===19&&(s.y===5||s.y===8);
  case 'lumiose-magenta8-east-roof':return s.y===8&&[3,10,14].includes(s.x);
  case 'lumiose-side09-course':return s.y===8&&(s.x===10||s.x===14);
  default:return false;
 }
}
