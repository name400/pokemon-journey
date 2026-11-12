# 탐험모험 전투 노력치

새로 시작하는 일반 야생·트레이너 전투와 미션 10 동료 전투에서 상대가 쓰러질 때 살아 있는 자기 파티에 종별 노력치를 지급한다. 쓰러뜨린 뒤 포획 기회에서는 두 번 지급하지 않는다. 포획만 한 경우는 원작 지급 근거가 불충분해 보류한다. 파워웨이트를 지닌 개체에만 HP 노력치 8을 더한다. 종별 상한 252, 전체 상한 510을 적용하고 기존 개체값과 저장 데이터를 보존한다. 전투 이벤트 순서 및 상대 식별자를 기록하고 포켓몬과 진행 상태를 같은 저장 경로로 반영한다.

근거: [ZA 노력치와 육성](https://rotomlabs.net/guide/stat-training-legends-z-a), [파티 공유와 파워 도구](https://gamefaqs.gamespot.com/switch/452075-pokemon-legends-z-a/answers/659501-how-are-evs-from-defeating-wild-pokeacutemon-granted), [파워 도구 보너스](https://www.pokecommunity.com/threads/ev-training-in-pok%C3%A9mon-legends-z-a.538755/). 종별 값은 기존 도감의 PokeAPI 고정 리비전 `6b8db7f3cb31cfaa37cb74e5c3edff124bcba5ce`의 `pokemon_stats.csv`에서 생성했다. 출처와 기존 라이선스는 `data/pokedex-source.json`, `public/licenses/pokeapi.txt`를 참고한다. ZA의 모든 종별 지급값은 원작 실기로 전수 확인하지 못했다.

구형 진행 중 전투는 이미 처리한 상대를 안전하게 판별할 수 없어서 그 전투가 끝날 때까지 노력치를 소급 지급하지 않는다. 종별 데이터가 없거나 잘못된 저장값은 추측해 변경하지 않는다. 전투 중 새 노력치는 저장하되 전투 시뮬레이터의 능력치에는 전투가 끝난 뒤 반영한다. 턴 도중 도구가 바뀌면 정확한 장착 시점 확인이 어려워 턴 전후 모두 파워웨이트를 지닌 경우에만 보너스를 준다. 전체 상한 직전 복수 능력치가 동시에 늘어날 때의 정확한 원작 우선순위는 미확인으로, 현재 HP·공격·방어·특수공격·특수방어·스피드 순으로 남은 양을 배분한다. 다른 파워 도구와 포켓러스는 이번 구현 범위가 아니다. 운영 기기에서의 검증은 하지 않았다.
