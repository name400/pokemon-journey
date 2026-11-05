# Mirror Move·Instruct의 원본 기록과 호출 제한

원본 `7c0881255af5cd51992e513ff93c2f71adbe40e0`, native `@pkmn/sim 0.10.12` 기준이다. 아직 배포하지 않은 `calledMoveRule: source-pool-v1`의 helper/data/audit와 집중 검사만 확장했다. 공통 engine/state·Sites·운영 저장·Git 원격·commit 작업은 이 담당자가 변경하지 않았다.

## 실제 재현과 구현

### Mirror Move

원본 `CopyMoveAttr`는 Mirror Move에서 `target.getLastNonVirtualMove(false, false)`를 사용한다. `Pokemon.getLastNonVirtualMove`의 두 번째 인자 false는 FOLLOW_UP을 포함하고 Dancer의 INDIRECT·반사는 제외한다. native는 `target.lastMove`만 조회한다. 실제 상대가 Metronome으로 Slash를 호출한 다음 Mirror Move를 쓰면 native는 `lastMove=metronome`을 읽어 실패했다. 실제 호출 기록인 `lastMoveUsed=slash`를 사용해야 하는 차이를 확인했다.

lastMoveUsed도 Dancer·반사에 덮일 수 있어 단순 치환하지 않는다. 전투별 `BeforeMove`에서 외부/Dancer를 제외한 정상 시도를 기록하고, 전투별 useMove wrapper에서 확인된 원본 활성 호출기 여섯 종류의 FOLLOW_UP만 Mirror용 기록을 갱신한다. 기존 Pokemon.m snapshot에 `rogueCalledHistory: {normal, mirror}`라는 기술 ID 두 개만 보존한다. 정상 시도가 수면 등으로 취소돼도 원본 실패 moveHistory와 같이 최신 정상 시도가 된다. 실제 재출전에서는 초기화한다. 이 기록이 없는 이전 snapshot은 native lastMove/확인된 FOLLOW_UP lastMoveUsed로 복구하며 과거에 이미 덮인 기록을 추정해 만들지는 않는다.

원본 Mirror Move 금지69개·미구현86개·등록/Z/Max/challenge 제한을 적용하고, source 허용이 확인된 native mirror 플래그 예외113개만 허용한다. 원본이 허용하는 Roost 같은 자기 대상 기술은 실제 호출 기술의 native 대상 처리로 자신에게 적용한다. 전역 Dex를 수정하지 않는다.

### Instruct

원본 `RepeatMoveAttr.getCondition`은 FOLLOW_UP을 제외한 최근 기술, 실제 현재 moveset 슬롯, PP>0, 원본 금지53개를 요구한다. native는 슬롯이 없을 때도 반복 행동을 큐에 넣는 차이가 있었다. 원본 정상 기록과 실제 슬롯을 확인하고 native 큐/PP/행동 처리기를 사용한다. 기존 native Dynamax 및 준비 중인 특수 기술의 보호 조건도 보존한다. 명시적으로 허용된 native failinstruct 예외는13개다.

원본은 Razor Wind를 Instruct 금지에 넣지 않는다. 실제 더블에서 아군이 Razor Wind를 충전하고 Instruct를 받으면 같은 턴에 타격해야 한다. source `MovePhase.useMove`는 공격 단계에서 CHARGING을 제거한다. native는 조기 해제 뒤에도 twoturnmove 기간이 남을 수 있어, 해당 source 예외의 실제 공격이 충전 태그를 제거한 뒤 소모된 잠금만 정리한다. 첫 충전은 유지하고, 다음 턴에 불필요한 재충전/PP 소비가 생기지 않게 한다. 다른 충전 기술을 일괄 허용하지 않는다.

### 실패한 복사 기술과 전투 전체 최근 기록

