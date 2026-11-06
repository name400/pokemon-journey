# 탐험 맵 원작 대조 — 2026-11-06

사용자 요청: 원작 3D 공간의 길·건물·시설·연결·동선을 2D 도트로 옮긴다. 아래는 현재 확인 범위이며, 현재 맵이 원작에 일치한다는 뜻이 아니다.

- [공식 미르시티 소개](https://legends.pokemon.com/en-us/story-world/lumiose-city): 미르시티와 Hotel Z를 확인할 수 있다.
- [Serebii 미르시티 지도](https://www.serebii.net/pokearth/lumiosecity/): 도시와 야생 구역의 위치를 대조할 수 있다.
- [전체 도시 지도](https://www.gamesradar.com/games/pokemon/full-pokemon-legends-z-a-map-and-all-locations/): 도시 전체와 20개 야생 구역의 배치를 확인할 수 있다.
- [Hotel Z 접수대 화면](https://www.shacknews.com/article/146502/how-to-beat-rintaro-pokemon-legends-za): 로비의 접수대와 시각 요소를 확인할 수 있으나 단일 시점만으로 전체 벽·출입구·가구 좌표와 이동 동선을 확정할 수 없다.
- [임무 10 진행](https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/The_Secrets_of_Mega_Evolution): Hotel Z에서 동료를 만난 다음 앱솔의 메가스톤을 준비해 동료와 배틀하고 콰자르티코로 향한다.

현재 `lumioseMap`, `hotelMap`, 야생 구역 및 옥상은 임시 23×17 배치로 원작 동선과 일치하지 않는다. 실측·복수 시점의 근거 없이 벽, 문, 구역 연결을 추정해서 원작 재현으로 표시하거나 기존 좌표를 강제 이주하지 않는다. 우선 Hotel Z 내부의 출입구·접수대·층별 접근과 주변 거리, 다음으로 중심 광장과 각 색 지구·야생 구역의 연결을 원작 지도 및 실제 화면으로 대조하고, 기존 저장 위치는 안전한 진입 지점으로 복구하는 마이그레이션과 함께 구현해야 한다.

임무 10 시작 대화는 임시 호텔 접수처에서 호출하는 시범 연결이며 원작 NPC 위치나 동선을 재현했다고 주장하지 않는다. 동료 배틀, 콰자르티코, 나머지 임무와 실시간 전투는 별도 구현이 남아 있다.
