# 탐험·모험 이동 지연: 개선 후 재분석

## 2026-11-13 후속 구현

`8bdad1d4` 이후 [요청별 확인과 Canvas 순서 큐](docs/ADVENTURE_ORDERED_VISUAL_QUEUE_20261113.md)를 실제 클라이언트에 연결했다. 안전 경로의 정확한 ACK는 미전송 suffix와 아직 그리지 않은 회전 경유점을 유지한다. 같은 600ms 모의 지연·9칸 경로에서 최대 연속 Canvas 픽셀 변화는 65px에서 6px로 줄었고 전송 경로·서버 최종 위치·보행 수는 같았다. 요청 지연 자체는 줄지 않았다. 위험/구형 상태는 기존 buffer 경로를 유지하며, 충돌·조우·복구·중복 응답에서 큐를 폐기하는 모의 회귀를 확인했다. 아래 분석은 당시 기준을 보존한다. 실제 D1·운영 기기, 다른 탭 영향과 `testfailed.md`의 독립 실패 및 배포본 미검증 문제는 이번 결과로 해결 처리하지 않는다.

갱신: 2026-11-12  
브랜치: `cloud/pokerogue-continue-20261105`  
이번 읽기 분석 기준: `970bcf63f81d94513b87518ed0cd449cca857c6a`  
이전 분석 기준: `a4ef64f5e86e07fe416ce66bcd301fb8089096ca`

추가 원격 확인: `76db31f601fda8377d5622ae30ff98d6a81dc752`까지 대조했다. 분석 중 추가된 두 커밋은 방향 패드 CSS·zone12 그리기·관련 기록/검사 변경이며, 아래 이동 큐·보간 시간·서버 응답 경로는 변경되지 않았다. 본문 링크는 상세 분석한 `970bcf6`에 고정한다.

## 결론

이전 개선안은 상당 부분 구현됐다. **이제 남은 지연을 “예측 이동 없음”, “매번 DB 10회 호출”, “타임아웃 없음”으로 설명하면 틀리다.** 다음 우선순위는 요청별로 끊기는 예측/방향 전환을 연속적인 이동 시계로 바꾸고, 지역별 예측 제한과 실제 화면 애니메이션을 측정하는 것이다. 서버 응답에는 아직 줄일 수 있는 상세 계산과 데이터가 있다.

이번 작업은 원격 소스를 읽고 이 문서만 수정한다. 게임 코드·DB·설정·배포는 변경하지 않았다. 아래의 코드상 실행 순서와 조건은 확인했지만 사용자가 겪는 멈춤의 위치·밀리초·기여율을 이번에 실측한 것은 아니다. 개발 코드가 현재 서비스된 운영 코드와 같은지도 별도로 확인해야 한다.