추가 실제 더블 재현: 지난 턴 Splash→새로 교체한 상대에게 Mirror Move 실패→이어지는 Copycat이 native에서 실패했다. native가 실패한 Mirror Move 자체를 전투 lastMove에 넣기 때문이다. 원본 `MovePhase`는 CopyMoveAttr(Mirror Move/Copycat) 자체로 전투 lastMove를 갱신하지 않는다. 전투 인스턴스의 clearActiveMove에서 이 두 caller만 이전 lastMove를 보존한다. 실제 중첩 호출된 기술은 native의 기존 기록을 그대로 사용한다. 원본 PRNG나 다른 기술의 모든 실패 시점 전체를 새로 구현한 것은 아니다.

## 검증

`tests/rogue-mirror-instruct.test.mjs`13개:

- Mirror Move69·Instruct53 전체 금지, 원본 미구현86·등록/Z/Max/challenge 경계.
- 실제 Metronome→Slash 후 Mirror Move의 Slash 복사·PP1회·moveset 보존, legacy의 기존 실패.
- codec 후 FOLLOW_UP 기록 및 기록 추가 전 snapshot fallback.
- 실제 Roost 자기 회복, Future Sight 금지 유지, 실패한 정상 수면 행동의 최신 기록 반영.
- 실제 더블에서 Metronome→Slash 뒤 Dancer/반사 행동이 있어도 Slash 기록 유지.
- 상대의 출전→교체→codec→재출전에서 기록 초기화.
- 실패한 Mirror Move 다음 Copycat이 이전 Splash를 복사하는 실제 더블/codec 경계.
- 실제 더블 Instruct→Chatter 반복 1회와 양측 PP, 반복 codec.
- moveset에 없는 기술·PP0·다른 호출기의 FOLLOW_UP을 Instruct 대상으로 삼지 않음.
- Razor Wind 충전→Instruct→같은 턴 두 상대 타격, PP1회·소모된 잠금 제거, codec 뒤 다음 턴 Splash 자유 선택. legacy는 기존 충전 유지.
- Mirror Move113개와 Instruct13개의 명시적 native 플래그 예외를 각각 실제 호출/반복 시도 후 native snapshot 복구. 기술 자체 조건 때문에 실패하는 경우는 정상 실패가 허용돼야 하며 모든 효과 동등성을 뜻하지 않는다.
- native 전역 callback과 legacy Pokemon.m 상태 보존.

기존61개를 합쳐 표준 Node **74/74**(약6.35초), Worker loader **74/74**(약5.73초) 통과했다. 소유 JS4파일 ESLint 오류/경고0, 원본에서 재생성한 정책 snapshot 비교 및 diff 공백 검사 통과. 로그는 `/tmp/mirror-instruct-final-focus.log`, `/tmp/mirror-instruct-final-worker.log`, `/tmp/mirror-instruct-final-lint.log`다. 전체 통합 검사는 root가 수행한다.

## 원본 활성 호출기 대조 범위와 남은 구현

원본 move.ts의 CallMoveAttr 계열 등록은 Metronome·Mirror Move·Sleep Talk·Nature Power·Assist·Copycat 여섯 종류이고 반복 실행은 Instruct 한 종류다. 이 일곱 등록의 명시적 후보/금지 정책 연결은 모두 존재한다. Me First·Snatch는 원본 미구현이므로 새 호출 경로로 활성화하지 않았다. Sketch/Mimic의 moveset 변경과 Dancer의 별도 INDIRECT 실행을 이 여섯 호출기와 혼동하지 않는다.

남은 실제 대조는 모든 호출기의 충전 후 FOLLOW_UP 상태/기록 경계, 특수 대상 소실·반복 큐·폼/패시브/추가 연타 조합, 각 기술의 실패 순서 및 원본 PRNG 알고리즘/호출 순서다. 특히 현재 수면 보완은 Sleep Talk의 명시적 충전2종이므로 Metronome 등 다른 호출자의 충전 해제 시 수면/마비 등 native 첫 검사와 원본 FOLLOW_UP 검사의 차이는 별도 후속 범위다. 실계정·실기기·운영 배포 검증은 별도이며 운영409·PC지연 원인 해결을 주장하지 않는다.
