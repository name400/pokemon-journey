// The original central computer lists these four subjects. Mapping each to
// one of the draft 2D terminals is an adaptation; wording is a paraphrase.
export const MISSION35_FILES=Object.freeze({
 a:{title:'장치',text:'3,000년 전 죽은 포켓몬을 되살리기 위해 만들어진 장치가 플레어단의 조사 대상이 되었다. 장치를 작동할 열쇠는 제작자인 AZ와 관련되어 있다.'},
 b:{title:'에너지원',text:'기록은 장치가 다른 포켓몬에게서 빼앗은 생명 에너지를 이용한다고 설명한다. 연구자들은 전설의 포켓몬의 에너지를 쓰는 경우도 검토했다.'},
 e:{title:'전설',text:'칼로스의 전설로 제르네아스는 생명과 재생, 이벨타르는 파괴와 죽음을 상징한다고 적혀 있다. 두 힘은 장치에 관한 연구의 대상이었다.'},
 k:{title:'공유된 꿈',text:'플레어단의 기록은 자원과 생명을 둘러싼 갈등을 이유로 생명의 수를 줄여야 한다는 계획을 주장한다.'},
});
export function mission35File(tile){return Object.hasOwn(MISSION35_FILES,tile)?MISSION35_FILES[tile]:null;}
