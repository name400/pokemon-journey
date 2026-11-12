# 탐험·모험 이동 지연 분석과 해결 계획

작성일: 2026-11-12  
대상: name400/pokemon-journey / cloud/pokerogue-continue-20261105  
분석 기준 커밋: `a4ef64f5e86e07fe416ce66bcd301fb8089096ca`

## 범위와 결론

사용자 요청에 따라 소스만 읽어 분석했다. 게임 코드, 저장 데이터, DB, UI 및 배포 설정은 수정하지 않았다. 이 문서만 추가한다. 운영 요청, 브라우저 성능 기록, D1 실행 시간, 네트워크 RTT는 계측하지 않았으므로 아래는 **코드에서 확인한 지연 유발 구조와 우선 검증할 병목**이다. 몇 ms가 느린지, 어느 항목이 실제 지연의 몇 %인지는 확정하지 않는다. GitHub 개발본과 실제 운영 배포본의 일치는 이 조사에서 확인하지 않았다.

가장 유력한 경로는 **직렬 이동 요청 → 반복 DB 조회/저장 → 이동에 불필요한 상세 응답 생성 → 클라이언트 병합/재렌더링**이다. 입력 즉시 예측 이동과 최대 4칸의 후속 버퍼는 이미 존재한다. 따라서 “예측 이동을 새로 넣으면 해결” 또는 “매 칸 전체 보유함을 전송한다”는 진단은 현재 코드와 맞지 않는다.

## 1. 실제 이동 경로

