# 2026-11-05 운영 메모리·마자용·등장 연출 수정

사용자가 심한 지연, 전투 시작/다음 전투에서 반복되는 장면, HTML 응답의 JSON 파싱 오류와 마자용 이벤트 오류를 보고했다. 기존 융합 확장은 읽기 조사 상태에서 중단하고 이 문제를 우선했다. 운영 로그와 배포 정보만 읽었으며 운영 저장·Sites 저장본·배포는 변경하지 않았다. 코드 기준은 `6726fef092710e398f74f6d4f4eb8c24fc9bc448`이다.

## 확인한 운영 사실과 범위

- 조회 당시 운영은 **v50**, Sites 소스 `ec55c161aa832b0e23eb6ee317b443309c625bfc`였다. GitHub 클라우드 브랜치의 SHA와 Sites 작업 사본의 SHA를 혼동하지 않는다.
- 2026-11-05 UTC 07:51:37, 07:51:44, 08:19:53, 08:20:38의 `POST /api/rogue-classic`에서 `exceededMemory` / `Worker exceeded memory limit`를 확인했다. 마지막 요청 식별자는 `6272b624aa4a80467bd139588037cc9b`, wall 약1.1–1.3초/CPU 약443–498ms였다. 성공 응답도 있어 모든 요청이 실패한 것은 아니다.
- 이 플랫폼 종료는 route의 catch 바깥에서 발생한다. HTML 500 응답에 기존 `response.json()`이 실패해 사용자 화면에 `Unexpected token '<'`를 노출하는 경로와 일치한다. 모든 지연의 원인이 메모리라고 확정하지 않는다.
- 별도 보고된 마자용 시간대의 409 여섯 건은 본문/오류 문구가 없어 개별 원인 귀속은 불가능하다. 아래의 추가 envelope 거부는 재현했지만 실제 싱글 UI와는 다른 형식이었다(후속 정정 참조).
- admin 403은 권한 없는 관리자 조회의 거부이며 권한 검사를 완화하지 않았다. favicon 404는 기존 SVG favicon을 metadata에 연결했다. 원본 로그의 IP·인증 헤더·개인 저장은 문서에 보관하지 않는다.

후속으로 사용자는 `6726fef` 적용 배포를 알려줬다. 읽기 전용 재조회에서 최신 **v51**, Sites 소스 `1951eb15a7aa180494b4ec8ac3455019cf7b5a63`, 저장 갱신 시각 UTC08:49:10을 확인했다. 이후 반환된 오류 로그5개는 새 Worker 버전 `b4db60f3-65ca-424b-897b-47bb9b85bc79`의 GET403/404였으며 게임 POST가 없었다. 따라서 위 v50의409/메모리 오류를 v51에서도 재현했다고 보고하지 않는다. 이번 수정은 6726fef 뒤의 변경이므로 그 배포에 이미 포함된 것으로 간주하지 않는다.

## 구현

### Worker에서 사용하지 않는 native 검증 카탈로그 제외

`@pkmn/sim`은 Dex 초기화 시 여러 세대의 `Learnsets`와 `Legality`를 불러와 병합한다. 앱은 기술 학습/출전 검증을 pinned source와 자체 `learnsets-modern`으로 처리하며, 앱 코드에 native TeamValidator/Teams.generate/learnsets 호출은 없다. build plugin은 **해당 패키지 내부의 learnsets/legality 모듈만** 빈 lookup으로 대체한다. 두 자료는 병합 의존성이 있어 함께 제외한다. 종족·기술·특성·도구·세대별 전투 scripts는 유지하며 설치 패키지나 전역 Dex를 수정하지 않는다.

표준 Node 검사는 원본 전체 카탈로그를 사용한다. `npm run test:worker`는 동일한 제외 판정의 Node loader로 전체 검사를 다시 수행한다. 실제 production build도 같은 Vite plugin을 사용한다. 향후 native TeamValidator/Teams.generate를 추가한다면 이 정책을 그대로 사용하면 안 되며 별도 검증용 실행 환경이 필요하다.

로컬 Node에서 GC 후 게임 모듈 import 유지 힙은 처음 비교 약79.3→45.5MiB, 재측정75.6→43.4MiB였다(약32–34MiB 감소). native party-battle production chunk는 약6.7→2.8MB로 줄었다. 이는 Node heap/빌드 크기 측정이며 운영 Worker의 총 메모리·콜드 스타트·사용자 체감 지연 측정이 아니다. 80MiB Node old-space 상한의 실제 전투 검사도 통과했다.

### 마자용 3턴 미니게임

