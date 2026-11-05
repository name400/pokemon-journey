# Copycat·Sleep Talk·Assist 원본 호출 제한 연결

원본 `7c0881255af5cd51992e513ff93c2f71adbe40e0`과 native `@pkmn/sim 0.10.12`를 대조했다. 아직 배포하지 않은 `calledMoveRule: source-pool-v1` 범위에서 Metronome 다음으로 세 호출기의 명시적 후보 정책을 연결했다. 기존 무표시 도전에는 적용하지 않는다. 제품 변경은 기존 `lib/rogue-called-move-policy.mjs`, 생성 snapshot과 audit script에 한정한다. 공통 engine/state·Sites·운영 저장·Git 원격·commit은 이 담당자가 변경하지 않았다.

## 원본 근거와 차이

원본 `src/data/moves/invalid-moves.ts`의 금지 목록은 Copycat40개, Sleep Talk32개, Assist48개다. `CallMoveAttrWithBanlist.isMoveAllowed`는 여기에 NONE·미구현86개·challenge 제한을 적용한다. `RandomMovesetMoveAttr.getEligibleMoves`는 잠꼬대에서 자기 moveset을, 조수에서 자기 자신을 제외한 파티 moveset을 사용하며 중복 기술을 유지한다. PP0·기절한 동료를 별도로 제외하지 않는다. Hardcore의 기술 제한은 Revival Blessing이며 원본 challenge 훅과 함께 적용한다.

native는 각 기술의 failcopycat/nosleeptalk/noassist 플래그를 기준으로 삼아 원본과 다른 허용/금지 조합이 있다. 예를 들어 원본은 Copycat·Assist의 Thief를 허용하고 native는 막는다. 원본 Sleep Talk은 Chatter를 허용하지만 native는 막는다. 반대로 native가 시도할 수 있는 Mirror Coat(Copycat 금지)나 Recycle/Fling 등의 원본 미구현 기술은 호출하면 안 된다.

생성된 snapshot은 원본이 허용하는 native 플래그 예외를 Copycat13개·Sleep Talk9개·Assist9개로 고정한다. runtime은 원본 enum 등록·미구현·호출기별 금지·Hardcore를 검사하고, **확인한 예외 ID에 한해서만** native 플래그 제한을 해제한다. 알 수 없는 기술이나 native Z/Max를 일괄 허용하지 않는다. Copycat의 기존 Max→기본 기술 처리와 잠꼬대의 native 수면/Comatose `onTry`를 유지한다. 빈 후보는 추첨하지 않고 정상 실패한다. 조수는 원본의 현재 파티에 없는 방출/포획 표시 개체를 제외한다.

## 잠꼬대의 충전 후 수면 경계

원본 Sleep Talk 금지 목록에는 Meteor Beam·Electro Shot이 없으며 두 기술 모두 구현되어 있다. 원본 `MovePhase.chargeMove`와 `MoveChargePhase.end`는 호출의 FOLLOW_UP 사용 모드를 다음 턴 충전 해제에도 보존한다. `isIgnoreStatus`와 `isIgnorePP`에 따라 후속 단계에서 수면 검사·수면 카운터·PP를 건너뛴다.

native의 charge 제한만 해제하면 다음 턴 실제 수면으로 공격이 막혔다. codec 복구 후 피해0·수면 카운터4→3을 재현했다. native는 충전 volatile의 `sourceEffect.sourceEffect`에 원래 호출자 `sleeptalk`을 이미 저장한다. 이 값, 해당 기술 ID, 현재 twoturnmove가 모두 일치하는 두 기술의 후속 타격에만 전투별 slp Condition이 native 수면 검사를 건너뛴다. 새 저장 필드가 필요하지 않다. 실제 복구 후 두 기술 모두 피해가 발생하고 수면 카운터4·PP[9,10]이 그대로였다.

직접 선택한 일반 충전 기술, 다른 수면 행동, legacy 전투와 전역 slp Condition은 유지한다. 비가 내리는 Electro Shot 등 기존 native의 충전/공격 처리 자체를 다시 구현하지 않는다. 다른 호출기·다른 상태이상의 모든 FOLLOW_UP 규칙이 원본과 같다는 주장은 아니다.

## 검증 범위

신규 `tests/rogue-called-move-restrictions.test.mjs`12개는 다음을 검사한다.

- 세 호출기 전체 금지·미구현 목록, unknown/Z/Max·Hardcore 차단과 명시적 예외 경계.
- 실제 상대가 사용한 Thief의 Copycat 복사와 legacy 거부, 2턴 codec 이후 PP 보존.
- Copycat의 Mirror Coat·Recycle·Fling·Ally Switch 차단과 native 차이.
- 실제 잠꼬대 Chatter, 깨어 있을 때 실패/Comatose/실제 수면 조건, 빈 후보·미구현 제외·PP0 기술 호출.
- 두 충전 기술의 실제 충전→codec→타격, 특공 상승·수면 카운터·호출자/호출 기술 PP, 일반 충전에서 수면 실패 유지.
- 실제 조수 Thief, 동료의 PP 보존, 반복 codec, 기절·PP0 동료 및 중복 가중치, 방출/포획 동료와 빈/미구현 후보 제외.
- 적 측 잠꼬대·조수와 전역/legacy slp 격리.
- 명시적으로 허용한 native 플래그 예외31개 전부를 실제 해당 호출기로 시도한 뒤 즉시 native snapshot/복구.

기존 Metronome RNG/log 동일성 검사에는 `Date.now`를 고정해 초 경계의 native `|t:|` 로그만 달라지는 flake를 제거했다. PRNG·HP·PP·전체 로그 비교는 유지한다. 다른 슬롯·탐험·재화 보존은 codec 경계에서 확인한다.

신규12개와 기존49개를 합쳐 표준 Node **61/61**(약14.68초), Worker runtime loader **61/61**(약13.88초) 통과했다. 소유 JS4파일 ESLint 오류/경고0, 원본에서 재생성한 snapshot 파일 비교와 diff 공백 검사 통과. 로그는 `/tmp/called-restrictions-final-focus.log`, `/tmp/called-restrictions-final-worker.log`, `/tmp/called-restrictions-final-lint.log`다. 전체 통합 검사는 root가 수행한다.

## 남은 구현과 별도 검증

원본 eligibility 정책은 위 세 호출기 범위에서 연결했다. 남은 실제 대조는 Mirror Move·Instruct·다른 호출기, 최근 기술의 기록/실패 시점과 특수 대상 소실, 모든 FOLLOW_UP 상태·폼·패시브·추가 연타 조합, 원본 PRNG 알고리즘/호출 순서다. 예외31개와 Metronome 추가219개의 즉시 실행/복구 안전성만으로 모든 효과의 원본 동등성을 주장하지 않는다.

실계정·실기기·운영 배포 후 검증은 별도이며, PC 지연과 운영 409의 원인은 이번 전투 규칙 작업에서 확인하지 않았다.
