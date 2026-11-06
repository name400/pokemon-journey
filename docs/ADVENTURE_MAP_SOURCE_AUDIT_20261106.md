# 탐험 맵 원작 대조 — 2026-11-06

사용자 요청: 원작 3D 공간의 길·건물·시설·연결·동선을 2D 도트로 옮긴다. 아래는 현재 확인 범위이며, 현재 맵이 원작에 일치한다는 뜻이 아니다.

- [공식 미르시티 소개](https://legends.pokemon.com/en-us/story-world/lumiose-city): 미르시티와 Hotel Z를 확인할 수 있다.
- [Serebii 미르시티 지도](https://www.serebii.net/pokearth/lumiosecity/): 도시와 야생 구역의 위치를 대조할 수 있다.
- [전체 도시 지도](https://www.gamesradar.com/games/pokemon/full-pokemon-legends-z-a-map-and-all-locations/): 도시 전체와 20개 야생 구역의 배치를 확인할 수 있다.
- [Hotel Z 접수대 화면](https://www.shacknews.com/article/146502/how-to-beat-rintaro-pokemon-legends-za): 로비의 접수대와 시각 요소를 확인할 수 있으나 단일 시점만으로 전체 벽·출입구·가구 좌표와 이동 동선을 확정할 수 없다.
- [임무 10 진행](https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/The_Secrets_of_Mega_Evolution): Hotel Z에서 동료를 만난 다음 앱솔의 메가스톤을 준비해 동료와 배틀하고 콰자르티코로 향한다.

현재 `lumioseMap`, `hotelMap`, 야생 구역 및 옥상은 임시 23×17 배치로 원작 동선과 일치하지 않는다. 실측·복수 시점의 근거 없이 벽, 문, 구역 연결을 추정해서 원작 재현으로 표시하거나 기존 좌표를 강제 이주하지 않는다. 우선 Hotel Z 내부의 출입구·접수대·층별 접근과 주변 거리, 다음으로 중심 광장과 각 색 지구·야생 구역의 연결을 원작 지도 및 실제 화면으로 대조하고, 기존 저장 위치는 안전한 진입 지점으로 복구하는 마이그레이션과 함께 구현해야 한다.

임무 10 시작 대화는 임시 호텔 접수처에서 호출하는 시범 연결이며 원작 NPC 위치나 동선을 재현했다고 주장하지 않는다. 동료 배틀, 콰자르티코, 나머지 임무와 실시간 전투는 별도 구현이 남아 있다.

## Hotel Z 이동 경로 — 부분 구현

[실제 진행 안내 및 화면](https://www.gameguides.space/guides/66/pokemon-legends-z-a.html)에 근거해 로비 접수대 부근 엘리베이터 → 2층의 두 객실 문 → 왼쪽 202호 → 복도·로비로 돌아가는 경로를 연결했다. 2층과 202호 저장 좌표도 재접속 시 복원한다. 수치화된 바닥 크기, 엘리베이터와 벽·침대의 정확한 타일 위치는 화면들에서 확인하지 못했으므로 초안이다. 침대의 시간 변경과 옥상 연결은 구현하지 않았다. 실제 호텔 및 도시 전체를 재현했다는 뜻이 아니다.

[야생 구역 1 위치](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-1-guide-all-pokemon-and-alphas)는 호텔 남쪽, 연구소 동쪽이다. 현재 임시 맵의 도시 서쪽 진입과 구역 2로 곧바로 연결되는 지형은 원작과 다르므로 도시 전체 동선과 함께 수정해야 한다. 기존 진행을 유지하면서 구역을 옮길 구체적 좌표와 경로는 아직 검증하지 못했다.

## Hotel Z 옥상 — 부분 구현

[Hotel Z 시설 설명](https://bulbapedia.bulbagarden.net/wiki/Hotel_Z)과 [엘리베이터 화면](https://www.nintendolife.com/guides/pokemon-legends-z-a-how-to-start-the-mega-dimension-dlc)에 따라 로비·2층·호텔 전용 옥상 사이의 엘리베이터를 연결했다. 옥상에 화로와 의자 두 개, 소파와 탁자, 화분을 표시한다. 자료에서 확인된 가구의 종류와 연결만 반영했으며 정확한 도트 좌표와 옥상 경계는 초안이다. 이 공간은 기존 `lumiose-rooftop` 시범 길과 별개로 취급한다. 두 공간을 연결하는 원작 경로와 조건은 미확인이다. 옥상에서 저장·재접속 후 엘리베이터 복귀, 파티·지갑 보존을 격리 API 검사로 확인했다. 도심과 야생 구역 1의 잘못된 연결은 이 변경에서 수정하지 않았다.

## 야생 구역 1 출입 방향 — 부분 수정

[구역 1 위치 안내](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-1-guide-all-pokemon-and-alphas)는 호텔 남쪽, [동쪽 출입구 안내](https://www.thonky.com/pokemon-legends-z-a/main-mission-03-a-new-life-in-lumiose-city)는 구역 동쪽에서 나와 북쪽으로 호텔로 가는 동선을 확인한다. 기존 광장 서쪽 출입을 막고 호텔 남쪽 임시 입구와 구역 1 동쪽 출구의 왕복을 연결했다. 기존 구역 1 저장도 출구를 이용할 수 있으며 좌표나 저장 데이터를 이주하지 않는다. 광장·입구의 정확한 배치와 크기는 여전히 임시다. 구역 1 서쪽에서 구역 2로 이어지는 기존 시범 연결 역시 원작의 도시 지리와 일치하는 것으로 확인되지 않아 후속 수정 대상이다.

## 구역 1과 구역 2의 임시 직결 제거

[임무 5 안내](https://pokequery.com/games/legends-za/walkthrough)는 옥상 길을 통해 구역 2로 이동하는 순서를 설명하며, [구역 위치 안내](https://pokemongohub.net/post/guide/all-wild-zones-pokemon-legends-z-a/)는 구역 2를 Vert Plaza로 구분한다. 기존의 구역 1 서쪽 → 구역 2 직결을 제거했다. 구역 1 서쪽은 연결 준비 중으로 표시하며 동쪽으로 나갈 수 있고, 구역 2는 기존 옥상 경로에서 접근한다. 기존 구역 2 저장은 동쪽에서 현재 도시 초안으로 돌아갈 수 있다. 이 귀환 좌표는 원작 도로의 위치를 재현한 것이 아니며 해당 도로와 구역 1 서쪽의 연구소 방면 연결은 추가 구현이 필요하다. 도시·구역 2의 전체 지형 역시 미완성이다.

## Floral Avenue와 포켓몬 연구소 — 동선 부분 구현

[구역 1 안내](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-1-guide-all-pokemon-and-alphas)에서 구역 1이 Floral Avenue의 연구소 동쪽에 있다는 관계를 확인해, 구역 1 서쪽 출구 → Floral Avenue → 연구소 입구를 왕복하도록 연결했다. 구역 1에서는 기존 동쪽의 호텔 방면 출구도 유지한다. 연구소 내부는 기존 연구소 화면을 재사용하는 초안이며 원작 Mable의 대화·시설을 재현한 것이 아니다. 도로 폭·건물 모양과 좌표 및 거리의 다른 시설은 미확정이다. 거리·연구소에서 재접속과 이동, 파티·지갑 보존을 격리 API로 검사했다. 구역 2의 실제 Vert Plaza 거리 연결 및 도시 전체 맵은 아직 구현되지 않았다.

## Vernal Avenue 및 Vert Plaza 연결 — 경로 초안

[야생 구역 2 안내](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-2-guide-all-pokemon-and-alphas)는 Vernal Avenue에서 동쪽 길로 Vert Plaza에 접근한다고 설명한다. Floral Avenue의 연구소가 Vernal Avenue 남쪽에 있다는 [구역 1 안내](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-1-guide-all-pokemon-and-alphas)와 함께, 연구소 방면 → Vernal Avenue → Vert Plaza → 구역 2와 귀환을 연결했다. 기존 구역 2 저장은 동쪽 출구로 Vert Plaza에 도착하며, 광장 서쪽과 Vernal Avenue 서쪽을 통해 기존 도시로 돌아갈 수 있다. 호텔 주변 지구와 Vernal의 연결점 및 각 지역의 모양·거리·건물은 임의 좌표의 초안이며 원작의 정확한 맵이 아니다. Vert Plaza의 원형 지형·물·다리와 남쪽 및 북서쪽 출입구, Café Woof, 연구소 주변 및 호텔 주변 실제 지형은 아직 만들어지지 않았다. 기존 게임의 구역 2 랭크 Y 제한은 유지했지만, 위 안내는 원작에서 초반 접근 가능하다고 설명하므로 정책 차이가 남아 있다. 옥상 첫 방문은 기존 경로를 유지한다.

## 야생 구역 2 출입구와 Vernal Avenue 표식 — 부분 수정

[야생 구역 2 안내](https://thegameslayer.com/guides/pokemon-legends-z-a-all-wild-zone-2-pokemon/)의 남쪽·북서쪽 입구와 남동쪽 물가 목조 다리, [Vernal Avenue 안내](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-2-guide-all-pokemon-and-alphas)의 Café Woof 위치 관계를 근거로, 구역 2의 출입 타일을 남쪽과 북서쪽으로 옮기고 기존 수면에 다리를 놓았다. Café Woof는 Vernal Avenue의 표식·설명만 추가했으며 건물 내부와 정확한 좌표는 미구현이다. 광장에서 구역 2 진입 시 랭크 Y 제한은 제거했다. 랭크·진행 및 저장 데이터는 그대로 둔다.

구역 2는 기존에 걸을 수 있던 내부 타일을 막지 않으며 이전 좌우 경계 출입 타일에 저장된 경우 각각 인접한 내부 타일로 복구한다. 기존 북서쪽 출구의 구역 3 직결은 기존 진행을 보존하는 임시 연결이고, 실제 도시 경유 경로는 미구현이다. 수면은 기존의 작은 사각형으로 전체 원형 물·섬·다리 구조를 재현하지 못했고 건물과 도로 좌표도 여전히 초안이다. 실제 기기·배포 사이트 검증은 하지 않았다.

## Vert Plaza 수역과 북서쪽 출구 — 부분 구현

[구역 2 지형 안내](https://allthings.how/pokemon-legends-z-a-wild-zone-2-every-spawn-and-where-to-find-them/)의 원형 수역·중앙 섬·다리와 [출입구 안내](https://thegameslayer.com/guides/pokemon-legends-z-a-all-wild-zone-2-pokemon/)의 북서쪽 Vert Sector 2 연결을 바탕으로 수역과 중앙 섬, 남쪽 다리를 초안으로 바꾸고 출구 뒤에 별도의 Vert Sector 2를 추가했다. 정확한 수역 경계·다리 위치와 거리의 실제 건물은 확인되지 않았으며 임시 타일이다. 이 거리와 구역 3 사이의 나머지 경로 역시 기존 진행을 유지하는 초안이다. Josée와 랭크 진행 조건은 구역 3으로 가는 쪽에 유지된다.

물 확장으로 예전 저장 좌표가 수면이 되는 경우, 이전 타일 배치에서 유효했고 저장 리비전이 일치하는 위치만 같은 구역의 가까운 이동 가능 타일로 옮긴다. 신규 저장에는 지형 버전을 기록하며 충돌한 리비전이나 원래 유효하지 않은 좌표를 추측해 복구하지 않는다. 옛 경계 출구 좌표 복구도 유지한다. 대표 저장 복구, 구역·거리 왕복과 기존 퀘스트 경로를 격리 API 및 지도 테스트로 검사했다.

[Café Woof 안내](https://bulbapedia.bulbagarden.net/wiki/Caf%C3%A9_Woof)에서 Vernal Avenue의 Bleu Sector 3, 실제 카페 메뉴와 회복 기능을 확인했다. 실제 건물 좌표·내부 배치를 검증하지 못해 현재 표식은 그대로 초안이며, 내부·메뉴와 연결 도로의 정확한 재현은 미구현이다. 실제 기기 검증은 하지 않았다.

## Café Woof 서비스 — 부분 구현

[Café Woof 화면](https://www.wikidex.net/wiki/Caf%C3%A9_Guau/Caf%C3%A9_Can_Can)에는 붉은 벽돌 건물과 야외 좌석이 나타난다. 위치 초안의 카페 표식을 붉은 차양 형태로 바꾸고, [카페 메뉴](https://www.serebii.net/legendsz-a/cafes.shtml)에 기재된 음료 10종과 가격을 대화에서 제공한다. 주문 시 파티 회복 및 선두 친밀도 증가를 코인 차감과 한 트랜잭션으로 처리한다. 부족 잔액·오래된 리비전은 회복과 결제를 모두 거부한다. 정확한 친밀도 증가량은 확인하지 못해 기존 게임의 1 증가 규칙을 임시 적용한다(럭셔리볼 등 기존 보정 가능).

실제 건물·야외 좌석의 정확한 지형 좌표, 카페 내부로의 진입 가능 여부, 사진 연출과 순간 이동은 구현하지 않았다. 지역 지도는 여전히 초안이다. API에서 잔액 부족, 주문과 재접속, 오래된 리비전 및 파티 상태 복원을 검사했다. 실제 기기와 운영 사이트는 미검증이다.

## Café 친밀도와 Rouge Plaza 만남

[친밀도 자료](https://bulbapedia.bulbagarden.net/wiki/Friendship)의 Legends: Z-A 항목에 따라 카페 주문 시 선두 포켓몬 친밀도를 30 올리고 255에서 제한한다. 파티 회복·결제의 원자성과 이전 저장은 유지한다. 이전 주문을 구분할 기록은 없으므로 과거 주문의 친밀도를 추정해 바꾸지 않는다. 대표 잔액 부족·리비전 충돌·100→130·240→255·재접속을 검사했다.

[임무 5 진행](https://bulbapedia.bulbagarden.net/wiki/Walkthrough%3APok%C3%A9mon_Legends%3A_Z-A/Part_5)에서 Josée를 Rouge Plaza에서 만나 승리한 뒤 야생 구역 3을 탐색하는 순서를 확인했다. Josée를 구역 2에서 Rouge Plaza 쪽 구역 3 초안으로 옮기고, 필수 진행 중에는 풀숲 진입을 막되 이미 풀숲에 저장된 기존 플레이어는 갇히지 않게 했다. 탐정사무소 진입 조건과 이전 배틀 진행 데이터는 유지한다. NPC의 정확한 좌표, Rouge Plaza와 Vert Sector 2 사이의 실제 도로, 구역 2 수역 윤곽 및 Café Woof 건물·내부 위치는 여전히 미확정이다. 실제 기기·운영 사이트 검증은 하지 않았다.

## 구역 2 북서쪽 입구 계단

[구역 2 안내](https://thegameslayer.com/guides/pokemon-legends-z-a-all-wild-zone-2-pokemon/)는 Vert Sector 2에 인접한 북서쪽 입구 바로 앞에 계단이 있다고 설명한다. 해당 입구 안쪽에 이동 가능한 계단 타일을 추가했다. 계단의 정확한 폭·길이와 주변 지형은 자료로 확인하지 못해 초안이며, 수역·다리의 정확한 윤곽과 Vert Sector 2에서 Rouge Plaza까지의 도시 경로 및 Café Woof 내부는 여전히 미구현이다. 기존 타일의 이동 가능 여부는 바꾸지 않는다.