후속 코드 대조에서 앞선 원인 설명을 정정했다. `hasMultiBattleDTO`는 activeBySide의 길이가2이상인 경우에만 true이므로, 실제 싱글 BattlePanel은 마자용도 `{type:'move',move:...}`를 보낸다. 기존 미니게임은 그 flat 형식을 이미 지원한다. 기준 엔진이 추가 `{type:'turn',actions:[{actor:0,type:'move',move:...}]}`를 거부하는 것은 재현했지만, 이를 현재 싱글 UI의 운영409 원인으로 확정한 설명은 잘못됐다.

단일 actor0의 move envelope를 기존 명령으로 정규화한다. 기존 평평한 명령도 유지한다. 다중 actor·잘못된 actor·교체·특수 기믹·자기 교체 기술 거부는 유지한다. 세 턴·보상과 저장 codec 복구, 다른 슬롯/탐험/재화 보존을 검사했다. 기존 운영409 저장의 복구가 증명된 것은 아니다. 실제 사용자의 운영 저장을 열어 검사하지 않았다. 후속 production-client 격리 검사에서는 실제 싱글 UI의 flat 기술 선택3회가 모두200이고 보상까지 진행했으며 다른 슬롯·탐험·재화와 브라우저 오류0을 확인했다. 운영409의 개별 원인은 여전히 미확정이다.

### 등장 전 선표시와 오류 응답

새 전투 DTO의 before roster가 이미 들어올 포켓몬을 가리켜 처음부터 화면에 표시된 뒤 switch 연출로 다시 등장하는 경로를 수정했다. Classic의 선행 switch와 같은 개체를 가리키는 슬롯만 비우고 해당 이벤트에서 표시한다. 다음 야생 전투에서는 기존 플레이어는 유지하고 새 상대만 기다린다. 일반 교체의 다른 나가는 개체와 move 이후의 교체는 유지한다. 최종 상태와 입력 객체는 바꾸지 않는다.

이 검사는 실제 첫 전투/다음 전투 DTO의 표시 상태를 확인한다. 사용자가 말한 모든 중복 재생을 브라우저에서 재현·해결한 것으로 보고하지 않는다. 실제 화면·재마운트·대화 전환·오류 복구 경계 검증이 남는다.

클라이언트 응답 처리는 HTML 500에 한국어 서버 오류를 표시하고 정상 JSON의 오류 문구는 보존한다. POST를 자동 재전송하지 않는다. 메모리 원인 수정과 이 오류 표시 개선은 구분한다.

## 검증

- 일반 전체 검사 **765/765**, 280.9초. Worker 데이터 정책 전체 검사 **765/765**, 281.4초. 두 실행은 동시에 수행했으며 모두 실패/skip0이었다.
- 등장·기존 재생 제어·마자용 집중 검사 **7/7**, 1.6초. build policy/응답 검사와 bounded heap 검사도 전체 실행에 포함한다.
- 타입 검사와 production build 통과. 신규 파일/엔진/layout/Vite 설정 린트 오류·경고0. hook의 기존7오류는 기준과 같은 규칙/개수이며 앱은 기준98오류18경고→현재97오류18경고다. 전체 린트 통과라고 보고하지 않는다. `git diff --check` 통과.
- **실제 production 빌드를 Wrangler의 localhost Worker로 실행**, 분리된 `/tmp/pokerogue-memory-local` D1에 합성 저장만 넣어 HTTP 검사했다. 첫 게임 GET200 약240ms, 일반 전투 POST 세 번 모두200(45/27/37ms), 후속 GET200 약14ms. 마자용은 POST 세 번200(32/23/25ms), GET 복구 후 보상 화면까지 진행했다. 잘못된 명령409 뒤 revision0 유지도 확인했다. 로컬 지연은 운영망·운영 D1·플랫폼 메모리 한도 재검증과 같지 않다.
- 로컬 근거: `/tmp/incident-normal-full.log`, `/tmp/incident-worker-full.log`, `/tmp/incident-playback-focus.log`, `/tmp/incident-final-type.log`, `/tmp/incident-final-build.log`, `/tmp/incident-new-lint.log`, `/tmp/incident-worker-http.json`, `/tmp/incident-local-worker.log`. 이 임시 파일은 공개 저장소에 원본 업로드하지 않는다.

## 남은 작업

코드는 승인된 GitHub 작업 브랜치에 저장한다. Sites는 사용자가 별도 Work에서 적용한다. 배포 후 동일 저장의 메모리 종료 여부, 서버/API 지연과 연출 지연의 구분, 전투 시작/다음 전투/대화/재접속에서 실제 중복 재생, 마자용 운영 저장 회복을 확인해야 한다. 현재 운영이 이미 고쳐졌다고 보고하지 않는다.

기능 구현 잔량은 `REMAINING_IMPLEMENTATION_CURRENT.md`의 Mega8폼·지가르데 중간형/자동 폼·복잡한 진화/도구/이벤트·전투 원본 차이를 유지한다. 이번 사고 대응에서 그 확장은 구현하지 않았다. 비활성 원본 콘텐츠와 보류한 탐험은 유지한다.
