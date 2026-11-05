# PC 실제 GIF 성능 조사 — 2026-11-05

## 결론과 범위

실제 GIF와 실제 React 화면/로컬 전투 controller를 연결해 개발 번들 24구간, 최적화 번들 24구간, 관찰자 축소 대조 4구간, CPU trace 회차 3구간(그중 warm turn 1회 stack 수집)을 완료했다. **운영 PC 끊김 원인은 아직 확정하지 못했다. 제품 성능 코드는 추정으로 수정하지 않았다.**

최적화 번들의 정상 CPU single/double 각 3턴에는 long task가 없었다. 4× CPU에서 발견한 최적화 번들의 턴 중 long task는 모두 최종 기술 제출/POST 전 메뉴 선택 구간이었다. 해당 회차들의 POST 이후 재생/다음 입력 구간에는 long task가 없었다. 메뉴 전환에는 React, 스타일/레이아웃, 자동 focus, Playwright 클릭 actionability 검사 등이 함께 들어가므로 이 결과를 사용자 PC의 원인으로 단정할 수 없다.

## 측정 구성

- Chromium 1280×800, normal/4× CPU, single/double, 첫 진입/첫 턴/warm/즉시 다음 턴/재접속/150ms 인공 네트워크 지연.
- 뮤츠/핑복/판짱/직구리의 실제 PokeAPI Showdown GIF front/back 8개를 다운로드하여 localhost에서 원본 바이트 그대로 cacheable HTTP로 제공. 출처·크기·SHA-256을 보존하고 각 전투 이미지의 decode를 확인했다. 이미지 placeholder나 Playwright 이미지 route가 아니다.
- 실제 UI와 전투 엔진을 사용하지만 전투는 합성 fixture다. 아군은 스피드스타/튀어오르기, 생존 가능한 상대는 튀어오르기를 사용한다. 저장은 메모리에 격리된다.
- Vite 최초 module transform은 측정 전 별도 warm-up. 개발 React Profiler, 최적화 React/Vite 번들을 구분했다. 최적화 React에서 Profiler callback 0은 렌더 비용 0을 뜻하지 않는다.
- click→fetch 시작→headers/body→JSON parse→다음 입력, long task, rAF, CDP script/layout/style, GIF cache를 분리했다. body/저장 내용·쿠키·raw headers는 출력하지 않았다.
- 측정 중 부모의 전체 테스트/빌드와 다른 브라우저 검사를 중지했다. 배포 Worker/DB/외부 CDN/실제 PC 하드웨어는 이 실험 범위 밖이다.

## 주요 수치

각 행은 first/warm/immediate 3턴의 범위다. request는 fetch 시작→headers이며 submit→ready에는 body 수신/재생이 포함된다. 더블 첫 턴은 이벤트 수가 달라 더 길다.

| 번들 / CPU | 전투 | request ms | submit→ready ms | long task (POST 전/후, 3턴 합계) | 최대 rAF 간격 ms |
|---|---|---:|---:|---:|---:|
| 개발 / normal | single | 21.6–43.7 | 1337–1352 | 0 / 0 | 33.4 |
| 개발 / normal | double | 35.7–49.9 | 2639–2883 | 0 / 0 | 33.4 |
| 개발 / 4× | single | 92.4–116.6 | 1682–1757 | 6 / 14 | 200.1 |
| 개발 / 4× | double | 88.5–99.6 | 3064–3106 | 18 / 46 | 200.0 |
| 최적화 / normal | single | 30.8–42.6 | 1301–1317 | 0 / 0 | 16.8 |
| 최적화 / normal | double | 37.9–40.4 | 2591–2842 | 0 / 0 | 33.4 |
| 최적화 / 4× | single | 37.5–73.0 | 1391–1473 | 4 / 0 | 166.7 |
| 최적화 / 4× | double | 48.2–73.0 | 2700–2914 | 5 / 0 | 116.7 |

정상 CPU 최적화 JSON parse는 single 0.1–0.4ms/double 0.3–0.4ms였다. 약 1.3초/2.6초의 입력 잠금 동안 프레임은 계속 진행되어 해당 fixture에서는 이벤트 재생 대기가 주된 경과 시간이다. 이 대기를 운영에서 보고된 끊김과 동일하다고 간주하지 않았다.

