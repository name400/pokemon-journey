# 미션 23: 루주 6번지 Gwynn과 홀로베이터

[원작 미션 안내](https://www.thonky.com/pokemon-legends-z-a/main-mission-23-a-rogue-mega-ampharos)는 홀로베이터에서 Gwynn과 배틀하고 회복한 뒤 옥상·비계·사다리를 거쳐 전룡에게 가는 순서를 설명한다. [루주 6번지 자료](https://bulbapedia.bulbagarden.net/wiki/Rouge_Sector_6)는 전룡 사건의 위치를 확인한다. 기존 루주 6번지 거리에서 Gwynn 전투와 기존 미션 옥상 홀로베이터를 이용할 수 있도록 연결했다.

홀로베이터로 내려올 때 올라간 거리를 저장해 복귀한다. 이전 버전의 루주 북쪽 거리 진입과 복귀 위치가 저장되지 않은 옛 옥상 저장은 기존 동작을 유지한다. 거리의 정확한 사건·홀로베이터 칸과 옥상 구조는 2D 초안이며 원작의 실시간 공격과 동료 동시 전투는 미구현이다.

[미션 공략](https://www.thonky.com/pokemon-legends-z-a/main-mission-23-a-rogue-mega-ampharos)의 비계 다음 낮은 지붕과 전룡 옥상 사다리를 별도 이동층으로 추가했다. 내려가기 전 옥상에서 주울 수 있는 독압정은 [기술머신 목록](https://www.serebii.net/legendsz-a/tm.shtml)의 089번이다. 위치·층의 크기·복귀 경로는 추정이며 기존 지름길은 호환을 위해 유지한다. 기술머신을 통한 기술 교육은 이번에 추가하지 않았다.

## Gwynn 재대결 편성과 상금

[Gwynn 전투 자료](https://bulbapedia.bulbagarden.net/wiki/Gwynn)는 미션 23 재대결에서 4마리의 기술과 승리 상금 3,008원을 기록하며, [별도 공략](https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/A_Rogue_Mega_Ampharos)도 같은 금액을 제시한다. 새로 시작하는 전투의 기술·성별·지닌 도구를 해당 자료에 맞추고 승리 시 기본 상금을 지급한다. 기존 금색 인형의 트레이너 상금 규칙도 적용한다. 이미 진행 중인 구형 배틀은 저장된 상대와 기존 상금 규칙을 유지하며 과거 승리에 새 상금을 소급하지 않는다. 호바귀의 작은 사이즈 폼은 기존 종 표현을 사용하므로 원작 폼까지 재현한 것은 아니다.

격리 API에서 새 편성·기권·재도전·상금·회복·승리 후 이동과 구형 배틀 복원 및 기존 보유 데이터 보존을 확인했다. 상금과 편성은 2차 자료 기반이며 원작 실기·운영 D1·Sites 병합본은 확인하지 않았다.
