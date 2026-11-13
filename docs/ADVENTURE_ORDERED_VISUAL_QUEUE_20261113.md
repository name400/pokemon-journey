# 요청 확인과 순서 있는 필드 이동 표시

기준 `8bdad1d4`의 실제 클라이언트 이동 흐름에 `createVisualMovementRequests`와 `predictCloudPathSteps`를 연결했다. `ADVENTURE_VISUAL_REQUEST_JOURNAL_20261113.md`의 미연결 상태를 대체하는 후속 구현이다. 서버 저장·조우·리비전·펜스 API, UI 테마는 변경하지 않았다.

## 동작과 경계

- 요청 전 원본 world·리비전·전송 경로를 journal에 보관한다. 입력 직후 보이는 회전과 타이머가 소비하는 회전을 동일한 미전송 suffix로 갱신하여 중복하지 않는다.
- `accept` 전에 요청 토큰과 정확한 전송 prefix를 검증한다. 리비전 +1, 보행 수, 위치·방향, 지도·활성 파트너, 배틀·조우·포획·학습 대기를 확인한다. 정상 ACK는 이미 표시한 suffix 및 아직 그리지 않은 waypoint를 유지하면서 예측 리비전만 갱신한다.
- Canvas는 보행 수 기반 ID를 순서대로 소비한다. 동일 좌표로 되돌아오는 입력도 별개 칸이며, React가 여러 예측을 한 번에 렌더해도 회전 중간 칸을 생략하지 않는다. 기본 100ms / 운동화 75ms의 한 칸 주기를 사용하고 현재 구간의 방향으로 캐릭터를 그린다. reduced motion은 순서를 즉시 소비한다.
- 충돌·부분 이동·이벤트·불일치 ACK는 queue와 미전송 입력을 폐기한다. 복구·새 상태 조회·메뉴/blur/숨김으로 중단하면 기존 표시 경로를 취소한다. 오래된 요청 토큰은 새 요청의 journal을 바꾸지 않는다. 요청 전 리비전 이하의 중복 이동 응답은 ACK로 인정하지 않고 기존 fence+GET 복구로 확인하여 재전송하지 않는다.
- journal을 만들 수 없는 위험 지역·구형 보행 수 누락 상태는 기존 buffer 검증과 이벤트 중단 규칙으로 동작한다. 조용한 경로용 시각 최적화를 이유로 그 지역의 입력을 버리지 않는다. 요청 대기 중 지도 경계 예측은 기존처럼 금지한다.
- 최근 64개의 표시점을 보관하며 Canvas는 ID 누락·비인접 구간을 감지하면 경로를 가로질러 보간하지 않는다. 실제 네트워크 요청은 여전히 하나씩 보내며 서버의 12칸 상한은 그대로다.

## 같은 입력의 프레임 비교

로컬 Chromium 390×844, 대체 이미지, 요청마다 모의 지연 600ms. 오른쪽 입력 후 논리 위치 x=7에서 위로 바꾸고 400ms 뒤 키를 뗐다. 교정된 동일 모의 API를 기준 코드와 후보에 각각 적용하고 Vite를 재시작하여 측정했다.

기존 모의 API는 `stepField`의 위치만 합치고 방향을 갱신하지 않았다. 실제 서버는 `s.facing=direction`을 별도로 적용하므로, 회전 후에도 `right`인 모의 응답은 정확한 prefix 검증에서 올바르게 거절됐다. 관련 이동 fixture에서 방향 갱신을 추가한 후 **전후 모두** 다시 측정했다. 잘못된 응답에 맞추어 검증을 완화하지 않았다.

| 항목 | 기준 코드 | 순서 큐 |
| --- | --- | --- |
| 서버 최종 위치 / 보행 수 | (7,4) / 9 | (7,4) / 9 |
| 전송 경로 | right; right×4,up×2; up×2 | 동일 |
| 요청별 모의 경과 시간 | 604 / 602 / 600ms | 604 / 601 / 600ms |
| 연속 Canvas 빨간 픽셀 프레임의 최대 맨해튼 변화 | 65px | 6px |
| 회전 중간 (7,8) 및 ACK 이후 마지막 두 칸 | 중간 목표가 다음 목표로 덮임 | 1…9 ID를 한 번씩 순서대로 소비 |

