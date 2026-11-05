# 2026-11-05 POST 409 분류와 저장 전 응답 검증

기준 `1dcfdce`, `cloud/pokerogue-continue-20261105`. 운영 DB·Sites 저장·배포는 변경하지 않았다. 이 수정은 운영 409의 원인이 확인됐다는 뜻이 아니다.

## 확인한 사실과 미확정 원인

부모 작업자의 읽기 전용 운영 조회에서 v55 배포 성공과 2026-11-05 UTC11:36:05.390의 `POST /api/rogue-classic` 409 한 건을 확인했다. 해당 요청은 wall313ms/CPU13ms, 이어진 GET은200이고 다음 POST도200이었다. 요청과 응답 본문은 없다. 로그의 content-length84는 **요청 헤더**이며 오류 응답 크기가 아니다. 클라이언트는 모든 행동 실패에서 GET으로 복구하므로 이 순서만으로 저장 충돌이나 게임 오류를 식별할 수 없다. 현재 운영409와 지속 PC 끊김의 개별 원인은 미확정이다.

현재 클라이언트 `act`의 동기 ref lock은 같은 렌더 사이의 중복 클릭을 막는다. 전투 중 기본 GET은 스타터 catalog를 요청하지 않는다. 이 조사에서 동일 탭의 보통 중복 클릭이나 지속적인 PC 프레임 끊김을 새로 재현하지 않았다. 실제 싱글 마자용 UI가 flat move를 보낸다는 앞선 정정을 유지한다.

## 별도로 재현한 결함과 수정

실제 TypeScript route를 로컬 SQLite에 연결하고 DTO 생성 실패를 주입했다. 기존 HEAD는 먼저 저장한 다음 `classicGameView`/JSON 응답을 만들었다. 이 단계가 실패하면 **409를 반환했지만 저장 revision과 행동 횟수는 이미0→1**이었다. 저장 읽기·쓰기 실패도 모두409였다. `/tmp/astra-api-baseline.log`에 이 격리 재현의 수치만 보관했다. 운영에서 같은 예외가 발생했다는 증거는 없다.

이제 encode 후 DTO와 JSON 응답을 먼저 준비하고, 성공했을 때에만 기존 CAS 저장을 수행한다. 응답 생성·직렬화 실패 시 기존 저장을 보존하며 신규 계정의 빈 저장 행도 만들지 않는다. CAS와 픽업 버전 검사, `changes()=1` 조건부 랭킹 batch는 유지한다. POST 자동 재전송은 추가하지 않았다. DB 실행 중 통신 실패는 커밋 여부가 불명확할 수 있으므로 로그에 `saveOutcome:unknown`으로 표시한다.

오류 응답은 기존 `error` 문구에 `code`와 요청별 무작위 `requestId`를 추가한다. 같은 ID는 `X-Request-Id` 헤더와 서버 진단에 기록한다.

| 상황 | HTTP / code |
| --- | --- |
| 잘못된 JSON·요청 형식 | 400 / INVALID_REQUEST |
| revision 불일치·일반 CAS 거부 | 409 / REVISION_CONFLICT |
| 알 뽑기의 저장 또는 픽업 CAS 거부 | 409 / SAVE_OR_PICKUP_CONFLICT |
| 게임 처리 중 plain Error | 409 / ACTION_FAILED |
| 읽기·인코딩·쓰기·응답 생성 오류, 게임 TypeError 등 | 500 / INTERNAL_ERROR |

게임 코드의 plain Error는 규칙 거부와 내부 엔진 실패 양쪽에 사용되므로 ACTION_FAILED를 곧바로 사용자 입력 오류로 해석하지 않는다. 내부500의 메시지는 일반 안내로 바꾸고 원시 내부 오류를 응답에 노출하지 않는다.

서버 진단은 단계·코드·허용된 action/command enum·revision 숫자·처리 시간·저장 결과·표준 오류 종류만 기록한다. 계정ID, 쿠키/헤더, 원시 요청, 저장 내용, 오류 메시지와 stack은 기록하지 않는다. 다음 사건에서 응답의 code/requestId와 서버의 같은 ID를 대조해야 한다. 플랫폼이 Worker 자체를 종료하면 이 catch와 진단이 실행되지 않을 수 있다.

