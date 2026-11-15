# 미션 26 SBC 연전 복원

기존 미복구 작업 공간은 현재 접근 가능한 `/workspace`와 `/tmp`에서 찾지 못했고 기존 체크아웃의 작업 트리와 stash에도 해당 변경은 없었다. 개발 브랜치를 기준으로 다시 구현했다.

[Serebii의 Vert Sector 9](https://www.serebii.net/pokearth/lumiosecity/vertdistrict.shtml) 및 [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Legends:_Z-A/Part_21)는 Livia, Gérald, Lebanne의 순서와 Lebanne의 음번·견고라스·한카리아스·드래캄을 뒷받침한다. Thonky의 요약은 한카리아스를 누락하지만 위 두 자료의 네 마리와 각 기술을 채택했다. 원작의 실시간 플러스 기술은 기존 게임의 턴제 일반 기술로 표현한다. 기존 개시된 전투 스냅샷은 새 파티로 교체하지 않는다.

Bulbapedia는 두 전투 사이 회복 제안을 설명한다. 첫 두 상대를 이긴 새 진행에서 회복 선택지를 한 번 제공하며 거절하고 다음 배틀을 시작할 수도 있다. 회복 제안은 진행과 함께 저장되고, 기존 1·2단계 저장에 과거 회복 여부를 추정해 넣지 않는다. 승리 후 각 상대의 보상은 기존 단계 조건에서 한 번만 지급한다. 기존 지도 좌표, 단계 번호와 완료된 미션은 유지한다. 실제 운영·기기 검사는 하지 않았다.

## 호텔 앞 대결

[원작 공략](https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Legends:_Z-A/Part_21)은 세 사건을 마치고 호텔로 돌아간 뒤 밖에서 Jacinthe의 배틀존과 SBC 대결이 시작된다고 설명한다. 세 사건을 마치고 호텔 로비에서 나간 뒤 기존 호텔 바깥 화면에 세 대결과 대결 사이 회복 제안을 연결했다. 자동 전투 대신 표시된 상대를 선택하는 턴제 방식이며 좌표와 한 명으로 표시한 필드 표현은 2D 근사다. 기존 로비 상호작용과 진행 중 전투를 그대로 남겨 오래된 저장의 재도전을 보장하고, 명시된 0~2단계만 바깥에 표시한다. 완전한 실시간 배틀존·홀로그램 연출과 원작 기기 대조는 남아 있다.
