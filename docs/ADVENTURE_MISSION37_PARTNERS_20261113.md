# 미션 37 방어 작전 동료 파티

원작의 [Ivor](https://bulbapedia.bulbagarden.net/wiki/Ivor), [Canari](https://bulbapedia.bulbagarden.net/wiki/Canari), [Lebanne](https://bulbapedia.bulbagarden.net/wiki/Lebanne), [Corbeau](https://bulbapedia.bulbagarden.net/wiki/Corbeau), [Griselle](https://bulbapedia.bulbagarden.net/wiki/Griselle)의 미션 37 동료 전투 자료에 따라 방어 작전 다섯 구간의 선두·후속 포켓몬, 레벨, 기술, 성별과 지닌 도구를 연결했다. 동료가 쓰러지면 기존 다수 턴제 엔진이 동료의 다음 포켓몬으로 교체한다. 동료 포켓몬과 도구는 플레이어 보유함이나 가방에 추가되지 않는다.

현재 전투 엔진은 플레이어 외 동료 측이 하나이므로 Ivor와 함께 현장에 있는 Gwynn, Griselle과 함께 현장에 있는 Grisham의 독립된 동시 전투는 재현하지 않는다. 메가스톤을 지니지만 동료 AI의 자동 메가진화와 플러스 기술은 구현하지 않았으며, 실시간 전투와 원작의 기술 선택 방식도 턴제 각색이다. 미션 36의 Lida·Naveen 임시 파티는 이번 변경 대상이 아니다.

새로 시작하는 각 방어전에서만 새 파티를 만들고 이미 진행 중인 전투 스냅샷과 플레이어 파티·진행 저장은 변환하지 않는다. 다섯 구간의 구성·진행·재조회와 이전 동료 전투 복원을 격리 API로 검사했다. 원작 실기와 운영 환경은 검증하지 않았다.
