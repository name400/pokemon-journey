# 탈피 발동 확률 — 2026-11-18

고정 원본 `7c0881255af5cd51992e513ff93c2f71adbe40e0`의 [탈피 정의](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/abilities/init-abilities.ts#L517)는 `randSeedInt(10) < 3`, 즉 30% 확률로 [자신의 상태이상을 해제](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/abilities/ab-attrs.ts#L3795)한다. 기존 시뮬레이터는 실제 전투에서 33% 판정을 사용함을 격리 재현했다.

신규 도전에는 `shedSkinChanceRule: source-v1`을 기록하고 전투별 독립 Dex의 발동 확률을 30%로 조정한다. 규칙이 없는 구형 저장은 이전 33%를 유지하며 과거 결과나 저장을 일괄 수정하지 않는다. 일반·패시브 특성과 억제는 기존 특성 컴포넌트를 이용한다.

격리 엔진에서 일반·패시브의 발동과 미발동, 특성 억제, 상대 더블 전투, 저장 복원, 구형 규칙 및 다른 데이터 보존을 검사했다. 독·맹독·마비·잠듦·얼음은 특성 콜백을 따로 검사했다. 화상으로 기절한 경계는 신규 도전의 `statusResidualOrderRule`을 적용해 확인했다. 초기 검사 fixture가 기존 상태이상 처리 순서를 사용해 해당 경계에서 실패했고, 신규 도전 설정을 반영해 재검사했다. 원본과 난수 생성기·호출 순서가 같다는 뜻은 아니며 모든 특성 조합·원본 런타임·실제 기기는 미검증이다. 사용자 데이터와 Sites는 건드리지 않았다.
