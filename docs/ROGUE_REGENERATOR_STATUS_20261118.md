# 재생력의 상태이상·교체 회복 — 2026-11-18

고정 원본 `7c0881255af5cd51992e513ff93c2f71adbe40e0`은 [재생력에 교체 시 회복 속성을 연결](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/abilities/init-abilities.ts#L987)하고, [최대 HP의 0.33을 적용](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/abilities/ab-attrs.ts#L2744)하며 [내림 및 최소 1](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/utils/common.ts#L344)로 계산한다. 기존 native 시뮬레이터는 1/3을 적용한다. 격리 단일 전투에서 최대 HP 175, 현재 HP 20인 화상 개체가 교체될 때 기존 78, 원본 계산 77을 재현했다. 일반 특성과 패시브에서 동일했다.

신규 도전에 `regeneratorRoundingRule: source-v1`을 기록하고 해당 전투의 독립 Dex에서만 일반 상태의 회복량을 고친다. 기존 저장은 규칙을 추가하지 않아 이전 1/3 회복을 유지한다. 이미 기록된 HP는 수정하지 않는다. 다이맥스는 기준 HP를 별도로 검증하지 않아 기존 동작을 유지한다.

격리 엔진에서 일반/패시브, 화상/독, 특성 억제, 더블 교체, 저장 복원, 최대 HP 상한, 구형 규칙 및 다른 저장 보존을 확인했다. 원본 런타임의 직접 실행, 모든 상태·도구·폼 조합, 실제 기기 및 운영 데이터는 검사하지 않았다. 탐험 전투 및 Sites 배포는 변경하지 않았다.
