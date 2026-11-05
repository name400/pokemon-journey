# 2026-11-05 PC 부화 결과·기술 정보·대사 순서·응답량

기준 `08af752712330b59b4ae1b25908f8b47c386605f`. 사용자가 PC의 작은 부화 결과, 기술 카드의 i 버튼 넘침, 대사 확인 전 화면 전환과 끊김을 보고했다. 실제 Page/RogueClassic/BattlePanel을 합성 계정과 로컬 API로 검사했다. Sites나 운영 저장은 쓰지 않았다.

## 구현과 실제 화면 검사

- PC900px 이상에서 부화 결과의 여백을 활용한다. 1920×1080의 실제 패널은760×356→1144×760px, 포켓몬 이미지45→140px, 이름13→20px, 설명10→14px, 버튼 높이38→52px이었다. 작은 PC에서는 이미지가96–140px로 조정된다. 18개 결과의2/3페이지, 이전/다음 경계, 한 마리씩 보기와 모두 확인을 검사했다.
- 모바일390×844의 패널·이미지35px·이름11px·설명9px·버튼36px은 변경 전과 같았다. 8개 크기(1920×1080,1366×768,1280×720,1000×900,390×844,375×667,844×390,768×1024)에서 가로 overflow 없이 조작했다.
- i 버튼은 카드 안의 독립 공간에 고정하고 상속 padding을 제거해 글리프를 중앙에 둔다. PC28px/터치44px이며, 카드의 우측 여백도 해당 크기에 맞춘다. 툴팁을 잘라 숨기는 overflow 처리는 하지 않았다. 8크기×4기술에서 버튼/글리프 containment, PP 비겹침, 키보드로 정보만 열고 실제 전투 명령이 전송되지 않는 것을 검사했다. 기준1440×1000 fixture 자체에서는 원래 버튼의 넘침을 재현하지 못했으므로 사용자의 정확한 브라우저·확대 배율 재현으로 과장하지 않는다.
- 실제5웨이브 반바지 꼬마의 intro에서 대사 미확인 중2.6초 타이머가 끝나 등장 화면이 사라지는 경로를 로컬에서 재현했다. 대사와 숨긴 게임 뷰에서는 전투 재생을 멈춘다. 6.5초 미확인 상태에서 트레이너 등장 배경과 이미지, 포켓몬 미등장을 유지했다. 마지막 확인 뒤 별도의2.6초 소개를 다시 기다리지 않고 포켓몬을 각1회만 등장시켰다. 지역 biome 자체의 다른 조기 전환이 모두 재현된 것은 아니다.
- 마지막 피해·기절 재생 전에 승리 대사가 열리는 경로는 재생 완료 key로 지연한다. 실제 controller의 승리 queue phase는 `win`이며 일부 이벤트의 `outro`와 모두 다룬다. BattlePanel이 최종 표시를 마친 뒤 대사를 열고, 대사 확인 전 자동 보상 전환을 막는다. PC/모바일에서 재생 중에는 대사가 없고 대사 등장 시 FX/REPLAY가 끝난 것을 확인했다. 저장이나 난수 진행에 새 필드를 추가하지 않는다.

화면 하네스는 `tests/browser/ui-readability/README.md`, 실제 상태/동작 검사는 `check.mjs`다. 외부 이미지는 단순 SVG로 대체했으므로 이 결과는 실제 스프라이트 품질·로딩 검증이 아니다. 다른 슬롯·탐험·부화 결과 확인 재화 보존을 검사했다.

## 클라이언트 끊김 측정과 적용 범위

독립 읽기 전용 분석은 로컬 production client, 합성 Mewtwo/Lechonk 전투와200ms 지연을 넣은 API로 정상 CPU/4×CPU, 연출 on/off를 비교했다. 실제 운영 POST wall174–283ms라는 부모 채팅의 읽기 결과와 이 합성 왕복 측정을 혼동하지 않는다.

- 정상 CPU 4턴: 명령 입력→다음 명령 가능1827–1854ms, rAF p95 16.7ms, long task0.
- 4×CPU: 약1907–1984ms, 간헐58–69ms 작업2개. 실제 PC의 지속적인 끊김은 이 범위에서 재현하지 못했다.
- 해당 턴의 명시적 순차 연출은1516ms였다. 약230ms API 외 대기의 대부분을 설명하며 watchdog3200ms를 추가로 기다린 흔적은 없었다. 임의로 속도를 바꿔 끊김 해결로 보고하지 않는다.
- 로그 auto-scroll의 layout 작업은 관측됐지만 읽기 없는 scrollTo A/B는 개선되지 않았다. 관련 코드 변경은 적용하지 않았다.

