# 껍질방울 modifier와 대타 피해

고정 원본 `7c0881255af5cd51992e513ff93c2f71adbe40e0`의 `MoveEffectPhase.applyMoveDamage`는 대타가 흡수한 실제 피해를 공격자의 `totalDamageDealt`에 더한다. `HitHealModifier`는 타격이 끝난 뒤 그 값을 사용해 회복한다. 기존 simulator modifier 연결은 대타 피해를 빠뜨렸다.

새 도전의 `shellBellRule: source-v2`는 껍질방울 **modifier**의 회복량에 대타가 실제로 흡수한 피해를 합한다. 다단·더블 공격에서 포켓몬에 준 피해와 함께 한 번 계산하며 기존 진행의 규칙을 보존한다. 전투 스냅샷에도 규칙을 저장한다. 실제 턴에서 대타 체력 상한, 다단·더블, 상대의 도구, 도구 없음, 저장 복구와 다른 슬롯을 검사했다.

**후속:** 새 도전의 `source-v3`에서 native 껍질방울과 modifier를 합산하고 한 번 회복하며 치유 부적도 한 번 적용한다. 기존 v2 진행은 당시 동작을 유지한다. 상세 검증은 [SHELL_BELL_NATIVE_MIX_QA_20261105.md](SHELL_BELL_NATIVE_MIX_QA_20261105.md)를 따른다. 전체 기술·실계정 플레이의 원본 동등성을 의미하지 않는다.

관련 전투·도구·융합·챌린지 회귀는 일반 환경과 Worker 로더에서 각각 132/132 통과했다. 타입 검사와 프로덕션 빌드가 통과했으며 전체 테스트 스위트는 이번에 실행하지 않았다.