[이전 문서 보존본](https://github.com/name400/pokemon-journey/blob/cd641da1ebd7f84d9b7ac30e67bf8a7147b5b1b7/Lagsol.md)의 수치와 미구현 목록은 당시 상태이며 아래 내용을 우선한다.

## 1. 이미 개선된 부분 — 다시 구현하지 말 것

| 이전 진단 | 현재 코드에서 확인한 변화 | 아직 남은 부분 |
| --- | --- | --- |
| 이동마다 DB API 호출 10회 | compact cloud 이동의 world+party 사전 조회, commit batch 내부 스냅샷 조회 | SQL 계산·쓰기·직렬화 자체는 남음 |
| 이동 응답에 상점/원정 전체 목록 | compact move/face 응답에서 제외 | 기술·교습·진화·지도·전체 가방·세계 상태 등은 포함 |
| 요청 제한 시간 없음 | move/face/dodge 및 복구 요청은 4초 제한, movementFence 후 복구 | 평상시 끊김 개선과는 별개, 복구 대기와 탭 경합은 남음 |
| 예측마다 상위 화면 전체 상태 갱신 | PredictedAdventureField 내부 state로 예측 분리 | 서버 응답의 상위 setData/보유함 전체 병합은 남음 |
| 모든 지역 후속 예측 4칸 | 검토한 일부 평지에서 최대 12칸 | 다른 지역·실내·위험·경계에는 4칸 또는 전환 대기 |
| 진화 목록 전체 탐색 | 종/폼별 불변 데이터 인덱스 추가 | 동적 진화 조건은 계속 평가 |
| 대화/필드 클릭도 전부 busy로 차단 | 필드 disabled에서는 busy 제외. 이동 중 대화는 확인된 위치·방향·선두가 표시된 예측과 일치할 때 서버가 반환한 대화를 연다 | 미확정 경로와 구역 전환, 다른 요청 중 대화는 자동 실행하지 않는다. 실제 운영 환경은 미검증 |

근거:
- [라우터 사전 조회](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/app/api/world/route.ts#L7), [단일 조회 SQL](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/lib/cloud-adventure/movement-prefetch.mjs#L3).
- [read/present/commit](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/lib/cloud-adventure/route.ts#L126), [이동 시작](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/lib/cloud-adventure/route.ts#L177), [commit 결과 재사용](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/lib/cloud-adventure/route.ts#L972).
- [요청 제한·필드 분리·복구](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/components/cloud-adventure/entry.tsx#L21), [진화 인덱스](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/lib/evolution.mjs#L2).

명시적으로 cloud 엔진이 저장돼 있고, compact move이며, 그룹/조우/추가 보상이 없는 정상 이동을 가정하면 **사전 조회 1회 + batch 1회 = D1 API 호출 2회** 경로다. batch에는 wallet 초기화, world·선두·wallet 갱신, 결과용 SELECT 4개가 들어가므로 통상 총 9개 최상위 SQL 문이다. JSON 하위 쿼리의 실제 실행 비용까지 9회로 표현하는 것이 아니며, 운영 RTT 측정값도 아니다. 모호한 기존 저장의 별도 파티 조회, 그룹 탐험, dodge 등의 경로는 이 가정과 다르다. 기존 10회 설명을 현재 정상 이동에 적용하지 않는다.

## 2. 남은 원인과 해결 우선순위

### P1. 방향을 바꾸면 예측 타이머가 멎고 이전 경로의 확인을 기다리는 흐름

근거: [키 입력](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/components/cloud-adventure/entry.tsx#L91), [버퍼 타이머와 전송 루프](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/components/cloud-adventure/entry.tsx#L108).

코드에서 확인한 순서:

1. 처음 이동할 때 inputSequence를 inputAtStart에 고정한다.
2. 새 방향키를 누르면 inputSequence를 증가시키고 새 방향을 pathQueue에 넣는다.
3. 기존 previewTimer는 inputSequence가 달라지면 매번 반환한다. 해당 타이머는 새 방향으로 전환되지 않는다.
4. 이미 표시한 직진 버퍼는 현재 응답이 온 뒤 별도 move 요청으로 전송한다.
5. 새 방향의 pathQueue는 그 직진 버퍼 요청이 끝나고 바깥 tick이 다시 실행될 때 실제로 전송된다. turnPreview는 새 방향의 예측 종점만 표시한다.

즉, 오른쪽을 누르다가 아래쪽으로 꺾는 경우, **새 방향 한두 칸은 먼저 보이더라도 계속 아래로 걷는 표시가 서버 확인 사이에 멈출 수 있는 구조**다. 이전 요청과 아직 전송하지 않았던 직진 버퍼가 모두 있으면 새 방향 확정까지 두 요청의 잔여 시간이 관여한다. 모든 방향 전환이 항상 두 RTT를 소모한다는 뜻은 아니다.

해결 방향:

- 요청 안에서 생성·해제하는 previewTimer 대신, 화면이 살아 있는 동안 유지되는 이동 시계와 순서 있는 입력 큐를 둔다.
- 시각적으로 진행한 입력, 서버에 보낸 입력, 확인받은 입력을 sequence로 구분한다.
- 방향 전환은 현재 칸 이동의 끝에 연결하고, 화면에 아직 실행하지 않은 이전 방향의 입력은 정책에 따라 대체한다. 이미 실행한 입력을 조용히 삭제해 보행/조우를 건너뛰지 않는다.
- ACK에서는 확인된 prefix만 제거하고 남은 입력을 서버 상태 위에 재생한다. 전송 작업은 순차로 유지해도 화면 시계까지 await할 필요는 없다.
- 타임아웃·충돌·전투/이벤트는 권위 상태 복구와 큐 중단의 예외다. 이 안전 경계를 지우지 않는다.

검증: 350/600/1,000ms 모의 응답에서 직진 중 90도 전환, 빠른 좌우 교대, 손을 뗀 직후 방향 전환. 입력→첫 해당 방향 프레임과 첫 프레임 이후 정지 길이, 서버 경로/보행 수 일치를 각각 측정한다.

### P1. 한 칸 이동의 애니메이션과 입력 주기가 달라 작은 정지가 생길 가능성

근거: [Canvas 보간](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/components/cloud-adventure/adventure-field.tsx#L52), [이동 주기](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/lib/cloud-adventure/adventure-prediction.mjs#L39).

- 위치 변경 시 moveDuration은 보통 이동 주기 × 0.85다.
- 기본 주기는 100ms, 운동화는 75ms이므로 한 칸 보간은 각각 85ms / 63.75ms다.
- 다음 목표가 정확히 한 주기 뒤 도착한다는 조건에서는 좌표가 먼저 도착해 15ms / 11.25ms 동안 정지할 수 있다. 프레임 스케줄링·응답 지터에 따라 실제 체감은 달라진다.
- walkUntil은 걷는 모양의 지속 시간을 연장할 뿐 좌표의 정지 시간을 채우지 않는다.
- 현재 위치와 새 목표의 맨해튼 거리가 1.25보다 크면 moveDuration=1이 된다. 여러 칸 묶음의 종점/예측 보정이 전달되면 순간 이동처럼 보일 수 있다.
- predictCloudPath는 중간 꺾인 경로가 아닌 마지막 위치를 반환한다. Canvas 역시 시작점→종점 보간이므로 여러 방향이 함께 큐에 있으면 경로 생략/대각선 보간 가능성을 점검해야 한다.

해결 방향:

- 연속 입력에서는 칸별 waypoint를 시간축에 올리고 이동 속도를 일정하게 유지한다. 네트워크 ACK 도착 시각을 애니메이션 시작 시각으로 사용하지 않는다.
- 방향 전환도 칸별 경로를 따라간다. 정상적인 여러 칸 이동과 서버 오류 보정을 구분해 전자에 1ms 순간 이동 규칙을 적용하지 않는다.
- 단순히 0.85를 1로 바꾸는 것만으로 응답 지터/방향 큐 문제까지 해결됐다고 하지 않는다.
- reduced-motion, 전투 발생, 지도 변경 시 즉시 확정이 필요한 동작은 별도 정책을 유지한다.

검증: 네트워크 0/50/150ms에서도 연속 직진의 실제 Canvas 좌표를 프레임 단위로 관찰한다. 접근성 라벨만으로 부드러움을 판정하지 않는다.

### P1. 확장 예측은 일부 평지에만 적용됨

근거: [지역 및 타일 조건](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/lib/cloud-adventure/adventure-prediction.mjs#L19), [서버 최대 경로](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/lib/cloud-adventure/adventure-world.mjs#L1008).

12칸 후속 버퍼 후보는 lumiose, lumiose-centrico-route, lumiose-vert-street-route, lumiose-zone1, lumiose-zone4, lumiose-zone6이다. 실내·그룹은 제외하며 zone6의 canal/roof/high도 제외한다. 검토한 타일·위험 조건까지 만족해야 확장된다. 나머지는 4칸이다. 구역 전환 예측은 후속 버퍼를 끝내고 확인을 기다린다.

기본 주기의 4칸 후속 예측은 약 400ms, 운동화는 약 300ms에 소진될 수 있다. 12칸은 약 1,200/900ms로 늘지만 네트워크·서버 지연이 그보다 길거나 맵 경계에 도달하면 다시 기다린다. 수치는 타이머 예산이며 관측 RTT가 아니다. 따라서 “다른 구역에서는 아직 느리다”는 보고와 일치할 수 있다.

해결 방향:

- 지역별 요청 지연과 버퍼 소진 빈도를 먼저 기록한다. 확장 목록을 무조건 전체 맵으로 바꾸지 않는다.
- 안전한 길의 결정적 이동, 접촉/풀숲/퀘스트 경계, 지도 전환을 구분한다. 안전한 길에서는 지속적인 예측을 허용하되 제한된 시간/거리의 미확정 큐를 유지한다.
- 서버는 경로의 모든 칸을 순서대로 검증하고 조우 발생 위치에서 멈춘 뒤 처리한 입력 수를 반환한다.
- 맵 경계의 목적지 자료는 미리 로드할 수 있지만 입장 조건·이벤트 성공은 서버가 확정한다.
- 서버 경로 상한 12와 미확정 시각 큐의 상한을 별개로 설계한다. 큰 경로를 보내는 것으로 RTT를 무한히 숨길 수는 없다.

### P1. compact 응답이 아직 좌표/변경값 중심의 작은 응답은 아님

근거: [present](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/lib/cloud-adventure/route.ts#L128), [commit](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/lib/cloud-adventure/route.ts#L129).

상점·원정은 빠졌으나 선두/변경 개체의 learnable/tutorMoves/evolutions를 계속 계산·전송하고, world의 대부분 상태·지도·상호작용·빠른 이동 목록·가방·wallet도 포함한다. batch 안으로 옮긴 결과 SELECT는 HTTP 왕복을 줄이지만 쿼리, JSON 파싱, normalizeStoredPokemon, 응답 직렬화 비용을 없애지는 않는다. 진화는 인덱스가 추가됐으므로 이제 “매번 전체 진화 행 탐색”으로 진단하지 않는다.

해결 방향:

- movement reply 계약을 별도로 만든다: revision, ack/처리 칸 수, 위치·방향·필드 변화, 실제 변경 개체/가방/재화, 조우/이벤트와 상세 정보 무효화 표시.
- 종·폼·레벨 기반 기술 목록은 값이 변했을 때 또는 관리 메뉴에서 갱신한다. 진화 가능 알림은 보행/친밀도/시간/파티/가방 의존성이 있으므로 계속 정확히 계산하거나 버전별 무효화한다.
- mapVersion·퀘스트/층/시간 상태에 맞춰 지도와 빠른 이동 목록을 재사용한다.
- 단순 이동의 coins+0 쓰기와 초기화 비용은 계측 후 줄인다. walkSteps/친밀도는 실제 변경이므로 저장을 무작정 생략하지 않는다.
- changes() 기반 쓰기 체인과 batch 안의 일관된 스냅샷은 안전 장치다. 응답 경량화를 이유로 제거하지 않는다.
- 프런트 accept는 world 전체 교체를 전제로 한다. 서버만 부분 응답으로 바꾸면 정보가 사라질 수 있으므로 병합/삭제 의미를 함께 구현한다.

### P2. ACK 때 전체 보유함 병합과 상위 UI 갱신은 남음

근거: [accept](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/components/cloud-adventure/entry.tsx#L58), [필드 예측 분리](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/components/cloud-adventure/entry.tsx#L38).

예측 state는 이제 필드 내부에 있어 이전보다 개선됐다. 그러나 응답마다 old.box 전체로 Map을 만들고 배열/필터를 재생성한다. setBusy/setData/setTeam에 따른 상위 UI 갱신도 남아 있다. 보유량에 비례한 병합 비용과 ACK 순간 렌더 작업을 측정할 필요가 있다.

해결: 개체 ID별 저장소 및 안정적인 순서/참조를 사용하고 실제 변경 부분만 갱신한다. 필드·파트너·파티·수첩을 데이터 변경 범위에 맞춰 구독시킨다. 승인된 디자인을 바꾸는 작업은 아니다.

### P2. 응답으로 예측을 초기화하는 지점과 그룹 조회 경쟁

근거: [accept/load](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/components/cloud-adventure/entry.tsx#L58), [그룹 폴링](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/components/cloud-adventure/entry.tsx#L142).

accept는 새 응답마다 setPrediction(null)을 실행하고, 이동 루프는 후속 버퍼/회전 예측을 다시 설정한다. React 배칭으로 중간 상태가 실제 그려지지 않을 수도 있으므로 매번 깜빡인다고 확정하지 않는다. 그룹 조회가 이동 중 동일 리비전·동일 위치로 돌아와 예측을 지우는 사례는 모의 브라우저에서 재현 후 보완했다. 더 최신 리비전, 다른 위치, 전투·포획·기술 선택은 반영한다. 그룹의 같은 리비전 표시 변경은 다음 조회까지 늦어질 수 있으며 실제 운영에서의 효과는 미측정이다. [검사 기록](docs/ADVENTURE_GROUP_POLL_MOVEMENT_20261112.md).

남은 작업: 일반 이동 응답의 서버 상태와 미확정 입력 재계산을 확인하고, 실제 그룹 기기에서 구성원 표시 지연과 최신 전투·위치 반영을 측정한다.

### P2. 대화/도입부/회피는 일반 평지 이동과 다른 지연 경로

- 이동 중 대화는 표시한 위치·방향·선두가 서버 확인 결과와 일치하면 대화창을 연다. 일치하지 않거나 전투·실패가 발생하면 실행하지 않는다. [검사 기록](docs/ADVENTURE_PENDING_INTERACTION_20261112.md). 다른 요청과 구역 전환 중 입력은 자동 대기하지 않으며 실제 운영은 미검증이다.
- 도입부 introMove/introEscapeMove는 일반 이동 버퍼를 쓰지 않는다.
- dodge는 클라이언트에서 compact를 붙이지 않고 라우터 사전 묶음 조회 대상에도 없다.
- 실패 복구는 4초 제한을 도입했지만 fence와 GET이 차례로 추가된다. 총 복구가 4초 안에 끝난다는 뜻이 아니다. [이미 기록된 새로고침/펜스 경합](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/docs/ADVENTURE_FENCE_RELOAD_RACE_20261112.md)을 보존한다.

남은 작업: 도입부의 별도 예측과 dodge의 경량 경로를 검토한다. 펜스 제거·자동 이동 재시도로 데이터 안전을 희생하지 않는다.

## 3. 기존 측정 결과와 한계

저장소의 [이동 측정 기록](https://github.com/name400/pokemon-journey/blob/970bcf63f81d94513b87518ed0cd449cca857c6a/docs/ADVENTURE_MOVEMENT_MEASUREMENT_20261112.md)은 과거 `d894e0a`에서 로컬 Chromium 390×844, CPU 4배 감속, 모의 /api/world 응답을 사용했다.

- 모의 150ms 응답: 첫 위치 변경 35/133ms, 대부분 80–147ms 간격, 화면 경계 276–293ms.
- 모의 600ms 응답: 첫 위치 변경 117/55ms, 대부분 74–140ms 간격, 초기 206 또는 547ms 정지 구간.
- 일부 실행에서 175/250ms long task가 관찰됐다.

이는 **기존 기록을 읽은 결과**이며 이번 재실행 결과가 아니다. 최초 위치 기준도 캔버스 접근성 좌표 변화여서 실제 픽셀 표시까지 측정한 것은 아니다. 이미 개선됐어도 일부 정지가 관찰된다는 증거지만, 특정 함수가 long task의 원인이라는 증거는 아니다. 최신 코드·운영 D1·실제 휴대폰 결과로 일반화하지 않는다.

Canvas는 가시 타일 범위, invalidation 스케줄러, 정지 시 프레임 중단, 이미지 필요 시 로드를 이미 사용한다. 이제 “매 이동 이미지 전체 재다운로드”를 해결책으로 제시하지 않는다. 배경/동적 레이어 분리나 해상도 조정은 draw 프로파일에서 비용이 확인됐을 때 후순위로 검토한다.

## 4. 다음 구현 순서

1. **배포 버전 확인 + 같은 경로의 실제 측정.** 평지 직진/방향 전환/문 경계/전투 진입/NPC 대기를 구분한다. 입력→시각 반응, 시각 반응 뒤 가장 긴 정지, RTT, ACK, 처리 칸 수, 미확정 큐 길이, 서버 처리와 프레임 긴 작업을 연결한다. 계정/세이브/토큰은 로그에 기록하지 않는다.
2. **연속적인 이동 시계와 방향 전환 큐.** 네트워크 송신 루프와 표시를 분리하고 ACK prefix만 제거한다. 기존 단일 전송·revision·fence는 유지하거나 동등한 보호를 먼저 검증한다.
3. **칸별 애니메이션 연결.** 0.85 주기 정지와 종점 점프를 확인하고 waypoint 보간을 적용한다.
4. **지역별 제한 정교화.** 안전한 지형·위험 이벤트·전환을 구분한 예측 정책. 단순 12→큰 숫자 변경 금지.
5. **movement 전용 응답과 보유함 갱신 경량화.** 운영 프로파일에서 큰 쪽부터 처리한다.
6. **그룹/도입부/회피/대화 별도 경로 검증.**

실험용 네트워크는 0/50/150/350/600/1,000ms 및 지터/응답 유실을 사용하고, 실제 네트워크 측정도 따로 수행한다. 기본/운동화, 작은/큰 보유함, 모바일/PC, 저성능 CPU를 포함한다. 최소 몇 초의 직진만으로 공식 게임 수준이라 판정하지 않는다.

회귀 기준:

- 동일한 입력 경로의 각 칸에서 보행 수·친밀도·접촉·풀숲 조우·퀘스트·전환을 놓치지 않는다.
- 고정 테스트 난수와 저장 복원으로 아이템/재화/포획 중복, 충돌, 응답 유실, 두 탭, 페이지 숨김/새로고침을 검사한다.
- 키를 뗀 뒤 불필요한 이동이 추가되지 않으며, 빠른 회전 경로가 실제로 표시된 경로와 일치해야 한다.
- 서버의 교정/전투/이벤트가 발생하면 아직 확정되지 않은 입력을 안전하게 정리한다.
- 클라이언트 화면만 부드러워지고 실제 저장이 밀리는 상태를 성공으로 취급하지 않는다.

## 5. 이번 문서 갱신의 완료 범위

현재 소스와 이전 소스 차이, 개선 구현, 남은 실행 경로 및 기존 측정 기록을 읽었다. 문서를 현재 기준으로 갱신했으며 게임 코드 수정·게임 테스트/벤치마크 실행·운영 DB 접근·Sites 저장/배포는 하지 않았다. 지연 수정 완료나 공식 게임과 같은 무지연을 보장하지 않는다.
