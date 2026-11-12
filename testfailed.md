# 배포 검증 실패 기록

## 2026-11-12 — GitHub `15b1094`

- 대상 브랜치: `cloud/pokerogue-continue-20261105`
- GitHub 대상 커밋: `15b1094f66c0c45e899c6a1f09ec174645dbd1dd`
- 실제 검증 소스: 위 커밋을 기존 Sites 소스에 병합한 로컬 커밋 `97a33b5ac93dd46d4f12e2ba36652570e27ac666`, 그리고 커밋되지 않은 `app/layout.tsx`의 브라우저 제목을 「포켓몬」으로 변경한 작업.
- 환경: Node.js v24.22.1
- 결과: `npm run typecheck` 통과, `npm run build` 통과. `npm test`는 3,333개 중 3,331개 통과, 2개 실패 (155.9초).
- 배포: 실패로 중단. 마지막으로 확인한 운영 버전은 Sites v81이며, 이 검증 소스는 운영 배포하지 않았다.

### 1. 탐험 모험 — 스타터 1 리그 진행

- 테스트: `tests/adventure-api.test.mjs:164`, 실패 단언: 239행.
- 테스트명: `fresh starter 1 can clear the league, A rank and the final investigation`.
- 조건: 자연 진행으로 배지와 파티를 준비하고, 리그를 최대 3회 시도한 뒤 `state.world.completed === true`를 기대한다.
- 실제: `league stalled: {"leagueAttempts":3,"leagueReached":4,"finalTraining":49}`. 완료 플래그가 `true`가 아닌 `undefined`여서 실패했다.
- 스타터 4번과 7번의 같은 진행 테스트는 이번 실행에서 통과했다. 이 결과만으로 게임 버그인지, 전투 난수 또는 테스트의 시도 횟수·전략 문제인지 확정할 수 없다.
- 확인할 사항: 같은 스타터와 조건으로 리그 마지막 전투의 패배 원인과 난수를 추적하고, 정상적인 게임 규칙과 테스트 재현성을 각각 검증한다.

### 2. 포켓로그 — 트레이너 고정 도구와 상태이상

- 테스트: `tests/rogue-trainer-items.test.mjs:19:164`.
- 조건: 월로의 밀로틱에 `toxicorb`와 `marvelscale`이 적용된 상태로 전투를 한 턴 진행한 뒤, 저장된 상대 포켓몬 상태가 `맹독`인지 확인한다.
- 실제: `AssertionError: null !== '맹독'`. 도구와 특성 확인 단계는 통과했지만 한 턴 뒤 상태이상 단언에 실패하여 이후 복원 검증은 실행되지 않았다.
- 확인할 사항: 독구슬 발동 조건, 턴 종료 처리와 전투 상태 저장을 재현해 확인한다. 이 기록만으로 실패 원인을 확정할 수 없다.

두 실패가 해결되거나 원인이 확인되면, 실제 검증한 커밋과 작업 트리를 명시하고 타입 검사·전체 테스트·배포용 빌드를 다시 수행한다. 운영 DB, 계정 데이터 및 기존 Sites 설정은 유지한다.
