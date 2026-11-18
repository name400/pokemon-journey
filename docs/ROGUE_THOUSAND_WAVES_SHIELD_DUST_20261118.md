# 사우전드웨이브와 인분

고정 원본 `7c0881255af5cd51992e513ff93c2f71adbe40e0`의 [기술 정의](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/moves/move.ts#L10836), [추가 효과 확률 판정](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/moves/move.ts#L6051), [인분의 효과](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/abilities/ab-attrs.ts#L1196)를 대조했다. 대상의 인분이 유효하면 피해는 주되 추가 교체 불가 효과는 막는다.

기존 네이티브 기술은 인분 대상에게도 교체 불가를 적용했다. 신규 도전의 `thousandWavesEffectBlockRule: source-v1`은 기존 추가 효과 판정을 이용해 일반·패시브 인분, 틀깨기와 특성 억제를 반영한다. 이전 저장에 새 규칙을 자동 부여하지 않으며 전투 스냅샷에는 적용 규칙을 보존한다.

단일·더블, 멀티렌즈 유무, 일반·패시브 인분과 틀깨기, 위액에 의한 특성 억제, 구형 저장 동작과 전투 상태 복원을 격리 엔진으로 확인했다. 기존 전체 공격 및 물거품아리아 회귀를 포함해 49건이 통과했다. 전체 특성·도구 조합, 브라우저·실기기 및 운영 저장은 미검증이며 Sites에는 배포하지 않았다.
