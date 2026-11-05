# 전투 규칙 지원 대조 목록

원본 `7c0881255af5cd51992e513ff93c2f71adbe40e0`의 MoveId와 앱의 `@pkmn/sim 0.10.12` 및 전투별 보정 자료를 대조한 **범위별 목록**이다. 전 기술 효과의 원본 동등성 전수 완료를 뜻하지 않는다. 새 규칙은 기존 저장의 명시적 버전 경계를 유지한다.

## native 가용성과 앱 보정의 구분

| 조사 대상 | 확인된 수량 | 해석 |
| --- | ---: | --- |
| 원본 양수 MoveId | 920 | NONE 제외 |
| 별칭 정규화 후 native Move 존재 | 920 | 메타데이터 존재 여부이며 효과 동등성 검사가 아님 |
| 고유 native 기술 ID | 902 | Z기술의 물리/특수 원본 ID가 native 단일 기술로 합쳐짐 |
| 이름 별칭 정규화가 필요한 항목 | 37 | Z기술 36개 + TEN_MILLION_VOLT_THUNDERBOLT |
| 정규화 후 원본 번호와 native num 불일치 | 18 | Z기술 특수 변종의 별도 번호; 기술 자체의 미구현으로 세지 않음 |
| native nonstandard 표기가 있는 원본 항목 | 235 | Past/Unobtainable 등. customgame에서의 사용 가능성과 호출 후보 정책은 별도 |
| 앱 수치 보정 v1 | 13 | `classicMoveBalance` |
| 앱 수치 보정 v2 총수 | 28 | v1 포함 `classicMoveBalanceV2` |
| 앱 플래그 보정 | 11 | `classicMoveFlags` |
| 수치/플래그 보정 합집합 | 39 | 나머지 기술을 검증 완료로 세지 않음 |

별칭 규칙은 `__(PHYSICAL|SPECIAL)` 접미사를 제거하고 소문자/밑줄 제거, 10,000,000 Volt Thunderbolt만 native `10000000voltthunderbolt`로 연결한다. source/native 목록의 단순 문자열 차이 37개를 미구현 기술 37개로 보고하지 않는다. 반대로 존재하는 920개를 모두 원본과 같다고 보고하지 않는다.

재현은 `node scripts/audit-rogue-called-moves.mjs /workspace/pokerogue-reference /tmp/rogue-called-moves-inventory.json`으로 수행한다. 원본 체크아웃의 커밋을 먼저 확인하고 원본 등록 체인·금지 목록을 TypeScript AST로 읽으며 제품/운영 자료를 바꾸지 않는다. 원본의 미구현 86개와 Metronome 금지 43개를 제외하면 후보 794개, native 후보는 581개다. 원본에만 219개, native에만 6개이며 후자(Ally Switch, Corrosive Gas, Fling, Magic Room, Recycle, Wonder Room)는 원본 미구현이다. 이 수량은 challenge 제한 전 후보 정책 대조이고, 각 기술의 효과·난수 동등성·실제 획득 가능성을 뜻하지 않는다.

## 완료한 실제 전투 경로

