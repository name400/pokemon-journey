# 뮤츠 기술 직후 DOCTYPE·409 신고 검토

사용자는 뮤츠 기술을 쓴 직후 DOCTYPE 비슷한 문구와409가 함께 표시됐다고 추가 설명했다. 이후 현재는 해결된 상태이며 사건은 ebc6a8d 배포 전이었다고 확인했다. 정확한 기술 이름·발생 시각·원본 응답 본문은 확인되지 않았다. 이 기록은 현재 재현되는 결함이나 원인 확정 보고가 아니다.

## 코드로 확인한 범위

- 이전 배포1dcfdce도 readGameResponse에서 HTML 파싱 실패를 한국어 안내로 바꾸고 있었다. 따라서 해당 코드가 실행됐다면 순수 HTML409/500만으로 raw DOCTYPE 파싱 문구가 화면에 나타나는 것을 설명할 수 없다.
- 반면 이전 API POST catch는 모든 Error.message를 JSON error필드에 담아409로 반환했다. JSON error에 파싱 문구가 담기면 클라이언트는 이를 유지한다. 내부 예외도409였으므로 당시409를 저장 revision 충돌로 해석해서는 안 된다.
- 이전 클라이언트는 POST 실패 후 복구 GET까지 실패하면 GET 오류로 최초 문구를 덮었다. 따라서 화면의 DOCTYPE 문구와 콘솔 POST409가 같은 응답에서 나온 것인지도 미확정이다. 최초 POST 오류 번호/문구 보존은 ebc6a8d에서 수정됐다. decodeGameData의 JSON 파싱처럼 서버 내부 SyntaxError가 기존 JSON error로 전달되는 경로도 있지만 실제 저장 손상의 증거는 없다.
- ebc6a8d에 포함된 후속 API는 parse/read/encode/view/write 등 단계와 명시적 충돌을 구분하고, 내부 실패는 일반 안내와 요청번호로 반환한다. action단계의 일반Error는 규칙 거절과 엔진 예외가 함께 포함될 수 있어 아직409 ACTION_FAILED/기존 안내문구를 유지한다.
- 오래된 브라우저 모듈이 남았거나 서버 JSON error에 파싱 문구가 실렸을 가능성은 코드상 배제하지 못한다. 어느 경우였는지, HTML이 어디서 왔는지, 과거 메모리 초과와 같은 사건인지는 확인되지 않았다. 기존v50 메모리 초과 기록을 이번 사건에 귀속하지 않는다.

## 격리 검증

현재5ab161b 기준 합성 1층 뮤츠 대 맛보돈 전투에서 이전 화면의 네 기술 Disable/Confusion/Teleport/Psywave를 각각 새 저장에서1회 실행했다. 게임 controller → 저장 encode/decode → DTO JSON → 실제 readGameResponse 왕복을 일반 Node 및 Worker 데이터 정책에서 모두 통과했다(각4경로). 탐험 데이터도 보존했다. 실제 사용 기술은 확인되지 않았으므로 모든 뮤츠 기술·상태·폼 조합 검사라는 뜻은 아니다.

합성 HTML 응답200/409/500은 모두 원시 DOCTYPE/Unexpected token문구를 노출하지 않았다. JSON409의error필드에 같은 시험 문구를 넣으면 기존 서버 메시지로 보존되는 경로도 확인했다. 해당 구조를 운영에서 확인했다는 뜻은 아니다.

집중검사 `node --test tests/game-response.test.mjs tests/rogue-classic-api.test.mjs` **17/17** 통과. 추가 제품 변경은 하지 않았다. 재현 probe는 `/tmp/mewtwo-response-probe.mjs`, 집중 결과는 `/tmp/mewtwo-response-focus.log`다. 이번에는 제품 코드 변경이 없으므로 전체/빌드 검사를 반복하지 않았다.

## 운영 조회와 다음 확인

읽기 전용 최근180분 오류 표본100건 조회는12:51:37.894UTC(21:51:37KST)의 canceled GET /api/account 한 건을 반환했다. POST409나이번사건의진단본문은없었다. 표본 부재가 과거 오류의 부재를 입증하지 않는다. 원시 헤더·계정·저장 자료는 기록하지 않는다.

상태는 사용자 보고상 해결, 과거 원인은 미확정이다. 새 배포에서 재발하면 기술명·직전 행동·한국 시각·화면 오류 번호와 같은 requestId의 안전한 stage/code/saveOutcome 진단을 연결한다. 현재는 사이트/운영저장 변경 없이 조사 근거만 보존한다. 남은 구현 목록과 실기기/실계정 검증 잔량은 그대로다.
