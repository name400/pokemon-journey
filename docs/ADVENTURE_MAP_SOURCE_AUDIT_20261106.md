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
