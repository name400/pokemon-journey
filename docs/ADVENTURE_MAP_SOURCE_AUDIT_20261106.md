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

## 구역 2 동남쪽 다리 — 부분 수정

[구역 2 안내](https://thegameslayer.com/guides/pokemon-legends-z-a-all-wild-zone-2-pokemon/)는 남쪽 입구에서 동남쪽 목조 다리를 건너 중앙으로 향하는 경로를 설명한다. 기존 정남쪽 중앙에 있던 다리를 동남쪽 중앙 섬 방향으로 옮겼다. 다리의 정확한 각도와 물가 경계는 자료상 확인하지 못한 초안이다. 이전 버전 다리 위에 저장한 위치가 새 수면에 해당하면 같은 구역의 가장 가까운 보행 가능 타일로 복구하며, 저장 리비전이 다를 때는 이전과 같이 복구를 거부한다. 다른 저장 데이터는 보존한다. 전체 수역 윤곽, 도시 도로 및 카페 위치·내부는 미완성이다.

## Vernal Avenue 동쪽 물가 — 부분 구현

[Nintendo Life의 구역 2 접근 경로](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-2-guide-all-pokemon-and-alphas)는 Café Woof 부근에서 물가 옆 동쪽 길로 Vert Plaza에 간다고 설명한다. Vernal Avenue 초안의 동쪽 길 옆에 물가를 추가했다. 물가의 모양과 좌표, 카페 건물·내부의 정확한 배치는 확인되지 않은 초안이다. 새 물가 위에 저장된 구버전 위치는 리비전이 일치하는 경우 같은 구역의 가까운 보행 가능 위치로 옮긴다. 기존 지갑·파티·진행은 변경하지 않는다.

## 구역 2에서 Rouge Plaza 방면의 Centrico 연결 — 부분 구현

[임무 5 안내](https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Legends:_Z-A/Part_5)는 야생 구역 2 이후 핸섬 탐정사무소로 향할 때 Centrico 포켓몬센터를 지나고 Rouge Plaza에서 Josée를 만난다고 설명한다. 기존 Vert Sector 2와 구역 3의 즉시 연결 사이에 Centrico 방면 초안과 회복 가능한 센터를 연결했다. 센터와 도로의 정확한 좌표·폭 및 실제 전체 경로는 확인되지 않았다. 기존 구역 3 저장은 유지되고 동쪽 출구로 새 연결 구역을 이용할 수 있다. 구역 3과 Rouge Plaza는 여전히 임시로 합쳐진 상태다.

## Rouge Plaza의 야생 구역 3 남쪽 입구 — 부분 구현

[구역 3 안내](https://altissimo1.github.io/Supplementary-Series/Legends/Legends-Z-A/poke-balls.html)는 Rouge Plaza의 야생 구역 3 남쪽 입구를 명시한다. Centrico 방면에서 구역 3으로 갈 때 남쪽 입구로 들어가고 이 입구로 돌아가도록 연결했다. 기존 구역 3의 동쪽 출구는 이전 진행과 저장의 접근성을 위해 남겨 두었으며, 그 정확한 원작 연결은 검증되지 않았다. 남쪽 입구 좌표와 주변 도로·광장 윤곽도 초안이다.

## Centrico 센터와 프리즘타워 — 위치 관계 반영

[임무 20 안내](https://www.thonky.com/pokemon-legends-z-a/main-mission-20-a-request-from-the-rust-syndicate)는 Centrico 포켓몬센터가 프리즘타워 북쪽에 있다고 명시한다. 연결 구역 초안에서 센터 남쪽에 이동할 수 없는 탑 표식을 추가했다. 이는 확인된 방향 관계만 나타내며 실제 탑의 규모·윤곽·센터까지의 거리와 도로 폭은 검증되지 않았다. 표식 자리에 있던 이전 저장은 리비전이 일치하면 같은 구역의 인접한 보행 가능 위치로 복구한다.

## 야생 구역 3의 초반 접근

[Nintendo Life 구역 3 안내](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-3-guide-all-pokemon-and-alphas)는 이 구역이 초반부터 열려 있다고 설명한다. Vert Sector 2에서 Centrico 방면으로 나가는 데 임의로 붙였던 랭크 Y 제한을 제거했다. 임무 5의 Josée 전투가 실제로 필요한 상태에서는 구역 3 내부의 기존 스토리 진입 판정을 그대로 유지한다. 랭크 Z에서 구역 접근·재접속과 파티·지갑 보존을 격리 API로 검사한다. 도시와 광장의 실제 지형은 별도 미완성이다.

## 구역 2 남쪽 입구 풀밭 — 부분 구현

[구역 2 동선 안내](https://thegameslayer.com/guides/pokemon-legends-z-a-all-wild-zone-2-pokemon/)는 남쪽 입구 바로 안쪽에 풀이 있고 꼬몽울을 만날 수 있다고 설명한다. 남쪽 입구 부근에 걸을 수 있는 풀밭을 추가하고 기존 남쪽 통로와 동남쪽 다리를 유지했다. 풀밭의 정확한 면적·좌표는 초안이다. 기존 풀밭 조우 풀을 사용하므로 위치별 포켓몬 출현이나 원작의 필드 개체 행동을 구현했다는 뜻은 아니다. 해당 위치의 구버전 저장은 좌표 그대로 복원된다.

## 구역 2 입구·나무·중앙 섬·물가 조우 — 부분 구현

[구역 2 위치 안내](https://www.videogameschronicle.com/guide/pokemon-legends-z-a-wild-zone-2/)는 꼬몽울이 입구 부근, 딱충이가 나무, 보르쥐·거북손손이 중앙, 별가사리와 잉어킹이 물가에 있음을 설명한다. 구역 초안의 남·북서 입구, 북서쪽 나무, 중앙 섬, 동쪽 물가에 해당하는 풀밭을 구분하고, 각 위치에서 해당 조우 풀을 사용하도록 연결했다. 남쪽과 북서 입구의 풀밭, 동남쪽 다리와 중앙 섬은 기존 동선으로 왕복할 수 있다. 별가사리는 물가에서 밤에만 선택되고 잉어킹은 낮과 밤 모두 가능하다. 각 구역의 정확한 좌표·면적과 출현 확률·레벨은 임시 값이다. 이는 기존 풀밭 무작위 전투의 부분 개선으로, 원작의 화면에 보이는 개체·나무 매달림·접근 도주·다리로 뛰는 행동이나 3D 지형의 완전한 재현은 아니다. 구역 밖·미분류 위치는 기존 공통 조우 풀을 유지한다.

## 구역 2 꼬몽울 필드 행동 — 대표 개체 초안

[구역 2 위치 안내](https://www.videogameschronicle.com/guide/pokemon-legends-z-a-wild-zone-2/)는 꼬몽울이 입구 부근에 출현하고 가까이 접근하면 달아난다고 설명한다. 이를 바탕으로 남쪽 입구 부근에 화면에 보이는 꼬몽울 한 마리와 접근 시 이동·도주, 가까운 위치에서 조준해 볼을 던지는 경로를 추가했다. 움직임과 포획 여부는 서버가 판정하고 볼 수량과 결과를 함께 저장한다. 구역을 벗어나면 개체가 초기화된다.

좌표·레벨·감지 거리·이동 경로·도주 횟수와 구역 재입장 시 재출현, 포획 실패 시 도주는 자료에서 확인하지 못한 임시 규칙이다. 보이는 다른 종, 나무 매달림, 은신·정확한 조준과 실시간 전투는 아직 이 구현에 포함되지 않는다. 이동 예측은 꼬몽울 주변에서 서버 결과를 기다린다. 지도 전체 윤곽 및 Café Woof 위치·내부도 여전히 미완성이다.

## 구역 2 나무의 딱충이 — 대표 개체 초안

[구역 2 안내](https://www.videogameschronicle.com/guide/pokemon-legends-z-a-wild-zone-2/)와 [출현 위치 안내](https://allthings.how/pokemon-legends-z-a-wild-zone-2-every-spawn-and-where-to-find-them/)는 딱충이가 구역의 나무에 매달려 나타난다고 설명한다. 구역 북서쪽 경계 나무에 대표 개체를 표시하고 가까이서 조준해 볼을 던지도록 연결했다. 포획과 볼 수량은 서버에서 함께 저장하고, 실패하면 기존 야생 전투로 이어진다. 구역을 벗어나면 개체가 초기화된다.

정확한 나무 좌표·레벨·조준 거리·재출현 및 포획 실패 후의 세부 동작은 초안이다. 실제 3D 지형에 맞춘 나무와 수역의 윤곽, 다른 야생 개체의 화면 표시·행동, 원작 실시간 전투는 아직 미완성이다. 이 표시는 기존 경계 타일을 이용하므로 기존 저장의 통행 가능 위치는 바꾸지 않는다.

## 구역 2 중앙·물가의 보이는 야생 포켓몬 — 부분 구현

[구역 2 위치 안내](https://www.videogameschronicle.com/guide/pokemon-legends-z-a-wild-zone-2/)와 [출현 위치 안내](https://allthings.how/pokemon-legends-z-a-wild-zone-2-every-spawn-and-where-to-find-them/)를 바탕으로 중앙의 보르쥐·거북손손과 물가의 잉어킹·밤 별가사리를 공통 목록으로 화면에 표시한다. 가까운 포켓몬을 조준해 볼을 던지면 서버에서 구역·거리·시간·개체 소진 여부를 다시 검사하고 결과와 볼 수량을 함께 저장한다. 포획 실패 시 기존 야생 전투로 연결되고 구역을 벗어나면 필드 개체 상태가 초기화된다.

정확한 좌표·출현 수·레벨·조준 거리와 포획 실패 후 반응은 임시다. 거북손손은 현재 고정 위치에서 대기한다. 보르쥐와 별가사리의 부분적인 이동은 아래 항목을 참조한다. 수역·다리의 실제 윤곽과 Rouge Plaza·Centrico·Café Woof의 정확한 위치·동선도 미완성이다.


## 구역 2 잉어킹의 다리 반응 — 부분 구현

[구역 2 안내](https://www.videogameschronicle.com/guide/pokemon-legends-z-a-wild-zone-2/)와 [현장 안내](https://thephrasemaker.com/2025/10/17/pokemon-legends-z-a-wild-zone-2-guide/)는 다리를 지날 때 잉어킹이 물에서 다리로 뛰어오른다고 설명한다. 다리를 지나면 잉어킹의 서버 위치를 다리로 바꾸고 해당 위치를 화면과 조준에 반영하며, 이동 횟수가 지나면 물로 돌려보낸다. 저장 후 재접속하면 남은 상태를 유지하고 구역을 떠나면 초기화한다. 기존 저장의 개체 소진 상태는 유지한다.

뛰는 정확한 거리·빈도·위치·체류 시간과 다리 윤곽은 임시다. 다리 위에서 즉시 포획되는 원작의 정확한 조건, 보르쥐 무리·공격 반응 및 별가사리·거북손손의 실제 이동은 아직 확인·구현하지 않았다. Rouge Plaza·Centrico·Café Woof의 실제 지형과 동선도 미완성이다.


## 구역 2의 보르쥐 무리와 별가사리 이동 — 부분 구현

[구역 2 안내](https://allthings.how/pokemon-legends-z-a-wild-zone-2-every-spawn-and-where-to-find-them/)는 보르쥐가 작은 무리로 이동하며 거북손손은 대체로 단독 출현한다고 설명한다. [별도 안내](https://thephrasemaker.com/2025/10/17/pokemon-legends-z-a-wild-zone-2-guide/)는 보르쥐가 발견 시 공격할 수 있고 별가사리는 물가 근처에서 떠다닌다고 설명한다. 공통 필드 개체 처리에 보르쥐 두 마리의 육지 이동과 접촉 시 전투, 밤의 별가사리 수역 이동을 연결했다. 위치와 개체별 포획 상태는 서버 저장에 남고 재접속 시 복원된다. 기존 보르쥐의 포획 상태는 유지한다.

[다른 보도](https://www.theverge.com/games/802089/pokemon-legends-z-a-shiny-hunting)는 보르쥐가 접근 시 도주하기도 한다고 하므로, 접촉 시 전투를 언제 시작하는지에 관한 원작의 세부 조건은 미확인이다. 두 마리라는 수, 동선·속도·감지 거리와 별가사리 이동 규칙도 초안이다. 시간은 실제 경과 시간이 아닌 플레이어 이동에 의해 진행된다. 거북손손의 세부 행동, 원작 실시간 전투와 지형·도시 동선은 여전히 미완성이다.

## 구역 2 북동쪽 다리 — 부분 구현

[구역 2 안내](https://xboxplay.games/pokemon-legends-za/how-to-100-wild-zone-2-in-pokemon-legends-za-68012)는 북동쪽 다리와 중앙의 여러 다리가 모이는 구간을 설명한다. [별도 안내](https://gamingpromax.com/pokemon-legends-z-a-wild-zone-2-complete-guide/)도 북동쪽 다리를 언급한다. 기존 남동쪽 다리 외에 북동쪽 바깥쪽과 중앙 섬을 잇는 두 번째 보행 다리를 추가했다. 기존 수면 세 칸을 통행 가능하게 한 것이므로 이전 보행 가능 좌표는 그대로 유지된다.

이는 원작에 다리가 여러 개 있고 북동쪽 연결이 있다는 방향 관계만 반영한다. 실제 다리의 정확한 위치·각도·폭, 수역 경계와 바깥쪽 도로는 미확인 초안이다. 구역 밖 Rouge Plaza·Centrico 도로와 Café Woof의 실제 위치·내부도 이 변경에서 완성하지 않았다. 보르쥐 공격과 도주의 세부 조건 및 거북손손 반응은 추가 자료 확인이 필요하다.

## 구역 2 동남쪽 섬과 바위·얕은 물 — 부분 구현

[구역 2 설명](https://www.wikidex.net/wiki/Zona_salvaje_2)은 동쪽의 분리된 구역이 바위깨기와 얕은 물을 지나 접근할 수 있다고 설명한다. [구역 2 안내](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-2-guide-all-pokemon-and-alphas)는 그곳을 동남쪽 물가라고 설명한다. 동남쪽에 바위로 막힌 입구, 건널 수 있는 얕은 물과 작은 섬을 추가했다. 선두 포켓몬이 바위깨기를 알아야 바위를 제거할 수 있으며, 통로 개방은 저장된다.

구체적인 타일 좌표·섬 크기·물 깊이와 지형 연결은 초안이며 원작 지도에 정확히 일치한다고 볼 수 없다. 야생 우두머리 잉어킹·별가사리와 출현 조건은 아직 추가하지 않았다. 예전 버전에서 새 지형의 동남쪽 칸에 저장한 경우 같은 구역의 접근 가능한 육지로 좌표를 옮기고 파티·지갑·진행을 보존한다. 리비전 불일치는 기존과 같이 복구하지 않는다. Rouge Plaza·Centrico 도로, Café Woof의 실제 위치와 내부 역시 미완성이다.

## 구역 2 동남쪽 섬의 우두머리 — 부분 구현

[구역 2 안내](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-2-guide-all-pokemon-and-alphas)는 Emma의 의뢰를 마친 뒤 동남쪽에 낮의 우두머리 잉어킹 Lv.30과 밤의 우두머리 별가사리 Lv.32가 나타난다고 설명한다. [우두머리 잉어킹 보도](https://www.gamesradar.com/games/pokemon/a-brave-alpha-magikarp-in-pokemon-legends-z-a-is-getting-revenge-by-blasting-unsuspecting-players-with-hydro-pump-instead-of-the-usual-splash-attack/)는 하이드로펌프 사용을 확인한다. 바위 통로를 열고 기존 세 의뢰를 마치면 섬에서 시간에 맞는 우두머리와 전투·포획할 수 있다. 전투 도주 시 재도전할 수 있고 처치·포획 후 구역을 벗어나면 재출현한다.

섬 좌표·의뢰 완료를 판별하는 세부 경계·재출현 방식은 임시다. 우두머리의 접근·실시간 공격과 별가사리의 고유 기술은 아직 구현하지 않았다. 직접 필드 투구는 아래 항목을 참조한다. 위치의 정확한 도트 전환 및 Rouge Plaza·Centrico·Café Woof는 여전히 미완성이다.


## 구역 2 섬 우두머리 필드 투구 — 부분 구현

[포켓몬 공식 안내](https://legends.pokemon.com/en-us/news/adventure)는 필드에서 야생 포켓몬을 조준해 볼을 던질 수 있고 우두머리는 발견 시 추격·공격한다고 설명한다. 섬 우두머리를 가까이서 직접 조준해 볼을 던질 수 있도록 연결했다. 서버는 위치·출현 조건·볼 수량을 재확인하고 포획과 소모를 함께 저장한다. 실패하면 해당 우두머리와 기존 전투가 시작된다.

조준 사거리·실패 시 즉시 전투·개체 출현 조건은 초안이다. 현재 전투는 턴 방식이며 우두머리의 실시간 추격·공격과 플레이어 회피, 뒤쪽 판정은 아직 구현되지 않았다. 구역 2 수역의 정확한 윤곽과 Rouge Plaza·Centrico·Café Woof의 실제 지형도 미완성이다.

## Rouge Plaza 원형 정원과 북쪽 이동식 센터 — 부분 구현

[루주 광장 설명](https://bulbapedia.bulbagarden.net/wiki/Rouge_Plaza)은 광장이 원형 정원이며 중앙 대부분을 야생 구역 3이 차지하고, 북쪽 노점에서 포켓몬을 회복할 수 있다고 설명한다. 기존 사각형 초안의 중앙 야생 구역을 원형에 가깝게 바꾸고 바깥 정원 구역과 북쪽 회복 노점을 추가했다. 회복 노점은 상점 판매 없이 기존 회복 경로를 사용한다. 바뀐 지형은 기존처럼 걸을 수 있어 이전 저장 좌표를 막지 않는다.

정확한 정원 윤곽·화단·건물·작은 흰색 탑의 위치·담장과 도로 폭은 자료상 여기서 확정하지 못했고 아직 초안이다. 구역 3과 광장은 현재 단일 맵이며, 구분된 실제 입구·Centrico까지의 도로와 내부 이동 경로는 완성되지 않았다. Cafe Woof의 실제 건물·내부와 구역 2 수역 전체 윤곽 역시 남아 있다.


## Rouge Plaza 정원 탑과 사다리 — 부분 구현

[루주 광장 설명](https://bulbapedia.bulbagarden.net/wiki/Rouge_Plaza)은 원형 정원의 작은 흰 탑과 사다리로 접근 가능한 위층을 설명하고, [구역 3 안내](https://www.gameshedge.com/pokemon-legends-z-a-shiny-pokemon-guide/)는 정원 중앙의 탑을 언급한다. 탑의 사다리와 별도 위층을 추가해 왕복할 수 있도록 연결했다. 이후 자료 대조에 따라 아래 항목처럼 서쪽으로 옮겼다. 위층에서 저장·재접속해도 위치를 복원하고, 종전 정원 저장 좌표는 유지한다.

탑의 정확한 위치·크기·내부 구조, 사다리 방향과 위층의 실제 출현물은 확인하지 못한 초안이다. 원형 정원의 정확한 윤곽·담장·입구와 주변 도시 도로, Café Woof 및 구역 2 수역의 전체 형상은 아직 미완성이다. 실시간 전투·회피는 이번 변경에 포함되지 않는다.


## Rouge Plaza 네 정원과 서쪽 탑 — 부분 구현

[WikiDex 구역 3 설명](https://www.wikidex.net/wiki/Zona_salvaje_3)은 원형 구역이 중앙 통로와 담장으로 나뉜 네 개의 정원으로 구성되고, 탑이 서쪽에 있으며 출입구가 남북에 있다고 설명한다. [현장 안내](https://www.screenhype.co.uk/how-to-catch-all-the-pokemon-in-wild-zone-3/)도 구역이 분할돼 있고 서쪽 건물에 우두머리가 있다고 설명한다. 기존의 중앙 탑 표식을 서쪽으로 옮기고 남북 통로와 양쪽 정원을 나누는 이동 불가 담장 및 통과할 수 있는 틈을 추가했다. 탑 위층의 기존 저장은 그대로 복원하며, 새 담장에 겹치는 이전 버전 저장은 같은 구역의 인접한 이동 가능 위치로 복구한다.

담장의 개별 좌표·틈·간격, 탑의 정확한 크기와 사다리 방향은 초안이다. 일부 자료는 탑을 동쪽이라고 설명하므로 원작 화면을 통한 정밀 위치 확인도 남아 있다. 남쪽 출입은 기존 경로로 연결되지만 북쪽 출입구와 Rouge Street의 실제 경로는 아직 구현되지 않았다. 구역 2 수역 전체, Centrico 도로 및 Café Woof의 건물·내부와 실시간 전투·회피도 미완성이다.

## 구역 3 탑 방향 대조 — 미확정

[게임 화면과 지도를 싣는 GamesRadar 안내](https://www.gamesradar.com/games/pokemon/pokemon-legends-z-a-yoga-master-guidance/)와 [Nintendo Life 구역 3 안내](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-3-guide-all-pokemon-and-alphas)는 탑 건물이 서쪽에 있다고 설명한다. 반면 [Pokémon Central Wiki](https://wiki.pokemoncentral.it/Zona_selvaggia_3)는 동쪽이라고 설명해 서로 충돌한다. 서쪽 설명이 여러 자료에서 확인되지만, 이번 조사에서는 게임 내 지도 방향을 직접 판독하거나 영상으로 동선을 대조하지 못했다. 현재 서쪽 배치는 계속 초안으로 둔다. 탑의 정확한 좌표·출입 방향과 주변 담장의 위치도 미확정이다.

## Rouge Plaza 북쪽 Rouge Street — 부분 구현

[구역 3 설명](https://www.wikidex.net/wiki/Zona_salvaje_3)은 남북 출입구가 각각 Rouge Street의 남북 구간으로 이어진다고 설명하고, [미르시티 도로 설명](https://bulbapedia.bulbagarden.net/wiki/Lumiose_City)은 Rouge Street 북쪽이 North Boulevard와 연결되고 인근에 포켓몬센터가 있다고 설명한다. 구역 3 북쪽 문과 북쪽 도로 구간을 왕복 가능하게 연결하고 회복 가능한 센터를 배치했다. 이 구간에서 재접속해도 위치와 파티·지갑을 보존한다.

도로와 센터의 정확한 폭·좌표·건물 외형은 초안이고 North Boulevard의 좌우 구간으로는 아직 연결되지 않는다. 센터의 상세 내부, 주변 시설, 루주 광장 담장의 정확한 형상도 미완성이다. 구역 2 수역과 Café Woof의 실제 형태, 실시간 전투·회피도 남아 있다.


## Rouge Plaza 네 정원의 위치별 조우 — 부분 구현

[구역 3 위치 안내](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-3-guide-all-pokemon-and-alphas)는 사자코·판짱을 북서, 냐스퍼를 북동, 메이클을 남서, 피카츄를 남동, 플라베베를 중앙에서 찾는다고 설명한다. [다른 안내](https://www.screenhype.co.uk/how-to-catch-all-the-pokemon-in-wild-zone-3/)는 판짱을 남서쪽에서도 발견할 수 있다고 설명한다. 현재 초안의 담장과 통로 안에서 풀숲 위치에 따라 이 출현 후보를 사용하도록 연결했다.

이는 기존 풀숲 무작위 전투의 위치 구분이다. 화면에 보이는 대표 개체에 대해서는 아래 항목을 참조한다. 정원 좌표·정확한 출현 비율·레벨은 초안이다. 중앙의 기존 플라베베 낮 제한은 유지했으나 자료에 따라 시간 정보가 달라 재확인이 필요하다. 지형의 정확한 윤곽, 탑 방향의 충돌 해결, Rouge Street와 구역 2·Centrico·Café Woof의 정밀 재현, 실시간 전투·회피는 여전히 미완성이다.


## Rouge Plaza의 보이는 야생 개체 — 부분 구현

[구역 3 안내](https://www.screenhype.co.uk/how-to-catch-all-the-pokemon-in-wild-zone-3/)는 각 정원에서 냐스퍼의 도주, 피카츄·메이클·사자코의 공격성, 중앙 플라베베의 차분한 반응을 설명한다. 기존 네 정원 초안에 사자코·판짱·냐스퍼·메이클·피카츄·플라베베 대표 개체를 표시하고 가까이서 조준·직접 포획할 수 있게 연결했다. 냐스퍼는 접근 시 이동·도주하고, 공격적인 개체는 접촉 시 기존 야생 전투로 전환한다. 포획 결과·볼 수량과 개체 상태는 서버가 저장하며 구역을 나가면 개체가 초기화된다.

개체의 정확한 좌표·수·감지 거리·도주 속도, 공격 시 접촉 거리와 재출현 조건은 초안이다. 현 상태는 플레이어 이동에 따라 반응하며, 원작처럼 실시간으로 추격·공격하거나 플레이어가 회피하지는 않는다. 플라베베의 낮 제한은 기존 처리이며 출현 시간은 출처에 따라 달라 재확인이 필요하다. 정원의 정확한 지형·탑 방향과 구역 2 수역·Centrico·Café Woof도 미완성이다.

## 필드 회피 이동 — 기반 구현

[Z-A 전투 설명](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_battle_%28Legends%3A_Z-A%29)은 플레이어가 회피 동작을 사용할 수 있다고 설명한다. 필드에서 Shift 또는 Y, 화면의 회피 버튼으로 바라보는 방향에 최대 두 칸 이동하는 입력을 추가했다. 서버가 기존 이동과 같은 충돌·구역 이동·야생 조우 판정을 각 칸에 적용하고 저장 버전을 확인한다. 두 칸과 0.9초 간격은 구현을 위한 임시값이다.

현재는 필드 이동만 지원한다. 실시간 적 공격·플레이어 피격, 회피 무적 시간과 전투 중 회피는 구현되지 않았다. 루주 광장 탑 방향과 실제 지형, 구역 2 수역·다리, Centrico 도로, Café Woof의 정확한 위치와 내부는 계속 미확정 또는 미완성이다.

## 전투 방식 변경 지시

사용자의 최신 요청에 따라 탐험 전투는 기존 포켓몬 게임처럼 명령을 고르는 턴제를 유지한다. 위의 실시간 전투·전투 중 회피는 더 이상 구현 목표가 아니다. 야생 조우와 트레이너전은 기존 턴제 엔진을 사용하며, 필드의 두 칸 회피 이동은 전투 밖 이동 기능으로 유지한다. 기존 저장 및 이미 열려 있는 포획 기회는 이 결정만으로 변경하지 않는다.

맵 원작 재현 요구는 그대로다. 루주 광장의 탑 방향과 정원의 세부 윤곽, 구역 2 수역·다리, Centrico 도로 및 Café Woof의 위치·내부는 추가 자료 대조와 구현이 필요하다. 구역별로 확인된 사실과 임시 좌표는 위 기록을 따른다.

## 구역 2 남쪽 입구 왼편 다리 — 부분 구현

[야생 구역 2 안내](https://thegameslayer.com/guides/pokemon-legends-z-a-all-wild-zone-2-pokemon/)는 남쪽 입구에서 왼쪽, 꼬몽울 근처의 나무다리를 건너 광장 중앙으로 갈 수 있다고 설명한다. 기존 초안 지도에 남쪽 입구 왼편과 중앙 섬을 잇는 통행 가능한 다리를 추가했다. 기존 우측 다리와 저장 좌표는 보존했다.

좌측이라는 상대 위치와 연결은 자료에 근거하지만 정확한 타일 좌표·길이·폭은 초안이다. 기존 동쪽 다리의 실제 유무와 수역 윤곽은 영상 대조가 더 필요하며, 이 변경만으로 구역 2의 원작 지형 전체를 완성한 것은 아니다.

## 구역 2 출입구·수역 대조 — 추가 확인

[WikiDex의 구역 2 설명](https://www.wikidex.net/wiki/Zona_salvaje_2)은 원형 둘레 안의 큰 호수·중앙 섬·목조 다리와 남쪽 및 북서쪽 출입구를 설명한다. 두 출입구는 각각 Vert Street 남쪽과 북쪽 구간으로 연결된다고 명시한다. 동쪽 우두머리 구역은 바위를 깨고 얕은 물을 지나 접근한다고도 설명한다. [구역별 현장 안내](https://gamerpillar.com/wild-zone-2-all-pokemon-locations-pokemon-legends-z-a/)는 북쪽 나무다리와 남쪽 입구 왼편 꼬몽울을 각각 설명하지만 다리의 총개수나 정확한 좌표를 확정하지 않는다.

현재 초안에서 남쪽 출입은 Vert Plaza, 북서 출입은 Vert Sector 2라는 별도 지도에 연결되어 있다. 이 지도의 범위와 원작 Vert Street 남북 구간의 연결 관계는 아직 검증되지 않았으므로 동일하다고 간주하지 않는다. 추가된 남서·기존 남동·북동 다리의 방향과 개수, 수역의 정확한 형태 역시 원작 화면과의 위치별 대조가 필요하다. 이번 조사에서는 게임 내 방향이 식별되는 화면으로 그 좌표를 확인하지 못해 타일이나 저장 좌표를 변경하지 않았다.

## Café Woof 테라스 — 부분 구현

[Poképédia의 Café Woof 설명](https://www.pokepedia.fr/Caf%C3%A9_Toutou)은 Z-A에서 플레이어와 선택한 포켓몬이 음료를 마시며 카페 테라스에 앉는 장면을 설명한다. 기존 Vernal Avenue 카페 표식 앞에 보행 가능한 포장 테라스와 작은 탁자 표현을 추가했다. 기존 카페 주문과 주변 도로 연결, 저장 좌표를 유지한다. 탁자 표시는 장식이며 장애물이나 앉기 기능은 아니다.

테라스의 실제 크기·좌석 위치와 건물 외관·정확한 주소 좌표는 아직 확인하지 못한 초안이다. 원작처럼 착석·사진 촬영하는 기능도 아직 구현되지 않았다.

## 구역 2 추가 스크린샷 — 방향 확인 대기

[실플레이 스크린샷](https://www.gamerguides.com/assets/media/17/428/wild_zone_2_binacle_battle_pokemon_za-7917c7cf.jpg)의 미니맵에 중앙 섬으로 이어지는 다리 세 개가 보인다는 별도 확인이 전달됐다. 방향은 대략 북동·북서·남서로 추정됐지만, 이번 작업 도구에서는 이미지 본문과 지도 북쪽을 직접 판독하지 못했다. 따라서 이는 전달받은 관찰이며 독립 확인 결과가 아니다. 현재 초안의 남동 다리와 새로 제시된 북서 방향의 차이는 추가 교차 검증이 필요해 지형을 수정하지 않았다.

## 구역 2 세 다리·북서 발판 — 부분 구현

별도로 확보한 [원작 지도](https://thegameslayer.com/wp-content/uploads/2025/10/IMG_3876.jpeg)와 [구역 2 지도](https://thegameslayer.com/wp-content/uploads/2025/10/IMG_3878.jpeg)를 실플레이 미니맵의 북쪽 표시와 대조한 결과, 중앙 섬의 목교는 북서·북동·남남서 세 방향으로 확인됐다고 전달받았다. 남쪽 입구는 남남서 다리보다 동쪽이며, [동쪽 통로 안내](https://gamewith.jp/pokemon-za/524388)의 바위 뒤 얕은 물을 지나 남동쪽에 접근한다. 이 환경에서 이미지 본문을 직접 판독하지는 못했다.

전달된 대조 결과에 따라 초안의 남동 직결 다리를 없애고 북서 다리와 높은 발판을 연결했다. 기존 북동·남남서 다리와 북쪽 계단을 유지하고, 남동쪽 바위 통로와 기존 저장의 파티·진행 데이터를 보존한다. 예전 남동 다리 위치에 저장된 정상 버전은 가까운 보행 가능 지점으로 옮긴다. 상세 타일 좌표·거리·발판 형태와 실제 수역 윤곽은 계속 초안이다.

## 구역 2 동쪽 해안 우회로 — 부분 수정

전달된 원작 지도 대조와 [동쪽 바위 통로 안내](https://gamewith.jp/pokemon-za/524388)에 맞춰 남쪽과 동쪽 해안 사이에 물가를 배치했다. 현재 중앙 섬에서 동쪽 바위 앞까지의 대표 경로는 북동 다리와 동쪽 해안을 통과하며, 바위를 깨야 얕은 물 건너 우두머리 구역으로 이동할 수 있다. 이전 지형에서 새 물가가 된 칸에 저장된 정상 버전은 가장 가까운 보행 가능 칸으로 복구한다.

새 물가의 타일 좌표와 곡선은 실제 원작 치수를 측정한 것이 아니라 연결을 표현한 초안이다. 북서 발판·동쪽 바위와 호숫가의 세부 형상, 주변 도시 접근은 추가 시각 대조가 필요하다. 이 환경에서는 원작 이미지 본문을 직접 판독하지 못했다.
