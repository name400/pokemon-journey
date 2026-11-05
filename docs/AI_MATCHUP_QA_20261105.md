# AI matchup 검증

새 도전에만 source-matchup-v1을 저장한다. 원본 pokemon.ts getMatchupScore의 PP있는 공격 평균·STAB·HP/속도/희생 점수, enemy-command-phase의3배/보스2배·반복교체counter, trainer 동점의 turn<<2 임시seedoffset을 연결했다. 복구 후 선택·counter가 유지되고 partner reserve를 넘어가지 않는 실제 싱글/더블을 검사했다.

이 단계 chart는 native기본타입을 사용한다. 노출/부유/강풍, 전체 move-benefit/대상/원본 전투난수와 숫자ID는 후속대조로 남기며 전체 원본 AI 동등성으로 보고하지 않는다. 기존 진행과 이미 생성된 전투는 이전 최고점/교체 기준을 보존한다. 집중6검사와 최종 전체 결과는 CONTINUATION_ROUND2_QA_20261105.md를 따른다.
