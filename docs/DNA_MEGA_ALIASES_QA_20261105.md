# 2026-11-05 남은 메가8폼의 융합·변신 연결

기준 `75402726dc4c33200e0fcc6dc06fd364d1035581`. 원본은 `7c0881255af5cd51992e513ff93c2f71adbe40e0`, native simulator는 기존 `@pkmn/sim`0.10.12다. Sites는 사용자가 관리하며 이 작업은 코드·검증·승인된 GitHub 브랜치 저장만 수행한다.

## 구현 범위

| 원본 폼 | native 연결 | 처리 |
| --- | --- | --- |
| Absol mega-z | absolmegaz | 로컬 Mega 분류 |
| Garchomp mega-z | garchompmegaz | 로컬 Mega 분류 |
| Lucario mega-z | lucariomegaz | 로컬 Mega 분류 |
| Meowstic mega | meowsticmmega / meowsticfmega | 성별 연결·원본의 성별 조건 해제 |
| Magearna mega-original | magearnaoriginalmega | 이름 순서·로컬 Mega 분류 |
| Tatsugiri mega-curly / mega-droopy / mega-stretchy | tatsugiricurlymega / tatsugiridroopymega / tatsugiristretchymega | 이름 순서·로컬 Mega 분류 |

8개 원본 폼이며 냐오닉스 암수로 native 외형은9개다. 이 native 자료는 `isMega`가 비어 있어 기존 분류에서 빠졌다. 대응을 명시적으로 제한하고 종족 이름·원본6능력치 일치를 확인한다. 필요한 Mega 플래그는 새로운 Species 사본에만 붙인다. 공유 Dex는 바꾸지 않으며 전투의 source stats 사본을 재구성할 때도 이 분류를 유지해 저장/다음 턴에 플래그가 사라지지 않는다. 메가 주체의 다이맥스·테라스탈·Z 선택 제한도 유지한다.

능력치·타입·기본 특성은 원본 폼 자료를 사용한다. 특히 싸리용 메가의 원본 기본 특성은 마중물이다. native 자료의 기본 사령탑을 그대로 쓰지 않고 source ability를 전달한다. 실제 전투에서 부유의 땅 면역, 오라가드의 접촉 피해 감소, 예리함의 베기 위력도 비교했다. 이것이 모든 기술·특성 상호작용의 전수 동등성을 뜻하지는 않는다.

원래 색 마기아나·축 늘어진 모습/쭉 뻗은 모습 싸리용의3일반 폼도 원본의 기본 능력치·타입과 일치하는 범위에서 양쪽 융합과 역변신을 허용한다. 기존60→63일반 비기본 폼, 지속 폼131→139(Mega96/Gmax33/Primal2/Ultra1/종족결합6/우라오스1), 합계 **202폼 항목의 DNA 수치·저장·전투 지원**이다. 종수나 이미지 완성 개수가 아니다.

## 성별·도구·저장 보존

원본 `generation-06.ts`의 냐오닉스 역변신은 item-inactive와 `SpeciesDefaultFormMatchTrigger`의 compound다. 이 정확한 모양만 파싱해 암컷을 수컷으로 되돌리는 합성 reverse를 만들지 않는다. 알 수 없는 compound trigger나 성별은 허용하지 않는다. 원래 색/싸리용 모습과 암수의 원본 개체 ID도 허용되는 item 전환의 parent로 확인한다.

검증된 일반 폼의 명시적 native ID와 기존 빈 legacy ID를 모두 허용하되 임의 ID는 계속 거부한다. 기존 standalone Mega-Z의 누락된 Mega 플래그나 냐오닉스 암컷의 옛 수컷 alias는 로딩 시 일괄 덮어쓰지 않는다. 불명확한 상태의 융합은 거부하고, 보유한 도구로 명시적으로 해제·재변신하면 올바른 폼으로 돌아와 융합할 수 있는 경로를 검사했다. 특히 옛 암컷/수컷 alias 불일치에는 전투 중 새 Mega 분류를 강제하지 않아, 진행 중인 단일 타입 챌린지의 기존 출전 판정이 다음 턴에 막히지 않는 경계를2턴으로 검사했다. 불명확한 옛 상태의 모든 메가 제한을 소급 완성한 것은 아니다.

