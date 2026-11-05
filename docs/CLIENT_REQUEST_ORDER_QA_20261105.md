# Classic 조회 응답 순서 격리 검사 — 2026-11-05

## 확인된 결함과 수정

`ebc6a8d` 클라이언트는 저장 revision이 낮은 응답을 거부하지만 같은 revision의 조회는 모두 적용했다. 알 화면의 실제 15초 pickupOnly 폴링으로 두 full GET을 시작하고 첫 full GET만 늦게 반환시켰다. 서로 다른 관리자 픽업 갱신을 나타내는 합성 응답에서 최신 픽업3 표시 뒤 이전 픽업2가 다시 표시됐고, 다음 drawEggs의 expectedFeaturedId도 이전 값이었다. 이 상황은 전설 픽업이 갱신되었다는 정상 서버 거절을 유발할 수 있다. 운영에서 발생했다는 증거는 없다.

`app/rogue-classic.tsx`의 load에 조회 세대 번호를 추가했다. 새 조회나 행동이 시작되면 이전 조회의 데이터와 오류 표시를 무시한다. 저장 revision 비교와 동기 action lock은 유지하며, 쓰기 자동 재시도나 서버 검증 완화는 없다. 이전 조회의 500이 나중에 성공한 슬롯 선택 위에 표시되는 상황도 차단한다. 픽업이 사용자가 누르는 순간 실제로 바뀌거나 다른 탭에서 저장한 경우에는 여전히 안전한 충돌 거절이 가능하다.

## 실제 UI 회귀 5/5

`tests/browser/ui-readability/request-order.mjs`는 Vite 독립 포트5224의 실제 Page/RogueClassic를 사용한다. 외부 그림은 대체하고 합성 저장과 네트워크 응답 지연만 제어하며, UI 내부 상태를 직접 호출하지 않는다. 픽업 검사는 가상 시계로 실제 15초 간격을 두 번 진행한다. DTO·뽑기·전투는 실제 게임 함수를 사용한다.

- 같은 revision의 full GET 역순 도착: 최신 칠색조 픽업 유지, expectedFeaturedId250 전송, 실제 뽑기로 알1개 획득. 이전 루기아249로 보내면 실제 게임 검증이 거절하는 것도 확인.
- 알 화면에서 시작한 조회가 슬롯 선택 뒤 성공: selectSlot revision0 → turn revision1, 저장 revision2. 기존 revision 방어도 회귀 확인.
- 같은 조회가 슬롯 선택 뒤500: 오래된 조회 오류가 성공한 화면에 표시되지 않으며 selectSlot0 → turn1 정상.
- 트레이너 대화 중 실제 전투 화면 키1 입력: turn 요청 없음. 대화 건너뛰기 뒤 실제 flat move 요청 정상.
- 실제 마자용 싱글 화면: `{type:'move',move:'splash'}` 세 번, 매 행동마다 저장 encode/decode, 3턴 뒤 reward 도달. optional turn envelope를 보내는 테스트가 아니다.

결과 `.sites-runtime/tests/request-order/results.json`, `/tmp/astra-request-order-final.log`. 수정 전 최소 재현 `/tmp/astra-pickup-race.mjs`에서는 픽업3 → 픽업2와 이전 expectedFeaturedId152 전송을 확인했고, 수정 뒤 같은 재현에서 픽업3/153을 유지했다. 정식 테스트는 실제 유효 전설 ID와 실제 뽑기 검증을 사용한다.

기존 오류 복구 브라우저 검사도375/1280 × 복구 GET 성공/실패4/4 통과했다(`/tmp/astra-error-recovery-order-regression.log`). 최초 POST 오류 번호 보존, POST1/GET1, 실패 요청 자동 재전송 없음, 모바일 오류 번호 overflow 없음. TypeScript 통과. 새 검사 파일 eslint 통과. `app/rogue-classic.tsx` 전체 파일 lint는 HEAD와 변경 후 모두 기존97오류/18경고로 동일하며 lint 전체 통과로 표현하지 않는다. 이번 변경은 Node 테스트 수를 늘리지 않는다. 전체 suite/빌드는 부모의 통합 기록을 따른다.

## 운영 원인과 한계

최초 운영 POST409 응답 본문은 아직 없다. 사용자가 마지막 배포가1dcfdce였다고 확인하여 기존 진단 코드/오류 번호가 최초 사건에 없었다는 점을 확인했다. 이후 사용자가 ebc6a8d 배포 완료를 알렸고 부모가 Sites v58 succeeded(12:50:32 UTC)를 읽기 확인했다. 새 배포의 재발 응답은 아직 없으며, 이번 조회 순서 수정은 그 배포 이후 로컬 변경이다.

이번 격리 검사는 전투409의 실제 원인을 확정하지 않았다. 트레이너 대화와 마자용의 현재 정상 UI 요청에서는 새 서버 결함을 재현하지 못했다. 후속 증거는 발생 UTC시각, 직전 행동, 화면의 오류 번호와 같은 requestId의 안전한 서버 진단(code/stage/action/commandType/revision/storedRevision/saveOutcome)이다. 원시 저장, 계정값, 요청본문, stack 수집은 필요하지 않다. 일반 ACTION_FAILED는 규칙 거절과 엔진 Error가 함께 포함될 수 있으므로 코드만으로 단정하지 않는다.

Sites·운영 저장·원격 Git 쓰기는 수행하지 않았다.