최적화 cold/reconnect는 별도 측정했다. 정상 CPU 재접속 총 시간은 single 약2242ms/double 약3510ms이며 long task 0, GIF transferSize 0 cache hit를 확인했다. 4× double cold는 6개/max134ms, reconnect는 2개/max86ms long task가 있어 초기화 경계는 턴 재생과 분리해야 한다. 인공150ms latency에서 정상 CPU request는 약153–155ms로 늘고 재생 시간은 유지되었다. 운영 네트워크 재현을 의미하지 않는다.

## 관찰 오버헤드와 CPU 귀속

문서 전체 MutationObserver를 끈 4× double 대조에서도 warm 메뉴 구간 long task 4개/max112ms가 남았다. 기준 회차 max57ms보다 커졌으므로 한 번의 대조로 관찰자가 원인이라고 할 수 없다. rAF/PerformanceObserver/CDP/Playwright 비용과 실행 변동은 여전히 포함된다.

소스맵을 포함한 최적화 번들에서 4× double warm CPU sample을 1회 수집했다.

- trace 4022ms, 2883 samples. 전체 phase 3573ms, 최종 submit→ready 2679.7ms.
- long task 91/72/62/54ms 모두 최종 제출 이전의 네 번의 메뉴 클릭에 겹친다. POST 이후 long task 0.
- CDP 누적 Task 1750.5ms / Script 401.6ms / Layout 125.8ms / RecalcStyle 307.1ms. 이 수치는 서로 독립적으로 합산할 항목이 아니다.
- 소스 매핑된 앱 경로의 누적 시간: BattlePanel 로그 자동 스크롤 35.6ms, BattlePanel render 한 호출 경로 inclusive 25.1ms, focus effect 20.4ms. 이는 4초 전체에 걸친 누적 sample이며 단일 긴 작업 길이가 아니다.
- native `elementsFromPoint`, 요소 검색 및 layout 관련 호출도 보인다. Playwright actionability가 포함되는 구간이라 앱 렌더만의 비용으로 귀속할 수 없다. idle/program 비중도 커 JS CPU sampling만으로 native rendering을 정확히 함수별 귀속할 수 없다. React inclusive stack들은 중첩되므로 합산하지 않는다.

이 자료로 강제 log-scroll/focus 삭제, 렌더 memoization, 애니메이션 단축을 정당화할 정도의 지배적 병목을 찾지 못했다. 접근성/대사 흐름을 바꾸는 임의 최적화는 하지 않았다. 남은 확인은 실제 문제가 나는 PC의 배포 화면에서 메뉴 클릭/응답 대기/이벤트 재생 중 어느 구간인지 구분하고, 동일 시각의 안전한 request ID와 browser performance trace를 연결하는 것이다.

## 재현과 산출물

명령은 [browser harness README](../tests/browser/ui-readability/README.md#local-performance-investigation)에 있다. 계측 도구/합성 fixture만 추가되었다. 타깃 ESLint(profile-browser/artwork, Vite config, main, fixture)은 오류/경고 없이 통과했다. 부모 통합 검증은 표준820/820, Worker 집중17/17, type/build 통과다.

로컬 재현 산출물은 gitignored이며 저장/응답 body를 포함하지 않는다.

- `.sites-runtime/tests/ui-readability/performance/summary.json` — 개발 24구간
- `.sites-runtime/tests/ui-readability/performance-production/summary.json` — 최적화 24구간
- `.sites-runtime/tests/ui-readability/performance-production-light/summary.json` — 관찰자 축소 4구간
- `.sites-runtime/tests/ui-readability/performance-production-cpu/{summary.json,cpu-summary.json,warm-turn.cpuprofile}` — CPU trace 및 매핑 집계
- 각 폴더 `4x-double-warm-turn.json` 등의 단계 파일에는 입력/POST/long task 타임스탬프가 있어 귀속을 재검증할 수 있다.
- `/tmp/pokerogue-profile-art/provenance.json` — 실제 이미지 출처/hash

표본은 각 조건 3턴으로 작다. 정상 회차에 문제가 없었다는 결과가 운영 문제의 부재나 해결을 입증하지 않는다. 운영 진단 및 로컬 서버 단계 실측은 [후속 통합 QA](INCIDENT_FOLLOWUP_QA_20261105.md)를 함께 참고한다.
