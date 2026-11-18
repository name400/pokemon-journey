# 사우전드애로의 멀티렌즈 착지 시점

고정 원본 `7c0881255af5cd51992e513ff93c2f71adbe40e0`의 [기술 정의](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/moves/move.ts#L10830) 및 [착지 속성](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/moves/move.ts#L6146)은 부유한 대상을 마지막 타격에서 떨어뜨린다. 기존 엔진은 멀티렌즈의 첫 타격 직후 착지를 적용했다.

신규 도전의 `thousandArrowsOrderRule: source-v1`은 멀티렌즈 사용 시 마지막 타격의 대상별 피해 직후 착지를 처리한다. 다른 경우는 기존 엔진 처리를 유지하며, 이전 저장에는 새 규칙을 소급 적용하지 않는다. 전투 스냅샷에 적용 중인 규칙을 기록한다.

격리 엔진에서 멀티렌즈의 두 대상 순서, 단일 대상·일반 공격, 방어·대타·틈새포착·부유·기절·이미 착지한 대상, 구형 규칙, 실제 턴 명령의 PP와 저장 복원을 검사했다. 관련 전체 공격 회귀를 포함해 73건이 통과했다. 부자유친과 다른 특성·도구·날씨 조합, 브라우저·실기기, 원본 난수·피해량 전체 동등성은 미검증이며 Sites에는 배포하지 않았다.
