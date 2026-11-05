# 호출된 충전 공격의 FOLLOW_UP 상태·기록 경계

사용자의 사용량 절약 지시에 따라 R5의 표준/Worker74개 통과 묶음 이후, 확인된 충전 후속 오류만 보완했다. 새 일반 구현이나 자연 플레이 반복은 시작하지 않았다. 원본은 `7c0881255af5cd51992e513ff93c2f71adbe40e0`다. 제품 변경은 기존 called-move helper와 root에게 허용받은 engine의 마비/얼음 BeforeMove 가드 두 곳이다. Sites·운영 데이터·원격 Git·commit 작업은 이 담당자가 수행하지 않았다.

## 확인한 문제와 수정

원본 `CallMoveAttr.apply`는 FOLLOW_UP으로 호출하고, `MoveChargePhase.end`는 이 모드를 다음 턴 공격에도 유지한다. `MovePhase.followUpMoveFirstFailureCheck`는 Heal Block·Throat Chop·Gravity를 확인하며 일반 첫 검사에 있는 수면/얼음/혼란/마비를 수행하지 않는다. 수면 및 혼란의 남은 횟수도 그 검사에서 감소하므로 후속 공격에서는 그대로여야 한다. FOLLOW_UP은 PP를 추가 소비하지 않으며 Instruct의 최근 정상 기술로 취급하지 않는다.

기존 잠꼬대 충전2종 보완만으로는 Metronome 등 다른 호출자가 충전한 공격이 다음 턴 native 수면/상태 검사에 막혔다. 또한 native는 충전 해제를 일반 runMove로 실행하므로 정상 기록이 충전 기술로 덮이면 Instruct가 원본과 달리 호출된 Razor Wind를 다시 사용할 수 있었다.

- 전투별 `rogueCalledMoveRelease(pokemon, move)`는 twoturnmove의 기술 ID, 이미 저장된 원래 호출자 sourceEffect, 원본 등록/호출 후보 허용을 모두 확인한다. 불일치·미확인 호출자는 제외한다. 새 저장 필드를 추가하지 않는다.
- 확인된 후속 해제에서만 전투별 slp/frz/confusion BeforeMove를 건너뛴다. engine의 기존 원본 마비·얼음 콜백 두 곳에도 같은 가드를 추가한다. 상태 효과·속도·다른 이벤트를 지우거나 일반 행동의 상태 검사를 풀지 않는다.
- 후속 해제는 Mirror용 최근 기술을 갱신하지만 정상 기록은 원래 caller로 유지한다. 이전 기록이 없는 snapshot도 실제 저장된 최근 정상 기술/호출자만 사용한다.
- Heal Block·Throat Chop·Gravity와 직접 선택한 일반 충전의 수면 검사는 유지한다. legacy/무표시 전투에는 새 함수/조건 facade가 설치되지 않는다.

## 집중 검증과 기존 회귀

신규 `tests/rogue-called-charge-followup.test.mjs`6개:

1. 실제 Metronome→Solar Beam 충전→상대 Hypnosis→codec→다음 공격. 새 규칙은 공격·수면 카운터 유지·PP[9,10], legacy는 기존 수면 취소/카운터 감소 유지.
2. 충전 후 마비/얼음/혼란을 저장·복구하고 각각의 취소 난수를 고정. 새 규칙은 실제 공격과 얼음/혼란 카운터·자기 HP 보존, legacy는 기존 취소/카운터 감소/혼란 자해 유지.
3. Metronome→Razor Wind 충전 후 codec→해제→Instruct. 기록을 유지한 저장과 기록 추가 전 저장 모두 정상 기록은 Metronome, Mirror 기록은 Razor Wind다. Instruct 추가 반복·새 충전·추가 PP가 생기지 않는다.
4. 실제 호출 Recover의 Heal Block, Hyper Voice의 Throat Chop, Fly 충전 이후 Gravity가 각각 유효하다.
5. 직접 고른 Solar Beam은 새 규칙에서도 codec 뒤 수면으로 취소되고 수면/PP의 기존 경계를 유지한다.
6. 불일치 기술·미확인 호출자·원본에서 해당 기술을 부를 수 없는 호출자에는 FOLLOW_UP 우회를 적용하지 않는다. 다른 슬롯·탐험·재화도 codec 경계에서 보존한다.

신규6개와 기존74개를 합쳐 표준 Node **80/80**(약5.49초), Worker loader **80/80**(약5.44초) 통과했다. 변경 제품/검사3파일 ESLint 오류/경고0, diff 공백 검사 통과. 로그는 `/tmp/called-charge-followup-final-focus.log`, `/tmp/called-charge-followup-final-worker.log`, `/tmp/called-charge-followup-initial-lint.log`다. 정책 snapshot은 R5 이후 변경하지 않았으며 당시 원본 재생성 비교가 통과했다. 전체 통합 검사는 root 담당이다.

## 남은 범위와 인계

이 묶음은 수면·마비·얼음·혼란과 최근 정상/FOLLOW_UP 기록의 확인된 차이를 해결한다. 대표 실제 조합은 Metronome과 기존 Sleep Talk 충전2종이다. Copycat/Mirror Move/Assist의 모든 충전·폼·상태 조합 전수 검증은 하지 않았다.

정적 대조에서 남은 차이 후보는 후속 해제 시 flinch/Truant/infatuation/disable 등 다른 native 첫 검사와 원본 FOLLOW_UP의 차이다. 아직 실제 재현·정책별 영향 검증을 하지 않았으므로 해결됐다고 표시하지 않는다. 특수 대상 소실·반복 큐·일반 기술의 실패 시점 및 원본 PRNG 동등성도 별도다. 실계정/실기기·운영 배포·409/PC지연은 이번 검증 범위가 아니다.

제품은 이 시점에서 고정한다. 다음 담당자는 `docs/BATTLE_CALLERS_SOL_HANDOFF_20261105.md`를 먼저 읽고 일반 구현을 이어갈 수 있다.
