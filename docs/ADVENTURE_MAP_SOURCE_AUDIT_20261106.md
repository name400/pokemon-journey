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

## Rouge Plaza와 묘지 사이 북쪽 거리 — 부분 수정

[야생 구역 4 안내](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-4-guide-all-pokemon-and-alphas)는 묘지가 구역 3 북쪽에 있고 음식점 너머에 있다고 설명한다. [별도 안내](https://www.gamerguides.com/pokemon-legends-z-a/guide/wild-zones/rogue-plaza/all-wild-zone-3-pokemon-locations)는 묘지를 Looker Bureau 북동쪽으로 설명한다. 기존 구역 3 서쪽의 묘지 직결 출구를 제거하고 북쪽 거리에서 동쪽 묘지로 왕복하도록 연결했다. 구역 3의 옛 서쪽 출구 칸에 저장된 유효한 위치는 인접한 보행 칸으로 복구한다.

북쪽 거리의 폭과 묘지 출구의 정확한 위치는 초안이며, 음식점 건물과 상세 동선은 아직 구현하지 않았다. 야생 구역 3 동쪽의 다른 임시 연결과 Centrico 도로도 원작 위치에 맞는지 추가 대조가 필요하다.

## 묘지 서쪽 입구 의뢰인 — 부분 수정

[사이드 미션 위치 목록](https://www.gamerguides.com/pokemon-legends-z-a/checklists/side-missions-locations)은 묘지의 깜까미 의뢰인 Moire가 야생 구역 4의 서쪽 게이트에 있다고 설명한다. 기존에 루주 광장 서쪽에 배치된 의뢰인을 북쪽 거리의 묘지 진입점 근처로 옮겼다. 의뢰 수락·반지 반환은 새 위치에서 처리하며 기존 의뢰 상태와 보상 진행은 보존한다.

묘지 입구와 의뢰인의 정확한 타일 좌표, 북쪽 거리 음식점의 건물 위치와 외형은 초안이다. 음식점의 식사·연속 배틀 기능은 아직 구현하지 않았다.

## 북쪽 거리 Sushi High Roller — 건물 초안

[Nintendo Life의 구역 4 안내](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-4-guide-all-pokemon-and-alphas)는 음식점 너머가 구역 4라고 설명하고, [Bulbapedia 음식점 안내](https://bulbapedia.bulbagarden.net/wiki/Sushi_High_Roller_%28Lumiose_City%29)는 이 음식점이 Rouge Street에 있다고 설명한다. 북쪽 거리 초안의 묘지 접근로 근처에 건물과 상호작용 지점을 추가했다. 기존 도로·의뢰인·센터로 이동할 수 있으며 건물 부지에 저장된 옛 위치는 가까운 통행 가능 칸으로 복구한다.

정확한 건물 위치·크기·외형과 내부는 확인하지 못해 초안이다. 실내 입장과 사이드 미션 73 및 식사 연속 배틀은 아직 구현되지 않았다. 확인된 자료에 따르면 원작의 재도전은 5코스와 비용이 있으므로 임의의 단일 전투를 완성된 식사 배틀로 취급하지 않는다.

## Sushi High Roller 실내 — 부분 구현

[원작 음식점 설명](https://bulbapedia.bulbagarden.net/wiki/Sushi_High_Roller_%28Lumiose_City%29)은 실내에 배틀 코트가 있다고 설명하고, [미션 목록](https://www.gamerguides.com/pokemon-legends-z-a/checklists/side-missions-locations)은 접수원을 통해 미션 73을 시작한다고 설명한다. 북쪽 거리의 음식점 입구에서 접수원과 배틀 코트가 있는 별도 실내로 입장하고 남쪽 출구로 돌아갈 수 있게 했다. 실내 재접속 시 위치·파티·지갑을 보존한다.

접수원과 코트의 정확한 좌표, 방 크기·가구·외형은 초안이다. 미션 73의 해금 조건, 5코스 진행과 연속 턴제 배틀·보상·패배/저장 복구는 아직 미구현이다. 따라서 접수원은 현재 안내만 제공하고 비용을 청구하지 않는다.

## Sushi High Roller 코스 상대 데이터 — 전투 연결 전

[원작 식당 배틀 목록](https://bulbapedia.bulbagarden.net/wiki/Sushi_High_Roller_%28Lumiose_City%29)에 기재된 다섯 코스의 상대 포켓몬 15마리와 레벨·기술을 `adventure-sushi.mjs`에 등록했다. 기존 턴제 엔진에서 대표 코스 팀을 생성할 수 있는지 확인했다. 원작은 상대 셋이 동시에 등장하지만 현재 모험 엔진은 싱글 턴제이므로 실제 배틀 연출·규칙과의 연결은 아직 하지 않았다.

[미션 안내](https://www.gamerguides.com/pokemon-legends-z-a/database/missions/side-missions/full-course-of-battles-high-rolling)에 따르면 미션 73은 메인 미션 24부터 가능하며 첫 완료 보상은 파비·또뽀·시마열매 각 10개다. 현재 메인 스토리는 미션 10 단계까지 부분 연결되어 있어 미션 24 도달을 판정할 수 없다. 코스 간 회복 금지, 5연전 진행·승패·저장 복구, 최초 보상과 3만 코인 재도전 및 재도전 보상 지급은 아직 미구현이다. 상대의 성별과 Z-A의 무특성 규칙도 턴제 엔진에 아직 반영하지 않았다.

## Sushi High Roller 5코스 서버 경로 — 조건부 연결

미션 73 첫 도전과 5코스 승리, 코스 사이 회복·파티 변경 제한, 다음 코스 및 중단, 패배 시 센터 복귀를 기존 싱글 턴제 엔진에 연결했다. 상대 3마리는 현재 엔진에서 순차적으로 등장한다. 코스와 대기 보상은 저장되며, 첫 완료 보상은 파비·또뽀·시마열매 각 10개다. 완료 후 재도전은 30,000코인을 원자적으로 차감하고, 성공 보상으로 큰금구슬 2개와 숙달의씨 1개를 지급한다. 보상 수령은 별도 동작으로 중복 지급되지 않으며 보유 한도 초과 등 저장 실패 시 대기 상태를 보존한다. 원작의 동시 3마리 전투와는 다른 사용자의 싱글 턴제 요청에 따른 처리이며, 숙달의씨를 기술플러스에 사용하는 기능은 미구현이다.

해금 조건은 미래 스토리에서 명시적으로 기록할 `zaMission24Started`에 연결했지만, 현재 메인 스토리는 미션 10까지 부분 구현되어 있어 정상 플레이에서는 아직 이 값을 얻을 수 없다. 따라서 **실제 게임에서는 식사 배틀이 아직 해금되지 않는다**. 격리 테스트에서만 미션 24 상태를 만들어 전체 5코스·저장 복구·회복 제한·재도전과 보상을 확인했다. 원작의 상대 성별·무특성 처리, 전투 세부 규칙과 미션 24까지의 이야기 연결도 남아 있다.

## 미션 10 호텔 밖 동료 배틀 — 부분 구현

[Urbain의 미션 10 배틀 자료](https://bulbapedia.bulbagarden.net/wiki/Urbain)와 [진행 안내](https://www.thonky.com/pokemon-legends-z-a/main-mission-10-the-secrets-of-mega-evolution)에 따라 호텔 밖 동료와 배틀하고, 앱솔과 앱솔나이트를 준비하는 조건을 추가했다. 상대의 두 스타터 포켓몬은 선택한 타입에 따라 달라지며 Lv.25, 썬더볼트는 Lv.26과 썬더볼트나이트를 지닌다. 기존 턴제 엔진에서 썬더볼트가 메가진화할 수 있다. 승리 보상은 1,560코인이며 승패와 관계없이 다음 이야기 단계로 진행된다.

현재 모험 시작 포켓몬은 원작 Z-A의 스타터 선택과 다르므로 동료에게 풀·불꽃·물 중 기준 타입을 직접 선택하도록 했다. 앱솔은 파티에 있으며 앱솔나이트를 지녀야 하지만, 실제 배틀에 반드시 내보냈는지까지는 검사하지 않는다. 상대의 능력·연출은 기존 턴제 엔진을 따른다. 동료의 정확한 위치는 초안이며, 이어지는 콰자르티코 입구·데덴네 배틀·Vinnie와 미션 10 이후부터 24까지의 이야기는 아직 미구현이다.

## 미션 10 콰자르티코 도착 — 부분 구현

[도시 지도 안내](https://www.gamesradar.com/games/pokemon/pokemon-legends-z-a-mega-stones-locations/)는 콰자르티코가 루주 광장의 서쪽에 있다고 설명하고, [시설 안내](https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/quasartico-inc.html)는 회사가 North Boulevard와 연결되며 건물 앞 데덴네 두 마리가 미션 10의 필수 배틀이라고 설명한다. 루주 북쪽 거리에서 북쪽 큰길과 회사 앞뜰을 오가는 초안 구간을 연결하고, 데덴네를 물리친 뒤 Vinnie와 이야기하도록 미션 10을 이어 붙였다. 새 구역의 위치는 저장·복구된다.

원작은 동료와 데덴네 둘을 동시에 상대하는 멀티 배틀이다. 사용자 요청에 맞춰 현재는 동료가 한 마리를 맡고 플레이어가 다른 Lv.30 데덴네 한 마리와 싱글 턴제로 싸우는 구성이다. 데덴네의 기술과 동료의 전투 연출은 초안이다. 건물·길의 정확한 크기·좌표와 원작 화면 일치 여부도 미확인이다. Vinnie의 설명 이후 도전권을 얻는 배틀존과 승급전, 식당 미션 24까지의 나머지 이야기는 아직 구현하지 않았다.

## 미션 10 랭크 V 배틀존과 Vinnie 승급전 — 부분 구현

[미션 10 안내](https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Legends:_Z-A/Part_10)의 밤 시간 티켓포인트 6,000점, Vinnie의 네 마리와 레벨·기술·할비롱 메가진화, 승리 시 랭크 F·2,048원·기술머신 051 신비의부적을 기존 턴제 배틀과 저장에 연결했다. [랭크 V 트레이너 목록](https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/Z-A_Royale_Trainers)에서 Jaques·Anna·Warren 세 팀을 대표 상대로 연결했다. 각 승리의 550점과 재입장해 상대를 다시 만나는 방식은 정확한 원작 점수가 확인되지 않은 임시 진행 규칙이다. 승급전 패배 후 티켓포인트는 보존하고, 기술머신 보상은 별도로 한 번만 수령한다.

기술머신은 가방에 지급되지만 기술을 가르치는 기능은 아직 없다. 승급 후 콰자르티코 사무실·카페·호텔 이야기와 미션 11~24는 아직 연결되지 않았고, 트레이너의 개별 점수와 배틀존 배치·도시 지형은 원작 동등성이 미확인이다. 위 이전 절의 승급전 미구현 서술은 이 절로 갱신되며, 나머지 지형과 멀티 배틀의 한계는 그대로다.

## 미션 10 승급 후 이야기 — 부분 구현

[미션 순서](https://pokemondb.net/legends-z-a/missions)와 [진행 안내](https://www.neoseeker.com/pokemon-legends-z-a/Main_Mission_10-13)에 따라 콰자르티코 사무실에서 Vinnie의 설명, 안내 직원의 메가조각 교환 안내, 누보 카페 만남, 호텔 작전 회의까지 연결했다. 안내 후 기존 메가스톤 교환 기능을 해금하며 기존 저장의 단계·파티·지갑을 보존한다. 누보 카페가 [Centrico Plaza 인접 Vert Street에 있다는 자료](https://bulbapedia.bulbagarden.net/wiki/Nouveau_Cafe)를 바탕으로 인근 기존 거리 초안에 카페 표식을 두었다. 정확한 좌표, 사무실의 크기와 가구 배치, 대화 및 연출은 임시 구현이다.

회의에서 폭주 야도란·폭타·우츠보트 사건을 안내하지만 미션 11~13의 실제 장소·전투·완료 처리는 아직 미구현이며, 미션 10 자체를 완료 처리하지 않는다. 이후 이야기와 미션 24, 기술머신 사용도 남아 있다. 각 장면은 저장 후 복구되고 중복 진행은 거부된다. 실제 기기와 배포 사이트에서는 검증하지 않았다.

## 미션 11 폭주 메가야도란 — 부분 구현

[진행 안내](https://www.thonky.com/pokemon-legends-z-a/main-mission-11-a-rogue-mega-slowbro)의 남쪽 수변 전투와 야도란나이트 보상을 기반으로, 기존 Vernal Avenue 초안에 임시 수변 표식을 연결하고 메가야도란과의 턴제 전투 및 보상 수령을 구현했다. 패배 시 재도전할 수 있고 보상을 받을 공간이 없으면 수령 대기 상태를 보존한다. 미션 10은 다른 두 사건까지 마치기 전 완료 처리하지 않는다.

수변의 정확한 좌표·도로와 상대 레벨 34·기술 구성은 임시다. 안내 자료의 권장 레벨을 적용한 것이며 상대의 실제 레벨로 확인한 수치가 아니다. 원작의 동료 동시 참전은 아직 구현하지 않았고 현재 플레이어 단독 전투다. 폭주 폭타·우츠보트와 세 사건 이후 이야기도 미구현이다. 위 절의 미션 11 전투 미구현 서술은 이 절로 갱신된다.

## 미션 12·13과 미션 10 마무리 — 부분 구현

[폭타 사건 안내](https://www.thonky.com/pokemon-legends-z-a/main-mission-12-a-rogue-mega-camerupt)의 Tony의 Lv.32 저리어·둔타, 승리 보상 1,536원과 회복 및 폭타나이트, [우츠보트 사건 안내](https://www.thonky.com/pokemon-legends-z-a/main-mission-13-a-rogue-mega-victreebel)의 북쪽 큰길 전투와 우츠보트나이트를 연결했다. 세 사건을 모두 해결하면 호텔 앞에서 [Lv.33 지가르데와 배틀하고 돌을 받는 장면](https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Legends:_Z-A/Part_11)을 거쳐 미션 10을 완료한다. 별도로 받지 않은 메가스톤은 완료 이후에도 수령할 수 있다.

현재 폭타는 기존 공사 현장에 임시 연결했으며 원작의 프리즘타워 북동쪽 현장·비계 동선은 미구현이다. 우츠보트의 정확한 위치도 초안이다. 두 보스의 Lv.34와 기술은 임시이며 원작의 동료 동시 전투와 보스 기믹은 구현하지 않았다. 지가르데 이후 L 대화는 간략화했고 미션 14와 기술머신 사용은 미구현이다. 위 미션 11 절의 다른 두 사건 미구현 서술은 이 절로 갱신된다. 대표 승패·포획 제한·재접속·보상 중복 방지를 검사했으며 운영과 실기기는 미검증이다.

## 미션 14 호텔 앞 Naveen 배틀 — 부분 구현

[미션 안내](https://www.thonky.com/pokemon-legends-z-a/main-mission-14-reaching-rank-e)와 [상대 기술 자료](https://www.serebii.net/legendsz-a/mainmissions/reachingranke.shtml)에 따라 미션 10 완료 뒤 호텔 앞에서 Naveen의 Lv.33 아리아도스·깜까미·곤율랭과 턴제 배틀을 연결했다. 원작 기술과 승리 보상 1,848원을 적용하고 패배 후 재도전 및 저장 복구를 지원한다. 호텔 앞 좌표는 기존 지도 초안이다.

원작의 티켓포인트 32,000점, 밤의 랭크 F 배틀존, Canari 퀴즈·승급전과 미션 15는 미구현이며 랭크는 F로 유지한다. 이번 변경은 지형을 원작에 맞게 추가 수정하지 않았다. 위 절의 미션 14 미구현 서술 중 호텔 앞 배틀은 이 절로 갱신된다.

## 미션 14 랭크 E 승급 — 부분 구현

[랭크 F 상대 자료](https://bulbapedia.bulbagarden.net/wiki/List_of_Z-A_Royale_Trainers/F)의 Arthur·Manon·Leandro와 32,000점 도전권을 배틀존에 연결했다. 승리당 3,200점과 재입장 방식은 원작 값이 확인되지 않은 임시 규칙이다. [미션 14 안내](https://www.thonky.com/pokemon-legends-z-a/main-mission-14-reaching-rank-e)와 [상대 기술 자료](https://www.serebii.net/legendsz-a/mainmissions/reachingranke.shtml)에 따라 암호, OX 문제, 특별한 미르갈레트, Mani·Tarragon·Canari 턴제 전투, 랭크 E, 기술머신 066과 사인 인형을 연결했다. 틀린 답은 단계를 유지한다. 보상은 가방 용량을 확인해 원자적으로 지급한다.

변전소·카페 갈랑·Racine Construction의 구체적 위치와 실내는 미확인으로 기존 도시 초안의 표식에 연결했다. 암호 입력은 단일 버튼이며 지형 이동 퀴즈와 실제 파트너 동행은 미구현이다. Z-A의 무특성·실시간 전투 규칙 대신 사용자 요청의 기존 턴제 엔진을 사용한다. 기술머신 사용 기능과 미션 15 이후 이야기는 미구현이다. 위 절의 미션 14 도전권·퀴즈·승급전 미구현 서술은 이 절로 갱신된다.

## 미션 15~18 폭주 메가진화 — 부분 구현

[미션 15 개요](https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/A_Job_for_Team_MZ%21)에 따라 랭크 E 승급 후 호텔 회의·옥상 안내·세 사건·호텔 보고를 연결했다. [독침붕](https://www.thonky.com/pokemon-legends-z-a/main-mission-16-a-rogue-mega-beedrill), [루차불](https://www.thonky.com/pokemon-legends-z-a/main-mission-17-a-rogue-mega-hawlucha), [다크펫](https://www.thonky.com/pokemon-legends-z-a/main-mission-18-a-rogue-mega-banette)과 턴제 배틀하고 각 메가스톤을 별도로 받을 수 있다. 패배 시 재도전, 가방 용량 부족 시 수령 대기 및 호텔 보고 후 미수령 보상 재방문을 보존한다.

기존 옥상·북쪽 큰길·공사 현장의 사건 표식은 임시 위치로 원작의 Vert Sector 5·Magenta Sector 3·Jaune Sector 9를 재현한 것이 아니다. 상대 Lv.41과 기술도 임시다. 원작의 로토글라이드 실제 조작, 동료 동시 참전, 보스 기믹과 세 사건 후 옥상의 지가르데·L 장면은 미구현이다. 호텔 보고는 이 생략을 표시한 간략 연결이며 미션 19와 기술머신 사용도 미구현이다. 실기기·운영에서는 검증하지 않았다.

## 미션 15 후반과 미션 19 도입 — 부분 구현

[미션 15 안내](https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/A_Job_for_Team_MZ%21)에 따라 세 사건 뒤 옥상의 지가르데·L 대화와 호텔 보고를 연결했다. 이미 이전 버전에서 호텔 보고를 마친 저장도 기존 완료·보상 기록을 유지한 채 옥상 장면을 본 뒤 미션 19로 진행할 수 있다. 옥상 위치·대사와 연출은 초안이다.

[미션 19 안내](https://www.thonky.com/pokemon-legends-z-a/main-mission-19-reaching-rank-d)와 [목표 점수 자료](https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/Reaching_Rank_D)에 따라 랭크 E 배틀존의 35,000점 도전권, Josée의 Lv.43 근육몬·요가램 전투와 2,064원·숙달의씨, Emma와 Ivor의 탐정사무소 대화까지 연결했다. [랭크 E 트레이너 자료](https://bulbapedia.bulbagarden.net/wiki/List_of_Z-A_Royale_Trainers/E)에서 Henri·Clarisse·Apolline의 종과 레벨을 사용했다. 승리당 3,500점, 상대 기술, 정의단 도장 위치는 임시이며 원작과 일치한다고 확인되지 않았다. 시청 수색·카페·하수도·Gwynn·Ivor 승급전과 이후 스토리는 미구현이다. 기존 로토글라이드·동료 동시 참전 등의 미구현도 남아 있다.

## 미션 19 Gwynn 수색과 승급전 — 부분 구현

[미션 진행 안내](https://www.thonky.com/pokemon-legends-z-a/main-mission-19-reaching-rank-d)와 [상대 팀·기술](https://www.serebii.net/legendsz-a/mainmissions/reachingrankd.shtml)을 대조해 시청 단서, 누보 카페, Canari 재대결, 냉동빔으로 분수 얼리기, 하수도 잠긴 문과 클레피 포획, 네 곳 조사·환상 벽, Gwynn 및 Ivor의 턴제 배틀을 연결했다. 클레피를 포획해야 진행하며 일반 전투 포획과 기절 후 포획 기회 양쪽을 지원한다. 승급 후 랭크 D와 기술머신 011을 지급한다.

하수도 지도, 시청·분수·도장의 좌표와 클레피 레벨은 초안이며 원작의 상세 통로·문·동행 장면을 재현하지 않았다. 기존의 턴제 엔진을 사용하고 도구·스토리 단계는 저장된다. 하수도 진입 후 나갔다 다시 들어와도 진행 단계를 보존한다. 호텔에서 받는 퍼포먼스 스니커는 낮에 지급되지만 실제 날짜가 바뀌었는지는 추적하지 않으며 이동 속도 효과도 미구현이다. 기술머신은 지급되지만 가르치는 기능은 미구현이고 미션 20 이후도 미구현이다. 위 미션 19 도입 절의 시청 수색부터 승급전까지 미구현 서술은 이 절로 갱신된다. 실제 기기·운영에서는 검증하지 않았다.

## 미션 20~23 Syndicate와 폭주 사건 — 부분 구현

[미션 20 안내](https://www.thonky.com/pokemon-legends-z-a/main-mission-20-a-request-from-the-rust-syndicate)와 [상대 기술 자료](https://www.serebii.net/legendsz-a/mainmissions/arequestfromtherustsyndicate.shtml)를 대조해 단원·Philippe 턴제 배틀, 빚에 관한 설명과 호텔 회의를 연결했다. 미션 21~23의 [입치트](https://www.thonky.com/pokemon-legends-z-a/main-mission-21-a-rogue-mega-mawile), [거북손데스](https://www.thonky.com/pokemon-legends-z-a/main-mission-22-a-rogue-mega-barbaracle), [전룡과 선행 Gwynn 배틀](https://www.thonky.com/pokemon-legends-z-a/main-mission-23-a-rogue-mega-ampharos), 각 메가스톤과 호텔 보고를 구현했다. 세 사건 후 Philippe의 빈집 의뢰에서 고오스·고우스트·팬텀을 각각 포획하고 입주자에게 이야기하는 흐름까지 연결했다. 포획은 기존 파티·보유함 경로를 사용하며, 일반 포획과 기절 후 포획 기회를 모두 지원한다.

Syndicate 사무소, 빈집과 세 사건의 좌표·상세 구조, 보스 및 빈집 포켓몬 Lv.49, Gwynn 재대결의 기술·보상은 임시다. 사무소 앞의 두 단원은 한 번의 싱글 배틀로 간략화했고 동료의 동시 참전과 활공·보스 기믹은 미구현이다. 빚 대화는 실제 지갑을 차감하지 않는다. 세 사건을 보고해도 미션 20을 완료 처리하지 않으며, 이어지는 하수도 결정 정리·SBC 연전·은행 사건 및 미션 24는 미구현이다. 위 미션 19 절의 미션 20 이후 미구현 서술은 이 절로 일부 갱신된다. 실기기·운영에서는 검증하지 않았다.

앱솔 조건은 [원작 필수 파티 안내](https://bulbapedia.bulbagarden.net/wiki/Required_Party_Pok%C3%A9mon)에서 앱솔나이트를 지닌 앱솔의 파티 보유로 확인했다. 따라서 실제 첫 출전을 강제하지 않고 기존 파티 검사 방식을 유지한다.

## 미션 20 남은 의뢰 — 부분 구현

[미션 진행 자료](https://www.thonky.com/pokemon-legends-z-a/main-mission-20-a-request-from-the-rust-syndicate)와 [상대 팀 자료](https://www.serebii.net/legendsz-a/mainmissions/arequestfromtherustsyndicate.shtml)에 따라 하수도 결정 27개 정리, SBC의 François·Vivica 연속 전투, 은행 안전요원 전투와 호텔·Philippe 보고를 연결했다. 결정별 진행을 저장하며, SBC 두 전투 사이에는 회복하거나 파티를 변경할 수 없다. 패배·취소 시 재도전할 수 있고 첫 전투 보상은 중복 지급하지 않는다. 보고 후 기존 미션 24 관련 식당 해금 플래그가 켜진다.

하수도 구조와 결정 좌표, SBC·은행 사건의 지도 위치 및 상대 기술은 초안이다. 결정 파괴 경험치와 원작의 상세 은행·호텔 연출은 미구현이며, 미션 24의 랭크 C 스토리 진행도 아직 구현하지 않았다. 이번 절이 위 절의 하수도·SBC·은행 사건 미구현 서술을 갱신한다. 기존 포켓몬식 턴제 전투를 사용하며 실제 기기와 운영 저장은 검증하지 않았다.

## 미션 24 랭크 C 승급 — 부분 구현

[진행 안내](https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/Reaching_Rank_C)와 [상대 기술](https://www.serebii.net/legendsz-a/mainmissions/reachingrankc.shtml)에 따라 밤 배틀존에서 38,000점의 도전권을 얻고 Corbeau의 아보크·갸라도스·로즈레이드·펜드라와 턴제 승급전을 치른다. 승리 시 랭크 C와 3,744원을 받고, 사무소에서 기술머신 100을 수령하면 호텔 축하 장면의 간략한 요약과 미션 25 시작이 연결된다. 보상은 중복 지급되지 않는다.

배틀존 승리당 3,800점과 일반 상대의 기술, 사무소 지도는 초안이다. 원작의 보너스 카드와 메가펜드라 변신, 상세 호텔 연출 및 기술머신을 가르치는 기능은 미구현이다. 위 절의 미션 24 미구현 서술은 이 절로 갱신한다. 미션 25의 배틀코트 전투는 아직 미구현이며 실기기·운영 검증도 남았다.

## 미션 25 배틀코트 — 부분 구현

[미션 25 안내](https://www.thonky.com/pokemon-legends-z-a/main-mission-25-a-showdown-on-the-battle-court)에 따라 Lida와 Naveen의 포켓몬·레벨과 승리 보상을 적용하고 기존 턴제 엔진으로 순차 배틀을 연결했다. 각 승리 단계는 저장되며 패배 후 해당 상대에게 다시 도전할 수 있다. 완료하면 미션 26 시작 상태를 기록한다.

Vernal에 배치한 배틀코트 표식과 상대 기술은 초안이다. 메가곤율거니 변신과 상세 동료 연출, 야생 구역 16·17 개방과 미션 26의 SBC 초대는 미구현이다. 이 절이 바로 위 미션 25 전투 미구현 서술을 갱신한다. 실기기·운영은 검증하지 않았다.

## 미션 26 SBC 초대 — 도입 부분 구현

[진행 자료](https://www.thonky.com/pokemon-legends-z-a/main-mission-26-an-invitation-from-the-sbc)에 따라 Asami의 Lv.50 플라제스와 턴제 배틀, 200원 보상, Lebanne의 초대 확인 및 Hotel Z 작전 회의를 연결했다. 패배 시 재도전하며 각 단계는 저장된다.

부티크와 호텔 위치·실내, 상대 기술 및 대사는 초안이다. 원작의 Asami 전투 중 메가진화 필수 조건과 의상 지급은 탐험 턴제 전투에 아직 없어 적용되지 않는다. 세 폭주 사건(미션 27~29), 이후 SBC 배틀과 미션 30, 야생 구역 16·17은 미구현이다. 이 절이 위 절의 SBC 초대 미구현 서술을 일부 갱신한다. 실기기·운영은 검증하지 않았다.

## 미션 26 후반과 미션 27~29 — 부분 구현

[미션 26](https://www.thonky.com/pokemon-legends-z-a/main-mission-26-an-invitation-from-the-sbc) 및 [눈여아](https://www.thonky.com/pokemon-legends-z-a/main-mission-27-a-rogue-mega-froslass), [파비코리](https://www.thonky.com/pokemon-legends-z-a/main-mission-28-a-rogue-mega-altaria), [이상해꽃](https://www.thonky.com/pokemon-legends-z-a/main-mission-29-a-rogue-mega-venusaur) 안내에 따라 세 폭주 포켓몬과 턴제 배틀하고 메가스톤을 개별 수령하도록 연결했다. 이후 Hotel Z에서 Livia·Gérald·Lebanne과 순서대로 대결하고 각 승리와 보상을 저장하며, 세 번째 승리 후 미션 30 시작 상태를 기록한다. 패배한 상대에게 재도전할 수 있다.

세 현장 위치·접근 동선과 보스 Lv.55·기술은 초안이다. 상세 옥상 경로, 동료 동시 참전, 의상 지급, 메가진화 조건 및 Lebanne의 메가드래캄은 미구현이다. SBC 전투 사이 회복 제한의 원작 여부도 미확인이다. 야생 구역 16·17과 미션 30 랭크 B 진행은 미구현이며 실제 기기·운영은 검증하지 않았다. 이 절이 바로 위 절의 세 사건과 SBC 배틀 미구현 서술을 갱신한다.

## 미션 30 랭크 B 승급 — 부분 구현

[진행 안내](https://www.thonky.com/pokemon-legends-z-a/main-mission-30-reaching-rank-b)와 [상대 구성](https://www.serebii.net/legendsz-a/mainmissions/reachingrankb.shtml)에 따라 41,000점 도전권, Canari·Ivor·Corbeau, 50%폼 지가르데, Jacinthe 순서의 턴제 전투와 랭크 B 승급, 기술머신 020 수령을 연결했다. 각 승리와 보상을 저장하고 패배 시 현재 상대에게 재도전한다. 보상 수령 후 미션 31 시작 상태를 기록한다.

배틀존 승리당 4,100점과 상대 기술, 호텔 위치는 초안이다. 보너스 카드, 토너먼트의 상세 연출과 상대 메가진화는 미구현이며 지가르데 전투도 기존 턴제 규칙이다. 실제 기기·운영 검증과 미션 31 이야기는 남아 있다. 야생 구역 16·17도 미구현이다. 이 절이 위 절의 미션 30 미구현 서술을 갱신한다.

## 미션 31~34 Vinnie의 요청 — 부분 구현

[미션 31 진행 자료](https://www.serebii.net/legendsz-a/mainmissions/asummonsfromvinnie.shtml)를 따라 콰자르티코 앞 Vinnie, 사무실의 Jett, Hotel Z 작전 회의를 연결했다. 이어 [망나뇽](https://www.thonky.com/pokemon-legends-z-a/main-mission-32-a-rogue-mega-dragonite), [마기라스](https://www.thonky.com/pokemon-legends-z-a/main-mission-33-a-rogue-mega-tyranitar), [아쿠스타](https://www.thonky.com/pokemon-legends-z-a/main-mission-34-a-rogue-mega-starmie)의 폭주 사건을 기존 턴제 전투로 연결하고 각 메가스톤을 별도로 수령한다. 아쿠스타 전에 Philippe와 대결하며, 세 사건을 해결하고 호텔에 보고하면 미션 35 시작 상태를 기록한다. 사건 완료·보상 대기는 저장되며 패배 후 재도전과 보상 중복 방지를 지원한다.

세 현장 표식과 Lv.60·기술, 사무실과 대사는 초안이며 실제 옥상·골목·홀로베이터 경로와 미션 34의 홀로베이터 선행 의뢰는 미구현이다. Philippe의 메가무장조 변신, 동료 동시 참전과 상세 연출도 미구현이다. 야생 구역 16~19와 미션 35 진행은 아직 구현하지 않았고 실기기·운영 검증은 남았다. 이 절이 위 절의 미션 31 미구현 서술을 갱신한다.

## 미션 35 Grisham 수색 — 도입 부분 구현

[미션 안내](https://www.thonky.com/pokemon-legends-z-a/main-mission-35-reaching-rank-a)와 [상대 구성](https://www.serebii.net/legendsz-a/mainmissions/reachingranka.shtml)을 따라 Emma와의 턴제 배틀, Mable과 누보 카페의 단서, Griselle 배틀과 배틀 후 파티 회복을 연결했다. 기존 연구소 기록 기능은 유지하고, 전투 실패 후 재도전과 단계 저장을 지원한다.

Emma 전투는 탐정사무소 안의 기존 표식, Mable은 기존 연구소 연구원 표식, Griselle은 공사 현장의 임시 표식을 사용한다. 원작의 옥외 전투·연구소 소장실·카페 실제 위치는 재현하지 않았으며 상대 기술과 메가진화도 초안이다. Lysandre Labs 탐색, 열쇠와 문서, AZ 장면, 45,000점 도전권 및 Grisham 승급전과 미션 36은 미구현이다. 야생 구역 16~19 역시 남아 있으며 실제 기기·운영 검증은 하지 않았다. 이 절이 위 절의 미션 35 미구현 서술을 일부 갱신한다.

## 미션 35 연구소 — 축약 구현

[원작 진행 자료](https://www.thonky.com/pokemon-legends-z-a/main-mission-35-reaching-rank-a)에 따라 별도의 연구소 초안에서 키카드 세 장, 포획 불가 Lv.50 킬가르도, 승강기 열쇠, B3F 자료 네 개와 L의 설명을 연결했다. 카페에서 Grisham과 대화한 뒤 Hotel Z에서 AZ의 설명을 들을 수 있다. 카드·층·전투 상태와 진행은 저장된다.

연구소는 단순한 초안 지도이며 원작의 방·보안문·워프·야생 조우·옥상 AZ 장면을 재현하지 않았다. 키카드와 자료의 개수·필수 순서만 연결한 것이므로 원작 공간 구현으로 간주하지 않는다. 45,000점 도전권과 Grisham 승급전 및 미션 36은 아직 미구현이다. 이 절이 위 절의 연구소·AZ 미구현 서술을 일부 갱신한다.

## 미션 35 랭크 A 승급 — 부분 구현

[원작 진행·상대 자료](https://www.serebii.net/legendsz-a/mainmissions/reachingranka.shtml)와 [승급전 보상](https://www.thonky.com/pokemon-legends-z-a/main-mission-35-reaching-rank-a)을 대조해 45,000점 도전권, Grisham의 여섯 포켓몬과 턴제 승급전, 랭크 A와 기술머신 104 지급을 연결했다. 승패·보상과 미션 36 시작 상태가 저장되고 패배 후 재도전할 수 있다.

배틀존 승리당 4,500점, 일반 상대 팀 일부·기술과 카페 위치는 초안이다. 상대 기술과 메가리자몽 X 변신, 보너스 카드, 상세 후속 장면은 미구현이다. 연구소의 원작 평면·문·워프 등 위 절의 제약이 계속 적용된다. 미션 36 이후와 야생 구역 16~19, 실기기·운영 검증은 남았다. 이 절이 위 절의 도전권·승급전 미구현 서술을 갱신한다.

## 미션 36 프리즘타워 — 부분 구현

[진행 자료](https://www.thonky.com/pokemon-legends-z-a/main-mission-36-prism-towers-dark-turn)에 따라 프리즘타워의 팀 MZ, 동료의 여섯 포켓몬과 턴제 배틀, Vinnie의 설명 및 미션 37 시작 상태를 연결했다. 이전 스타터 타입에 따라 상대 스타터 두 마리를 선택하고 기록이 없는 오래된 저장은 플레이어에게 타입을 묻는다. 승패와 진행은 저장되며 패배 후 재도전할 수 있다.

기존 Centrico 방면 표식은 실제 타워 집결 지점의 초안이다. 상대 기술·메가진화, 밤의 폭발과 상세 타워 연출은 미구현이다. 미션 37 방어 작전, 야생 구역 16~19 및 실제 기기·운영 검증이 남아 있다. 이 절이 위 절의 미션 36 미구현 서술을 갱신한다.

## 미션 37 미르시티 방어 작전 — 부분 구현

[원작 진행 자료](https://www.thonky.com/pokemon-legends-z-a/main-mission-37-operation-protect-lumiose)의 상대 순서에 따라 팀 MZ 옥상, Ivor·Gwynn, 다리, Canari·Tarragon, Jacinthe·Lebanne, Corbeau·옥상의 여섯 배틀 구간을 연결했다. 폭주 메가 포켓몬은 구간별로 기존 턴제 엔진에서 순차로 상대하며, 승리 단계는 저장되고 패배 후 재도전할 수 있다. 구간 순서를 건너뛸 수 없고 포획이나 일반 트레이너 보상을 지급하지 않는다.

방어 작전 통로는 독립된 **초안 지도**이며 원작 도시의 실제 길·비계·사람 사다리·옥상 동선이 아니다. 상대 Lv.65와 기술은 임시이며 원작의 동료 동시 참전도 미구현이다. 여섯 구간 후 지가르데·앙주 플라엣테 최종 대결과 결말, 미션 38 이후는 아직 구현하지 않았고 미션 37을 완료 처리하지 않는다. 야생 구역 16~19와 실기기·운영 검증도 남았다. 이 절이 위 절의 미션 37 미구현 서술을 일부 갱신한다.

## 미션 37 최종 대결과 미션 38 — 턴제 축약 구현

[최종 대결의 원작 순서](https://bulbapedia.bulbagarden.net/wiki/Ange)와 [미션 38 진행](https://www.thonky.com/pokemon-legends-z-a/main-mission-38-the-future-of-lumiose-city)을 대조해 두 꽃과의 전투와 퍼펙트폼 지가르데 공격을 세 차례 번갈아 진행하고 마지막 코어퍼니셔·돌을 쥐는 선택·니힐라이트 결말을 연결했다. 지가르데 전투는 대여 전투로 처리해 원래 파티·선두·소유 포켓몬을 덮어쓰지 않으며, 각 단계는 저장되고 실패 시 재도전할 수 있다. 이후 Hotel Z와 Centrico 대화, 미션 39 시작 상태를 연결한다.

원작은 꽃을 상대로 한 실시간 기믹과 지가르데 방어막·타워 광선을 포함한다. 여기서는 요청한 턴제에 맞춘 축약 전투이며 꽃과 타워 표적은 기존 플라엣테 이미지를 대체 사용하고 레벨·능력치·기술은 임시다. 꽃의 원작 상성·상태 면역, 메가 지가르데 변신 연출·직접 니힐라이트 기술, 돌의 지가르데나이트 변환과 정식 엔딩 크레딧은 미구현이다. 미션 38의 소원은 단일 선택지이며 미션 39 이후, 야생 구역 16~19와 실기기·운영 검증도 남았다. 이 절이 위 절의 최종 대결·미션 38 미구현 서술을 일부 갱신한다.

## 미션 39 첫 보상 배틀 — 부분 구현

[무한 로열 진행 자료](https://bulbapedia.bulbagarden.net/wiki/Walkthrough%3APok%C3%A9mon_Legends%3A_Z-A/Part_27)와 [첫 상대 구성](https://www.serebii.net/legendsz-a/z-aroyale/rankinfinity.shtml)에 따라 50,000점 도전권, 콰자르티코 접수처의 Zach 턴제 배틀과 600원, 이후 Hotel Z의 Lida·L 대화를 연결했다. 대화 후 미션 40과 41을 동시에 시작할 수 있다. 패배 시 재도전하며 승리와 점수 차감은 저장된다.

일반 배틀존의 상대 구성 일부와 승리당 5,000점, 패배 시 도전권 유지 규칙은 임시다. 원작의 무작위 추가 보상, 2회차 이후의 고정 상대·반복 배틀, 야생 구역 20과 미션 39의 전체 완료 조건은 미구현이다. 미션 39는 완료 처리하지 않는다. 미션 40~42 및 실기기·운영 검증도 남았다. 이 절이 위 절의 미션 39 도입 미구현 서술을 일부 갱신한다.

## 미션 40 도입과 미션 41 — 부분 구현

[미션 40·41 진행 자료](https://www.thonky.com/pokemon-legends-z-a/main-mission-41-the-one-that-takes)와 [대상 레벨](https://www.gamepro.de/artikel/pokemon-legends-z-a-zygarde-fangen%2C3441876%2Cseite2.html)을 대조해 Mable의 제르네아스 조사 도입, Grisham·Vinnie의 이벨타르 단서, 메가우츠보트·메가루차불·메가마기라스 시뮬레이터 세 전투와 Lv.75 이벨타르 포획을 연결했다. 전투는 턴제이며 시뮬레이터 진행과 전설 포획 상태를 저장한다. 이벨타르는 실제 포획 시에만 미션을 완료하며 도망·포획 실패 후 재도전할 수 있다.

이벨타르 옥상은 루주 거리의 임시 표식이며 원작의 돔·비계·로토글라이드 경로가 아니다. 시뮬레이터 상대의 기술과 대화도 초안이다. 미션 40의 구역 3·5·9 이상한 우두머리 조사와 구역 11 제르네아스, 미션 42 지가르데와 구역 20은 미구현이다. 미션 39의 2회차 이후 배틀과 완료 조건도 여전히 남는다. 실제 기기와 운영은 검증하지 않았다. 이 절이 위 절의 미션 40·41 미구현 서술을 일부 갱신한다.

## 미션 40 구역 3 조사 — 부분 구현

[원작 조사 자료](https://bulbapedia.bulbagarden.net/wiki/Walkthrough%3APok%C3%A9mon_Legends%3A_Z-A/Part_28)에 따라 야생 구역 3의 Lv.70 이상한 우두머리 강철톤을 포획하거나 쓰러뜨려 조사할 수 있다. 도망은 완료로 기록하지 않고, 성공은 저장해 중복 조우를 막는다.

강철톤 표식 좌표와 기술은 초안이다. 구역 5의 엘레이드, 구역 9의 부란다, 조사 보고와 구역 11의 제르네아스는 아직 미구현이므로 미션 40을 완료 처리하지 않는다. 실제 기기·운영과 강철톤의 포획 후 조사 처리에 대한 별도 화면 검증은 남았다. 이 절이 바로 위 절의 구역 3 조사 미구현 서술을 갱신한다.

## 미션 40 나머지 조사와 제르네아스 — 부분 구현

[원작 조사 순서](https://bulbapedia.bulbagarden.net/wiki/Walkthrough%3APok%C3%A9mon_Legends%3A_Z-A/Part_28)에 따라 Lv.70 우두머리 엘레이드·부란다를 포획하거나 쓰러뜨려 조사하고, 세 조사 보고 뒤 Lv.75 제르네아스를 포획하도록 연결했다. 도망이나 포획 실패는 재도전할 수 있고 실제 포획 시에만 미션 40이 완료된다. 미션 41도 완료된 경우 미션 42가 열린다.

구역 5·9·11은 누보 카페 쪽에서 이동하는 조사 전용 임시 지도이며 원작 도시 연결·평면을 재현하지 않는다. 서쪽 풀밭·높은 옥상·북쪽 강가라는 위치 관계만 참고했고 세부 지형·기술·출현 위치는 초안이다. 원작의 실제 구역과 현장 이동은 여전히 미구현이며, 미션 42와 실기기·운영 검증도 남았다. 이 절이 바로 위 절의 엘레이드·부란다·제르네아스 미구현 서술을 갱신한다.

## 미션 42 지가르데 — 턴제 부분 구현

[원작 진행 자료](https://www.thonky.com/pokemon-legends-z-a/main-mission-42-to-keep-the-world-in-balance)에 따라 제르네아스와 이벨타르를 실제 포획한 뒤 L의 승부와 야생 구역 20의 지가르데 10%·50%·퍼펙트폼 전투를 연결했다. 세 전투는 요청에 따라 턴제로 변환했으며 도중 중단이나 패배 후 재도전할 수 있다. 승리 후 보유한 볼로 확정 포획하고 지가르데큐브를 받는다.

구역 20 지형과 이동 경로, 지가르데의 레벨·기술과 L의 기술은 초안이다. L의 메가갸라도스와 원작 실시간 전투 기믹은 구현하지 않았으며, 큐브로 폼을 바꾸는 기능도 아직 없다. 미션 39 반복 배틀, 구역 5·9·11·20의 실제 지도와 실기기·운영 검증이 남았다. 이 절이 바로 위 절의 미션 42 미구현 서술을 갱신한다.

## 지가르데큐브와 무한 로열 두 번째 배틀

[원작 폼 변경](https://www.serebii.net/legendsz-a/forms.shtml)에 따라 가방에서 선두 지가르데의 10%폼과 50%폼을 전투 밖에서 반복 전환한다. 큐브는 소모되지 않으며 포켓몬의 기술과 기존 저장을 보존한다. 퍼펙트폼 자동 변신은 이 기능에 포함되지 않는다.

첫 보상 배틀 이후에도 밤에 티켓포인트를 모아 [두 번째 상대 Griselle](https://www.serebii.net/legendsz-a/z-aroyale/rankinfinity.shtml)에게 도전할 수 있다. 도전권은 패배 시 유지되고 승리 시 소모된다. 상대 종과 레벨은 원작을 따르지만 기술·메가진화, 배틀존 점수와 무작위 보상은 미완성이다. 세 번째 이후 상대, 15번째 배틀 및 영원의꽃 플라엣테 보상, 20번째 이후의 무작위 반복도 미구현이며 미션 39 전체를 완료 처리하지 않는다. 이 절이 위 절의 큐브와 반복 배틀 미구현 서술을 일부 갱신한다.

## 무한 로열 세 번째·네 번째 보상 배틀

[원작 상대 순서](https://bulbapedia.bulbagarden.net/wiki/Infinite_Z-A_Royale)와 [상대 구성](https://www.serebii.net/legendsz-a/z-aroyale/rankinfinity.shtml)에 따라 Lida와 Tarragon을 연결했다. 각 배틀에서 도전권을 다시 모으고, 패배 시 보존하며 승리 시 경험사탕M 10개를 받는다. 사탕은 가방에서 사용할 수 있다. 이전 저장의 두 번째 승리 기록도 유지한다.

상대의 기술과 메가진화, 추첨 도구 보상, 기존 첫 두 배틀의 경험사탕 보상은 미구현이다. 다섯 번째부터 20번째까지와 이후 무작위 상대, 15번째의 영원의꽃 플라엣테·플라엣테나이트 및 미션 39 완료 처리는 아직 남는다. 배틀존 포인트는 임시값이고 운영 및 실기기 검증은 하지 않았다. 이 절이 위 절의 세 번째·네 번째 배틀 미구현 서술을 갱신한다.

## 무한 로열 다섯 번째부터 열네 번째 배틀

[원작 고정 순서](https://bulbapedia.bulbagarden.net/wiki/Infinite_Z-A_Royale)와 [초기 상대 구성](https://www.serebii.net/legendsz-a/z-aroyale/rankinfinity.shtml)에 따라 Xavi, Gwynn, Lebanne, Naveen, Yvon, Rintaro, Canari, Mani, Emma, Corbeau를 기존 턴제 보상 배틀에 연결했다. 11~14승의 경험사탕M 보상은 15개이며 이전의 승리 기록과 도전권 상태를 보존한다.

상대 기술·메가진화와 Mani 라이츄의 세부 폼은 초안이다. 15번째 동료 배틀과 영원의꽃 플라엣테·플라엣테나이트, 16~20번째 및 그 이후 무작위 반복, 추첨 도구 보상과 첫 두 배틀 경험사탕은 여전히 미구현이다. 미션 39는 완료 처리하지 않는다. 기존 배틀존 점수도 임시값이며 실기기·운영 검증은 하지 않았다. 이 절이 위 절의 5~14번째 배틀 미구현 서술을 갱신한다.

## 무한 로열 15번째 이후 — 부분 구현

[원작 상대 순서와 완료 조건](https://bulbapedia.bulbagarden.net/wiki/Infinite_Z-A_Royale)에 따라 15번째 동료전과 16~20번째 Ivor·Philippe·Jacinthe·Grisham·Vinnie를 연결했다. 15승 후 접수처에서 영원의꽃 플라엣테와 플라엣테나이트를 한 번만 받고 미션 39를 완료한다. 기존 스타터 기록이 없는 저장은 사용자가 타입을 선택한다. 20승 이후에는 구현된 상대 중 무작위로 대전하며 패배와 재접속 시 같은 상대와 도전권을 보존한다. 승수별 경험사탕M·L 보상과 가방 사용을 연결했다.

원작의 21승 이후 추가 상대 Josée·Asami·Andi, 재대전 시 강화된 팀, 20승 이후 사이드미션, 추첨 도구 보상 및 첫 두 배틀 경험사탕은 미구현이다. 전 상대 기술과 메가진화는 초안이며 배틀존 점수도 임시값이다. 동료의 분기 구성은 저장된 스타터 타입을 사용한다. 기존 저장 복구와 대표 전투·선물·재대전을 격리 검사했으나 실기기·운영 검증은 하지 않았다. 이 절이 위 절의 15번째 이후 미구현 서술을 일부 갱신한다.

## 스토리 보상 기술머신 학습

가방에 보유한 기술머신 011 벌크업, 020 치근거리기, 051 신비의부적, 066 볼트체인지, 100 더스트슈트, 104 플레어드라이브를 기술 관리 화면에서 선두 파티 포켓몬에게 반복해서 가르칠 수 있다. [원작 기술머신 규칙](https://www.serebii.net/legendsz-a/tm.shtml)과 각 기술의 Z-A 기술머신 학습 대상 목록을 기준으로 서버에서도 소유·호환성·중복 기술·선택 슬롯을 검사한다. 기존 기술의 PP와 저장은 보존하며 새 기술은 최대 PP로 시작한다.

지역·비기본 폼은 학습 대상 판별을 보수적으로 제한한다. 연구 보상 기술머신 6종은 기존의 별도 호환 목록을 사용하므로 해당 목록의 미반영 종은 여전히 남으며, 그 외 아직 획득 경로가 없는 기술머신도 미구현이다. 격리된 서버 검사에서 대표 종과 재접속을 확인했고 실기기·운영 검사는 하지 않았다.

## 운동화와 로토글라이드 — 프로젝트 조정 및 시범 경로

[원작 자료](https://game8.jp/pokemon-legends-z-a/732680)의 옥상 설명 후 높은 곳에서 활공한다는 흐름을 참고해, 임시 옥상 지도의 표시된 출발점에서 한 방향으로 활공할 수 있다. 출발·착지 위치와 장애물은 서버가 확인하고 기존 저장 위치를 유지한다. 구체적인 발판 좌표와 비행 거리는 원작에서 확인한 값이 아니며 이 지도에 한정된 초안이다. 임의 방향 조작, 고도·낙하 물리, 다른 옥상과 원작 도시 동선은 미구현이다.

퍼포먼스 스니커 획득 이후 연속 이동 및 안전한 예측의 목표 간격을 100ms에서 75ms로 줄였다. 원작에서 이 의상의 이동 속도 효과나 정확한 배율은 확인하지 못했으므로 사용자 요청에 따른 프로젝트 조정값이다. 네트워크 왕복시간과 서버 판정에 따라 실제 이동 속도는 달라진다. 격리 검사에서 출발 제한·재접속·기존 충돌과 저장 처리를 확인했으며 실기기·운영 성능은 측정하지 않았다.

## 야생 구역 5 — 이동 가능한 초안

[구역 5 조사 자료](https://pokequery.com/games/legends-za/wild-zones/5)와 [출입구·주변 카페 자료](https://www.pockettactics.com/pokemon-legends-z-a/wild-zone-5)를 참고해 서쪽·남쪽 출입구, 서쪽 풀밭, 북쪽 식생, 북서쪽 사다리와 서쪽·동쪽 옥상, 물가를 별도의 2D 지도로 연결했다. 사다리는 지상과 옥상 사이를 이동하며 위치와 층은 재접속 후 보존한다. 서쪽 풀밭에는 미션 40의 엘레이드 조사 경로도 연결한다. 기존 조사 전용 지도와 그 위치에 저장된 데이터는 유지한다.

도시 진입로는 기존 Centrico 방면의 임시 Café Gallant 주변에 연결한 근사 경로다. 실제 Bleu Sector 2의 도로 형상·정확한 입구 좌표와 각 타일의 크기는 아직 확인하지 못했다. 야생 포켓몬은 지상 대표 종과 임시 균등 출현률만 반영했으며 옥상 개체, 우두머리·기술머신과 다른 시설은 미구현이다. 지도는 원작 완성본이 아니며 실기기·운영 검사는 하지 않았다.

## 야생 구역 5 개체·기술머신 — 부분 구현

[구역 5 출현 자료](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-5-guide-all-pokemon-and-alphas)와 [기술머신 위치 자료](https://allthings.how/pokemon-legends-z-a-wild-zone-5-spawns-alphas-and-items/)를 참고해 옥상에 캐이시·썬더라이·피죤, 지상에 우두머리 모다피 Lv.25·휠구 Lv.28을 배치했다. 야생 개체는 격파·포획 후 해당 방문 동안 사라지고, 구역 재입장 후 다시 나타난다. 옥상의 기술머신 040 씨기관총은 한 번만 획득하고 호환 포켓몬에게 반복 사용한다.

개체·사다리·기술머신의 타일 좌표는 원작의 정밀 지도에서 확인하지 못한 초안이다. 캐이시의 접근 감지·순간이동, 원작의 짝 개체 행동과 모든 야생 개체의 실시간 이동은 미구현이며, 출현·재등장 조건과 지상의 휠구 접근 경로도 임시다. 이 절이 위 절의 옥상 개체·우두머리·기술머신 미구현 서술을 일부 갱신한다.

## 미션 42 옛 저장 승리 처리

제르네아스·이벨타르 완료 기록이 모두 있으나 별도의 준비 플래그가 없는 저장도 L과의 배틀 진입 및 승리 처리가 동일한 조건을 사용한다. 두 기록을 삭제하거나 다시 지급하지 않는다. 기존 간헐 실패가 이 조건 때문이었는지는 실행 당시 상태가 남지 않아 확정하지 못했다.

## 야생 구역 11 — 운하 양안 초안

[원작 구역 설명](https://bulbapedia.bulbagarden.net/wiki/Wild_Zone_11)과 [현장 안내](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-11-guide-all-pokemon-and-alphas)를 참고해 Saison Canal로 분리된 북쪽·남쪽을 2D로 구현했다. 구역 안에서 운하를 걸어서 건널 수 없으며, 각 출입구로 나가 반대쪽에 들어간다. 랭크 E 이후 접근하고, 북쪽 야돈·메더와 남쪽 트리미앙, 미션 40의 북쪽 제르네아스 조사에 기존 턴제 전투를 연결했다. 기존 미션 전용 임시 지도와 저장도 유지한다.

원작의 북쪽 입구는 구역 6 방면이지만 구역 6이 아직 없어 현재 양쪽 출입구를 기존 Vert Sector 2의 임시 연결점에 배치했다. 세부 해안선·건물·포켓몬 좌표와 출현 확률은 초안이고, 수중 포켓몬·우두머리 야도란·블로스터와 전체 시설도 아직 미구현이다. 기존 저장·구역 이동과 대표 야생 전투를 격리 검사했으며 실기기·운영 검사는 하지 않았다.

## 야생 구역 6 및 구역 11 북쪽 연결 — 부분 구현

[구역 6 원작 안내](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-6-guide-all-pokemon-and-alphas)의 북쪽 도시 출입, 남쪽 다리와 수로, Café Bataille 주변과 [미션 40 경로](https://www.thonky.com/pokemon-legends-z-a/main-mission-40-the-one-that-gives)의 구역 6 남쪽에서 구역 11 북쪽으로 이동하는 흐름을 참고했다. 임시 2D 지도에 북쪽 출입구·다리·남쪽 출입구를 두고, 구역 11의 기존 랭크 제한을 적용했다. 구역 11 기존 북쪽 저장도 유지하며 출구는 이제 구역 6으로 이어진다. 대표 야생 개체 델빌·요가랑·이어롤은 턴제 전투가 가능하다.

도시에서 구역 6까지의 정확한 길과 타일 좌표·다리 형태는 초안이다. 다리 아래 경로, 실제 높낮이·옥상, Café Bataille 서비스와 나머지 포켓몬·우두머리·도구는 미구현이다. 구역 6 자체의 미션 5~6 해금 조건은 임시로 제한하지 않는다. 실기기·운영 검사는 하지 않았다. 이 절이 위 절의 구역 6 연결 미구현 서술을 갱신한다.

## 야생 구역 6 수로와 옥상 — 부분 구현

[구역 6 현장 자료](https://www.videogameschronicle.com/guide/pokemon-legends-z-a-wild-zone-6/)에 따라 지상에서 다리 아래 수로와 옥상으로 이동하는 별도 층을 추가했다. 수로에 잉어킹·거북손손, 옥상에 보송송·파비코가 보이며, 수중 잉어킹의 칸은 걸어서 들어갈 수 없다. [기술머신 위치 자료](https://raiderking.com/pokemon-legends-z-a-all-tms-locations/)에 따라 옥상 남쪽의 기술머신 041 물의파동을 획득하고 반복 학습할 수 있다. 층별 위치와 획득 여부는 저장된다.

정확한 지도 좌표·높낮이와 사다리·옥상 연결 방식은 초안이다. 원작의 홀로베이터·낙하 동선과 다리 아래에서 바깥으로 이어지는 별도 출입구, 우두머리와 다른 도구는 아직 미구현이다. 대표 전투·기술 학습·층별 저장을 격리 검사했으며 실기기·운영 검사는 하지 않았다. 이 절이 위 절의 수로·옥상 미구현 서술을 일부 갱신한다.

### Wild Zone 6: alphas and rooftop access

- [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Wild_Zone_6) lists fixed alpha Pikachu (40–42), Houndoom (32–33), and Binacle (32–34). [Nintendo Life](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-6-guide-all-pokemon-and-alphas) places them at the café roof, street stalls, and waterside respectively. The map uses fixed representative levels and approximate tile positions; conflicting reports of time restrictions remain unresolved.
- [Pokémon-France](https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/) lists two Super Potions near the south entrance and tunnel and a Luxury Ball behind the alpha Pikachu. Their tile coordinates and roof positioning are provisional.
- [Pocket Tactics](https://www.pockettactics.com/pokemon-legends-z-a/wild-zone-6) describes a holovator, high roof and a drop to the southern rooftop TM041. The added elevator and fixed drop represent that route; roof shapes, landing coordinates, and the pre-existing alternate roof connection are provisional and do not claim exact original geometry. Free gliding and other zone items remain incomplete.

### Wild Zone 7: preliminary Magenta Plaza

[Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Magenta_Plaza) describes a round plaza, central obelisk, and Zone 7 opening at rank F. [Pokémon-France](https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/) lists south, west and northwest entrances and level ranges for its wild Pokémon; [Pokémon GO Hub](https://pokemongohub.net/post/guide/all-wild-zones-pokemon-legends-z-a/) lists day Hippopotas and night Shuppet. Sources differ on exact unlock progression, so rank F is used provisionally.

The grid is a conceptual circular plaza, not a measured map. The single city connector is temporary: its position in the existing Centrico draft, other plaza entrances, fountain, detailed terrain, visible species and alpha Fletchinder remain unverified or unimplemented. Grass encounter weights and exact placements are provisional.

#### Zone 7 central landmark and approach paths

[Nintendo Life](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-7-guide-all-pokemon-and-alphas) describes the sandy plaza and level 33 alpha Fletchinder perched on its central statue. The draft now shows the alpha on the obelisk and a sandy centre, with west and northwest approach paths inspired by the entrance descriptions above. Tile dimensions, their exact alignment and connections to the surrounding streets have not been established. Only the existing provisional south city connector is functional; the western and northwestern approaches are not yet city exits. Alpha respawn occurs on leaving and returning to the district, an approximation of the original's time/distance behaviour.

### Wild Zone 8: provisional Jaune Plaza

[Nintendo Life](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-8-guide-all-pokemon-and-alphas) locates the zone northeast of Centrico on Jaune Street, behind the Justice Dojo, and describes its central dirt and outer sand ring. [PokeQuery](https://pokequery.com/games/legends-za/wild-zones/8) distinguishes Numel on approaches, Machop and Gible in the center, and Sandile/Krokorok around the ring. Rank F and species levels follow these sources and Pokémon-France.

The round 2D terrain, field positions, probabilities and city connection are draft approximations. The exact city street and entrance orientations remain unverified; the sole connector through the existing Centrico draft is temporary, not a claim of original placement. The precise geography and other entrances remain unimplemented.

#### Zone 8 alpha and item placement

[Pokémon Kingdom](https://pente.koro-pokemon.com/legendsz-a/map-wild-zone-08.shtml) places alpha Camerupt in the southwest of the central sand and alpha Krokorok in the outer sand, and identifies stalls on the east and south. [Pokémon-France](https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/) lists two Great Balls, a Hyper Potion and a Heal Ball, among other items. The tile coordinates and stall/entrance geometry remain draft. Alpha Krokorok is static rather than circling; the precise late-game appearance condition for alpha Camerupt remains unverified and it is provisionally always present. TM036, Revive, remaining stalls, original entry streets, and exact geometry remain to be implemented.

### Wild Zone 9: provisional Magenta Sector 5

[Nintendo Life](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-9-guide-all-pokemon-and-alphas) describes construction scaffolding, a southern entrance, northwest entrance and ladders linking the ground to rooftops. It places Sableye beneath scaffolding, Mawile on the southwestern roofs, and Carbink on northeastern roofs. [GameWith](https://gamewith.jp/pokemon-za/524512) also identifies the southeastern Kadabra rooftop and these ladder approaches.

This is a provisional two-layer interpretation: tile sizes, ladder and city-connector coordinates, roof silhouettes and the scaffold connection are not surveyed. The second original entrance is not connected to the city yet. Rock obstacles, most field items and field behaviours remain unimplemented. Existing mission 40's research encounter is unchanged.

#### Zone 9 alphas and selected items

[PokeQuery](https://pokequery.com/games/legends-za/wild-zones/9) places alpha Meowstic on the middle rooftop and alpha Manectric on the northwest rooftop; [Pokémon-France](https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/) lists a Hyper Potion near the southern ladder, a Heal Ball on northern scaffolding, and a Great Ball on a western roof. Tile coordinates and roof/platform outlines are draft. Actual surrounding street connections and the northwest city entrance remain unverified. Alpha levels are representative; sex/form and all fixed spawn conditions are not yet fully reproduced.

### Wild Zone 10: provisional canal and rooftops

[Pokémon Kingdom](https://pente.koro-pokemon.com/legendsz-a/map-wild-zone-10.shtml) places Slowpoke and Bellsprout in the western courtyard, Carvanha and Staryu in the canal, and Arbok and Watchog on rooftops. [Pokémon-France](https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/) identifies west and east entrances and a ladder.

The two-layer grid and west connector are a provisional interpretation; city street alignment, shoreline and roof coordinates, eastern exit, ladder positions and full terrain are not established. The water encounter markers are approached from shore and do not allow walking through water. The eastern entrance and free field movement of Pokémon remain unimplemented.

#### Zone 10 alphas and selected items

[Pokémon-France](https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/) and [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Legends:_Z-A/Part_10) describe fixed alpha Sharpedo in the canal and alpha Arbok and Watchog on rooftops, plus Quick Ball, Net Ball, Hyper Potion and Ultra Ball pickups. Coordinates and exact terrain remain provisional; the water alpha is a static encounter rather than original field behaviour. The eastern city entrance, TM034, Revive, other items and full roof/shore alignment remain unimplemented.

### Wild Zone 12: provisional snowy Aymlis Park

[Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Wild_Zone_12) gives the park, unlock at mission 15 and encounter levels; [Pokémon GO Hub](https://pokemongohub.net/post/guide/all-wild-zones-pokemon-legends-z-a/) describes the battle court, water and western/northern/southern gates. The [Japanese item guide](https://gamepedia.jp/pokemon-legends-z-a/items) locates the battle court in the northwest.

The snowy grid, water outline, field coordinates and the sole west connector to the existing city draft are provisional, not a surveyed original. The northern and southern city connections, exact topography and roofs are not yet implemented. Bergmite is an approachable water encounter; water remains impassable.

#### Zone 12 southwestern pond, alphas and selected items

[Pokémon Kingdom](https://pente.koro-pokemon.com/legendsz-a/map-wild-zone-12.shtml) places alpha Avalugg in the southwest pond and alpha Abomasnow south of the court; [Game8](https://game8.jp/pokemon-legends-z-a/729694) and [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Wild_Zone_12) support representative levels 55 and 44. The earlier eastern pond draft is replaced by a southwestern pond. Old stored positions in the affected footprint move to nearby dry land without discarding the saved run. [Pokémon-France](https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/) lists a Super Potion near the south entrance, Quick Ball in the southwest, and Ultra Ball in the court. Their exact tiles are provisional. The city street, the other entrances, ice stone, TM013, other pickups and original field behaviours remain incomplete.

### Wild Zone 13: provisional North Boulevard woodland

[Gamer Guides](https://www.gamerguides.com/pokemon-legends-z-a/guide/wild-zones/aymlis-park) locates the zone along North Boulevard, Heracross near the western entrance and Pinsir south of the path, and describes day/night species. [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Legends:_Z-A/Part_13) lists encounter levels. Rank E access, a west entrance, forest strips, visible Heracross and Pinsir, and day/night grass encounters are represented.

Actual city-connector position, path and tree shapes, and other entrances are not surveyed. This is a provisional path layout; original field behaviour, most tools and terrain obstacles remain unimplemented.

#### Zone 13 time-specific alphas and selected items

[Game8](https://game8.jp/pokemon-legends-z-a/729772) and [PokeQuery](https://pokequery.com/games/legends-za/wild-zones/13) place alpha Trevenant north at night and alpha Weepinbell south during the day. The current draft mirrors those time conditions and preserves an already-started turn-based battle if the clock changes. [Pokémon-France](https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/) lists a Luxury Ball north, Ultra Ball west and Hyper Potion in the zone. Tile coordinates, original field movement, entrance alignments, TM081 and other pickups remain provisional or unimplemented.

### Wild Zone 14: provisional Electrical Substation

[Nintendo Life](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-14-guide-all-pokemon-and-alphas) identifies the Magenta District substation, northern entrance, central converters, sandy patches and representative species; [Pokémon Kingdom](https://pente.koro-pokemon.com/legendsz-a/map-wild-zone-14.shtml) lists the encounters. Access begins after rank D. The connection from the existing North Boulevard substation story landmark is a draft; neither that precise street nor the building and equipment coordinates are surveyed.

The yard, fixed encounter positions and probabilities are provisional. TM039 and other pickups are not yet implemented. The existing substation quiz is preserved.

#### Zone 14 weather, alpha and rock route

[Nintendo Life](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-14-guide-all-pokemon-and-alphas) describes alpha Excadrill near the central converters and sunny-day Helioptile; [All Things How](https://allthings.how/pokemon-legends-z-a-100-wild-zone-14-power-station-guide/) describes rocks broken by Fighting, Ground or Rock attacks. [Pokémon-France](https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/) lists a Mastery Seed behind a building among rocks, and Ultra and Luxury Balls. The simplified rock enclosure, item coordinates and equipment are draft. TM039 and other items remain incomplete. The existing adventure weather engine treats no rain as clear and does not yet produce independent city weather cycles; the rainy condition was checked using its existing rain-producing biome. Old stored positions in the new enclosure relocate to adjacent safe ground.

### Wild Zone 15: provisional North Boulevard / Jaune Sector

[Altissimo's location guide](https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/wild-zone-15.html) describes the narrow boulevard, central grassy oval, western grassy square and Café Ultimo; [Pokémon GO Hub](https://pokemongohub.net/post/guide/all-wild-zones-pokemon-legends-z-a/) lists Pumpkaboo and the day/night split between Scolipede and Shuppet. Rank D access and those representative encounters are implemented.

The grid, approximate café exterior and link from the existing North Boulevard are provisional; other original entrances, exact geometry and Café Ultimo interior/services are incomplete. Original roaming behaviours and the remaining items are not yet implemented.

#### Zone 15 alphas and rooftop route

[GameWith](https://gamewith.jp/pokemon-za/524974) documents Side Mission 80 after the Mission 26 Asami battle, the Ampharos/Manectric encounter and Holovator unlock; [All Things How](https://allthings.how/pokemon-legends-z-a-wild-zone-15-spawns-alphas-and-rooftop-larvitar/) describes the web route, Larvitar and day/night alpha locations. The encounter uses the user's requested turn-based battle and grants the documented 3,500 currency, four Quick Balls and Lumiose Galette. The temporary elevator position, separate rooftop map and web geometry are draft. Opening the web currently accepts a Fire attack; the original permits ranged attacks more broadly, and true range is not represented. The city approach, real field movement, TM052, Café Ultimo interior and remaining items are incomplete.

## Wild Zone 16 — Bleu Plaza (draft)

- [Nintendo Life](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-16-guide-all-pokemon-and-alphas) identifies Bleu Plaza south of Wild Zone 5 and a rank C unlock. The zone-5-to-zone-16 street in this build is a **provisional connection**, not evidence of the exact original entrance.
- [Pokémon France](https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/) describes the central monument, surrounding water and Florges Fountain, and lists Flaaffy, Falinks and Medicham. [TheGamer](https://www.thegamer.com/pokemon-legends-z-a-wild-zones-pokemon-list-collection-location-guide/) locates the fountain to the northeast.
- The rectangular water ring, crossings, path widths and tile coordinates are approximations. The fountain sculpture, further entrances, other species, other alpha encounters and items remain to be researched and implemented; this layout is not a verified reproduction of the original map.

- Fixed Alpha Ampharos (Lv. 52–53) occurs near the Florges Fountain; an Ultra Ball is opposite the Sector 4 battle area. Their exact tile positions in this draft are unverified. TM076 behind the fountain and the other documented items still need implementation. [Pokémon France](https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/)

## Wild Zone 17 — Vert Sector 7 (draft)

[Pokémon France](https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/) lists this zone in Vert Sector 7 from mission 25, its stairs, rooftop access and species. The temporary connection from Vert Sector 2 and the boundary, buildings, route widths and exact Pokémon positions are unverified approximations, not a faithful completed map. The second entrance, exact stairs and rooftop geometry, and most items remain to implement against location evidence.

- [PowerPyx](https://www.powerpyx.com/pokemon-legends-z-a-mawile-location/) places fixed Alpha Mawile on a rooftop reached by a ladder near Pyroar. [Pokémon France](https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/) lists fixed Alpha Pyroar, Alpha Mawile and a Timer Ball near the stairs. The ladder, rooftop shape, individual placements and city connection in this implementation remain provisional. TM062 behind Mawile is not yet implemented.

## Wild Zone 18 — Magenta Sector 9 (draft)

[Nintendo Life](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-18-guide-all-pokemon-and-alphas) documents a Northern Street entrance, Bagon in grass beside the road, Alpha Salamence on the ground and rank B access after mission 30. This implementation approximates the road, grass, building outlines, entrance coordinates and encounter positions. The precise Magenta Sector 8 entrance location, elevated access and scaffolding geometry, most rooftop Pokémon and most items remain unimplemented; the map is not an exact reproduction.

- [VGC](https://www.videogameschronicle.com/guide/pokemon-legends-z-a-wild-zone-18/) describes an alley left of Salamence, Alpha Lopunny and a scaffolding ladder leading to the rooftop entrance; [Pokémon France](https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/) lists a Quick Ball on the rooftop. The alley and ladder are compressed into this draft map; exact positions and the separate outer gate are unverified.

## Wild Zone 19 — Jaune Sector 8 garden (draft)

[Nintendo Life](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-19-guide-all-pokemon-and-alphas) places this park northeast of Zone 8, accessible after rank B. [PokeQuery](https://pokequery.com/games/legends-za/wild-zones/19) describes a garden with perimeter hedges and a central pavilion. Exact tile positions and boundaries, the connecting street from Zone 8, and encounter positions are unverified. Real city roads and entrances, pavilion ordinary day/night species, other wild Pokémon, most items and additional obstacles remain to implement; the map is not a verified reproduction.

- [Nintendo Life](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-19-guide-all-pokemon-and-alphas) describes Alpha Furfrou and nighttime Alpha Clefairy on the bandstand and notes that they do not always spawn. The draft currently deterministically alternates them by time; original spawn probability is unverified. [Pokémon France](https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/) lists brambles and the Luxury Ball and Quick Ball. Bramble position and both item coordinates are provisional.

## Wild Zone 20 — Centrico Plaza (draft expansion)

Zone 20 already existed for Mission 42. [Nintendo Life](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-20-guide-all-pokemon-and-alphas) places the zone at the ruined Prism Tower and opens it after the main story; grass, paths, dirt and water host different Pokémon. The earlier Mission 42 interaction and Zygarde site remain. This expansion enables ordinary access after Mission 38 and adds representative wild encounters; the street connection, ruin geometry, specific coordinates, level and spawn weights are provisional. Precise water and mud geometry, most species, the full randomized Alpha pool and most items remain unimplemented.

- [Pokémon France](https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/) lists a Mastery Seed near the south entrance and a Full Restore near the southwest tower base. The pool of three randomly selected Alpha examples, water shape, mud color, item and Alpha tile positions are simplified drafts, not verified original distributions. Old saves on newly blocked water are relocated to nearby walkable land.

## Jaune Plaza to Zone 19 street (draft)

[Nintendo Life](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-19-guide-all-pokemon-and-alphas) places Zone 19 northeast of Zone 8 near Café Acton. The previous direct zone-to-zone shortcut is replaced by an intermediate street; exact road alignment, street width, facade positions, café entrance and both gate coordinates remain unverified. Café Acton is not implemented as an accessible facility.

## Zone 5, Bleu Plaza and Rust Syndicate approach (draft)

[Nintendo Life](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-16-guide-all-pokemon-and-alphas) places Bleu Plaza immediately south of Zone 5 near the Rust Syndicate Office. The direct transition is replaced by a walkable street linking the two zone drafts and the existing Rust approach. The street shape, widths, gate coordinates and exact route to the office are provisional and are not established by the cited location description.

## Hotel Z and Vert Street to Wild Zone 17 (draft)

[Nintendo Life](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-17-guide-all-pokemon-and-alphas) places Zone 17 northeast of Hotel Z and southwest of Zone 2, behind Racine Construction. [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Lumiose_City) lists a Wild Zone 17 entrance on Vert Street. This build adds a street connection from the Hotel Z area to a Zone 17 entrance while preserving the prior Vert Sector 2 connection. The street alignment, building and gate tile coordinates are provisional; Racine Construction and exact surroundings are not yet implemented.

## Magenta Sector 8 to Wild Zone 18 (draft)

[Nintendo Life](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-18-guide-all-pokemon-and-alphas) lists North Boulevard and Magenta Sector 8 as distinct approaches to Zone 18. The new Sector 8 road and its connection to the existing North Boulevard map represent that relationship provisionally. Exact street alignment, building shapes, transition coordinates, and the rooftop entrance remain unverified.

## Rouge Street to Wild Zone 4 (draft)

[Nintendo Life](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-4-guide-all-pokemon-and-alphas) places Wild Zone 4 north of Zone 3 on the far side of Sushi High Roller, and [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Lumiose_City) lists the cemetery entrance on Rouge Street. A northern street exit and southern cemetery approach now represent that relationship; the old eastern transition is preserved for existing travel. Gate tile coordinates, street widths, and cemetery geometry are still provisional and are not established by these descriptions.

## Saison Canal: Magenta Plaza to Wild Zone 14 (draft)

[Nintendo Life](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-14-guide-all-pokemon-and-alphas) describes following the Saison Canal northwest from Prism Tower past Zone 7 to reach the Zone 14 substation. A canal-side route now connects the Zone 7 and Zone 14 drafts, retaining their previous city entrances. The canal shape, walkway width, buildings and gate coordinates remain unverified approximations; the existing North Boulevard connector is also not evidence of an original entrance.

## Vernal Avenue: opposite Wild Zones 1 and 12 (draft)

[Nintendo Life](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-12-guide-all-pokemon-and-alphas) places Zone 12 across the street from Zone 1 along Vernal Avenue. [Poképédia](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_12) lists an east Zone 12 entrance onto that avenue. The existing avenue now connects to the eastern entrance of the Zone 12 draft and to Zone 1 on the opposite side, preserving previous entrances. Tile coordinates, road width and exact entrance placement are provisional.

## Espace Vide and the eastern Wild Zone 10 entrance (draft)

[Poképédia’s Zone 10 description](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_10) places the eastern entrance towards Espace Vide. Its [Espace Vide entry](https://www.pokepedia.fr/All%C3%A9e_Ranavoir) describes a narrow street between buildings, stairs at its north and south ends, and a lower route to the Zone 10 canal. This draft connects the existing ground-level Zone 10 map to a small lane while retaining the old west entrance. Exact coordinates, detailed stairs and underground elevation are not verified; the lane’s connections to Bleu Sector 4 and the rest of the city remain unimplemented.

- [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Espace_Vide) identifies Estival Avenue and Bleu Sector 6 as the two ends. The draft now provides short, walkable end segments and a separate lower canal-passage layer. [Poképédia](https://www.pokepedia.fr/All%C3%A9e_Ranavoir) mentions stairs at the north/south ends and a lower canal passage; the extra layer-change stair, coordinates, road geometry and their other city connections are not established. The two road segments now connect to the wider draft network; see the following entry for evidence and limits.

## Estival Avenue and Bleu Sector 6 network connections (draft)

[Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Lumiose_City) describes Estival Avenue as one of the avenues connecting the boulevards to Centrico Plaza. The Estival draft now connects to the existing Centrico route; transition coordinates and the approach are provisional. [Poképédia](https://www.pokepedia.fr/Valcyan) describes rooftops accessed from Bleu Sector 6 facing Bleu Plaza, indicating proximity only; it does not establish a ground route. The new ground connection to the existing Bleu Plaza street is an unverified playable approximation, not a confirmed original route. The Coulant Waterway source refers to Vert Sector 6, not Bleu Sector 6, and is not used as evidence for this connection.

## Coulant Waterway: Vert Street and Wild Zone 11 (draft)

[Poképédia](https://www.pokepedia.fr/Canal_Lacoul%C3%A9e) places Coulant Waterway in the Vert District with two bridges and a connection to Vert Street; its [Zone 11 description](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_11) lists a south-bank entrance from this waterway. A draft path now links Vert Street and Zone 11’s south bank and preserves existing entrances. Water shape, bridge lengths, street alignment and tile coordinates remain approximate; the rest of the waterway’s district connections are not implemented.

### 블루 구역 5와 야생 구역 12 서쪽 (초안)

[Poképédia의 구역 12 설명](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_12)과 [Bulbapedia의 Aymlis Park](https://bulbapedia.bulbagarden.net/wiki/Aymlis_Park)를 근거로 구역 12 서쪽과 블루 구역 5의 관계를 반영했다. Poképédia는 서쪽 출입구 두 곳을 명시한다. 두 입구 및 이를 잇는 거리의 타일 좌표, 크기, 건물 윤곽은 초안이다. 기존 센트리코 임시 연결은 저장과 이동 호환성을 위해 유지한다. 카페와 다른 거리로의 실제 지상 연결 및 상세 지형은 미확인·미구현이다.

### 블루 구역 3과 야생 구역 12 북쪽 (초안)

[Poképédia 구역 12](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_12)는 북쪽에 블루 구역 3으로 이어지는 출입구 두 곳을 명시하고, [Aymlis Park](https://bulbapedia.bulbagarden.net/wiki/Aymlis_Park)는 그 인접 관계를 확인한다. 두 입구를 연결했으며, 타일 좌표·거리 및 건물 윤곽은 초안이다. 블루 구역 3의 하수도 입구와 주변 도로의 실제 위치·연결은 아직 구현하지 않았다.

### 블루 구역 3 하수도 연결 (초안)

[PowerPyx](https://www.powerpyx.com/pokemon-legends-z-a-how-to-return-to-lumiose-sewers/)는 구역 3 지하 통로 끝에서 사이드 미션 57을 시작해 문을 여는 경로를 설명하고, [Bulbapedia 미션 목록](https://bulbapedia.bulbagarden.net/wiki/Task_%28Legends%3A_Z-A%29)은 의뢰가 미션 19 완료 후 열림을 명시한다. 기존 하수도 맵과 연결하고 출구 복귀를 저장한다. 거리·입구·의뢰인 좌표와 지하 통로 형상은 초안이다. 지하 접근 및 물 기술로 치우는 오염물, 사이드 미션 57의 폭타 배틀과 보상을 연결했다. [Thonky의 공략](https://www.thonky.com/pokemon-legends-z-a/side-mission-057-the-camerupt-entrepreneur)과 [Serebii](https://www.serebii.net/legendsz-a/sidemissions/thecameruptentrepreneur.shtml)는 폭타의 레벨 46과 보상·기술을 뒷받침한다. 구역 5의 첫 오염물·계단·두 번째 오염물 이후 하수도 접근 통로로 이어지는 경로를 추가했다. 계단 위치, 통로 윤곽 및 분기는 초안이며, 구역 5의 우두머리 휠구는 두 번째 오염물 뒤 지하 공터로 옮겼으며 빠른 이동은 미구현이다. 기존 분수 경로는 진행 호환을 위해 유지한다.

### 야생 구역 5 지하 경유길 (초안)

[Thonky](https://www.thonky.com/pokemon-legends-z-a/side-mission-057-the-camerupt-entrepreneur)와 [PowerPyx](https://www.powerpyx.com/pokemon-legends-z-a-how-to-return-to-lumiose-sewers/)는 물 기술로 오염물을 제거하고 아래 통로·휠구 쪽을 지나 하수도 입구에 접근하는 경로를 설명한다. 구역 5 지하 계단, 두 차례 오염물과 하수도 접근 통로를 연결했다. 지형·계단·갈림길의 정밀 좌표와 높이 표현은 초안이며, 휠구를 지하 공터에 배치했으나 정확한 좌표와 다른 개체의 행동은 초안이다.

### 블루 구역 7과 야생 구역 12 남문 (초안)

[Poképédia 구역 12](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_12)는 남쪽 출입구가 블루 구역 7로 이어진다고 설명한다. [Bleu Sector 7 연결 목록](https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/bleu-sector-7.html)은 인접한 북서쪽 구역 5와 동쪽 Vernal Avenue도 명시한다. 세 연결을 반영했지만 정확한 도로·건물·출입구 좌표는 초안이다. 원작의 분수와 포켓몬센터는 기존 임시 위치를 유지하며 구역 7에 아직 구현하지 않았다.

### 블루 구역 7 남쪽과 사우스 불르바르 (초안)

[Bleu Sector 7 위치 목록](https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/bleu-sector-7.html)은 구역 남쪽을 South Boulevard로 표시한다. [도구 위치 자료](https://altissimo1.github.io/Supplementary-Series/Legends/Legends-Z-A/poke-balls.html)는 연구소 입구가 South Boulevard에 있음을 뒷받침한다. 구역 7 남쪽과 새 거리, 기존 연구소 앞 구간을 이어 기존 연구소·저장 위치를 보존했다. 도로의 실제 길이·연구소에 이르는 방향과 건물·출입구 좌표는 초안이며, 다른 도로 및 주변 시설은 아직 미구현이다.

### 블루 스트리트와 광장·사우스 불르바르 (초안)

[Bleu Plaza](https://bulbapedia.bulbagarden.net/wiki/Bleu_Plaza)는 광장이 Bleu Street로 South Boulevard에 연결된다고 설명한다. [Bleu Sector 7 연결 자료](https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/bleu-sector-7.html)는 서쪽에 Bleu Street가 있다고 설명한다. 기존 광장 접근로·사우스 불르바르·구역 7 사이에 왕복 가능한 거리를 추가했다. 정확한 도로 길이·갈림길·건물과 출구 좌표는 초안이며 Centrico Plaza 방면은 야생 구역 5 안을 통과하므로 구역 5 북쪽 출입구를 별도 연결했다. 구역 5 내부의 실제 거리 형상과 기존 임시 출입구 정리는 아직 남아 있다.

### 블루 스트리트 북쪽과 야생 구역 5 (초안)

[Bleu Street](https://bulbapedia.bulbagarden.net/wiki/Bleu_Street)와 [Wild Zone 5](https://bulbapedia.bulbagarden.net/wiki/Wild_Zone_5)는 블루 광장과 센트리코 광장 사이 거리의 북쪽 일부가 구역 5에 들어간다고 설명한다. 구역 5 지상 북쪽에 센트리코 방면 출입구와 도로 표시를 추가했다. 기존 임시 출구는 이동·저장 호환을 위해 유지하며 실제 위치와 거리 윤곽은 초안이다.

### 블루 스트리트와 블루 구역 6 (초안)

[Bleu Street 위치 설명](https://bulbapedia.bulbagarden.net/wiki/Bleu_Street)은 도로가 블루 구역 6을 지난다고 설명하며, [시설 위치 자료](https://psypokes.com/plza/servicenpcs.php)는 구역 6의 Passage de la Félicité 출입구가 블루 스트리트에 있다고 설명한다. 기존 블루 구역 6 접근로와 블루 스트리트에 왕복 연결을 추가했다. 출입구의 정확한 위치와 도로 폭은 초안이며 쇼핑 아케이드 연결은 추가했으나 상점 기능과 정확한 구조는 미구현이다.

### 파사주 드 라 펠리시테 (초안)

[블루 스트리트](https://bulbapedia.bulbagarden.net/wiki/Bleu_Street)는 파사주 드 라 펠리시테 입구를 명시하고 [구역 6 옥상 경로 안내](https://raiderking.com/pokemon-legends-z-a-all-flabebe-flower-color-locations/)는 블루 스트리트에서 통로를 지나 구역 6 쪽으로 갈 수 있다고 설명한다. 두 쪽 출입을 연결하되 기존 직접 연결도 유지한다. 실내 상점 위치와 통로 크기·출입구 좌표는 초안이며 상점 기능은 아직 없다.

### 야생 구역 5 지하 공터의 우두머리

[Thonky 공략](https://www.thonky.com/pokemon-legends-z-a/side-mission-008-get-well-fennekin)과 [PowerPyx](https://www.powerpyx.com/pokemon-legends-z-a-whirlipede-location/)는 두 번째 오염물 뒤 공터에 우두머리 휠구가 있다고 설명한다. 기존 지상 임시 개체를 지하 공터로 옮기되 기존 처치·포획 기록과 배틀 방식을 공유한다. 공터의 정확한 형태·개체 좌표·실시간 추격 행동은 원작과 대조되지 않았다.

### 사우스 불르바르·베르 구역 6·야생 구역 17 (초안)

[구역 17 안내](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_17)는 북쪽 세 출입구 가운데 하나가 베르 구역 6으로 이어진다고 설명한다. [도구 위치 목록](https://altissimo1.github.io/Supplementary-Series/Legends/Legends-Z-A/poke-balls.html)은 베르 구역 6과 South Boulevard 사이 계단을 명시한다. 이 관계를 연결하고 물과 다리를 도트로 표현했다. 계단 높이, 다리와 수역 윤곽, 도로·출입구 좌표는 초안이다. 구역 17의 다른 북쪽 수로 출입구도 연결했지만 실제 다리·계단 위치와 높이는 아직 정밀 대조되지 않았다.

### 야생 구역 17 북쪽 수로 출입구 (초안)

[Poképédia 구역 17](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_17)은 북쪽에 쿨랑 수로의 다리와 계단으로 향하는 별도 출입구를 설명한다. 기존 수로 지도에 두 경로를 연결하고 랭크 C 진입 제한을 유지했다. 다리·계단의 정확한 좌표와 높이 차, 주변 지형의 형태는 초안이다.

### 야생 구역 17 북쪽 산책로와 남쪽 잔디 (초안)

[Poképédia 구역 17](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_17)은 북쪽 Y자 산책로와 화염레오 조각상 두 개, 남쪽 잔디 구역 및 그 사이 계단을 설명한다. 이를 토대로 포장길과 계단, 조각상 장식을 표시했다. 타일 좌표와 높이 표현은 초안이며 남쪽 벤치·매점과 실제 조각상 형태·정확한 지형은 아직 대조·구현하지 않았다. 조각상은 기존에 막힌 타일 위에 놓아 기존 저장 위치를 막지 않는다.

### 블루 광장 야생 구역 16의 세 출입구 (초안)

[Poképédia 구역 16](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_16)은 블루 광장을 향하는 북서·동·남서 출입구 세 곳을 설명한다. 기존 출입구를 유지하며 동쪽과 남서쪽 출입구를 블루 광장 접근로에 추가했고 랭크 C 제한을 유지했다. 광장 접근 지도에서의 출입구 상대 위치와 좌표, 원형 수역·분수의 실제 윤곽은 초안이다.

### 베르 구역 6과 야생 구역 11 남쪽 (초안)

[Poképédia 구역 11](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_11)은 운하 남쪽의 동쪽 출구가 베르 구역 6으로, 남쪽 출구가 쿨랑 수로로 이어진다고 설명한다. 기존 수로 출구와 북·남 수역 분리를 유지하며 구역 6 방면 출구를 추가했다. 정확한 출입구 좌표·수역 윤곽과 주변 도시 지형은 초안이며 북쪽의 존느 구역 10·12 방면 연결도 추가했으나 자세한 지형과 거리 좌표는 초안이다.

### 야생 구역 11 북쪽과 존느 구역 10·12 (초안)

[구역 11 자료](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_11)는 북쪽 서쪽·동쪽 출입구가 각각 존느 구역 10·12로 이어진다고 설명한다. [구역 6 출현 자료](https://pokemongohub.net/post/guide/all-wild-zones-pokemon-legends-z-a/)는 구역 6이 존느 구역 12에 있음을 명시한다. 두 북쪽 출구와 구역 12·구역 6 연결을 추가했다. 거리와 각 출입구의 정밀 좌표·주변 건물은 초안이며, 존느 구역 10의 서쪽 구역 6·동쪽 구역 12 연결은 추가했으나 북쪽 구역 9와 쉐종 운하변 연결은 추가했으나 상세 지형은 초안이다. 기존 임시 출구는 저장·이동 호환을 위해 유지한다.

### 존느 구역 6·10·12 도시 연결 (초안)

[존느 구역 10 위치 자료](https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/jaune-sector-10.html)는 구역 6이 북서쪽, 구역 12가 동쪽이라고 설명한다. 야생 구역 11을 통과하지 않는 두 도시 연결을 추가해 야생 구역 제한과 분리했다. 구체적인 도로 형태·건물과 출구 좌표는 초안이다. 북쪽 존느 구역 9는 연결했으나 쉐종 운하변은 연결했으나 상세 지형은 초안이다.

### 존느 구역 10·9와 광장 접근로 (초안)

[존느 구역 10 안내](https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/jaune-sector-10.html)는 북쪽에 구역 9가 있다고 설명한다. [존느 광장에서 구역 9로 가는 안내](https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/Exploring_Lumiose_City)도 참고해 구역 10·9 및 기존 광장 근처 접근로를 연결했다. 실제 거리의 폭·구간·계단과 건물 좌표는 초안이며, 쉐종 운하변의 정확한 지형과 구역 9의 상세 지형은 미구현이다.

### 쉐종 운하변과 센트리코·존느 구역 6 (초안)

[Poképédia](https://www.pokepedia.fr/Quai_du_Canal_des_Saisons)는 운하변이 서쪽 센트리코 광장과 북쪽 존느 구역 6을 잇고 위쪽 길·물가 길과 나무 발판이 있다고 설명한다. [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Saison_Canalside)도 센트리코에서 운하 북쪽 강변으로 이어진다고 설명한다. 두 출입과 산책로·수역·발판을 추가했다. 정확한 좌표와 폭·높이 차·발판 개수는 초안이다. 존느 구역 2도 연결했으나 베르 구역 3 방면 다리는 연결했으나 주변 시설은 미구현이다.

### 존느 구역 2와 쉐종 운하변 (초안)

[Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Jaune_Sector_2)는 구역 2 남쪽이 쉐종 운하변에 접한다고 설명하고, [도구 위치 자료](https://altissimo1.github.io/Supplementary-Series/Legends/Legends-Z-A/poke-balls.html)는 서쪽 건물군으로 둘러싸인 안뜰을 명시한다. 두 구간을 왕복 연결하고 안뜰을 표현했다. 건물·안뜰·입구의 정확한 크기와 위치는 초안이며 북쪽 존느 스트리트는 연결했으나 저스티스 도장의 상세 구조·기능은 미구현이다.

### 존느 스트리트와 구역 2 (초안)

[존느 스트리트 자료](https://bulbapedia.bulbagarden.net/wiki/Jaune_Street)는 이 거리가 센트리코 광장에서 존느 광장을 거쳐 노스 불르바르로 이어지며 구역 2를 지난다고 설명한다. [구역 2 자료](https://bulbapedia.bulbagarden.net/wiki/Jaune_Sector_2)는 북쪽 경계가 존느 스트리트라고 명시한다. 구역 2·센트리코·기존 존느 광장 접근로를 왕복 연결했다. 세부 타일·방향과 광장 접근 경로는 초안이며, 광장 접근로에서 노스 불르바르 방면을 연결했으나 존느 포켓몬센터는 미구현이다.

### 존느 광장 접근로와 노스 불르바르 (초안)

[존느 광장 자료](https://www.pokepedia.fr/Place_Jaune)는 광장 남쪽 길이 존느 구역 6으로 이어진다고 설명한다. [존느 스트리트 자료](https://bulbapedia.bulbagarden.net/wiki/Jaune_Street)는 광장을 거쳐 노스 불르바르로 이어진다고 설명한다. 구역 6과 기존 광장 접근로, 노스 불르바르를 왕복 연결했다. 임시 접근로는 광장 자체가 아니며 도로의 방향·길이와 출입구 좌표는 초안이다. 존느 포켓몬센터와 실제 광장 주변 상세 지형은 미구현이다.

### 존느 스트리트와 야생 구역 8 출입구 (초안)

[구역 8 자료](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_8)는 존느 광장 내 구역이 존느 스트리트 양쪽에서 접근 가능하다고 설명한다. 기존 센트리코·광장 접근로 출구를 저장 호환을 위해 유지하면서 존느 스트리트에서 직접 들어가는 왕복 경로를 추가했고 기존 랭크 제한을 적용했다. 출입구의 정확한 좌표·도로 형상은 초안이며, 두 출입구를 포함한 광장 전체 형상은 원작 지도·영상과 추가 대조가 필요하다.

### 쉐종 운하 다리와 베르 구역 3 (초안)

[쉐종 운하변 자료](https://www.pokepedia.fr/Quai_du_Canal_des_Saisons)는 베르 구역 3과 운하변을 잇는 다리를 명시한다. [도구 위치 자료](https://altissimo1.github.io/Supplementary-Series/Legends/Legends-Z-A/poke-balls.html)는 구역 3 잔디 지대와 베르 광장 사이 계단을 설명한다. 운하를 건너는 길과 구역 3, 기존 광장을 왕복 연결하고 잔디를 표현했다. 다리 폭·계단과 지형의 정확한 좌표는 초안이며 카페·옥상·시설은 미구현이다.

### 베르 구역 3·쿨레 수로·베르 스트리트 (초안)

[베르 구역 3 자료](https://bulbapedia.bulbagarden.net/wiki/Vert_Sector_3)는 동쪽에 쿨레 수로, 남쪽에 베르 스트리트가 있다고 설명한다. [수로 자료](https://bulbapedia.bulbagarden.net/wiki/Coulant_Waterway)도 구역 3 동쪽과 베르 스트리트 방면의 관계를 확인한다. 기존 경로를 보존하며 양쪽에 왕복 연결을 추가했다. 정확한 도로·수로 윤곽과 출입 좌표, 구역 내 카페·옥상은 초안 또는 미구현이다.

### 베르 구역 1과 구역 3·베르 스트리트 (초안)

[구역 3 자료](https://bulbapedia.bulbagarden.net/wiki/Vert_Sector_3)는 구역 1이 바로 서쪽에 있다고 설명한다. [도시 탐색 자료](https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/Exploring_Lumiose_City)는 구역 1에 베르 스트리트와 누보 카페 부근에서 접근하는 경로를 설명한다. 구역 1을 추가하고 구역 3·베르 스트리트와 왕복 연결했다. 건물의 규모·형상과 지상 출입구 정확한 위치는 초안이며 옥상·발판 및 시설은 아직 미구현이다.

### 베르 구역 6·7 다리와 잔디 광장 (초안)

[도구 위치 자료](https://altissimo1.github.io/Supplementary-Series/Legends/Legends-Z-A/stat-boosters.html)는 구역 6에서 구역 7로 가는 다리와 구역 7의 잔디 광장을 명시한다. 기존 구역 6 수역·다리와 새 구역 7을 왕복 연결했다. 지도의 물길과 다리의 정확한 방향·길이, 광장 윤곽과 건물 좌표는 초안이며 구역 7의 옥상·홀로베이터와 시설은 미구현이다.

### 베르 구역 7과 사우스 불르바르 (초안)

[미션 40 위치 자료](https://www.pokemon-france.com/guides/legendes-pokemon-z-a/missions-secondaires/)는 구역 7이 사우스 불르바르에 접한다고 설명하고, [탐색 공략](https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/Exploring_Lumiose_City)은 불르바르의 홀로베이터에서 구역 7 옥상으로 가는 길을 설명한다. 구역 7과 기존 도로를 왕복 연결했다. 실제 지상 출입 위치·경로 형상은 초안이며 홀로베이터 미션과 옥상 경로는 아직 구현하지 않았다.

### 베르 구역 2 정원과 야생 구역 2 북서 입구 (초안)

[원작 구역 공략](https://thegameslayer.com/guides/pokemon-legends-z-a-all-wild-zone-2-pokemon/)은 야생 구역 2 북서 출입구가 베르 구역 2 옆에 있고 입구 안쪽에 계단이 있다고 설명한다. [현장 경로 자료](https://esports.gg/guides/pokemon/how-to-catch-larvitar-in-pokemon-legends-z-a/)는 구역 2 서북쪽 정원과 계단을 설명한다. 기존 연결을 유지하며 빈 도시 지도에 정원과 접근 계단을 표현했다. 정원 윤곽·계단 폭과 좌표는 초안이며 건물·옥상과 높이 차는 아직 추가 검증·구현이 필요하다.

### 야생 구역 13 동서 출입구 (초안)

[구역 13 자료](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_13)는 노스 불르바르의 동쪽과 서쪽에 각각 출입구가 있고 길이 구역을 가로지른다고 설명한다. 기존 서쪽 출구를 보존하며 동쪽 출입구를 추가하고 기존 랭크 E 제한을 적용했다. 타일 좌표와 각 출구 사이의 실제 거리 형상은 초안이며 남쪽 루주 구역 7 출입구는 추가했으나 상세 지형은 초안이다.

### 야생 구역 13 남쪽과 루주 구역 7 (초안)

[구역 13 자료](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_13)는 남쪽 출입구가 루주 구역 7로 이어진다고 설명한다. [기술머신 위치 안내](https://www.psypokes.com/plza/tm.php)는 구역 7에 훈련 코트가 있음을 설명한다. 남쪽 출구와 구역 7 왕복 연결을 추가하고 코트를 도식적으로 표시했다. 코트·건물·출입구의 정확한 위치와 구역 7의 루주 스트리트 접근을 추가했으나 옥상 연결은 미구현이다.

### 루주 구역 7과 루주 스트리트 (초안)

[구역 7 의뢰 위치 자료](https://www.dexerto.com/wikis/pokemon-legends-z-a/all-hyperspace-side-missions-walkthrough-in-mega-dimension-dlc/)는 루주 구역 7이 루주 스트리트에 접하는 것을 명시한다. 구역 7과 기존 루주 거리 지도 사이에 왕복 경로를 추가했다. 출입 위치·건물 및 길의 모양은 초안이며, 확인된 근거는 지역 관계이지 정밀한 지상 경로가 아니다. 다른 주변 거리와 옥상 경로는 미구현이다.

### 야생 구역 14 단일 진입 경로

[구역 14 자료](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_14)는 마젠타 스트리트 쪽 출입구 하나를 명시한다. [현장 공략](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-14-guide-all-pokemon-and-alphas)은 프리즘타워에서 운하를 따라 접근한다고 설명한다. 노스 불르바르에서 구역 14로 즉시 들어가던 초안 경로를 마젠타 운하 접근로로 바꾸고, 구역 입구의 랭크 D 제한을 유지했다. 기존 구역 내 저장 위치 복구를 위해 북쪽 레거시 출구는 유지한다. 정밀 지형과 거리 방향은 여전히 초안이다.

### 야생 구역 15 남서쪽과 존느 구역 7 (초안)

[구역 15 자료](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_15)는 남서쪽 출입구가 존느 구역 7로 이어진다고 설명한다. [존느 구역 7 자료](https://bulbapedia.bulbagarden.net/wiki/Jaune_Sector_7)는 구역이 존느 스트리트와 인접한다고 설명한다. 구역 7을 추가하고 기존 도시 거리·구역 15를 연결하며 랭크 D 제한과 옥상 상태를 유지했다. 정확한 입구 좌표·건물과 공원 형상은 초안이며 옥상 입구와 카페 시설은 미구현이다.

### 이베르날 애비뉴와 야생 구역 15 북쪽 (초안)

[구역 15 자료](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_15)는 북쪽 지상 출입구가 이베르날 애비뉴로 이어진다고 설명한다. [현장 공략](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-15-guide-all-pokemon-and-alphas)은 프리즘타워에서 이베르날 애비뉴를 따라 구역으로 가는 경로를 설명한다. 센트리코 접근로·새 애비뉴·구역 15를 연결하며 랭크 D 제한을 보존했다. 도로 폭·방향과 정밀 좌표는 초안이고 옥상 출입구는 미구현이다.

### 야생 구역 10 서쪽과 사우스 불르바르 (초안)

[구역 10 자료](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_10)는 서쪽 출입구가 사우스 불르바르, 동쪽은 에스파스 비드에 연결된다고 설명한다. 기존 센트리코 직결을 불르바르 경유로 바꾸고 기존 에스파스 비드 연결과 랭크 F 제한을 유지했다. 센트리코에서 불르바르로 가는 연결 및 입구의 정밀 좌표·지형은 초안이며 지도 대조가 더 필요하다.

### 야생 구역 9와 에스티발 애비뉴 (초안)

[구역 9 자료](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_9)는 남쪽 출입구 두 곳이 에스티발 애비뉴로 이어진다고 설명한다. 기존 센트리코 직결을 에스티발 경유로 정리하고 에스티발 지도와 두 왕복 연결을 추가했으며 랭크 F 제한을 적용했다. 출입구의 정밀 위치·도로와 고저차는 초안이며 북쪽 마젠타 구역 6 출입구는 추가했으나 동쪽 구역 3 출입구도 추가했으나 지형은 초안이다.

### 야생 구역 9 북쪽과 마젠타 구역 6 (초안)

[구역 9 자료](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_9)는 북쪽 출입구가 마젠타 구역 6으로 이어진다고 설명한다. [마젠타 구역 6 자료](https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/magenta-sector-6.html)는 북쪽 마젠타 스트리트·운하와 안뜰이 있는 건물군을 설명한다. 지상 출입구와 기존 운하 접근로를 연결하고 안뜰을 도식적으로 표현했다. 정확한 크기·길·출입구 좌표는 초안이며 옥상·상점·동쪽 구역 3 연결은 추가했으나 지형은 초안이다.

### 야생 구역 9 동쪽과 마젠타 구역 3 (초안)

[구역 9 자료](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_9)는 동쪽 출입구가 마젠타 구역 3으로 이어진다고 설명하고 [구역 6 안내](https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/magenta-sector-6.html)는 구역 3이 구역 6 동쪽에 있다고 설명한다. 두 관계를 왕복 연결하고 구역 9의 랭크 F 제한을 유지했다. 건물·안뜰의 정확한 위치와 길 폭은 초안이며 옥상·시설은 미구현이다.

### 야생 구역 9의 두 남쪽 출입구 (초안)

[구역 9 자료](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_9)는 두 남쪽 출입구가 에스티발 애비뉴에 연결된다고 설명한다. 기존 센트리코 직결을 에스티발 경유로 바꾸고 두 출입구의 왕복 연결과 랭크 F 제한을 유지했다. 기존 저장은 보존되며 도로·출입구의 정확한 형태와 좌표는 초안이다.

### 야생 구역 18 남쪽과 마젠타 구역 9 (초안)

[구역 18 자료](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_18)는 남쪽에 마젠타 구역 9가 있다고 설명한다. [구역 9 위치 자료](https://bulbapedia.bulbagarden.net/wiki/Magenta_Sector_9)는 구역 9가 콰자르티코 북쪽에 있다고 명시한다. 지상 경로를 왕복 연결하고 구역 18의 랭크 B 제한을 유지했다. 건물·골목과 출입구 좌표는 초안이며 원작의 옥상·비계 연결은 미구현이다.

### 오토널 애비뉴와 야생 구역 18 북쪽 (초안)

[구역 18 자료](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_18)는 북쪽 오토널 애비뉴를 명시하고 [오토널 애비뉴 위치 자료](https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/autumnal-avenue.html)는 센트리코 및 마젠타 구역 9 인접을 설명한다. 애비뉴·센트리코·구역 9와 구역 18 지상 북쪽을 연결하고 기존 랭크 B 제한을 유지했다. 방향·길 폭·출입 좌표는 초안이며 상점·실제 건물과 옥상은 미구현이다.

### 오토널 애비뉴와 북쪽 대로 (초안)

[오토널 애비뉴 위치 자료](https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/autumnal-avenue.html)는 북서쪽 끝이 북쪽 대로라고 설명한다. 두 구역을 왕복 연결했다. 출입 타일과 주변 건물·도로의 구체적인 형상은 원작 영상 대조가 필요한 초안이다.

### 야생 구역 18 남동쪽 콰자르티코 골목 (초안)

[구역 18 자료](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_18)는 남동쪽의 콰자르티코 방면 작은 골목을 별도 출입구로 설명한다. 지상에서 양방향 연결하고 랭크 B 제한을 적용했다. 골목 선형과 2D 출입 좌표, 높이 차는 원작 영상 대조가 필요한 초안이다.

### 야생 구역 18 도로변과 비계 (초안)

[구역 18 지형 자료](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_18)와 [출현 위치 자료](https://pokequery.com/games/legends-za/wild-zones/18)는 도로변 아공이·보만다와 남동쪽 공사 비계의 이어롭을 구분한다. 도로변 정원 및 남쪽 비계 접근을 표현하고 이어롭을 상층으로 이동했다. 비계와 옥상은 현재 하나의 상층으로 근사하며 경계·높이·정확한 좌표는 미확인이다.

### 구역 18 이어롭 배치 정정

[실플레이 안내](https://www.videogameschronicle.com/guide/pokemon-legends-z-a-wild-zone-18/)는 이어롭을 비계 사다리를 오르기 전 골목에서 만난다고 설명한다. 따라서 직전의 상층 배치를 지상 골목으로 정정했다. 골목의 정확한 형상·좌표와 실제 비계 높이 연결은 여전히 초안이다.

### 오토널 애비뉴 서쪽 마젠타 9번지 (방향 정정)

[오토널 애비뉴 위치 자료](https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/autumnal-avenue.html)는 마젠타 9번지를 애비뉴 서쪽으로 설명한다. 이전 초안의 동쪽 연결을 서쪽으로 정정했다. 분기 선형과 타일 좌표는 원작 영상에 의한 추가 대조가 필요한 초안이다.

### 야생 구역 6 북쪽 존느 11번지 (초안)

[구역 6 자료](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-6-guide-all-pokemon-and-alphas)는 북쪽 출입구가 존느 11번지에 있다고 설명한다. 양방향 이동을 연결했다. 거리의 건물·폭·타일 좌표는 원작 지도·영상으로 더 대조해야 할 초안이며 기존 임시 이동 연결은 보존한다.

### 존느 11번지 주변 도로 (초안)

[존느 11번지 자료](https://bulbapedia.bulbagarden.net/wiki/Jaune_Sector_11)는 9번지가 서쪽에 인접하고 존느 거리가 북쪽, 북쪽 대로가 동쪽 면을 지난다고 설명한다. 세 방향을 기존 지도와 양방향으로 연결했다. 정확한 분기 위치·거리 선형·건물은 영상 대조가 필요한 초안이다.

### 베르 7번지와 야생 구역 17 (초안)

[베르 7번지 자료](https://bulbapedia.bulbagarden.net/wiki/Vert_Sector_7)는 구역 17이 이 번지 안에 있다고 설명한다. 기존 지도에서 두 구역 사이 지상 이동을 추가하고 랭크 C 제한을 유지했다. 출입 위치·통로 선형은 원작 지도나 영상으로 추가 확인할 초안이다.

### 베르 6·7번지 다리 접근 (초안)

[원작 도구 위치 안내](https://altissimo1.github.io/Supplementary-Series/Legends/Legends-Z-A/stat-boosters.html)는 베르 6번지에서 7번지로 가는 다리를 언급한다. 기존 양방향 연결 양쪽에 걸을 수 있는 다리 접근 타일을 표현했다. 다리의 폭·정확한 선형과 수면 윤곽은 초안이다.

### 베르 거리와 사우스 불르바르 교차로 (초안)

[베르 포켓몬센터 위치 자료](https://bulbapedia.bulbagarden.net/wiki/Lost_Pok%C3%A9_Ball_collector)는 센터가 두 도로의 교차점에 있다고 설명한다. 기존 베르 거리와 사우스 불르바르 지도를 왕복 연결했다. 교차로의 실제 위치·폭과 센터 건물까지의 동선은 추가 원작 시각 대조가 필요한 초안이다.

### 베르 포켓몬센터의 도로변 접근 (초안)

[베르 8번지 자료](https://bulbapedia.bulbagarden.net/wiki/Vert_Sector_8)는 베르 거리 쪽 포켓몬센터의 파티 회복을 설명한다. 기존 회복 처리를 교차로 근처 초안 타일에 연결했다. 같은 자료는 Station Front와의 교차점을, [회수원 자료](https://bulbapedia.bulbagarden.net/wiki/Lost_Pok%C3%A9_Ball_collector)는 South Boulevard와의 교차점을 언급하므로 정확한 입구 좌표와 도로 이름은 미확정이다. 센터 상점·벤치·회수원은 별도 구현이 필요하다.

### 블르 7번지 포켓몬센터 (초안)

[블르 7번지 자료](https://bulbapedia.bulbagarden.net/wiki/Bleu_Sector_7)는 블르 거리와 사우스 불르바르 교차점의 포켓몬센터를 설명한다. 해당 번지 내 회복 지점을 기존 회복 처리로 연결했다. 건물 외관·정확한 좌표와 상점·벤치·회수원은 미구현이다.

### 블르 3번지와 베르날 애비뉴 (초안)

[Aymlis Park 자료](https://bulbapedia.bulbagarden.net/wiki/Aymlis_Park)는 베르날 애비뉴와 블르 3번지가 공원 포켓몬센터 인근에서 만난다고 설명한다. 기존 두 도시 맵을 별도 야생 구역 진입 없이 왕복 연결했다. 교차로 좌표·형상과 센터 출입구는 원작 영상 대조가 필요한 초안이다.

### 베르날 애비뉴와 야생 구역 5 (초안)

[구역 5 안내](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-5-guide-all-pokemon-and-alphas)는 베르날 애비뉴 끝에서 구역으로 접근할 수 있다고 설명한다. 애비뉴와 구역 5 지상을 양방향으로 연결했다. 동쪽 물가의 정확한 입구·수역 윤곽과 타일 좌표는 지도·영상으로 추가 확인할 초안이다.

### 블르 거리와 야생 구역 5 (초안)

[블르 1번지 자료](https://bulbapedia.bulbagarden.net/wiki/Bleu_Sector_1)는 구역 5가 대부분을 차지하는 번지가 블르 거리와 인접한다고 설명한다. 지상 통행을 양방향 연결했다. 구체적인 입구 좌표와 거리 형태는 원작 시각 자료로 추가 대조가 필요한 초안이다.

### 루주 3번지와 오토널 애비뉴·북쪽 대로 (초안)

[루주 3번지 자료](https://bulbapedia.bulbagarden.net/wiki/Rouge_Sector_3)는 오토널 애비뉴 북동쪽의 이 번지를 설명하고 [북쪽 대로 위치 자료](https://altissimo1.github.io/Supplementary-Series/Legends/Legends-Z-A/poke-balls.html)는 번지 북쪽의 대로를 언급한다. 두 도로에 연결되는 2D 지상 초안을 추가했다. 실제 교차로·건물 좌표와 상점·식당은 미구현이며 영상 대조가 필요하다.

### 루주 3번지의 식당과 볼 부티크 (위치 초안)

[르 예 식당](https://bulbapedia.bulbagarden.net/wiki/Restaurant_Le_Yeah)과 [루주 3번지](https://bulbapedia.bulbagarden.net/wiki/Rouge_Sector_3) 자료는 두 시설의 존재를 확인한다. 거리 초안에 시설 표식과 이름을 추가했다. 입구 좌표·외관은 추정이며 내부·음식 배틀·판매는 구현되지 않았다.

### 오토널 애비뉴와 콰자르티코 (초안)

[오토널 애비뉴 위치 자료](https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/autumnal-avenue.html)는 서쪽 접근처로 콰자르티코를 명시한다. 기존 거리와 콰자르티코 맵을 왕복 연결했다. 지형 선형과 출입 타일은 원작 영상으로 추가 확인할 초안이다.

### 루주 3번지와 루주 광장 서쪽 (초안)

[루주 지구 위치 안내](https://allthings.how/modest-mint-locations-in-pokemon-legends-z-a/)는 구역 3 서쪽의 시장을 루주 3번지로 설명하면서 1번지로 표기하는 자료도 있다고 밝힌다. 루주 3번지 초안과 구역 3 서쪽을 양방향 연결했다. 시장의 정확한 구역 경계·입구 위치와 지형은 미확정이며 원작 지도 대조가 필요하다.

### 야생 구역 4 남쪽 납골당 (초안)

[묘지 구역 안내](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-4-guide-all-pokemon-and-alphas)는 남쪽에 큰 납골당이 있다고 설명한다. 남쪽 지형에 통과할 수 없는 구조물을 추가하고 기존 저장이 해당 부지에 있을 때 인접 통행 칸으로 복구한다. 건물 윤곽·방향·정확한 위치는 원작 영상과 대조해야 할 초안이다.

### 팔레 통로와 루주 거리·북쪽 대로 (초안)

[시설 위치 자료](https://www.dbltap.com/guides/pokemon-legends-za-clothing-store-locations)와 [루주 8번지 자료](https://bulbapedia.bulbagarden.net/wiki/Rouge_Sector_8)는 팔레 통로가 두 도로 교차점 부근에 있고 여덟 상점이 있다고 설명한다. 2D 통로, 양쪽 도로 연결과 상점 이름을 추가했다. 출입구 좌표·실내 배치·상점 외형은 초안이며 판매·의상 변경은 미구현이다.

### 존느 거리와 북쪽 대로 교차로 (초안)

[미르시티 도로 설명](https://bulbapedia.bulbagarden.net/wiki/Lumiose_City)은 북쪽 대로에서 존느 거리로 이어지는 길을 명시한다. 기존 두 도로 지도 사이 왕복 경로를 추가했다. 교차로의 타일 좌표·폭·주변 건물은 원작 시각 자료 대조가 필요한 초안이다.

### 로즈 8번지와 마젠타 거리·포켓몬센터 (초안)

[로즈 8번지 자료](https://bulbapedia.bulbagarden.net/wiki/Magenta_Sector_8)는 이 지역이 마젠타 거리와 북쪽 대로에 접하고 교차점에 포켓몬센터가 있다고 설명한다. 기존 운하변 거리 초안과 번지를 왕복 연결하고 기존 회복 처리를 적용했다. 출입 좌표·센터 건물 형상은 초안이며 상점·벤치·회수원은 미구현이다.

### 로즈 8·9번지 연결 (초안)

[8번지 자료](https://bulbapedia.bulbagarden.net/wiki/Magenta_Sector_8)와 [9번지 자료](https://bulbapedia.bulbagarden.net/wiki/Magenta_Sector_9)는 두 번지의 남북 인접을 설명한다. 기존 지상 지도에 왕복 통행을 추가했고 구역 18의 랭크 B 제한은 유지했다. 실제 도로 선형·출입 좌표는 별도 지도·영상 대조가 필요한 초안이다.

### 로즈 9번지와 북쪽 대로 (초안)

[로즈 9번지 자료](https://bulbapedia.bulbagarden.net/wiki/Magenta_Sector_9)는 이 번지가 북쪽 대로와 오토널 애비뉴에 인접한다고 설명한다. 기존 두 지도에 왕복 지상 연결을 추가했고 구역 18의 랭크 B 제한을 유지했다. 정확한 출입구 위치·선형은 원작 지도·영상 대조가 필요한 초안이다.

### 마젠타 거리의 미르 지하 수도 입구 (초안)

[하수도 자료](https://bulbapedia.bulbagarden.net/wiki/The_Sewers)는 마젠타 거리의 독립된 작은 하수도 구간을 명시한다. 기존 결정 정리 하수도의 미션 20 시작·재진입·보고를 마젠타 운하변에서도 연결하고 출입 위치를 기억한다. 기존 베르날 입구와 옛 저장의 귀환은 유지한다. 정확한 입구·지하 구조는 초안이다.

### 사우스 불르바르와 마젠타 거리 (초안)

[미르시티 도로 설명](https://bulbapedia.bulbagarden.net/wiki/Lumiose_City)은 변전소·구역 14를 사우스 불르바르와 마젠타 거리의 시설로 설명한다. 기존 운하변 마젠타 거리 초안과 사우스 불르바르를 연결해 하나의 구역 14 입구로 접근하도록 했다. 교차점 좌표·실제 선형은 원작 시각 대조가 필요한 초안이다.

### 로즈 3번지와 야생 구역 7 (초안)

[스토리 안내](https://pokemundo.com.br/detonado/pokemon-legends-z-a)와 [구역 안내](https://www.pokemythology.net/detonados/detonado-legends-z-a/)는 로즈 광장 구역 7이 3번지와 4번지 사이에 있다고 설명한다. 기존 3번지와 구역 7을 왕복 연결하고 랭크 F 제한을 유지했다. 정확한 출입구 위치·거리 선형은 원작 지도·영상 대조가 필요한 초안이다.

### 로즈 4번지와 광장·오토널 애비뉴 (초안)

[로즈 4번지 자료](https://bulbapedia.bulbagarden.net/wiki/Magenta_Sector_4)는 이 번지가 로즈 광장 북쪽, 오토널 애비뉴 인근에 있으며 카페 포켓몬아미가 있다고 설명한다. 두 지역에 왕복 연결되는 거리 초안을 추가하고 구역 7의 랭크 F 제한을 유지했다. 정확한 좌표·건물 형상은 초안이며 카페 내부·서비스와 이 번지의 미션 28 현장 이전은 미완료다. 기존 미션 경로는 보존한다.

### Magenta and Jaune Plaza ground appearance (draft)

The [overhead Lumiose map](https://github.com/Insektaure/Shiny-Stash-Live-Map/blob/main/romfs/lumiose.png) depicts Magenta Plaza's circular centre and surrounding paved ring, with the canal outside on both sides, and a circular arrangement at Jaune Plaza. The field renderer now distinguishes the centres and outer rings across each screen; for Jaune, the central earth and outer sand are also described by the [Wild Zone 8 guide](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-8-guide-all-pokemon-and-alphas). The displayed ellipses, colours and precise road widths are 2D approximations, not surveyed geometry. The Jaune changes are rendering only. At Magenta, small canal edge tiles were added on both sides; their exact extent is provisional. Old saved positions on those tiles migrate only at a matching revision, while encounter tiles, field objects and exit locations remain unchanged. The full canal, surrounding buildings and missing original street connections are not implemented.

### Saison Canal-side buildings (draft)

The [overhead Lumiose map](https://github.com/Insektaure/Shiny-Stash-Live-Map/blob/main/romfs/lumiose.png) shows buildings and paths alongside the Saison Canal on both the Magenta and Jaune sides. The two existing route screens now include provisional building footprints adjacent to their walkways while retaining their current entrances. Their exact locations, individual outlines and the continuous canal geometry are not verified, and these blocks should not be treated as reproductions of specific buildings. Previously valid saved positions covered by the new blocks migrate only when the save revision matches.

### Coulant Waterway eastern connections

[Poképédia](https://www.pokepedia.fr/Canal_Lacoul%C3%A9e) describes two eastern streets connecting Coulant Waterway to Vert Sectors 6 and 7, as well as the existing northern and southern approaches. The draft waterway now connects to both sectors in each direction, while retaining its older Zone 11 and Vert Street connections. Exact door positions, street lengths and the overall waterway geometry are not established by the source and remain provisional. The additional exits use previously blocked boundary tiles; previously valid saved positions are unchanged.

### Saison Canal across Centrico (draft street continuity)

[Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Saison_Canal) places the northwest canal segment along Magenta Street and the southeast segment beyond Centrico. The Magenta canal-side route now has a direct bidirectional street transition to the existing Centrico screen, which already connects to the southeast Saison promenade. The screen-edge coordinates, the intervening street length and the actual passage geometry are provisional; the water itself is not yet rendered as a continuous channel beneath the tower. The new transition does not require entering Wild Zone 7, and keeps that zone's existing rank restriction.

### Canal beneath Prism Tower (draft)

The [Saison Canal reference](https://bulbapedia.bulbagarden.net/wiki/Saison_Canal) says the waterway runs directly beneath Prism Tower. The Centrico draft now shows water on both sides of its existing tower footprint, with walkable approaches retained around it. These are short, compressed tile segments: the waterline, bridge structure, tower dimensions and exact screen-to-screen alignment have not been surveyed. This updates the previous entry's statement that the water was not rendered. Legacy floor positions newly covered by water are moved to walkable ground only if the save revision matches; original encounter tiles are not changed.

### Saison promenade and Wild Zone 11 map edges

The [Wild Zone 11 reference](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_11) places the zone on both sides of the Saison Canal, without a crossing within the zone. The existing water now extends to the edges of the promenade and Zone 11 screens rather than ending against an artificial wall. Those boundary cells were already blocked; the bridge exit and the separation of the banks are unchanged. This improves visual continuity only: the precise shoreline and connections to adjacent screens remain draft.

### Centrico channel alignment (draft)

The Centrico canal now reaches the eastern screen boundary, aligning visually with water at the western edge of the existing Saison promenade. Walkable bridge strips preserve plaza and event access. The [source](https://bulbapedia.bulbagarden.net/wiki/Saison_Canal) establishes the channel beneath Prism Tower, but these tile widths, bridge locations and direct screen alignment are approximations. Newly submerged former floor positions in older save layouts are relocated only on matching revisions; all existing exits and event tiles remain in place.

### Bleu and Vert Plaza water outlines (draft)

The [overhead Lumiose map](https://github.com/Insektaure/Shiny-Stash-Live-Map/blob/main/romfs/lumiose.png) shows a rounded water feature around Bleu Plaza's central monument and an irregular lake at Vert Plaza. The Zone 16 draft rounds three corners of its water ring, and the Zone 2 draft removes the straight northward extension beyond the northeast shore. Tile scale, crossings and detailed banks remain approximations; this is not a surveyed reconstruction. New water corners replace former floor only, with matching-revision migration for old saves. The existing encounter-grass tiles, entrances and fixed occupants are retained.
