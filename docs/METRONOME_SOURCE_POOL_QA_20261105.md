# Metronome 원본 후보 정책 연결

이 단위는 원본 `7c0881255af5cd51992e513ff93c2f71adbe40e0`의 손가락흔들기 후보 정책을 새 도전의 실제 전투에 연결한다. 제품 소유 파일은 `lib/rogue-called-move-policy.mjs`, `data/rogue-called-move-policy.json`이며 `scripts/audit-rogue-called-moves.mjs`로 원본 사실을 재생성한다. 공통 state/combat 플래그와 engine 설치는 root가 조율했다. Sites·운영 데이터·Git 원격·commit 작업은 이 담당자가 수행하지 않았다.

## 실제 차이와 원본 근거

원본 `src/data/moves/move.ts`의 `RandomMoveAttr`와 `CallMoveAttrWithBanlist`는 원본 MoveId enum에서 NONE, `invalidMetronomeMoves`, 등록 기술의 `isUnimplemented`, challenge 제한을 제외한다. `src/data/moves/invalid-moves.ts`는 다수의 전용기를 의도적으로 허용한다고 명시한다. 원본 Silver Wind 등록에는 wind 플래그가 있고 미구현 표시는 없다. 따라서 원본에서 호출 가능한 은빛바람이 native에서는 Past라는 이유로 후보에서 빠지는 실제 차이가 있다.

원본 920개 기술의 등록 체인과 금지 목록을 TypeScript AST로 읽었다. 미구현 86개·금지 43개의 합집합을 제외하면 **794개**가 남는다. native Metronome은 nonstandard 및 native metronome 플래그로 **581개**를 고른다. 원본에만 있는 후보는 219개이며, native에만 있는 6개(Ally Switch, Corrosive Gas, Fling, Magic Room, Recycle, Wonder Room)는 원본 미구현이다. 단순히 Past 필터만 해제하면 이 원본 정책과 같지 않다.

원본 `src/data/challenge.ts`의 기술 제한 override는 Hardcore의 Revival Blessing 금지다. 이 기술은 Metronome 원본 금지 목록에도 있으므로 후보 794개에 들어가지 않는다. 비활성 챌린지·이벤트를 활성화하지 않는다.

## 구현과 저장 경계

- 새 run의 `calledMoveRule: source-pool-v1`을 combat에 복사하며, 복구는 저장된 combat 규칙을 사용한다. 기존/무표시 도전에는 소급 추가하지 않는다.
- 전투별 Dex의 Metronome `onHit`만 바꾼다. 원본 ID 순서로 고정한 794개에서 native `sample`을 한 번 호출하고, 선택한 기술은 현재 전투 Dex의 Move 객체로 실행한다. 기존 수치/플래그·스텔라·추가 연타 훅을 통과한다.
- 원본의 미구현/미등록 기술을 일괄 허용하지 않는다. snapshot 생성기는 원본 SHA와 등록 파일의 변경 여부, enum/등록 완전성 및 예상 수량을 확인한다.
- 전역 Dex·다른 전투·다른 슬롯·탐험·재화는 수정하지 않는다. WeakSet으로 재설치 중복을 막는다. snapshot 파일은 약17KB다.

native PRNG와 전투 snapshot의 다음 난수 경계는 보존한다. **원본 randBattleSeedInt의 알고리즘·호출 순서와 동일한 결과를 만드는 구현은 아니다.** 후보가 달라지는 새 규칙의 도전은 같은 seed라도 기존 native 후보 도전과 선택 결과가 달라질 수 있다. 다른 호출 기술의 후보/실패/대상 정책은 이번에 변경하지 않는다.

## 검증

`tests/rogue-called-move-policy.test.mjs` 9개가 다음을 검사한다.

- 920개 enum, 원본 미구현 86개와 금지 43개 전체, 후보 794개 순서/중복/실제 native 존재, 원본 전용 및 native 전용 경계.
- 실제 Metronome→Silver Wind의 wind 플래그, Wind Rider 면역/공격 상승, 스텔라 Bug 이력. 실제 Astral Barrage의 원본 보정 위력110과 피해.
- 적 측 동일 후보와 더블에서 실제 Surf의 아군/상대 둘 대상.
- 한 번의 후보 추첨/호출/Metronome PP 소비, 호출 기술의 moveset 삽입 없음. 반복 codec 복구 후도 유지하며 다른 슬롯·탐험·재화 보존.
- 중간 저장 복구 후 다음 실제 전투의 PRNG 상태·전체 로그·양측 HP·PP가 중단 없이 진행한 전투와 동일.
- 실제 `playClassicCombat` 명령과 codec, Hardcore에서 Revival Blessing 후보/실행 제외.
- 호출 Slash의 MultiLens 2회 타격과 Metronome/PP의 중복 실행 없음.
- 기존 native 581개 후보·전역 Dex·다른 전투 보존, 중복 설치 방지, 새 도전만 규칙 추가.
- **추가되는 219개 후보 전부를 각각 실제 엔진에서 호출하고 즉시 native snapshot 생성/복구**. 호출 실패 조건이 있는 기술은 그 native 실패 처리도 정상 종료해야 한다. 이 검사는 모든 기술 효과의 원본 동등성이나 장기 조합 검증을 뜻하지 않는다.

신규 9개와 기존 호출 데이터·Nature Power·Stellar·지연 공격·MultiLens 40개를 함께 실행해 표준 Node **49/49**(약8.22초), Worker runtime loader **49/49**(약7.22초) 통과했다. 변경 JS 3파일 ESLint 오류/경고0, diff 공백 검사 통과. 근거는 `/tmp/called-policy-final-focus.log`, `/tmp/called-policy-final-worker.log`, `/tmp/called-policy-final-lint.log`다. snapshot은 동일 원본에서 재생성해 파일 비교도 수행한다. 전체 프로젝트 통합 검사는 root 담당이다.

## 남은 구현과 별도 검증

실제 미대조/부분지원은 Copycat·Sleep Talk·Assist·Mirror Move·Instruct 등의 원본 금지/실패/대상 조건, 호출 기술의 복잡한 폼·패시브·추가 연타·타입 변환 조합, 원본 난수 순서다. 이번 추가219개도 즉시 실행/복구 안전성 외의 장기 효과 동등성은 남는다.

실기기·실계정과 운영 배포 후 검증은 별도다. 이번 작업으로 PC 지연이나 운영 409 원인이 확인됐다는 주장은 하지 않는다.
