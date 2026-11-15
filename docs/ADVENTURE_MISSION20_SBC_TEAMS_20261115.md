# 미션 20 SBC 연속 배틀의 기술

[루주 지구 트레이너 자료](https://www.serebii.net/pokearth/lumiosecity/rougedistrict.shtml)는 François와 Vivica의 각 포켓몬이 사용하는 기술과 지닌 도구가 없다는 점을 기재한다. 새로 시작하는 두 배틀에 해당 기술을 적용하고 자동으로 붙던 도구를 제거했다. [미션 공략](https://www.thonky.com/pokemon-legends-z-a/main-mission-20-a-request-from-the-rust-syndicate)에 나온 순서·레벨·상금과 배틀 사이 회복 불가 조건은 기존 구현을 유지한다. 상대의 실제 실시간 AI와 방어 플러스의 구체적 사용 시점은 이 턴제 엔진에서 재현하지 않았다.

이미 진행 중인 구형 배틀의 상대·상태는 바꾸지 않고, 기존 승리·상금 기록도 소급 변경하지 않는다. 격리 API에서 두 팀의 기술·도구, 첫 승리 후 체력 유지와 회복 거절, 두 번째 승리·상금·중복 거절 및 구형 배틀 복원을 확인했다. 승리 검사는 상대 체력과 상태를 조정했으며 원작 실기·운영 D1·Sites 병합본은 확인하지 않았다.
