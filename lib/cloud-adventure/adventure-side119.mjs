// https://bulbapedia.bulbagarden.net/wiki/Jacinthe#Side_Mission_119_and_later_reward_matches
export const SIDE119_JACINTHE={id:'side119-jacinthe',name:'Jacinthe',strategy:'balanced',team:[[703,73],[303,74],[699,74],[282,74],[700,74],[36,75]]};
export const SIDE119_MOVES=[
 ['스텔스록','스톤에지','문포스','러스터캐논'],
 ['치근거리기','아이언헤드','깨물어부수기','불꽃엄니'],
 ['눈보라','프리즈드라이','록블라스트','방어'],
 ['문포스','매지컬플레임','사이코키네시스','명상'],
 ['문포스','섀도볼','매지컬샤인','거짓울음'],
 ['에어슬래시','문포스','매지컬플레임','방어']
];
export function side119Wins(s){return Number.isInteger(s.zaSide119Wins)&&s.zaSide119Wins>=0&&s.zaSide119Wins<=4?s.zaSide119Wins:0;}
export function side119RepeatStreak(s){return Number.isSafeInteger(s.zaSide119RepeatStreak)&&s.zaSide119RepeatStreak>=0?s.zaSide119RepeatStreak:0;}