- [엔진 선택 라우트](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/app/api/world/route.ts#L6): 모든 요청에서 worlds.state를 조회해 cloud/local 엔진을 고른 뒤 해당 핸들러에 위임한다. `engineOnly` 조회는 첫 화면의 엔진 선택용이며 매 이동마다 별도 HTTP 요청을 보내는 구조는 아니다. 다만 매 POST 안에서 서버 엔진 판별 조회가 반복된다.
- [cloud 클라이언트](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/components/cloud-adventure/entry.tsx#L50): `act()`가 lock을 잡고 POST 응답과 JSON 파싱·accept를 기다린 뒤 해제한다.
- [이동 루프](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/components/cloud-adventure/entry.tsx#L82): 첫 이동 요청을 보낸 뒤 확인된 위치와 맞을 때만 버퍼에 쌓인 경로를 다음 요청으로 보낸다. 실제 상태 확정은 순차적이다.
- [서버 이동 처리](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/lib/cloud-adventure/route.ts#L163): 요청 경로를 한 칸씩 처리한다. 각 칸의 접촉·추적·조우·보행 수·친밀도와 구역 전환을 처리하고, 전투·이벤트·전환 경계에서 중단한다.
- [저장과 응답](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/lib/cloud-adventure/route.ts#L886): commit 후 present를 호출한다. present는 이미 가진 처리 결과를 그대로 직렬화하지 않고 DB에서 다시 읽어 응답을 만든다.

## 2. 확인한 지연 유발 구조

### P1 — 이동마다 여러 순차 DB 호출과 저장 후 재조회

근거: [read/present/commit](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/lib/cloud-adventure/route.ts#L98), [POST 시작](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/lib/cloud-adventure/route.ts#L130), [inventoryFor](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/lib/inventory.ts#L4).

정상적인 단독 탐험, 조우·추가 보상이 없는 cloud 이동에서 읽히는 순서는 다음과 같다.

1. 라우터: 엔진 판별용 worlds 조회.
2. POST: wallets INSERT OR IGNORE.
3. read: worlds 조회 후 필요한 파티 등의 pokemon_box 조회.
4. inventoryFor: 가방 조회.
5. 이동 처리 후 commit: worlds 갱신, 변경된 선두 pokemon_box 갱신, wallets 갱신을 batch로 실행.
6. present → read: worlds와 필요한 pokemon_box를 다시 조회.
7. wallet 조회 후 inventoryFor로 가방 재조회.

위 가정의 코드 경로는 **D1 API 호출 10회(그중 batch 1회), SQL 문 12개**로 계산된다. 실제 네트워크 왕복 횟수나 D1 내부 동작을 계측한 수치는 아니다. 그룹 탐험이면 멤버 조회·접속 시간 갱신 등이 추가된다. 조우·분기·변경 개체 수에 따라 달라진다.

추가 확인 사항:

- read는 같은 row.state를 raw와 state로 두 번 JSON.parse한다.
- 걷기는 실제로 walkSteps와 주기적인 친밀도를 변경하므로 pokemon_box 저장을 모두 없애서는 안 된다.
- 방향만 바꾸는 face도 공통 처리 끝의 changed 보충과 commit을 거친다.
- 재화가 바뀌지 않는 이동에도 wallets의 coins=coins+0 갱신이 포함된다.
- 인증 함수는 [헤더를 읽는 구현](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/app/chatgpt-auth.ts#L21)이다. 라우터와 핸들러의 인증 함수 호출이 각각 별도 외부 인증 API 왕복이라는 증거는 없다.

해결:

- 우선 요청 안에서 인증 결과·엔진 판별 시 읽은 row를 전달하는 구조를 설계해 중복 조회를 줄인다. revision 확인과 엔진 변경 경쟁은 유지한다.
- 이동 전용 read/present 경로를 만들고, 기존 batch 성공 후 응답을 만들 때 중복 읽기를 줄일 수 있는지 확인한다. 다른 탭·다른 요청이 변경한 상태를 섞어 응답하지 않도록 committed revision에 일치하는 스냅샷을 사용한다.
- 가방·wallet·파티의 독립 조회는 일관성 요구를 검토한 뒤 묶거나 병렬화한다. 단순 Promise.all이 DB 자체 처리 비용까지 없애지는 않는다.
- wallets 초기화는 일반 이동마다 하지 않는 경로를 검토하되, 기존 계정의 wallet 누락 복구를 유지한다.
- 무변경 wallet/개체 UPDATE 제거는 `changes()=1`에 의존한 트랜잭션 가드를 먼저 검토한다. 일부 문장만 삭제해 후속 보상·아이템 쓰기가 잘못 통과하는 수정은 금지한다.

### P1 — patch 응답이어도 이동과 무관한 상세 계산·정적 목록을 반복

근거: [present](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/lib/cloud-adventure/route.ts#L100), [기술 목록](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/lib/pokemon-config.mjs#L10), [진화 계산](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/lib/evolution.mjs#L5).

POST 결과는 boxMode=patch이며 파티·추가 대상 위주로 읽는다. 전체 보유함을 매번 서버에서 읽는다고 단정할 수 없다. 그러나 선두 또는 patch 대상마다 경험치, 레벨 기술, 교습 기술, 진화 후보를 다시 계산한다. 진화 후보 함수는 진화 행 목록을 필터링하고 조건을 평가한다. 응답에는 map, interaction, objective, 빠른 이동 목록, 전체 가방, 상점 목록, 원정 목록도 포함된다. 상점/원정처럼 변화가 드문 데이터도 이동 응답마다 만들어진다.

해결:

- 이동 결과에는 revision, 위치·방향·구역, 변경된 퀘스트/필드 상태, 조우/대화, 실제 바뀐 개체·재화만 전송하는 명시적인 movement patch 계약을 만든다.
- 지도는 mapId/mapVersion 및 지형·이벤트 변경 버전으로 캐시하고, 상태에 따라 변하는 장애물·NPC·층·낮밤 조건은 패치 또는 무효화 대상으로 둔다.
- 상점·원정 목록은 최초 로딩 또는 해당 메뉴 진입 시 제공한다.
- 기술·교습 목록은 종/폼/레벨 등에 맞춰 캐시하거나 상세 메뉴에서 계산한다. 진화는 보행 수·친밀도·시간·아이템·파티에도 의존하므로 무조건 정적 캐시로 바꾸지 않는다. 진화 가능 알림은 유지한다.
- 기존 accept는 world 자체를 깊은 병합하는 계약이 아니다. 서버에서 필드를 빼기만 하지 말고 클라이언트의 누락/삭제/전체 교체 의미와 함께 버전 관리한다.

### P1 — 예측 버퍼가 서버 지연을 가릴 수 있는 범위가 제한됨

근거: [예측과 버퍼](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/lib/cloud-adventure/adventure-prediction.mjs#L13), [입력과 순차 전송](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/components/cloud-adventure/entry.tsx#L58).

- 첫 입력 즉시 예측 표시가 이미 있다.
- 후속 버퍼는 최대 4칸이고 표시 주기는 기본 100ms, 운동화 상태 75ms이다.
- 서버 응답이 충분히 늦으면 후속 4칸을 예측한 뒤 더 전진하지 못한다. 후속 버퍼의 시간 범위는 기본 약 400ms / 운동화 약 300ms이며, 실제 프레임·타이머·경계 조건에 따라 달라진다. 이는 관측한 서버 지연값이 아니다.
- 구역 전환 예측은 이후 버퍼를 중지하고 서버 확인을 기다린다.
- 이동 중 방향 변경, 조우, 서버 좌표와 예측 불일치는 재조정/중단을 유발할 수 있다.
- accept에서 예측을 초기화하고 후속 루프에서 다시 설정하는 구조는 타이밍에 따른 좌표 튐의 점검 대상이다. 실제 눈에 보이는 튐은 아직 재현하지 않았다.
- introMove/introEscapeMove는 일반 필드 버퍼가 아닌 act 경로를 사용한다. 도입부 이동도 따로 측정해야 한다.

해결:

- 먼저 서버 응답 비용을 낮춘다. 속도 상수만 줄이거나 버퍼 상한만 키우면 예측과 실제 조우 사이의 차이가 커질 수 있다.
- 다음 단계에서 입력 sequence, 서버 ack 및 처리한 steps를 명시하고, 승인되지 않은 입력만 재생하는 reconciliation을 검토한다.
- 사용자 키 해제·방향 변경·전투 진입·구역 전환·대화에 대한 큐 취소 정책을 명확히 한다.
- 서버는 여전히 한 칸씩 조우·친밀도·이벤트를 판정해야 한다. 경로의 끝 좌표만 저장하거나 풀숲의 중간 조우를 건너뛰면 안 된다.
- 동시에 같은 revision의 이동 POST 여러 개를 보내는 방식은 피한다. revision 충돌과 보상 중복 방지를 유지한다.

### P1 — cloud 요청에 명시적 시간 제한이 없어 연결 이상 시 잠금이 길어질 수 있음

근거: [cloud api/act](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/components/cloud-adventure/entry.tsx#L21), [기존 네트워크 helper](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/lib/adventure-network.mjs#L2).

cloud api는 fetch를 직접 사용하며 AbortController 기반 제한 시간이 없다. 응답이 장시간 끝나지 않으면 act의 finally까지 도달하지 않아 lock/busy가 계속 유지될 수 있다. 실패 후에는 전체 load를 await한 다음 해제하므로 복구 GET이 느려도 대기가 이어진다. 반면 legacy local 화면에는 adventureJson helper와 불확실한 요청 복구 처리가 존재한다. cloud에서 그 보호를 사용하지 않는다.

해결:

- 시간 제한과 응답 상태 분류를 cloud에도 적용한다.
- 타임아웃은 서버 미실행을 뜻하지 않는다. 같은 이동을 즉시 재전송하지 말고 권위 상태와 revision을 확인한 뒤 큐를 복구한다.
- 읽기 복구도 실패하면 이동 확정을 차단하고 재연결 상태를 표시한다. 입력 미리보기와 저장 완료를 구분한다.
- 요청 ID/중복 처리 방지를 추가할 경우 서버의 중복 거부·결과 재조회 정책과 함께 설계한다.

### P2 — 응답마다 전체 클라이언트 보유함 병합과 주변 UI 재계산

근거: [accept](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/components/cloud-adventure/entry.tsx#L44), [대상 계산](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/components/cloud-adventure/entry.tsx#L131).

patch를 받더라도 old.box 전체로 Map을 만들고 새 배열로 변환·필터한다. 보유 개체가 많을수록 한 응답당 클라이언트 비용이 커질 수 있다. setPrediction도 같은 상위 컴포넌트 상태라 이동 표시 중 주변 UI와 필드 대상 계산을 다시 실행할 수 있다. 실제 React CPU 비중은 프로파일링이 필요하다.

해결:

- 보유함을 ID 기반으로 정규화하고 변경 개체만 갱신한다. 가능하면 순서 배열과 개체 저장소를 분리한다.
- 위치/예측 상태를 필드에 국한하고 파티·도구·수첩 UI가 바뀌지 않았을 때 렌더링을 재사용한다.
- memo/useMemo는 변경 의존성을 확인한 곳에만 적용한다. 퀘스트 NPC·접촉·시간 상태가 오래된 값으로 남지 않아야 한다.

### P2 — 지도 재생성과 Canvas 비용은 측정 후 최적화

근거: [지도 생성](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/lib/cloud-adventure/adventure-world.mjs), [Canvas](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/components/cloud-adventure/adventure-field.tsx#L29).

stepField·예측·서버 present에서 지도/필드 관련 계산이 반복된다. Canvas는 움직임 프레임에 배경·타일·대상을 다시 그리며 내부 해상도를 CSS 크기의 두 배로 사용한다. 저성능 기기의 프레임 지연 가능성은 있으나 측정하지 않았다.

이미 구현된 최적화는 보존한다: 보이는 영역의 타일 bounds, invalidate 기반 스케줄러, 움직임이 끝나면 애니메이션 정지, 필드 포켓몬 이미지 필요 시 로드, 단 한 번 생성하는 Canvas effect. 매 이동마다 이미지 전체를 다시 다운받거나 Canvas effect를 다시 생성한다고 주장하지 않는다.

해결:

- Performance 기록에서 draw가 병목일 때만 정적 배경/동적 캐릭터 레이어 분리, 지도 캐시, 기기별 내부 픽셀 비율을 검토한다.
- 이미지 실패는 현재 대체 표시가 있다. 외부 이미지 로딩을 서버 이동 지연의 확정 원인으로 보지 않는다.
- 큰 맵·카메라 이동·밤낮·장애물 해제 시 캐시 무효화를 검사한다.

## 3. 구형 local 탐험도 별도로 확인

[엔진 판별](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/lib/adventure-engine-selection.mjs#L1)에 따라 기존 저장은 local로 실행될 수 있다. cloud만 고쳐 모든 탐험 지연이 해결됐다고 보고하면 안 된다.

[local read/present/commit](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/lib/local-adventure-route.ts#L29)에도 저장 후 재조회와 상세 정보 생성이 있다. [local 클라이언트](https://github.com/name400/pokemon-journey/blob/a4ef64f5e86e07fe416ce66bcd301fb8089096ca/app/adventure-local.tsx)는 별도의 예측·복구·네트워크 제한을 가진다. 같은 개선 목표를 적용하되 cloud 코드를 통째로 덮어쓰거나 구형 저장을 임의로 다른 엔진으로 변환하지 않는다.

## 4. 권장 구현 순서와 검증

1. **계측 먼저:** 입력 시각, 첫 시각 반응, POST 시작/응답/JSON/accept, 저장 확정, 다음 전송을 기록한다. 서버에는 엔진 선택/read/이동 계산/commit/present/직렬화 구간의 Server-Timing 등을 추가하는 별도 작업을 한다. 사용자 ID·세이브·토큰은 성능 로그에 남기지 않는다.
2. **응답 경량화:** 이동 전용 응답, 정적 목록 제외, 기술/진화 상세의 불필요한 재계산 제거와 클라이언트 patch 계약.
3. **DB 호출 축소:** 요청 단위 상태 재사용, 독립 조회 묶기, 불필요한 초기화/쓰기 검토. revision·트랜잭션 가드 보존.
4. **요청 복구:** 제한 시간, 저장 결과가 불확실할 때 재동기화, 오래된 응답과 중복 이동 처리.
5. **프로파일 결과에 따라 렌더링 및 예측 경로 개선.**

검증 표본:

- cloud와 local 각각 일반 길, 풀숲, 문/계단/지도 경계, 추적 몬스터, 대화 직전, 도입부, 그룹 탐험.
- 짧은 연타·길게 누르기·빠른 방향 전환·키 해제·화면 숨김·네트워크 단절·응답 유실·두 탭 revision 충돌.
- 시험용 보유함 6/100/1,000마리, PC와 저성능 모바일, 빠른/느린 네트워크.
- p50/p95 입력→첫 프레임, 입력→서버 확정, 응답 크기, D1 호출/실행 시간, 프레임 긴 작업, 예측 좌표 수정 횟수를 변경 전후 비교한다.
- 같은 입력 경로에서 steps/walkSteps/친밀도·조우 판정 횟수·아이템·재화·파티·퀘스트가 보존되는지 확인한다. 무작위 조우는 고정된 테스트 난수로 비교한다.
- 저장 후 재접속, 타임아웃 뒤 실제로는 커밋된 경우, 처리 중 전투 진입, 거래 제외 개체의 재출현 방지, 기존 탐험/로그라이크 데이터 분리를 회귀 검사한다.

## 5. 이번 작업의 완료/미완료

완료: 고정된 최신 개발 커밋의 두 엔진·클라이언트·이동 예측·서버 읽기/쓰기/응답·Canvas·관련 계산을 읽고 근거와 개선안을 문서화했다.

미실시: 게임 코드 변경, 성능 계측/벤치마크, 게임 테스트 실행, 운영 계정/DB 접근, Sites 저장/배포. 따라서 “렉 수정 완료”, “속도 몇 배 개선”, “운영 원인 확정”이라고 보고하지 않는다.
