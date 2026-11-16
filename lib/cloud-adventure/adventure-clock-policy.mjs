// Only confirmed enclosed maps; hotelRoof and unknown future values remain outdoors.
const CLOCK_SEWERS=new Set(['lumiose-sewer','lumiose-crystal-sewer']);
const CLOCK_INDOORS=new Set(['cafeAction','cafeGallant','canariQuiz','hotel','hotel2f','hotel202','justiceDojo','lab','leNah','leWow','leYeah','lumioseDirector','lumioseLab','lumioseLab2','lysandreCafe','museum1','museum2','quasarticoOffice','racineGarage','racineRoom','richissimeHall','richissimeLobby','rustOffice','stoneEmporium','sushi']);
export function adventureFixedClockPaused(s){
 return !!s&&!!((s.combat&&s.combat.adventureWildClockRunsV1!==true)||(s.area===3&&(CLOCK_INDOORS.has(s.interior)||CLOCK_SEWERS.has(s.district))));
}
