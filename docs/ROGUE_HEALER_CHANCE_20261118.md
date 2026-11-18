# 치유의마음 발동 확률 — 2026-11-18

고정 원본 `7c0881255af5cd51992e513ff93c2f71adbe40e0`의 [치유의마음 정의](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/abilities/init-abilities.ts#L912)는 아군이 있을 때 `randSeedInt(2) === 1`로 50% 판정하며, [상태 해제 속성](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/abilities/ab-attrs.ts#L3795)은 대상 아군의 상태이상을 해제한다. 기존 엔진의 실제 더블 전투는 30% 판정을 호출하는 것을 재현했다.

신규 도전에 `healerChanceRule: source-v1`을 기록하고 더블 전투의 독립 Dex에서 발동 확률을 50%로 조정한다. 구형 저장은 이전 30%를 유지하며 저장 상태를 일괄 수정하지 않는다. 일반/패시브와 특성 억제는 기존 컴포넌트 판정을 사용한다.

격리 엔진에서 실제 더블 명령의 성공·실패, 일반/패시브, 아군·상대편, 억제, 저장 복원과 기존 저장 및 다른 슬롯 보존을 확인했다. 독·맹독·마비·잠듦·얼음은 특성 콜백을 별도로 확인했다. 원본의 난수 생성기와 호출 순서가 동일하다는 뜻은 아니며, 트리플·모든 특성 조합·원본 런타임 및 실제 기기는 미검증이다. 기존 사용자 데이터나 Sites는 건드리지 않았다.