실제 `classicGameView` 보상 후보·선택과 두 번째 개체 소모, 양쪽 역할, 융합 전/후 변신, 파티 해제·분리, 원본 특성 복구, 저장 codec·다음 native 턴을 연결했다. 기증자를 분리로 되살리지 않는다. 폼 도구의 기증자→주체 소유권 이전을 유지하며 known item은98→103키다. 일반 회귀는137폼별 전환/해제 경로를 검사하고, 냐오닉스 암컷 분기는 별도9외형 검사에 포함한다. 다른 슬롯·탐험·재화는 보존한다.

## 이미지와 미완료 구분

색/모습3폼의 팔레트 메타데이터는 기존 생성기로 원본 form key에서 다시 만들었다. 첫 전체 검사에서 이 파일의 drift를 발견했고 갱신 후 다시 검사한다. 메가8폼의 실제 front/back·이로치·성별·융합 합성 이미지를 새로 확보하거나 검증한 것은 아니다. 원본 asset URL 조회는 이 환경에서 `fetch failed`로 끝났으며 반복 우회하지 않았다. 기존의 검증된 이미지/사용 불가 fallback을 유지한다. 이미지 메타데이터가 생성됐다는 것과 실제 자산 다운로드·표시 성공은 구분한다.

## 검증 기록

- 신규 집중 검사5개: 9외형×양쪽 역할의 실제 보상·저장·전투·분리, 9외형의 융합 후 변신/해제, 잘못된 성별·수치·native ID와 legacy 복구, standalone 복구, 특성 피해 비교. 팔레트 회귀와 함께 **14/14** 통과.
- 기존 지속 폼/일반 폼/메가 집중 **22/22** 통과. 폼별 항목 수는 테스트에서139/63으로 검증한다.
- 타입 검사와 production build 통과. 변경 백엔드·테스트 린트 오류/경고0.
- production 빌드를 localhost Wrangler Worker와 분리된 합성 D1 저장으로 실행했다. 암컷 냐오닉스 메가 융합과 쭉 뻗은 싸리용 메가 융합에서 GET/POST 총10요청이200이며 각2턴·GET 복구 후 성별/native ID/Mega 플래그/기증자 보존과 특수 선택 차단을 확인했다. 첫 GET233ms, POST29–48ms로 운영 측정과 구분한다. 운영 사용자 저장은 사용하지 않았다.
- 초기 전체 검사는 팔레트 생성물 drift 1건으로 실패했다. 생성기를 실행해 원본 폼 메타데이터를 갱신하고 전체 검사를 다시 수행했다.

남은 실제 구현은 지가르데의 Complete 중간형·10% Complete와 자동 변형, 다른 자동 폼·복잡한 진화/도구/이벤트, 전체 전투 효과의 원본 차이다. 별도 검증은 신규 실제 이미지·모바일/실기기·운영 저장·200층 자연 플레이 및 앞선 메모리/중복 연출 수정의 배포 후 확인이다. 최신 목록은 `REMAINING_IMPLEMENTATION_CURRENT.md`를 따른다.

최종 확정: 마지막 legacy 분류 보호 변경 후 일반 전체 **770/770**(161.5초), Worker 데이터 정책 전체 **770/770**(144.6초), 최종 집중 **20/20**(4.2초). 타입·production 빌드·변경 린트(오류/경고0)·diff 검사 통과. 근거는 `/tmp/mega-alias-final-full.log`, `/tmp/mega-alias-final-worker.log`, `/tmp/mega-alias-legacy-focus.log`, `/tmp/mega-alias-final-type.log`, `/tmp/mega-alias-final-build.log`, `/tmp/mega-alias-final-lint.log`, `/tmp/mega-alias-worker-http.json`이다. 신규 실계정·실기기·실제 이미지·Sites 배포 검증은 하지 않았다.
