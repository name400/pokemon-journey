# Sol 인계: 호출 기술 전투 규칙

사용자는 사용량 절약을 위해 필요한 오류 분석을 마치면 Sol High로 일반 구현을 이어가기로 했다. 현재 담당자는 R6의 확인된 FOLLOW_UP 상태/기록 오류까지만 보완하고 제품 수정을 중단했다. 이 문서는 재현 근거와 미완료를 전달하며 추가 모델/운영 권한을 부여하지 않는다. Git 원격 저장은 root가 승인 범위에서 관리하고 Sites는 사용자가 별도 Work에서 관리한다.

## 현재 제품과 검증

- `lib/rogue-nature-power.mjs`: 원본35바이옴·4지형. 새 `naturePowerRule: source-biome-v1`만 적용.
- `lib/rogue-move-balance.mjs`: 기존 수치/플래그 규칙에서 문자열 useMove/runMove를 현재 전투 Dex로 정규화. 실제 호출·Dancer에서도 원본 위력/플래그 적용. 입력 ActiveMove·중복 설치·전역 격리 보존.
- `lib/rogue-called-move-policy.mjs` + `data/rogue-called-move-policy.json`: 아직 미배포인 `calledMoveRule: source-pool-v1`의 전투별 정책. Metronome794후보, Copycat/Sleep Talk/Assist/Mirror Move/Instruct 금지·미구현·명시적 native 예외. 정상/FOLLOW_UP 기록은 기존 Pokemon.m snapshot에 작은 기술 ID 두 개로 저장하고 재출전 시 초기화한다.
- `lib/rogue-battle-engine.mjs`: root가 rule 복사·설치 연결을 담당했다. R6에서 허용받아 기존 마비/얼음 BeforeMove 두 콜백에 `this.rogueCalledMoveRelease?.(pokemon,move)` 가드만 추가했다(마비 콜백 인자도 target/move 추가). AI 등 다른 공통 영역을 임의 수정하지 않았다.
- `scripts/audit-rogue-called-moves.mjs`: pinned 원본 SHA/등록파일 clean을 확인하고 AST에서 정책 사실을 생성한다. `node scripts/audit-rogue-called-moves.mjs /workspace/pokerogue-reference /tmp/inventory.json /tmp/policy.json` 후 정책 snapshot과 비교할 수 있다. 별도 원본 checkout이 필요하다.

원본 `src/data/moves/move.ts`의 활성 CallMoveAttr 계열 등록6종(Metronome/Mirror Move/Sleep Talk/Nature Power/Assist/Copycat)과 RepeatMoveAttr의 Instruct1종은 모두 명시적 정책 어댑터가 있다. Me First/Snatch는 원본 미구현이며 활성화하지 않았다. 등록/가용성은 모든 효과의 원본 동등성과 다르다.

최종 집중 검증은 표준/Worker 각각 **80/80**이다. 변경 파일 ESLint와 diff 검사도 통과했다. R5 정책 snapshot 재생성 비교 통과, R6는 snapshot 데이터 변경 없음. 전체 통합 회귀/타입/빌드 및 Git checkpoint는 root가 관리한다. 검사를 다시 실행하려면 다음9파일을 Node와 Worker loader로 한 번씩 검사하면 된다.

`rogue-called-charge-followup`, `rogue-mirror-instruct`, `rogue-called-move-restrictions`, `rogue-called-move-policy`, `rogue-called-move-data`, `rogue-nature-power`, `rogue-stellar-adaptability`, `rogue-stellar-delayed-called`, `rogue-multilens` (`tests/*.test.mjs`).

## 구분해서 이어갈 잔량

1. **실제 확인된 오류는 해결:** Metronome 호출 Slash의 Mirror Move 실패, Dancer/반사의 기록 덮임, 실패 Mirror Move 뒤 Copycat 전역 기록, Instruct 슬롯 필수/Chatter 반복/Razor Wind 조기 해제, 호출된 충전 해제의 수면·마비·얼음·혼란 및 정상 기록 오염.
2. **정적 차이 후보, 아직 미재현:** 원본 FOLLOW_UP은 일반 첫 검사의 flinch/Truant/infatuation/disable 등을 건너뛴다. 현재는 확인된 네 상태만 보완했으므로 해당 pending charge 조합을 합성 저장/실제 엔진에서 먼저 재현하고, Heal Block/Throat Chop/Gravity는 계속 유효하게 유지해야 한다. 복잡한 분석은 root와 먼저 조율한다.
3. **다른 미대조:** Copycat/Mirror Move/Assist의 모든 충전·특수 폼·패시브 조합, 특수 대상 소실/반복 큐, Instruct의 준비 중 특수 기술/native Dynamax guard와 원본 조건 차이. 일반 기술의 모든 실패 시점은 새로 구현하지 않았다.
4. **의도적으로 미완료인 동등성:** source randBattleSeedInt와 native PRNG의 알고리즘·호출 순서. 새 규칙은 후보 정책 및 snapshot 이후 결정성을 검증했으며 같은 seed의 원본 결과 일치를 주장하지 않는다.
5. **검증만 남은 사항:** 이번 범위의 실기기/실계정과 배포 후 검증. 원격 운영409와 PC지연의 원인/해결을 이 전투 규칙 결과로 단정하지 않는다.

상세 근거는 `STELLAR_DELAYED_CALLED_QA_20261105.md`, `NATURE_POWER_AND_CALLED_MOVE_DATA_QA_20261105.md`, `METRONOME_SOURCE_POOL_QA_20261105.md`, `CALLED_MOVE_RESTRICTIONS_QA_20261105.md`, `MIRROR_MOVE_INSTRUCT_QA_20261105.md`, `CALLED_CHARGE_FOLLOWUP_QA_20261105.md`에 있다. 작업을 이어갈 때 기존 flag 없는 저장·다른 슬롯·탐험·재화를 보존하고 공유 파일 소유를 root와 조율한다.

## 후속 검증

이후 FOLLOW_UP의 풀죽음·헤롱헤롱·사슬묶기·게으름(일반/패시브)·도발·봉인 차이를 실제 호출 후 충전과 codec 복구로 재현해 수정했다. 직접 선택한 충전 기술은 기존 판정을 유지하고 회복봉인·목막힘·중력은 기존 제한을 유지한다. 관련 일반·Worker 각 96/96, 타입 검사·빌드 통과. 전체 대상 소실·특수 폼·원본 난수 순서 동등성은 여전히 미완성이다.
