# 스시 하이 롤러 구형 저장 해금

기존 식당은 `zaMission24Started` 하나만 검사했다. 현재 스토리에서는 미션 20 완료 시 이 플래그가 설정되지만, 이를 갖지 않는 구형 저장이 이미 후반 랭크여도 식당에 들어가 도전할 수 없었다. 수락된 후기 미션 완료·시작 또는 C/B/A/S 랭크를 명시적으로 기록한 저장도 기존 도전에 접근할 수 있도록 UI와 서버가 같은 판정을 사용한다. D 랭크와 미션 20 진행 중만 기록된 저장은 기존처럼 잠겨 있다. 이미 완료한 기록·미수령 보상·코인과 진행 중 배틀을 소급 변경하지 않는다.

원작 해금 시점에 대해 [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Side_Mission)는 미션 20 완료, [Pokémon Database 정리](https://pokemondb.net/pokebase/435127/what-are-all-the-side-missions-in-legends-z-a)는 미션 24 중 사무소 방문, [Thonky](https://www.thonky.com/pokemon-legends-z-a/side-mission-073-full-course-of-battles-high-rolling)는 미션 25 시작을 제시한다. 실제 기기에서 경계를 확인하지 못했으므로 최신 저장의 기존 해금 시점은 바꾸지 않았다. 미션 20 완료 플래그는 이 게임의 실제 미션 24 시작을 뜻하며, 나머지는 더 늦은 진행의 구형 저장을 위한 호환 판정이다.

격리 API에서 D 랭크의 거절, 미션 24 플래그 없는 B 랭크의 최초 도전·재접속·기권, 이미 완료한 저장의 30,000코인 재도전 및 보상 중복 방지를 확인했다. 기존 식당 연전 검사는 별도로 통과했다. 다른 진행 기록을 보충하거나 운영 D1·Sites 병합본을 확인한 것은 아니다.
