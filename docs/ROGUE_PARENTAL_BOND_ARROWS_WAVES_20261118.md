# 부자유친과 사우전드애로·사우전드웨이브

고정 원본 `7c0881255af5cd51992e513ff93c2f71adbe40e0`의 [사우전드애로 착지](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/moves/move.ts#L6146) 및 [사우전드웨이브 교체 불가](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/moves/move.ts#L10836)는 마지막 타격에 적용된다.

이전 수정은 멀티렌즈 사용 시에만 마지막 타격 처리를 사용했다. 격리 전투에서 일반·패시브 부자유친만 있는 단일 대상은 첫 타격에 착지 또는 교체 불가가 적용되는 차이를 재현했다. 각각 기존 신규 도전 규칙 `thousandArrowsOrderRule` 및 `thousandWavesOrderRule`이 활성인 경우 부자유친의 마지막 타격도 처리하도록 수정했다. 해당 규칙이 없는 기존 저장은 이전 동작을 유지한다.

두 기술의 일반·패시브 부자유친, 멀티렌즈 병용, 특성 억제, 구형 규칙, 방어·대타·면역·기절 및 실제 턴 명령의 PP·저장 복원을 검사했다. 관련 부자유친·전체 공격 회귀를 포함해 62건이 통과했다. 원본 난수·모든 특성·도구 조합, 브라우저 및 실제 기기는 미검증이며 Sites에는 배포하지 않았다.