| 단위 | 버전 경계 | 구현·검증 범위 | 남은 범위 |
| --- | --- | --- | --- |
| 스텔라 지연 공격 이력 | adaptabilityRule v2 | Future Sight/Doom Desire의 예약·실제 타격 구분, 면역·기절·벤치 공격자·codec, Metronome 호출 | 모든 지연/소실/폼/연타 조합 전수 아님 |
| Nature Power | 새 naturePowerRule v1 | 원본 35 바이옴+4지형, 플레이 명령·적·더블·codec·실제 호출 타입/플래그 | 다른 호출 기술의 원본 조건/후보 정책 |
| 호출 기술의 전투별 데이터 | 기존 moveBalance v1/v2 또는 moveFlag v1 | 문자열 useMove/runMove 정규화, 실제 Metronome/Sleep Talk/Copycat/Dancer, PP·후크 중복·객체/전역 격리·codec | 객체로 들어오는 미대조 호출기, 후보 선택·실패·대상 규칙 |
| Metronome 후보 정책 | 새 calledMoveRule v1 | 원본 794후보·미구현86/금지43 제외, 추가219개 실제 호출/즉시snapshot 복구, 적·더블·Hardcore·PP·연타·codec 이후 다음 RNG | 원본 PRNG 동등성 및 모든 효과/장기 조합 검증 |
| Copycat/Sleep Talk/Assist 후보 정책 | 같은 미배포 calledMoveRule v1 | 호출기 금지40/32/48·미구현86·Hardcore·native예외31개, SleepTalk 충전2종 후속수면/PP·codec, Assist중복/기절/PP0/제거동료 | 최근 기술 기록/실패 시점·다른 FOLLOW_UP 상태/대상 조합 |
| Mirror Move/Instruct 정책·기록 | 같은 미배포 calledMoveRule v1 | 금지69/53·명시예외113/13, 정상/FOLLOW_UP 기록·Dancer/반사구분·교체/codec, Instruct슬롯/PP·RazorWind조기해제, 실패Mirror후Copycat 전역기록 | 모든 FOLLOW_UP 충전/상태 및 특수 대상/큐 조합 |
| 충전 FOLLOW_UP 확인된 상태·기록 | 같은 미배포 calledMoveRule v1 | Metronome충전→수면/마비/얼음/혼란→codec→공격/카운터/PP, 정상기록보존·Instruct재호출방지, 직접충전legacy 및HealBlock/ThroatChop/Gravity 유지 | 다른 첫 검사·모든호출자/폼 조합 전수검증 |

각 근거는 `STELLAR_DELAYED_CALLED_QA_20261105.md`, `NATURE_POWER_AND_CALLED_MOVE_DATA_QA_20261105.md`, `METRONOME_SOURCE_POOL_QA_20261105.md`, `CALLED_MOVE_RESTRICTIONS_QA_20261105.md`, `MIRROR_MOVE_INSTRUCT_QA_20261105.md`와 해당 집중 검사 파일에 있다. 원본 CallMoveAttr 등록6종과 Instruct1종의 명시적 정책은 모두 연결했다. 공통 전투 엔진의 다른 특성/기술/도구 목록을 이 표에서 임의로 완료 처리하지 않는다.

## 다음 대조 우선순위

1. **호출 후 충전/상태 경계**: 원본 활성 호출6종+Instruct1종의 명시적 정책 연결과 확인된 충전해제 수면/마비/얼음/혼란·기록 오류는 해결했다. flinch/Truant/infatuation/disable 등의 정적 차이 후보는 실제 재현 전이며, 모든 호출자/폼 조합과 실패 시점/대상 검증은 별도다. `CALLED_CHARGE_FOLLOWUP_QA_20261105.md`, `BATTLE_CALLERS_SOL_HANDOFF_20261105.md` 참고.
2. **추가 연타 및 타입 변경**: 기존 MultiLens/Parental Bond/스텔라 보너스의 자연 다단히트·호출·특수 피해 조합을 원본 순서와 비교한다. 테스트 존재만으로 모든 조합을 완료 처리하지 않는다.
3. **호출 실패/대상 소실 경계**: Instruct/Assist/Mirror Move 등의 금지·대상·PP·추가 발동과 저장 복구. 별도 재현에서 차이가 확인된 항목부터 수정한다.
4. **native의 원본 재정의 여부**: native에 있는 기술·특성·도구도 원본 수치/플래그/성공 조건이 다를 수 있다. 실제 게임에서 사용할 수 있는 범위와 조합을 우선한다.

실기기/실계정 검증은 위 구현 목록과 별개로 남는다. 이번 담당자는 Sites·운영 저장·원격 Git·commit 작업을 수행하지 않았다.
