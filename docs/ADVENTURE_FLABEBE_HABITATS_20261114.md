# 플라베베 색별 도시 출현

[StrategyWiki](https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/The_Many_Flowers_of_Flab%C3%A9b%C3%A9)와 [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Legends:_Z-A/Side_Missions_1-20)는 빨강 외의 꽃 색이 도시에서 출현한다고 설명한다. 하양은 베르 3번지 안뜰, 파랑은 마젠타 옥상, 주황은 블루 대로, 노랑은 구역 6 남쪽 운하 주변에 배치했다. 정확한 타일·레벨·재출현 주기는 2D 초안이다. 빨강은 기존 야생 구역 3에서 얻는다.

도시 야생 개체의 기존 소모·이로치 저장을 재사용하며 포획 시 꽃 폼을 유지한다. 기존 저장의 이동 가능 타일이나 보유 포켓몬을 바꾸지 않는다. 현장에서는 기존 스프라이트와 꽃 색 표식으로 구분한다. 격리 API에서 하얀 꽃 이로치의 전투 포획·재접속·중복 요청, 주황 꽃 필드 포획과 기존 파티·볼 재고를 검사했다. 네 위치의 인접 접근과 구형 좌표 복원도 검사했다.

실제 기기, 운영 D1 및 Sites 병합본은 검증하지 않았다.

## 사이드 미션 12

[원작 의뢰 목록](https://bulbapedia.bulbagarden.net/wiki/Task_%28Legends%3A_Z-A%29)과 [공략](https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/The_Many_Flowers_of_Flab%C3%A9b%C3%A9)에 따라 미션 6 완료 후 Vivace에게 서로 다른 다섯 색을 한 마리씩 보여 주면 각 머리색이 해금된다. 다섯 색을 모두 보여 주면 아쿠아·퍼플·패션 핑크, 1,500코인과 이상한사탕을 얻는다. 파티와 보유함 모두 선택할 수 있으며 포켓몬은 소비하거나 수정하지 않는다. 가방이 가득 차면 사탕은 따로 보관한다.

현재 미용실 옆의 2D 위치와 픽셀 색상은 초안이다. 추가 헤어스타일이나 원작 실시간 연출은 구현하지 않았다. 격리 API에서 해금 조건·보유함 선택·다른 종과 중복 색 거절·단계별 미용실 제한·다섯 색 완료·가방 한도·재접속·중복 수령·알 수 없는 미래 저장과 기존 포켓몬 보존을 확인했다. 실제 기기·운영 D1·Sites 병합본은 확인하지 않았다.
