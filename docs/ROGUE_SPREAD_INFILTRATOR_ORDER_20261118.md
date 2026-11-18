# 전체 공격의 틈새포착과 부가 효과 순서

고정 원본 `7c0881255af5cd51992e513ff93c2f71adbe40e0`은 [기술이 대타를 명중하는지 판정](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/moves/move.ts#L459)하고, [각 대상의 피해와 대상 효과를 순서대로 처리](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/phases/move-effect-phase.ts#L269)한다.

기존 신규 도전의 전체 공격 부가 효과 조기 처리에서는 대타가 존재하면 틈새포착으로 실제 대상을 맞힌 경우에도 첫 대상의 능력치 하락이 다음 대상 피해 뒤로 밀렸다. 신규 `spreadSecondaryBypassRule: source-v1`은 기존에 순차 처리 대상으로 검토한 기술에 한해 엔진의 대타 관통 표시를 반영한다. 과거 저장의 규칙과 대타가 실제로 피해를 받는 경우는 유지한다. 적용 규칙은 전투 스냅샷에도 보존한다.

격리 엔진에서 얼다바람·와이드브레이커의 대상별 순서, 일반·패시브 틈새포착, 멀티렌즈, 특성 억제·클리어바디·타입 면역, 기존 저장, 실제 턴 명령의 PP와 저장 복원을 확인했다. 전체 기술·특성·도구 조합, 실기기 및 운영 저장은 검증하지 않았고 Sites에는 배포하지 않았다.
