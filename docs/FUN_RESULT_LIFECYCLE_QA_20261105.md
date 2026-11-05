# 마자용 결과 안내의 전투 경계 수정

## 확인 및 수정

독립 QA에서 b0d661a의 마자용 렌즈 미획득 결과가 다음 일반 전투 보상
화면에도 반복되는 문제가 발견됐다. 완료된 `run.mystery`가 새 전투의
`beginEncounter` 뒤에도 남았고, UI는 현재 encounter 확인 없이
`fun-and-games / resolved`만으로 결과 문구를 표시했다.

- 새 전투 진입 시 완료된 마자용 상태만 삭제한다. 다른 이벤트 상태는
  일괄 삭제하지 않는다. 마자용 결과/보상을 확인하기 전이나 재접속할
  때는 상태와 결과를 유지한다.
- UI 결과 문구와 마자용 전용 다음/보상 건너뛰기 버튼은 현재 encounter가
  `kind: mystery`, `key: fun-and-games`인 경우에만 표시한다. 이전 저장에
  남아 있는 완료 상태도 일반 보상 화면에는 나타나지 않는다.
- 기존 원본 Winstrate 초상 연결 등 다른 작업은 유지했다.

## 검증

새 Node 검사4개: 렌즈 없음·렌즈 획득·기절 페널티 결과 각각에 대해 실제
마자용 턴 → gzip 저장/복구 → 결과 확인 → 다음 일반 야생 전투 → 승리 →
일반 보상3개 → 재접속을 검사했다. 추가로 다른 이벤트 기록은 새 전투
시작 뒤에도 보존되는지 검사했다. 다른 슬롯·탐험 데이터와 정상 일반
전투 코인 지급도 유지한다.

- 표준 focused **7/7**: 새 lifecycle4개 + 기존 minigame command2개 +
  기존 mystery-fun 통합1개. `/tmp/astra-fun-lifecycle-focused.log`
- Worker 신규 lifecycle **4/4**. `/tmp/astra-fun-lifecycle-worker.log`
- 브라우저 **6/6**:375/1280 각각 현재 미획득 결과, 현재 렌즈 결과,
  이전 완료 상태가 남은 일반 보상 화면. 현재 결과는 유지되고,
  일반 보상3개는 표시되며 이전 안내/마자용 전용 건너뛰기는 없다.
  `/tmp/astra-fun-lifecycle-browser.log`,
  `.sites-runtime/tests/fun-result-lifecycle/results.json` 및 화면6장.
- 신규 fixture/Node/browser 검사 파일 ESLint 오류·경고0.
  `/tmp/astra-fun-lifecycle-lint.log`

첫 브라우저 시도는375px에서 정상적으로 숨겨지는 선택지 개수 텍스트에
visible 대기를 걸어 중단됐다. 실제 보상 카드의 가시성을 확인하도록
테스트만 고친 뒤6/6 통과했다. 제품 코드는 최초 수정 뒤 바꾸지 않았다.

이 후속은 여섯 분야 통합 전체856/856 검사 이후의 작은 별도 수정이다.
전체 suite를860개 통과했다고 주장하지 않는다. 최종 타입/빌드 검증은
부모의 통합 기록을 따른다. 운영/Sites/원격 Git/커밋 쓰기는 하지 않았다.
기존 운영409·PC 문제의 원인 미확정 상태를 변경하지 않는다.