## 검증

`tests/rogue-classic-api.test.mjs`의 실제 route + 메모리 SQLite 검사9개가 표준/Worker 데이터 정책 각각9/9 통과했다. 잘못된 입력, 두 요청의 같은 revision 경쟁에서 한 번만 적용, action/TypeError 구별, read/encode/write 장애, DTO/직렬화 실패의 저장 보존, 픽업 변경의 소비 방지, 실제 SQLite 랭킹 guard와 실제 전투·저장 codec·다른 슬롯/탐험/재화 보존을 포함한다. 이는 Cloudflare D1 운영 검증과 다르다.

타입 검사 통과. 신규 helper/test ESLint0오류·0경고. route의 기존 explicit-any3오류는 유지한다. 집중 근거는 `/tmp/astra-api-focused.log`, `/tmp/astra-api-worker-focused.log`, `/tmp/astra-api-type.log`, `/tmp/astra-api-lint.log`다. 통합 전체 검사·production 빌드 결과는 부모 작업자의 최종 기록을 따른다. 수정 배포 후 실제 오류의 code/requestId 확인과 PC의 실제 성능 기록은 남는다.

## 73b13c3 이후 GET 민감 오류와 클라이언트 진단 보완

부모의 추가 읽기 조회에서는 운영 v56 게시 성공(UTC12:11:00.783508Z), Sites 작업 snapshot `b61001f1726460bf1b3a0a653faa847095236300`을 확인했다. Git73b13c3 포함 여부는 확인하지 못했다. 최근180분 조회가 errors_only와 전체 모두0건을 반환해 성공 트래픽조차 관측되지 않았으므로, 운영409가 사라졌다는 근거가 아니다. 새 운영409 원인 증거도 확보되지 않았다.

기존 GET은 원시 `error.message`를500본문에, `error.stack`을 로그에 기록했다. 시험용 민감 문자열을 실제 route의 읽기 실패에 주입한 격리 재현에서 `responseLeaksMarker:true`, `logsLeakMarker:true`를 확인했다(`/tmp/astra-get-privacy-baseline.log`). 이제 GET도 요청별 무작위ID·단계(auth/pickup/read/view)·표준 오류 종류·시간만 기록하고 일반500안내를 반환한다. 인증 조회 예외까지 같은 catch로 다루며 정상401·GET·pickupOnly 동작은 유지한다. 계정·저장·원시message/stack은 진단에 넣지 않는다.

POST의 `ACTION_FAILED` 응답은 기존 게임 안내 문구를 유지한다. 게임 plain Error가 아직 도메인 오류와 내부 오류로 완전히 타입 구분돼 있지 않으므로, POST 응답의 모든 문자열까지 완전히 비민감한 것으로 주장하지 않는다. GET과 POST **구조화 진단 로그**에서 원시 메시지를 배제하는 것과 이 응답 호환 정책을 구별한다.

클라이언트는 `GameResponseError`에 허용된 code·HTTP상태·UUID 형식 requestId를 보존한다. error.message 자체는 서버의 원문을 유지하고 화면에서만 `오류 번호: UUID`를 덧붙인다. 허용 목록 밖 code, 이메일/임의문자열/줄바꿈이 포함된 ID는 진단 속성으로 채택하지 않는다. 이 번호는 앱이 생성한 상관ID이며 플랫폼의 별도 ray/request ID와 동일한 값이라고 가정하지 않는다. 실패 후 복구GET이 다시 실패해도 최초 POST 문구와 번호를 유지하고, 진행 상태 확인 실패를 안내한다. POST를 재전송하지 않는다.

실제 전투를 route/SQLite에 연결해 다음 두 상황을 구분했다. 이는 예상 가능한 격리 재현이며 관측한 운영409의 원인 귀속이 아니다.

- 같은 revision으로 유효한 기술을 동시에 두 번 보내면200과 `REVISION_CONFLICT`409가 각각 한 번 발생하고, 기술PP·저장은 한 번만 감소/증가한다. GET으로 revision을 읽은 뒤 다음 행동은200이다.
- 트레이너 대사가 남은 상태에서 그 포켓몬의 유효한 기술을 보내면 `ACTION_FAILED`409이며 저장은 그대로다. 대사를 정상 처리한 뒤 같은 기술은200이다. 이 경로의 거부 규칙은 수정하지 않았다.