확인한 응답량 문제는 수정했다. 클라이언트 load가 모든 전투/슬롯/오류 복구에도 `?starters=1`로 스타터 전체를 받았다. 이제 기본 GET을 사용하고 실제 서버는 **`classic.selection`이 있을 때** 자동으로 catalog를 포함한다. 명시적 `?starters=1`과 기존 prepare/reduceCost/unlockPassive 등의 응답은 유지한다. UI의 `selecting` 필드와 저장의 `selection` 필드를 구별한다.

같은 성능 fixture에서 raw UTF8 응답은1,066,128→15,637 bytes(약98.5%감소), 로컬 GET 생성/반환135→16ms였다. 압축된 실제 wire 크기가 아니다. 초기 ready2761→2712ms는 단일 측정의 변동 범위이므로 큰 체감 개선 증명이 아니다. 변경 후에도4×CPU의 간헐 long task는 남았다.

실제 production build를 localhost Worker/분리된 합성 D1로 검사했다. 일반 전투 기본 GET은catalog 없이19,451bytes, 선택 중 기본 GET은689항목/1,069,954bytes, 전투의 명시적 catalog GET은1,069,955bytes로 모두200이며 revision0·해금 수를 유지했다. 클라이언트의 스타터 선택 새로고침 복구도 확인한다. 운영 저장·실제 네트워크·원본 GIF·융합 이미지·물리 GPU가 포함된 Performance 기록은 별도다.

## 마자용 원인 설명 정정

이전7540272 보고에서 단일 actor turn/actions 거부를 실제 싱글 UI의409 원인으로 설명한 것은 잘못됐다. `hasMultiBattleDTO`는 activeBySide 길이가2이상일 때만 true이고 실제 싱글 UI는 flat move를 보낸다. 현재 production-client에서 참가·확인·실제 기술 클릭3회가 모두 flat 요청/200이며3턴 후 보상에 도달했다. 다른 슬롯·탐험·재화 보존, pageerror0이었다. 추가 envelope 호환은 유지하지만 기존 운영409 여섯 건의 원인은 미확정이다. 과거 문서의 현재 설명도 정정했다.

## 검사 근거와 남은 범위

일반 전체773/773(159.1초), Worker 정책773/773(149.6초), 타입·production build 통과. 실제 대사 상태 집중3/3 통과. 변경 화면의 기존 린트 진단은 app97오류18경고, BattlePanel36오류10경고, API route3오류로 기준과 같으며 전체 린트 통과라고 보고하지 않는다. 신규 파일 린트·최종 브라우저 결과는 후속 확정 기록을 따른다.

로컬 근거: `/tmp/ui-final-full.log`, `/tmp/ui-final-worker.log`, `/tmp/ui-final-type.log`, `/tmp/ui-final-build.log`, `/tmp/ui-presentation-focus.log`, `/tmp/ui-readability-final-browser.log`, `/tmp/ui-catalog-http.json`; 화면 JSON/스크린샷은 `.sites-runtime/tests/ui-readability/`다. 성능 raw는 `/tmp/client-perf-audit/`, `/tmp/client-perf-trace/`, `/tmp/client-perf-catalog-after/`에 있고 공개 저장소에 원본 업로드하지 않는다.

Sites 배포 후 동일 장면과 실기기에서 재확인해야 한다. 실제 구현 잔량은 지가르데 중간형·자동 폼, 복잡한 진화/도구/이벤트/전투와 신규 메가 이미지다. 사용자가 추가로 확정한 울트라볼은 하이퍼볼과 다른 Beast Ball이며 다음 구현으로 진행한다. 고정 PokéRogue 원본에는 이 볼이 없어 사용자 요청 확장과 원본5볼을 구별해야 한다.

최종 브라우저 **11경로** 통과(8크기의 부화+정보,2크기의 대사 순서,1스타터 선택 reload). 신규 helper/집중 검사/화면 하네스 린트 오류·경고0. `git diff --check` 통과.
