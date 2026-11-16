# ZA 모르페코 모드 (2026-11-16)

[원작 전투 설명](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_battle_(Legends%3A_Z-A))과 [모르페코 폼 설명](https://bulbapedia.bulbagarden.net/wiki/Morpeko_(Pok%C3%A9mon))은 ZA에서 오라휠을 사용한 후 배부른 모양과 배고픈 모양을 바꾸며, 사용 시 모양에 따라 기술이 전기 또는 악 타입이라고 설명한다. 2차 자료다. 같은 자료는 ZA에서 모르페코를 2.0 이상 교환 또는 Mega Dimension에서 획득한다고 기록한다. 이 변경은 개체가 전투에 들어온 경우의 규칙이며 프로젝트에 새 획득 경로를 추가하지 않는다.

신규 ZA 전투에 `adventureMorpekoV1`을 붙인다. 표준 시뮬레이터의 매 턴 종료 모드 전환을 억제하고, 실제 오라휠 행동 후 다음 모드로 전환한다. 오라휠 타입은 행동 시 현재 모드를 사용하며 기술 목록과 전투 시각 이벤트도 표시를 맞춘다. 단일·동료 다중·삼중 전투 모두 적용한다. 오라휠 실행 여부와 효과 처리의 세부 경계는 턴제 근사다. 마커 없는 기존 전투와 저장된 개체·특성, 공통 대전 및 포켓로그는 이전 규칙을 유지한다.

[조로아](https://bulbapedia.bulbagarden.net/wiki/Zorua)·[조로아크](https://bulbapedia.bulbagarden.net/wiki/Zoroark)·[메타몽](https://bulbapedia.bulbagarden.net/wiki/Ditto_(Pok%C3%A9mon))·[체리꼬](https://bulbapedia.bulbagarden.net/wiki/Cherrim)는 확인한 도감에서 ZA 획득 불가로 기재돼 있다. 이 사실만으로 프로젝트에 이미 저장된 해당 개체나 그 특성을 제거하지 않는다. 그 외 미확인 제한 특성도 보류한다.

기본 기술 후 모드 유지, 오라휠 후 양방향 전환·악 타입 표기, 단일·동료·삼중 전투, 마커 없는 구형 전투 및 JSON·격리 API 재접속을 검사했다. 전체 테스트·운영과 Sites 병합본·원작 실기는 미검증이며 기존 `testfailed.md`는 유지한다.
