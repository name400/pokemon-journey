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
