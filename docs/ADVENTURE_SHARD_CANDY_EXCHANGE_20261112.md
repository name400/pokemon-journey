# 메가조각 경험사탕 교환

- 교환소가 열린 이후 경험사탕 S를 메가조각 8개로 교환한다. 메인 스토리 종료 후에는 M 30개, L 100개도 추가된다.
- 출처: https://pokemondb.net/pokebase/435143/whats-the-best-way-to-get-experience-candies-in-legends-z-a 및 https://www.thegamer.com/pokemon-legends-z-a-exp-candies-how-to-get-increase-levels-fast/
- 이 구현은 기존 교환소의 위치와 해금 플래그를 재사용한다. 원작 접수처의 정확한 화면과 공간은 별도로 구현하지 않았다. 스토리 종료는 기존 완료 플래그 `zaMission37Complete` 또는 `zaMission38Complete`로 판단한다.
- 사탕은 1~999개를 한 번에 교환할 수 있고 수량을 생략한 이전 요청은 1개로 처리한다. 보유량 제한과 동시 요청은 기존 가방·월드 트랜잭션과 리비전 검사로 처리한다. 기존 저장에는 필드를 추가하지 않는다.
- 다른 교환 물품과 운영 환경에서의 실제 검증은 이번 범위에 포함하지 않았다.