검증: 새 Node6검사 포함 API/응답 집중 **17/17**(1.42초), 타입 검사 통과, 신규/수정 helper·테스트·브라우저 harness 린트0오류·0경고. 실제 Page/RogueClassic의 격리 Chromium에서375px/1280px × 복구GET성공/실패 **4/4**를 확인했다. 각 경로POST1·복구GET1, 자동POST재전송0, 합성저장 불변, 첫 POST번호 유지, pageerror0이었다. 모바일 오류배너 client/scroll359px, 문서 client/scroll375px로 UUID 가로 넘침이 없어 CSS를 바꾸지 않았다. 외부 이미지는 대체했으며 실기기/운영 화면 검증과 다르다.

근거: `/tmp/astra-get-api-focus.log`, `/tmp/astra-get-type.log`, `/tmp/astra-get-lint.log`, `/tmp/astra-error-recovery-browser.log`, `.sites-runtime/tests/error-recovery/`. 브라우저 재현은 `tests/browser/ui-readability/error-recovery.mjs`이며 별도 localhost5224에서 실행해5223 성능 fixture의 저장을 건드리지 않았다. 전체 표준/Worker·production 빌드 검증은 부모의 통합 최종 기록을 따른다. Sites·운영 저장 쓰기 및 직접 커밋·푸시는 수행하지 않았다.

### POST 인증 경계 추가 리뷰 — 제품 변경 없음

POST의 `getChatGPTUser()`는 여전히 route의 try 바깥이다. 실제 `app/chatgpt-auth.ts`는 재export가 아닌 직접 구현이며 `await headers()` 뒤 고정된 헤더 이름을 읽는다. 전체 이름 percent decoding 실패는 내부 catch에서 null로 바꾸고, 인증 헤더 누락은 null을 반환한다. 외부 인증 서비스 호출이나 계정값을 포함한 명시적 throw는 없다.

실제 인증 모듈과 설치된 vinext headers shim을 함께 실행해 정상 이름, 잘못된 percent 인코딩, 인증 누락을 검사했다. 모두 예외 없이 예상 user/null을 반환했다. 요청 scope 바깥 호출에서는 정적인 headers 사용 위치 오류가 발생했지만, 실제 force-dynamic route의 정상 요청 입력으로 민감값을 포함한 인증 예외는 재현하지 못했다. 근거 `/tmp/astra-auth-review.log`.

vinext의 `app-route-handler-execution.js`는 route 밖으로 나온 예외를 원시 `console.error`와 `reportRequestError`에 전달한다. 이는 예외가 발생했을 때의 프레임워크 경로 확인이며 현재 인증 구현의 개인값 유출이나 운영 사건을 증명하지 않는다. 일반적인 민감 Error를 인위적으로 주입하는 것만으로 이번 제품 수정 범위를 넓히지 않았다. POST 인증 예외가 향후 새 구현에서 발생하면 안전한 route 응답을 우회할 수 있다는 경계는 남으며, 인증 구현이 바뀔 때 함께 검토해야 한다. 이번 리뷰에서는 제품 코드와 테스트 수를 바꾸지 않았다.

### ebc6a8d 이후 실제 UI 요청 순서 검사

같은 저장 revision의 pickup full GET이 역순 도착하면 픽업 표시와 다음 뽑기 expectedFeaturedId가 이전 값으로 돌아가는 결함을 격리 재현했다. 클라이언트 load에 조회 세대 번호를 추가해 새 조회/행동보다 오래된 조회의 데이터·오류 적용을 막았다. 실제 UI 요청 순서5/5, 기존 오류 복구4/4, 타입 통과. 트레이너 대화 입력 차단 및 마자용 flat move3턴 저장왕복은 정상이며, 전투409의 운영 원인은 여전히 미확정이다. 배포 버전 정정·근거·검사 한계는 `CLIENT_REQUEST_ORDER_QA_20261105.md` 참고.
