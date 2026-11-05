# 지가르데 중간형·스웜체인지와 터치 정보 버튼

기준 ee4c0e0, 원본 `7c0881255af5cd51992e513ff93c2f71adbe40e0`의 generation-06 및 POWER_CONSTRUCT. Sites/운영 저장은 변경하지 않는다.

## 실제 구현

- 10%, 50-pc, 10-pc, complete, 10-complete 다섯 중간형의 양쪽 DNA 보상·전투·저장·분리. 10-complete는 source formIndex5를 유지하며 native Zygarde-Complete와 이미지 atlas만 공유한다. 일반68+지속139=207폼 항목이다.
- Complete 두 변형에서 Zygardite 메가 변신/해제. `rogueZygardeMegaOrigin`으로 출신을 저장해 합류/융합/codec 뒤에도 올바른 완전체로 해제한다. 새 전환은 정확한 source form의 Pokémon ID를 저장한다. 기존 출신 필드가 없는 메가는 과거50% Complete 해제를 유지한다. 알 수 없는 출신/손상된 융합은 소모 전에 거부한다. 고정 원본에는 양쪽 Complete→Mega 경로가 있지만 출신 조건을 보완할 TODO가 남아 있다. 따라서 출신 기록을 이용한 구별 해제는 이 프로젝트의 데이터 보존 정책이며 원본 Mega 왕복 동등성을 증명한 것으로 보고하지 않는다.
- 검증된 비융합 source 지가르데의 Power Construct를 battle-local ability로 연결한다. 반HP 이하 등장/턴 종료에 50-pc→complete, 10-pc→10-complete로 바꾸고 최대HP 증가분을 현재HP에 더한다. 기절·새 전투/연속 야생 경계에서 출신 PC폼으로 돌아가며 기절은 HP0을 유지한다. 감소한 최대HP는 상한으로 자른다. 임시 다이맥스가 남은 경계에서는 배율을 유지하고 새 트레이너전에서는 정상화한다.
- 원본의 NoFusionAbility 정책을 적용해 융합 중 스웜체인지가 발동하지 않는다. Complete를 융합하거나 융합 상태에서 메가 도구를 쓰는 경로는 지원한다. 공유 Dex는 변경하지 않는다.
- 예전 native 변형은 외형/최대HP만 바뀌고 source PC index가 남을 수 있었다. 기존 PC 수치/ID, Complete 외형과 sprite, 현재 Power Construct, 정상 범위의 살아 있는 HP, 정확한 Complete 계산 최대HP가 모두 맞는 기록만 active slot과 대응 combat member에서 보정한다. HP·기술·도구·다른 슬롯은 보존한다. 다이맥스·손상/불명확한 옛 기록은 이 복구로 추정하지 않는다.
- 바다/화산의 검증된 일반 폼 경로는 nullable native alias도 실제 source/native 대응으로 확인한다. 융합 팔레트 donor 메타데이터는 검증된 원본/직전 ID 별칭과 source atlas를 기록한다. 실제 자산 다운로드/실기기 렌더 검증과 구분한다.

## 모바일 i 버튼 재현과 수정

격리 실제 Page에서375/390/430px의1·2·4번i를 tap하면450ms 뒤 aria-expanded=false이고3번만 true였다. 각 버튼을 새 페이지에서 확인했다. 이전 회귀 검사는 키보드 Enter로 열어 이 터치 경계를 놓쳤다.

터치 뒤 mouseover/mouseout 호환 이벤트가 발생하고 레이아웃/포커스 이동에 따라 wrapper의 mouse-leave 경로가 설명을 닫았다. pointer enter/leave는 pointerType=mouse일 때만 호버 열림/닫힘을 처리한다. touch는 i 버튼의 click 토글로 제어하고 기존 blur와 키보드 동작을 유지한다. 버튼 크기/카드 배치/PP/기술 실행은 바꾸지 않는다.

`tests/browser/ui-readability/touch-move-info.mjs`는375/390/430px·844×390landscape·1280×800PC에서4개 버튼을 각각 새 페이지로2회 확인한다. 총40경로에서 지속 열림, 재탭 닫힘, PC Enter/hover/leave, 기술 POST0건과 저장/PP 보존을 통과했다. 결과는 `.sites-runtime/tests/ui-readability/touch-move-info.json`, 요약은 `/tmp/zygarde-touch-final.log`이다. 실제 모바일 기기/Safari 검사는 아니다.

## 검증과 한계

새 지가르데 집중11테스트: 양쪽 역할5폼, 두 Complete 출신×standalone/융합 도구, codec/다음 턴, 반HP threshold, 개체값/주스/Flip Stat/임시 다이맥스, 기절/연속야생, 양쪽 진영/더블, NoFusion, 손상 거부, 정확한 옛 저장 복구와 donor palette별칭을 검사한다. 팔레트 기존9검사와 합계20/20 통과(`/tmp/zygarde-focus6.log`). 일반폼/지속폼 기존 거래·이벤트 회귀도 전체 검사에 포함한다.

초기 전체 검사에서785/786으로 팔레트 source 메타데이터 drift1개가 검출됐다. 생성기를 갱신해 source가 증명하는 ID 별칭만 추가하고 재생성했으며 이후 집중20/20으로 확인했다. 마지막 코드의 전체/Worker 정책·타입·빌드·브라우저 회귀 결과는 아래 최종 결과에 기록한다.

지속 PC 끊김과 운영 마자용409의 원인은 이 변경으로 확정/해결하지 않는다. 다른 종의 자동 폼, 변신/임의 패시브·랜덤 특성·모든 기술/도구와의 상호작용, 신규 메가8폼 실이미지는 남는다. 최신 잔량은 `REMAINING_IMPLEMENTATION_CURRENT.md`이며 원본 비활성 콘텐츠를 켜지 않는다.

## 최종 결과

일반 전체790/790(181.2초), 지가르데/팔레트 집중20/20, 타입·production빌드·diff 검사를 통과했다. 변경 backend/test lint 오류0·기존 classicDancingEligible 경고1이다. BattlePanel의 기존 진단36오류/10경고는 증가하지 않았다. 실제 브라우저 touch40/40, 이전 부화/정보/대사/선택11경로와 울트라볼·보상6경로를 재검사해 통과했다. 근거는 /tmp/zygarde-release-full.log, /tmp/zygarde-release-type.log, /tmp/zygarde-release-build.log, /tmp/zygarde-release-lint.log, /tmp/zygarde-front-lint.json, /tmp/zygarde-release-browser-regression.log, /tmp/zygarde-release-beast-browser.log이다.

Worker 정책 전체도790/790(157.2초) 통과했다(`/tmp/zygarde-release-worker.log`). 마지막 코드 뒤에는 문서만 갱신했다. 검증한 코드와 문서를 승인된 cloud/pokerogue-continue-20261105 브랜치에 일반 push하고 원격 SHA를 확인한다.