회전 부근 실제 그리기 인자(첫 입력 직전 기준 ms):

| 기준 시각 | 기준 픽셀 x,y | 큐 시각 | 큐 픽셀 x,y |
| --- | --- | --- | --- |
| 412 | 201,259 | 420 | 207,259 |
| 428 | 201,259 | 437 | 213,259 |
| 445 | 199,259 | 454 | 218,259 |
| 462 | 232,227 | 470 | 223,259 |
| 478 | 232,227 | 487 | 229,259 |
| 495 | 232,227 | 503 | 232,259 |
| 512 | 232,227 | 520 | 232,254 |
| 529 | 232,227 | 537 | 232,248 |

측정값은 Canvas 그리기 인자이며 화면 합성·물리 기기를 측정한 값이 아니다. 두 실행의 키 이벤트/프레임 시각은 다르지만 전송 방향 배열과 저장 결과는 같다. RTT 개선을 주장하지 않으며 위험 지역의 기존 endpoint 보간, 실제 D1·다른 탭·운영 성능은 이번 프레임 비교로 검증하지 않았다.

## 회귀 검증

- `npm run typecheck` 및 journal·prediction·field scheduler 단위 검사.
- 브라우저 `cloud-movement-turn.mjs`의 키보드·포인터·복합 회전·유지·거절·부분 이동·충돌 8종.
- 조우 중 회전 중단, 복구 성공/실패/정지 6종, timeout/reload 경합 5종(일반 2펜스, 기존 페이지 복구와 새로고침이 겹치는 순서 3펜스).
- 구형 보행 수 누락 및 위험 상태 fallback에서 표시한 입력의 서버 반영.
- 중복 ACK: 두 번째 요청은 한 번 저장되지만 첫 ACK가 반환되는 경우, stale prefix를 버리고 fence+GET으로 최종 위치를 복원하며 이동을 재전송하지 않음.
- 정상 및 reduced-motion에서 렌더 목표 ID·좌표를 전송 경로와 정확히 비교. 타이밍 픽셀 변화량은 측정값으로 남기며 불안정한 시간 임계값을 회귀 단언으로 사용하지 않음.
- 대화 대기/교정/조우/실패/파트너 변경 8종 및 메뉴 중단에서 미전송 suffix 폐기.

재현 서버:

```sh
node_modules/.bin/vite --config tests/browser/ui-readability/movement-trace.vite.config.mjs --host 127.0.0.1 --port 5229 --strictPort tests/browser/ui-readability
```

측정 및 렌더 경로 단언:

```sh
UI_TEST_URL=http://127.0.0.1:5229 TRACE_INTERNAL=1 VERIFY_WAYPOINTS=1 LATENCIES=600 MOVEMENTS=turn TURN_AT_X=7 PLAYWRIGHT_MODULE=/tmp/pokemon-browser-check/node_modules/playwright/index.mjs node tests/browser/ui-readability/cloud-movement-latency.mjs
```

`REDUCED_MOTION=1`로 즉시 표시 경로를 검사한다. `cloud-movement-duplicate.mjs`의 `CLOUD_TEST_STOP=menu TRACE_INTERNAL=1`은 메뉴 중단을 검사한다. `cloud-movement-buffer.mjs`의 `CLOUD_TEST_OLD_STEPS=1`, 또는 `CLOUD_TEST_HAZARD=1 CLOUD_TEST_MIN_PREVIEW=5`는 journal 미지원 상태의 기존 이동을 검사한다.

기존 `testfailed.md`의 독립 복구 실패·Sites 병합본·운영 D1 미검증 기록은 유지한다. 이번 작업은 로컬 코드와 모의 API의 확인이며 배포나 운영 세이브 변경은 포함하지 않는다.
